import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from './index';

const databases: DatabaseSync[] = [];
afterEach(() => databases.splice(0).forEach(db => db.close()));
function environment() {
  const sqlite = new DatabaseSync(':memory:');
  databases.push(sqlite);
  sqlite.exec(readFileSync('migrations/0001_initial_schema.sql', 'utf8'));
  sqlite.exec(readFileSync('db/schema.sql', 'utf8'));
  const cache = new Map<string, string>();
  const DB = { prepare(sql: string) {
    let values: (string | number | null)[] = [];
    return {
      bind(...args: (string | number | null)[]) { values = args; return this; },
      async run() { return { success: true, meta: sqlite.prepare(sql).run(...values) }; },
      async first() { return sqlite.prepare(sql).get(...values) ?? null; },
      async all() { return { results: sqlite.prepare(sql).all(...values) }; },
    };
  } } as unknown as D1Database;
  return { DB, CACHE: { get: async (key: string) => cache.get(key) ?? null, put: async (key: string, value: string) => { cache.set(key, value); } } as unknown as KVNamespace };
}
const payload = { name: 'Vườn hoa', address: 'Hà Nội', regionId: 'hanoi', lat: 21.04, lng: 105.84, description: 'Ven hồ', conceptTags: ['HOA_CO'], spotStatus: 'ACTIVE', coverImageUrl: '/spot-image-pending.svg' };
const post = (env: ReturnType<typeof environment>, body: unknown = payload, headers = {}) => worker.request('/api/community/spots', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }, env);

describe('community spot persistence', () => {
  it.each([
    null, [], { ...payload, name: '' }, { ...payload, lat: 91 }, { ...payload, lng: '105' },
    { ...payload, regionId: 'invalid' }, { ...payload, conceptTags: ['UNKNOWN'] },
    { ...payload, spotStatus: 'PEAK', statusValidUntil: '2026-02-30' },
    { ...payload, coverImageUrl: 'javascript:alert(1)' }, { ...payload, id: 'existing' },
    { ...payload, isFeatured: true }, { ...payload, name: '<img src=x onerror=alert(1)>' }, { ...payload, name: '" onload="alert(1)' }, { ...payload, description: 'x'.repeat(5001) },
  ])('rejects invalid or privileged creation input %#', async body => {
    const env = environment();
    expect((await post(env, body)).status).toBe(400);
    expect((await env.DB.prepare('SELECT * FROM spots').all()).results).toHaveLength(0);
  });
  it('rejects foreign origins and oversized bodies', async () => {
    const env = environment();
    expect((await post(env, payload, { Origin: 'https://evil.example' })).status).toBe(403);
    expect((await post(env, { ...payload, description: 'x'.repeat(17000) })).status).toBe(413);
  });
  it('throttles contributions without allowing public edits', async () => {
    const env = environment();
    expect((await post(env)).status).toBe(201);
    expect((await post(env)).status).toBe(429);
    expect((await worker.request('/api/community/spots/existing', { method: 'PUT', body: '{}' }, env)).status).not.toBe(200);
  });
  it('persists seasonal expiry and uploaded image URLs', async () => {
    const env = environment();
    const coverImageUrl = 'http://localhost/api/spot-images/community/12345678-1234-1234-1234-123456789abc.jpg';
    expect((await post(env, { ...payload, coverImageUrl, spotStatus: 'PEAK', statusValidUntil: '2026-12-31' })).status).toBe(201);
    const row = await env.DB.prepare('SELECT * FROM spots').first<Record<string, unknown>>();
    expect(row?.cover_image_url).toBe(coverImageUrl);
    expect(JSON.parse(String(row?.seasonal_trend))).toMatchObject({ status: 'PEAK', statusValidUntil: '2026-12-31' });
  });
  it('creates a canonical spot that survives a fresh public list and detail request', async () => {
    const env = environment();
    const response = await post(env);
    expect(response.status).toBe(201);
    const { id } = await response.json() as { id: string };
    const rows = await (await worker.request('/api/spots', {}, env)).json() as Record<string, unknown>[];
    expect(rows).toContainEqual(expect.objectContaining({ id, name: payload.name, is_active: 1, is_featured: 0 }));
    const row = await (await worker.request(`/api/spots/${id}`, {}, env)).json() as Record<string, unknown>;
    expect(JSON.parse(String(row.seasonal_trend))).toMatchObject({ startMonth: 1, endMonth: 12, status: 'ACTIVE', conceptTags: ['HOA_CO'] });
  });
  it('does not hide a newly added spot when the map already contains 50 records', async () => {
    const env = environment();
    for (let index = 0; index < 50; index++) {
      await env.DB.prepare(`INSERT INTO spots (id, name, slug, region_id, address, lat, lng, description, cover_image_url, best_time_of_day, best_time_description, cost_type)
        VALUES (?, ?, ?, 'hanoi', 'Hà Nội', 21, 105, '', '', 'SUNSET', '', 'FREE')`)
        .bind(`existing-${index}`, `Existing ${index}`, `existing-${index}`).run();
    }
    const created = await post(env);
    expect(created.status).toBe(201);
    const { id } = await created.json() as { id: string };
    const rows = await (await worker.request('/api/spots', {}, env)).json() as { id: string }[];
    expect(rows).toHaveLength(51);
    expect(rows.some(row => row.id === id)).toBe(true);
  });
});
