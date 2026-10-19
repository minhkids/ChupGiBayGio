import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import worker from './index';

const databases: DatabaseSync[] = [];
function makeEnv() {
  const sqlite = new DatabaseSync(':memory:');
  databases.push(sqlite);
  const migrations = new URL('../../migrations/', import.meta.url);
  for (const file of readdirSync(migrations).filter(name => name.endsWith('.sql')).sort()) {
    sqlite.exec(readFileSync(new URL(file, migrations), 'utf8'));
  }
  const DB = {
    prepare(sql: string) {
      let values: SQLInputValue[] = [];
      return {
        bind(...args: SQLInputValue[]) { values = args; return this; },
        async run() { return { meta: sqlite.prepare(sql).run(...values) }; },
        async first() { return sqlite.prepare(sql).get(...values) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...values) }; },
      };
    },
  } as unknown as D1Database;
  const cache = new Map<string, string>();
  const CACHE = { get: async (key: string) => cache.get(key) ?? null, put: async (key: string, value: string) => { cache.set(key, value); } } as unknown as KVNamespace;
  return { DB, CACHE, ADMIN_PASSWORD: 'fixture-password', ADMIN_SESSION_SECRET: 'fixture-session-secret' };
}
afterEach(() => databases.splice(0).forEach(db => db.close()));

async function read(env: ReturnType<typeof makeEnv>, path: string, headers = {}) {
  const response = await worker.request(path, { headers }, env);
  expect(response.status, path).toBe(200);
  return await response.json() as Record<string, unknown>[];
}

async function seedPair(env: ReturnType<typeof makeEnv>) {
  for (const [table, name, min, max] of [['film_labs', 'Independent lab', 120000, 180000], ['film_shops', 'Independent shop', 0, 0]] as const) {
    await env.DB.prepare(`INSERT INTO ${table} (id, name, address, ward, district, lat, lng, opening_hours, min_roll_price, max_roll_price, services) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind('same-id', name, '36 private street', 'Cửa Nam', 'Hoàn Kiếm', 21.03, 105.85, '09:00–18:00', min, max, '["Tráng C-41"]').run();
    await env.DB.prepare(`INSERT INTO ${table} (id, name, status) VALUES (?, ?, ?)`)
      .bind('pending', 'Not public', 'pending_review').run();
  }
}

async function adminHeaders(env: ReturnType<typeof makeEnv>) {
  const response = await worker.request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: env.ADMIN_PASSWORD }) }, env);
  expect(response.status).toBe(200);
  const { token } = await response.json() as { token: string };
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

const validShop = { name: 'New shop', locations: [{ ward: 'Cửa Nam', district: 'Hoàn Kiếm', openingHours: '10:00–20:00' }], inStockFilms: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 50000, maxRollPrice: 150000 };

describe('independent film directories', () => {
  it('allows editing a legacy lab with no shop branch locations', async () => {
    const env = makeEnv();
    await seedPair(env);
    const headers = await adminHeaders(env);
    const response = await worker.request('/api/admin/cms/labs/same-id', {
      method: 'PUT', headers,
      body: JSON.stringify({ adminCategory: 'filmLab', name: 'Independent lab updated', locations: [], inStockFilms: [], minRollPrice: 0, maxRollPrice: 0 }),
    }, env);

    expect(response.status).toBe(200);
    expect(await env.DB.prepare('SELECT name, address, min_roll_price, locations FROM film_labs WHERE id = ?').bind('same-id').first()).toMatchObject({
      name: 'Independent lab updated', address: '', min_roll_price: 0, locations: '[]',
    });
  });

  it('accepts minimum-only shop prices in admin create and update like partner onboarding', async () => {
    const env = makeEnv();
    const headers = await adminHeaders(env);
    const body = { ...validShop, maxRollPrice: 0 };
    const created = await worker.request('/api/admin/film-shops', { method: 'POST', headers, body: JSON.stringify(body) }, env);
    expect(created.status).toBe(201);
    const { id } = await created.json() as { id: string };
    expect((await worker.request(`/api/admin/cms/filmShops/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) }, env)).status).toBe(200);
    expect(await read(env, '/api/services')).toMatchObject([{ id, category: 'filmShop', minRollPrice: 50000, maxRollPrice: 0, price: 'Từ 50.000đ/cuộn' }]);
  });

  it.each(['labs', 'filmShops'])('protects every %s admin operation from missing or forged sessions', async (table) => {
    const env = makeEnv();
    await seedPair(env);
    const before = await read(env, '/api/services');
    for (const authorization of [undefined, 'Bearer forged.invalid']) {
      const headers = { 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}) };
      const createPath = table === 'labs' ? '/api/admin/labs' : '/api/admin/film-shops';
      for (const [path, method] of [[createPath, 'POST'], [`/api/admin/cms/${table}`, 'GET'], [`/api/admin/cms/${table}/same-id`, 'PUT'], [`/api/admin/cms/${table}/same-id`, 'DELETE']]) {
        const response = await worker.request(path, { method, headers, ...(method === 'POST' || method === 'PUT' ? { body: JSON.stringify(validShop) } : {}) }, env);
        expect(response.status, `${method} ${path}`).toBe(401);
      }
    }
    expect(await read(env, '/api/services')).toEqual(before);
  });

  it.each(['labs', 'filmShops'])('validates %s payloads without writing and preserves omitted services', async (table) => {
    const env = makeEnv();
    await seedPair(env);
    const headers = await adminHeaders(env);
    const createPath = table === 'labs' ? '/api/admin/labs' : '/api/admin/film-shops';
    const before = await read(env, `/api/admin/cms/${table}`, headers);
    for (const invalid of [{ name: '' }, { lat: 'bad' }, { minRollPrice: -1 }, { minRollPrice: 50000001, maxRollPrice: 0 }, { maxRollPrice: 1 }, { cheapestRollName: 'Not in stock' }, { locations: [{ ward: 'Cửa Nam', district: 'Unknown' }] }, { services: 'Scan' }, { services: ['x'.repeat(121)] }]) {
      for (const [path, method] of [[createPath, 'POST'], [`/api/admin/cms/${table}/same-id`, 'PUT']]) {
        expect((await worker.request(path, { method, headers, body: JSON.stringify({ ...validShop, ...invalid }) }, env)).status).toBe(400);
      }
    }
    expect(await read(env, `/api/admin/cms/${table}`, headers)).toEqual(before);
    // The URL owns the table even if an older/mistaken client supplies the other category.
    const body = { ...validShop, adminCategory: table === 'labs' ? 'filmShop' : 'filmLab' };
    expect((await worker.request(`/api/admin/cms/${table}/same-id`, { method: 'PUT', headers, body: JSON.stringify(body) }, env)).status).toBe(200);
    expect(await read(env, `/api/admin/cms/${table}`, headers)).toContainEqual(expect.objectContaining({ id: 'same-id', services: '["Tráng C-41"]' }));
  });

  it('keeps legacy register-lab URL as shop-only onboarding and reads the new shop back', async () => {
    const env = makeEnv();
    const form = new FormData();
    form.set('payload', JSON.stringify({ name: 'New partner shop', phone: '0912345678', ward: 'Cửa Nam', district: 'Hoàn Kiếm', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 50000 }));
    const response = await worker.request('/api/partner/register-lab', { method: 'POST', headers: { Origin: 'https://chupgibaygio.com' }, body: form }, env);
    expect(response.status).toBe(201);
    const { id } = await response.json() as { id: string };
    expect(await read(env, '/api/labs')).toEqual([]);
    expect(await read(env, '/api/film-shops')).toMatchObject([{ id, name: 'New partner shop', min_roll_price: 50000, max_roll_price: 0, lat: null, lng: null }]);
    expect(await read(env, '/api/services')).toMatchObject([{ id, category: 'filmShop', name: 'New partner shop', minRollPrice: 50000 }]);
  });
  it('uses the source table, never retail prices, for public categories even when IDs match', async () => {
    const env = makeEnv();
    await seedPair(env);
    const directory = await read(env, '/api/services');
    expect(directory).toHaveLength(2);
    expect(directory).toContainEqual(expect.objectContaining({ id: 'same-id', name: 'Independent lab', category: 'filmLab', minRollPrice: 120000, services: ['Tráng C-41'] }));
    expect(directory).toContainEqual(expect.objectContaining({ id: 'same-id', name: 'Independent shop', category: 'filmShop', minRollPrice: 0 }));
    for (const row of directory) {
      expect(row).toMatchObject({ address: 'Cửa Nam, Hoàn Kiếm, Hà Nội', lat: 21.03, lng: 105.85 });
      expect(JSON.stringify(row)).not.toContain('private street');
    }
    for (const [path, name] of [['/api/labs', 'Independent lab'], ['/api/film-shops', 'Independent shop']]) {
      const rows = await read(env, path);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ id: 'same-id', name, address: 'Cửa Nam, Hoàn Kiếm, Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm', lat: 21.03, lng: 105.85, min_roll_price: name === 'Independent lab' ? 120000 : 0, locations: [{ ward: 'Cửa Nam', district: 'Hoàn Kiếm', openingHours: '09:00–18:00' }] });
    }
  });

  it.each([
    ['labs', '/api/admin/labs', 'filmLab', 'filmShops'],
    ['filmShops', '/api/admin/film-shops', 'filmShop', 'labs'],
  ])('creates, lists, edits and deletes %s without changing the other table with a matching ID', async (table, createPath, category, otherTable) => {
    const env = makeEnv();
    await seedPair(env);
    const headers = await adminHeaders(env);
    const otherBefore = await read(env, `/api/admin/cms/${otherTable}`, headers);
    const body = { ...validShop, name: `Edited ${table}`, adminCategory: category, services: ['Tráng C-41', 'Scan'] };
    const created = await worker.request(createPath, { method: 'POST', headers, body: JSON.stringify(body) }, env);
    expect(created.status).toBe(201);
    const { id } = await created.json() as { id: string };
    expect(await read(env, `/api/admin/cms/${table}`, headers)).toContainEqual(expect.objectContaining({ id, services: '["Tráng C-41","Scan"]' }));

    const updated = await worker.request(`/api/admin/cms/${table}/same-id`, { method: 'PUT', headers, body: JSON.stringify(body) }, env);
    expect(updated.status).toBe(200);
    expect(await read(env, `/api/admin/cms/${table}`, headers)).toContainEqual(expect.objectContaining({ id: 'same-id', name: `Edited ${table}`, min_roll_price: 50000, services: '["Tráng C-41","Scan"]' }));
    expect(await read(env, '/api/services')).toContainEqual(expect.objectContaining({ id: 'same-id', category, name: `Edited ${table}`, services: ['Tráng C-41', 'Scan'] }));

    const deleted = await worker.request(`/api/admin/cms/${table}/same-id`, { method: 'DELETE', headers }, env);
    expect(deleted.status).toBe(200);
    expect((await read(env, `/api/admin/cms/${table}`, headers)).some(row => row.id === 'same-id')).toBe(false);
    expect(await read(env, `/api/admin/cms/${otherTable}`, headers)).toEqual(otherBefore);
    for (const method of ['PUT', 'DELETE']) {
      expect((await worker.request(`/api/admin/cms/${table}/same-id`, { method, headers, body: method === 'PUT' ? JSON.stringify(body) : undefined }, env)).status).toBe(404);
      expect(await read(env, `/api/admin/cms/${otherTable}`, headers)).toEqual(otherBefore);
    }
  });
});
