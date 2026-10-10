import { describe, expect, it, vi } from 'vitest';
import worker from './index';

function makeEnv() {
  const put = vi.fn().mockResolvedValue(undefined);
  const db = {
    prepare: (sql: string) => ({
      sql,
      bind(..._values: unknown[]) { return this; },
      async all() { return { results: [] }; },
      async first() { return null; },
      async run() { return { meta: { changes: 1 } }; }
    })
  };
  return { DB: db as unknown as D1Database, R2_BUCKET: { name: 'cms-test', put } as unknown as R2Bucket, ADMIN_PASSWORD: 'unit-test-password', ADMIN_SESSION_SECRET: 'unit-test-session-secret' };
}

describe('Services Hub admin API', () => {
  it('returns an empty public directory without preloaded data', async () => {
    const response = await worker.request('/api/services', {}, makeEnv());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it('requires a signed admin session for listing or changing directory entries', async () => {
    const env = makeEnv();
    const unauthorized = await worker.request('/api/admin/services', {}, env);
    expect(unauthorized.status).toBe(401);

    const badLogin = await worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'wrong' })
    }, env);
    expect(badLogin.status).toBe(401);

    const login = await worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unit-test-password' })
    }, env);
    expect(login.status).toBe(200);
    const { token } = await login.json() as { token: string };
    const listing = await worker.request('/api/admin/services', { headers: { Authorization: `Bearer ${token}` } }, env);
    expect(listing.status).toBe(200);

    const created = await worker.request('/api/admin/services', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'photographer', name: 'Test photographer' })
    }, env);
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ category: 'photographer', name: 'Test photographer' });

    const filmColor = await worker.request('/api/admin/services', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'filmColor', name: 'Test film color', iso: '200', paletteHex: ['#AABBCC'] })
    }, env);
    expect(filmColor.status).toBe(201);
    expect(await filmColor.json()).toMatchObject({ category: 'filmColor', name: 'Test film color', paletteHex: ['#AABBCC'] });
  });

  it('protects model-specific D1 creation routes and stores submitted spot data', async () => {
    const env = makeEnv();
    const unauthorized = await worker.request('/api/admin/spots', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Vườn hoa' })
    }, env);
    expect(unauthorized.status).toBe(401);

    const login = await worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unit-test-password' })
    }, env);
    const { token } = await login.json() as { token: string };
    const created = await worker.request('/api/admin/spots', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Vườn hoa', slug: 'vuon-hoa', address: 'Hà Nội', lat: 21, lng: 105, bestMonths: [3, 4] })
    }, env);
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ name: 'Vườn hoa', bestMonths: [3, 4] });
  });

  it('persists a verified seasonal status instead of always marking a new spot ACTIVE', async () => {
    const env = makeEnv();
    let savedTrend: { status: string; statusValidUntil?: string } | undefined;
    vi.spyOn(env.DB, 'prepare').mockImplementation(() => ({
      bind(...values: unknown[]) { savedTrend = JSON.parse(String(values.at(-1))); return this; },
      async run() { return { meta: { changes: 1 } }; }
    }) as unknown as D1PreparedStatement);
    const login = await worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unit-test-password' })
    }, env);
    const { token } = await login.json() as { token: string };
    const response = await worker.request('/api/admin/spots', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Vườn hoa', slug: 'vuon-hoa', address: 'Hà Nội', lat: 21, lng: 105, bestMonths: [10], spotStatus: 'PEAK', statusValidUntil: '2026-10-16' })
    }, env);
    expect(response.status).toBe(201);
    expect(savedTrend).toMatchObject({ status: 'PEAK', statusValidUntil: '2026-10-16' });
  });

  it('persists outfit, rental, photographer, film and lab submissions through the protected D1 endpoints', async () => {
    const env = makeEnv();
    const login = await worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unit-test-password' })
    }, env);
    const { token } = await login.json() as { token: string };
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const cases: [string, Record<string, unknown>][] = [
      ['/api/admin/outfits', { name: 'Set áo dài', hotspots: [{ x: 50, y: 40 }] }],
      ['/api/admin/rental-shops', { name: 'Tiệm thuê', dailyPrice: '200.000đ' }],
      ['/api/admin/photographers', { name: 'Nhiếp ảnh gia', packages: [{ name: 'Cơ bản', price: 1000000 }] }],
      ['/api/admin/films', { name: 'Kodak Gold 200', iso: 200, suitableSeasons: ['spring'] }],
      ['/api/admin/labs', { name: 'Film Lab', inStockFilms: ['Kodak Gold 200'], fast2h: true }]
    ];
    for (const [path, body] of cases) {
      const response = await worker.request(path, { method: 'POST', headers, body: JSON.stringify(body) }, env);
      expect(response.status, path).toBe(201);
    }
  });

  it('requires admin auth and validates image files before storing them in R2', async () => {
    const env = makeEnv();
    const form = new FormData();
    form.set('file', new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], 'sample.jpg', { type: 'image/jpeg' }));
    form.set('entity', 'outfits');
    const unauthenticated = await worker.request('/api/admin/upload', { method: 'POST', body: form }, env);
    expect(unauthenticated.status).toBe(401);

    const login = await worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unit-test-password' })
    }, env);
    const { token } = await login.json() as { token: string };
    const uploaded = await worker.request('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }, env);
    expect(uploaded.status).toBe(201);
    expect(await uploaded.json()).toMatchObject({ key: expect.stringMatching(/^admin\/outfits\//), url: expect.stringContaining('cms-test') });
    expect((env.R2_BUCKET as unknown as { put: ReturnType<typeof vi.fn> }).put).toHaveBeenCalledOnce();

    const invalid = new FormData();
    invalid.set('file', new File(['not an image'], 'payload.jpg', { type: 'image/jpeg' }));
    invalid.set('entity', 'outfits');
    const rejected = await worker.request('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: invalid }, env);
    expect(rejected.status).toBe(415);
  });

  it('validates public spot illustration uploads before storing them in R2', async () => {
    const env = makeEnv();
    const invalid = new FormData();
    invalid.set('file', new File(['not an image'], 'fake.jpg', { type: 'image/jpeg' }));
    invalid.set('spotId', 'community-spot');
    expect((await worker.request('/api/upload', { method: 'POST', body: invalid }, env)).status).toBe(415);

    const valid = new FormData();
    valid.set('file', new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], 'spot.jpg', { type: 'image/jpeg' }));
    valid.set('spotId', 'community-spot');
    const response = await worker.request('/api/upload', { method: 'POST', body: valid }, env);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ key: expect.stringMatching(/^spots\/community-spot\//), url: expect.stringContaining('cms-test') });
    expect((env.R2_BUCKET as unknown as { put: ReturnType<typeof vi.fn> }).put).toHaveBeenCalledOnce();
  });
});
