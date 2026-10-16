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
  return { DB, CACHE: { get: async (key: string) => cache.get(key) ?? null, put: async (key: string, value: string) => { cache.set(key, value); } } as unknown as KVNamespace, ADMIN_PASSWORD: 'review-test-password', ADMIN_SESSION_SECRET: 'review-test-session-secret' };
}
const payload = { name: 'Vườn hoa', address: 'Hà Nội', regionId: 'hanoi', lat: 21.04, lng: 105.84, description: 'Ven hồ', conceptTags: ['HOA_CO'], placeCategories: ['CAFE'], spotStatus: 'ACTIVE', coverImageUrl: '/spot-image-pending.svg' };
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
  it('holds community submissions for category validation and admin approval before they appear publicly', async () => {
    const env = environment();
    expect((await post(env, { ...payload, placeCategories: [] })).status).toBe(400);
    expect((await post(env, { ...payload, placeCategories: ['NOT_A_CATEGORY'] })).status).toBe(400);
    const response = await post(env);
    expect(response.status).toBe(201);
    const { id } = await response.json() as { id: string };
    const publicRows = await (await worker.request('/api/spots', {}, env)).json() as Record<string, unknown>[];
    expect(publicRows.some(row => row.id === id)).toBe(false);
    const pendingRow = await env.DB.prepare('SELECT * FROM spots WHERE id = ?').bind(id).first<Record<string, unknown>>();
    expect(pendingRow).toMatchObject({ id, name: payload.name, is_active: 0, is_featured: 0 });
    expect(JSON.parse(String(pendingRow?.seasonal_trend))).toMatchObject({ startMonth: 1, endMonth: 12, status: 'ACTIVE', conceptTags: ['HOA_CO'], placeCategories: ['CAFE'] });

    expect((await worker.request('/api/admin/cms/spots', {}, env)).status).toBe(401);
    const login = await worker.request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: env.ADMIN_PASSWORD }) }, env);
    const { token } = await login.json() as { token: string };
    const headers = { Authorization: `Bearer ${token}` };
    const queueResponse = await worker.request('/api/admin/cms/spots', { headers }, env);
    expect(queueResponse.status).toBe(200);
    expect(await queueResponse.json()).toEqual(expect.arrayContaining([expect.objectContaining({ id, name: payload.name, is_active: 0 })]));

    expect((await worker.request(`/api/admin/community-spots/${id}/approve`, { method: 'POST', headers }, env)).status).toBe(200);
    const approvedRows = await (await worker.request('/api/spots', {}, env)).json() as Record<string, unknown>[];
    expect(approvedRows).toContainEqual(expect.objectContaining({ id, is_active: 1 }));
    const remaining = await (await worker.request('/api/admin/cms/spots', { headers }, env)).json() as Record<string, unknown>[];
    expect(remaining.some(row => row.id === id && Number(row.is_active) === 0)).toBe(false);

    const rejectedResponse = await post(env, payload, { 'CF-Connecting-IP': 'review-reject' });
    const rejected = await rejectedResponse.json() as { id: string };
    expect(rejectedResponse.status).toBe(201);
    expect((await worker.request(`/api/admin/community-spots/${rejected.id}`, { method: 'DELETE', headers }, env)).status).toBe(200);
    expect(await env.DB.prepare('SELECT id FROM spots WHERE id = ?').bind(rejected.id).first()).toBeNull();
  });
  it('keeps new submissions out of public results even when the map already has 50 records', async () => {
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
    expect(rows).toHaveLength(50);
    expect(rows.some(row => row.id === id)).toBe(false);
    const pending = await env.DB.prepare('SELECT id, is_active FROM spots WHERE id = ?').bind(id).first<Record<string, unknown>>();
    expect(pending).toMatchObject({ id, is_active: 0 });
  });
});
