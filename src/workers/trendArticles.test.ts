import { describe, expect, it, vi } from 'vitest';
import worker from './index';

function makeEnv() {
  const statements: { sql: string; values: unknown[] }[] = [];
  const trendRows = [{ id: 'article-1', section: 'hotTrend', title: 'Xu hướng mới', content: 'Bài viết', image_url: 'https://example.com/photo.jpg', location: 'Hà Nội', region_id: 'hanoi', source_url: 'https://example.com/source', is_published: 1, created_at: '2026-10-10' }];
  const db = {
    prepare(sql: string) {
      const statement = { sql, values: [] as unknown[], bind(...values: unknown[]) { this.values = values; return this; },
        async all() { return { results: sql.includes('FROM trend_articles') ? trendRows : [] }; }, async first() { return null; },
        async run() { statements.push({ sql: this.sql, values: this.values }); return { meta: { changes: 1 } }; } };
      return statement;
    }
  };
  return { env: { DB: db as unknown as D1Database, R2_BUCKET: { name: 'trend-test', put: vi.fn() } as unknown as R2Bucket, ADMIN_PASSWORD: 'unit-test-password', ADMIN_SESSION_SECRET: 'unit-test-session-secret' }, statements, trendRows };
}

async function adminToken(env: ReturnType<typeof makeEnv>['env']) {
  const response = await worker.request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unit-test-password' }) }, env);
  return (await response.json() as { token: string }).token;
}

describe('trend articles', () => {
  it('serves published editorial posts from the public feed', async () => {
    const { env, trendRows } = makeEnv();
    const response = await worker.request('/api/trend-articles', {}, env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: trendRows[0].id, section: trendRows[0].section, title: trendRows[0].title, content: trendRows[0].content, imageUrl: trendRows[0].image_url, location: trendRows[0].location, regionId: trendRows[0].region_id, sourceUrl: trendRows[0].source_url, isPublished: true, createdAt: trendRows[0].created_at }]);
  });

  it('requires admin auth and stores posts in one of the two feed sections', async () => {
    const { env, statements } = makeEnv();
    const body = { section: 'hotTrend', title: 'Xu hướng mới', content: 'Bài viết', imageUrl: 'https://example.com/photo.jpg', location: 'Hà Nội', regionId: 'hanoi', sourceUrl: 'https://example.com/source', isPublished: true };
    const unauthorized = await worker.request('/api/admin/cms/trendArticles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, env);
    expect(unauthorized.status).toBe(401);

    const token = await adminToken(env);
    const created = await worker.request('/api/admin/cms/trendArticles', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, env);
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ ...body, id: expect.any(String) });
    expect(statements.some((statement) => statement.sql.includes('INSERT INTO trend_articles'))).toBe(true);
  });

  it('rejects unknown sections instead of saving posts outside the two tabs', async () => {
    const { env } = makeEnv();
    const token = await adminToken(env);
    const response = await worker.request('/api/admin/cms/trendArticles', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'misc', title: 'Không hợp lệ' }) }, env);
    expect(response.status).toBe(400);
  });

  it('supports editing, deleting, and uploading article images with admin auth', async () => {
    const { env, statements } = makeEnv();
    const token = await adminToken(env);
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const body = { section: 'upcomingSpot', title: 'Điểm mới', content: 'Nội dung', imageUrl: '', location: 'Đà Lạt', regionId: 'dalat', sourceUrl: '', isPublished: false };
    const update = await worker.request('/api/admin/cms/trendArticles/article-1', { method: 'PUT', headers, body: JSON.stringify(body) }, env);
    expect(update.status).toBe(200);
    const remove = await worker.request('/api/admin/cms/trendArticles/article-1', { method: 'DELETE', headers }, env);
    expect(remove.status).toBe(200);
    expect(statements.some((statement) => statement.sql.includes('UPDATE trend_articles'))).toBe(true);
    expect(statements.some((statement) => statement.sql.includes('DELETE FROM trend_articles'))).toBe(true);

    const form = new FormData();
    form.set('file', new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], 'trend.jpg', { type: 'image/jpeg' }));
    form.set('entity', 'trendArticles');
    const upload = await worker.request('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }, env);
    expect(upload.status).toBe(201);
    expect(await upload.json()).toMatchObject({ key: expect.stringContaining('admin/trendArticles/') });
  });
});
