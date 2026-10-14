import { readFileSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import worker from './index';

const databases: DatabaseSync[] = [];
function makeEnv() {
  const sqlite = new DatabaseSync(':memory:');
  databases.push(sqlite);
  sqlite.exec(readFileSync(new URL('../../db/schema.sql', import.meta.url), 'utf8'));
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
  return { DB, ADMIN_PASSWORD: 'test-password', ADMIN_SESSION_SECRET: 'test-session-secret' };
}

afterEach(() => { databases.splice(0).forEach((db) => db.close()); });

async function adminHeaders(env: ReturnType<typeof makeEnv>) {
  const login = await worker.request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: env.ADMIN_PASSWORD }) }, env);
  const { token } = await login.json() as { token: string };
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

describe('place category management', () => {
  it('serves editable categories and supports authenticated create, rename, and delete', async () => {
    const env = makeEnv();
    const publicList = await worker.request('/api/place-categories', {}, env);
    expect(publicList.status).toBe(200);
    expect(await publicList.json()).toEqual([
      { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 },
      { id: 'VINTAGE', label: 'Vintage', sortOrder: 2 },
      { id: 'SHOPPING_MALL', label: 'Trung tâm thương mại', sortOrder: 3 },
      { id: 'RED_RIVER', label: 'Gần sông Hồng', sortOrder: 4 },
      { id: 'SUNSET', label: 'Chụp hoàng hôn', sortOrder: 5 },
    ]);

    const body = { label: 'Tiệm sách' };
    const unauthorized = await worker.request('/api/admin/place-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, env);
    expect(unauthorized.status).toBe(401);
    const headers = await adminHeaders(env);
    const created = await worker.request('/api/admin/place-categories', { method: 'POST', headers, body: JSON.stringify(body) }, env);
    expect(created.status).toBe(201);
    const category = await created.json() as { id: string; label: string; sortOrder: number };
    expect(category).toMatchObject({ id: 'TIEM_SACH', label: 'Tiệm sách', sortOrder: 6 });

    const renamed = await worker.request(`/api/admin/place-categories/${category.id}`, { method: 'PUT', headers, body: JSON.stringify({ label: 'Không gian sách' }) }, env);
    expect(renamed.status).toBe(200);
    expect(await renamed.json()).toMatchObject({ id: 'TIEM_SACH', label: 'Không gian sách' });
    const removed = await worker.request(`/api/admin/place-categories/${category.id}`, { method: 'DELETE', headers }, env);
    expect(removed.status).toBe(200);
    expect(await removed.json()).toMatchObject({ success: true });
    expect(await (await worker.request('/api/place-categories', {}, env)).json()).not.toContainEqual(expect.objectContaining({ id: 'TIEM_SACH' }));
  });

  it('blocks deletion while a spot uses the category and allows it after reassignment', async () => {
    const env = makeEnv();
    const headers = await adminHeaders(env);
    await env.DB.prepare(`INSERT INTO spots (id, region_id, name, slug, address, lat, lng, best_time_of_day, best_time_description, cost_type, cover_image_url, description, seasonal_trend)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind('spot-1', 'hanoi', 'Quán ven sông', 'quan-ven-song', 'Hà Nội', 21, 105, 'evening', '', 'FREE', '/pending.svg', '', JSON.stringify({ placeCategories: ['CAFE'] })).run();

    const blocked = await worker.request('/api/admin/place-categories/CAFE', { method: 'DELETE', headers }, env);
    expect(blocked.status).toBe(409);
    expect(await blocked.json()).toMatchObject({ spotCount: 1 });
    expect(await env.DB.prepare('SELECT id FROM place_categories WHERE id = ?').bind('CAFE').first()).toEqual({ id: 'CAFE' });

    await env.DB.prepare("UPDATE spots SET seasonal_trend = json_set(seasonal_trend, '$.placeCategories', json('[]')) WHERE id = ?").bind('spot-1').run();
    const removed = await worker.request('/api/admin/place-categories/CAFE', { method: 'DELETE', headers }, env);
    expect(removed.status).toBe(200);
  });
});
