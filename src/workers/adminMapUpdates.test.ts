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

async function fixture() {
  const env = makeEnv();
  const login = await worker.request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: env.ADMIN_PASSWORD }) }, env);
  const { token } = await login.json() as { token: string };
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const body = { name: 'Old spot', slug: 'old-spot', address: 'Hà Nội', lat: 21, lng: 105, bestMonths: [3, 4], spotStatus: 'ACTIVE', goldenHour: 'Old light' };
  const created = await worker.request('/api/admin/spots', { method: 'POST', headers, body: JSON.stringify(body) }, env);
  expect(created.status).toBe(201);
  const { id } = await created.json() as { id: string };
  await env.DB.prepare("UPDATE spots SET seasonal_trend = json_set(seasonal_trend, '$.conceptTags', json('[\"SUNSET\"]'), '$.trendScore', 88) WHERE id = ?").bind(id).run();
  return { env, headers, body, id };
}

async function publicSpot(env: ReturnType<typeof makeEnv>, id: string) {
  const response = await worker.request('/api/spots', {}, env);
  expect(response.status).toBe(200);
  const rows = await response.json() as Record<string, unknown>[];
  return rows.find((row) => row.id === id)!;
}

describe('admin spot edits read back by the map', () => {
  it.each([
    { spotStatus: 'INVALID', statusValidUntil: '2026-11-30' },
    { spotStatus: 'PEAK' },
    { spotStatus: 'ENDING_SOON', statusValidUntil: 'tomorrow' },
  ])('rejects invalid seasonal edits without modifying the public record: %j', async (invalid) => {
    const { env, headers, body, id } = await fixture();
    const before = await publicSpot(env, id);
    const response = await worker.request(`/api/admin/cms/spots/${id}`, { method: 'PUT', headers, body: JSON.stringify({ ...body, ...invalid }) }, env);
    expect(response.status).toBe(400);
    expect(await publicSpot(env, id)).toEqual(before);
  });

  it('clears the seasonal expiry when returning to ACTIVE and supports all-year months', async () => {
    const { env, headers, body, id } = await fixture();
    await env.DB.prepare("UPDATE spots SET seasonal_trend = json_set(seasonal_trend, '$.status', 'PEAK', '$.statusValidUntil', '2026-11-30') WHERE id = ?").bind(id).run();
    const response = await worker.request(`/api/admin/cms/spots/${id}`, { method: 'PUT', headers, body: JSON.stringify({ ...body, bestMonths: [] }) }, env);
    expect(response.status).toBe(200);
    const trend = JSON.parse(String((await publicSpot(env, id)).seasonal_trend));
    expect(trend).toMatchObject({ status: 'ACTIVE', startMonth: 1, endMonth: 12, conceptTags: ['SUNSET'] });
    expect(trend).not.toHaveProperty('statusValidUntil');
  });

  it('keeps the saved status when older clients omit seasonal status fields', async () => {
    const { env, headers, body, id } = await fixture();
    await env.DB.prepare("UPDATE spots SET seasonal_trend = json_set(seasonal_trend, '$.status', 'PEAK', '$.statusValidUntil', '2026-11-30') WHERE id = ?").bind(id).run();
    const response = await worker.request(`/api/admin/cms/spots/${id}`, { method: 'PUT', headers, body: JSON.stringify({ ...body, spotStatus: undefined }) }, env);
    expect(response.status).toBe(200);
    expect(JSON.parse(String((await publicSpot(env, id)).seasonal_trend))).toMatchObject({ status: 'PEAK', statusValidUntil: '2026-11-30' });
  });

  it('updates the public seasonal label and month filter while preserving unrelated trend metadata', async () => {
    const { env, headers, body, id } = await fixture();
    const response = await worker.request(`/api/admin/cms/spots/${id}`, {
      method: 'PUT', headers, body: JSON.stringify({ ...body, name: 'Updated spot', lat: 22, lng: 106, bestMonths: [10, 11], spotStatus: 'PEAK', statusValidUntil: '2026-11-30', goldenHour: 'New light' }),
    }, env);
    expect(response.status).toBe(200);
    const row = await publicSpot(env, id);
    expect(row).toMatchObject({ name: 'Updated spot', lat: 22, lng: 106, best_months: '[10,11]' });
    expect(JSON.parse(String(row.seasonal_trend))).toMatchObject({ status: 'PEAK', statusValidUntil: '2026-11-30', startMonth: 10, endMonth: 11, trendTitle: 'New light', conceptTags: ['SUNSET'], trendScore: 88 });
    expect(row.best_time_description).toBe('New light');
  });
});
