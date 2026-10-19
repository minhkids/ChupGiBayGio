import { describe, expect, it, vi } from 'vitest';
import worker from './index';

function makeEnv() {
  const put = vi.fn().mockResolvedValue(undefined);
  const get = vi.fn().mockResolvedValue({ body: new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0x00])]).stream(), httpMetadata: { contentType: 'image/jpeg' } });
  const cache = new Map<string, string>();
  const db = {
    prepare: (sql: string) => ({
      sql,
      bind(..._values: unknown[]) { return this; },
      async all() { return { results: [] }; },
      async first() { return null; },
      async run() { return { meta: { changes: 1 } }; }
    })
  };
  return { DB: db as unknown as D1Database, R2_BUCKET: { name: 'cms-test', put, get } as unknown as R2Bucket, CACHE: {
    get: vi.fn(async (key: string) => cache.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => { cache.set(key, value); }),
    delete: vi.fn(async (key: string) => { cache.delete(key); }),
  } as unknown as KVNamespace, ADMIN_PASSWORD: 'unit-test-password', ADMIN_SESSION_SECRET: 'unit-test-session-secret' };
}

describe('Services Hub admin API', () => {
  it('returns an empty public directory without preloaded data', async () => {
    const response = await worker.request('/api/services', {}, makeEnv());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it('publishes multiple shop branch locations through the public directory API', async () => {
    const env = makeEnv();
    const locations = [{ ward: 'Cửa Nam', district: 'Hoàn Kiếm', openingHours: '09:00–18:00' }, { ward: 'Dịch Vọng', district: 'Cầu Giấy', openingHours: '10:00–20:00' }];
    vi.spyOn(env.DB, 'prepare').mockImplementation((sql: string) => ({
      bind() { return this; },
      async all() { return { results: sql.includes("FROM film_shops WHERE status = 'published'") ? [{ id: 'multi', name: 'Tiệm Film', min_roll_price: 50000, max_roll_price: 0, locations: JSON.stringify(locations) }] : [] }; },
    }) as unknown as D1PreparedStatement);
    const response = await worker.request('/api/services', {}, env);
    expect(response.status).toBe(200);
    expect((await response.json()).find((item: { id: string }) => item.id === 'multi')).toMatchObject({ category: 'filmShop', locations });
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

    const legacyUpdate = await worker.request('/api/admin/services/legacy-rental', {
      method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'rental', name: 'Legacy rental updated', address: 'Hà Nội' }),
    }, env);
    expect(legacyUpdate.status).toBe(200);
    expect(await legacyUpdate.json()).toMatchObject({ id: 'legacy-rental', category: 'rental', name: 'Legacy rental updated' });

    const filmColor = await worker.request('/api/admin/services', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'filmColor', name: 'Test film color', iso: '200', paletteHex: ['#AABBCC'] })
    }, env);
    expect(filmColor.status).toBe(201);
    expect(await filmColor.json()).toMatchObject({ category: 'filmColor', name: 'Test film color', paletteHex: ['#AABBCC'] });
  });

  it('throttles repeated failed admin logins per client IP', async () => {
    const env = makeEnv();
    const request = () => worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.10' },
      body: JSON.stringify({ password: 'wrong' }),
    }, env);

    for (let attempt = 0; attempt < 5; attempt++) expect((await request()).status).toBe(401);
    expect((await request()).status).toBe(429);
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

  it('stores entry fees as ticket costs for public spot cards', async () => {
    const env = makeEnv();
    const writes: { sql: string; values: unknown[] }[] = [];
    vi.spyOn(env.DB, 'prepare').mockImplementation((sql: string) => {
      let values: unknown[] = [];
      return {
        bind(...args: unknown[]) { values = args; return this; },
        async run() { writes.push({ sql, values }); return { meta: { changes: 1 } }; },
        async first() { return null; },
      } as unknown as D1PreparedStatement;
    });
    const login = await worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unit-test-password' }),
    }, env);
    const { token } = await login.json() as { token: string };
    const response = await worker.request('/api/admin/spots', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Điểm có vé', slug: 'diem-co-ve', address: 'Hà Nội', lat: 21, lng: 105, entryFee: '100.000đ' }),
    }, env);

    expect(response.status).toBe(201);
    expect(writes[0].sql).toContain('cost_type');
    expect(writes[0].sql).toContain('ticket_price_range');
    expect(writes[0].values).toContain('TICKET');
    expect(writes[0].values).toContain('100.000đ');
  });

  it('persists a verified seasonal status instead of always marking a new spot ACTIVE', async () => {
    const env = makeEnv();
    let savedTrend: { status: string; statusValidUntil?: string; bestMonths?: number[] } | undefined;
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
    expect(savedTrend).toMatchObject({ status: 'PEAK', statusValidUntil: '2026-10-16', bestMonths: [10] });
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

  it('persists roll prices and cheapest film name through admin shop create and update', async () => {
    const env = makeEnv();
    const writes: { sql: string; values: unknown[] }[] = [];
    vi.spyOn(env.DB, 'prepare').mockImplementation((sql: string) => {
      let values: unknown[] = [];
      return {
        bind(...args: unknown[]) { values = args; return this; },
        async run() { writes.push({ sql, values }); return { meta: { changes: 1 } }; },
        async all() { return { results: [] }; },
        async first() { return null; },
      } as unknown as D1PreparedStatement;
    });
    const login = await worker.request('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unit-test-password' })
    }, env);
    const { token } = await login.json() as { token: string };
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const locations = [{ ward: 'Cửa Nam', district: 'Hoàn Kiếm', openingHours: '09:00–18:00' }, { ward: 'Dịch Vọng', district: 'Cầu Giấy', openingHours: '10:00–20:00' }];
    const body = { adminCategory: 'filmShop', name: 'Tiệm Film', locations, inStockFilms: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 50000, maxRollPrice: 150000, expressDelivery2h: true };

    const created = await worker.request('/api/admin/film-shops', { method: 'POST', headers, body: JSON.stringify(body) }, env);
    expect(created.status).toBe(201);
    const updated = await worker.request('/api/admin/cms/filmShops/shop-1', { method: 'PUT', headers, body: JSON.stringify(body) }, env);
    expect(updated.status).toBe(200);

    expect(writes).toHaveLength(2);
    expect(writes.every(({ sql }) => sql.includes('film_shops'))).toBe(true);
    expect(writes.every(({ sql }) => sql.includes('min_roll_price') && sql.includes('max_roll_price') && sql.includes('cheapest_roll_name'))).toBe(true);
    expect(writes[0].values).toEqual(expect.arrayContaining([50000, 150000, 'Kodak Gold 200']));
    expect(writes.every(({ sql }) => sql.includes('locations'))).toBe(true);
    expect(writes.every(({ sql }) => sql.includes('express_delivery_2h'))).toBe(true);
    expect(writes.every(({ values }) => values.includes(1))).toBe(true);
    expect(writes[0].values).toContain(JSON.stringify(locations));
    const excessive = await worker.request('/api/admin/film-shops', { method: 'POST', headers, body: JSON.stringify({ ...body, locations: [...locations, ...locations.slice(0, 2)] }) }, env);
    expect(excessive.status).toBe(400);
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
    const uploadResult = await uploaded.json() as { key: string; url: string };
    expect(uploadResult.key).toMatch(/^admin\/outfits\//);
    expect(new URL(uploadResult.url).pathname).toBe(`/api/admin-images/outfits/${uploadResult.key.split('/').at(-1)}`);
    expect((env.R2_BUCKET as unknown as { put: ReturnType<typeof vi.fn> }).put).toHaveBeenCalledOnce();
    const publicImage = await worker.request(new URL(uploadResult.url).pathname, {}, env);
    expect(publicImage.status).toBe(200);
    expect(publicImage.headers.get('content-type')).toBe('image/jpeg');

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
    const uploaded = await response.json() as { key: string; url: string };
    expect(uploaded.key).toMatch(/^spots\/community-spot\//);
    expect(new URL(uploaded.url).pathname).toBe(`/api/spot-images/community-spot/${uploaded.key.split('/').at(-1)}`);
    expect((env.R2_BUCKET as unknown as { put: ReturnType<typeof vi.fn> }).put).toHaveBeenCalledOnce();

    const get = vi.fn().mockResolvedValue({
      body: new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0x00])]).stream(),
      httpMetadata: { contentType: 'image/jpeg' }
    });
    (env.R2_BUCKET as unknown as { get: typeof get }).get = get;
    const image = await worker.request(new URL(uploaded.url).pathname, {}, env);
    expect(image.status).toBe(200);
    expect(image.headers.get('content-type')).toBe('image/jpeg');
    expect(new Uint8Array(await image.arrayBuffer())).toEqual(new Uint8Array([0xff, 0xd8, 0xff, 0x00]));
  });
});
