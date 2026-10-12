import { describe, expect, it, vi } from 'vitest';
import worker from './index';

function environment(seed: Record<string, Record<string, unknown>[]> = {}) {
  const writes: { sql: string; values: unknown[] }[] = [];
  const objects = new Map<string, Uint8Array>();
  const db = {
    prepare(sql: string) {
      let values: unknown[] = [];
      return {
        bind(...args: unknown[]) { values = args; return this; },
        async first() { return null; },
        async all() { return { results: Object.entries(seed).find(([table]) => sql.includes(`FROM ${table}`))?.[1] || [] }; },
        async run() { writes.push({ sql, values }); return { meta: { changes: 1 } }; }
      };
    },
    batch: vi.fn(async (statements: { run: () => Promise<unknown> }[]) => Promise.all(statements.map((statement) => statement.run())))
  };
  const bucket = {
    put: vi.fn(async (key: string, bytes: Uint8Array) => { objects.set(key, bytes); }),
    get: vi.fn(async (key: string) => objects.has(key) ? { body: objects.get(key), httpMetadata: { contentType: 'image/jpeg' } } : null),
    delete: vi.fn(async (key: string) => { objects.delete(key); })
  };
  const cache = { get: vi.fn(async () => null), put: vi.fn(async () => undefined) };
  return { DB: db as unknown as D1Database, R2_BUCKET: bucket as unknown as R2Bucket, CACHE: cache as unknown as KVNamespace, writes, bucket };
}

const jpg = () => new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], 'photo.jpg', { type: 'image/jpeg' });
const submit = (path: string, payload: Record<string, unknown>, images: File[] = [], env = environment()) => {
  const form = new FormData();
  form.set('payload', JSON.stringify(payload));
  images.forEach((image) => form.append('photos', image));
  return worker.request(path, { method: 'POST', headers: { Origin: 'https://chupgibaygio.com' }, body: form }, env);
};

const photographer = {
  name: 'Minh Studio', phone: '0912345678', styles: ['MàuFilm'], shootSpots: ['Hồ Tây'],
  package: { name: 'Nàng Thơ', price: 600000, duration: '1.5 giờ', deliveredPhotos: '15 ảnh chỉnh' }
};

describe('public partner registration', () => {
  it('suggests only distinct Hanoi addresses from the geocoder', async () => {
    const env = environment();
    const provider = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ features: [
      { geometry: { coordinates: [105.85, 21.03] }, properties: { name: 'Ngọc Thụy', type: 'street', district: 'Bồ Đề', city: 'Hà Nội', countrycode: 'VN' } },
      { geometry: { coordinates: [105.85, 21.03] }, properties: { name: 'Ngọc Thụy', type: 'street', district: 'Bồ Đề', city: 'Hà Nội', countrycode: 'VN' } },
      { geometry: { coordinates: [105.86, 21.04] }, properties: { name: 'Công viên Ngọc Thụy', osm_key: 'leisure', district: 'Bồ Đề', city: 'Hà Nội', countrycode: 'VN' } },
      { geometry: { coordinates: [106.7, 20.8] }, properties: { name: 'Lê Lợi', type: 'street', city: 'Hải Phòng', countrycode: 'VN' } }
    ] }), { status: 200 }));
    try {
      const response = await worker.request('/api/partner/address-suggestions?q=Ng%E1%BB%8Dc%20Th%E1%BB%A5y', {}, env);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([{ label: 'Ngọc Thụy, Bồ Đề, Hà Nội' }]);
      expect(provider).toHaveBeenCalledOnce();
    } finally { provider.mockRestore(); }
  });

  it('does not query the geocoder for an empty or short address', async () => {
    const provider = vi.spyOn(globalThis, 'fetch');
    try {
      const response = await worker.request('/api/partner/address-suggestions?q=Ng', {}, environment());
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([]);
      expect(provider).not.toHaveBeenCalled();
    } finally { provider.mockRestore(); }
  });

  it('stores an optional public studio address without affecting photographers without studios', async () => {
    const env = environment();
    const response = await submit('/api/partner/register-photographer', { ...photographer, address: '15 Ngọc Thụy, Long Biên, Hà Nội', district: 'Long Biên' }, [jpg(), jpg(), jpg()], env);
    expect(response.status).toBe(201);
    const written = env.writes.find(({ sql }) => sql.includes('INSERT INTO photographers'));
    expect(written?.sql).toContain('address');
    expect(written?.values).toContain('15 Ngọc Thụy, Long Biên, Hà Nội');
    expect(written?.values).toContain('Long Biên');
  });
  it('reads published partner records through the live directory and photographer API', async () => {
    const env = environment({
      photographers: [{ id: 'p-1', name: 'Minh Studio', status: 'published', address: '15 Ngọc Thụy, Hà Nội', district: 'Long Biên', styles: '["MàuFilm"]', preferred_spots: '["Hồ Tây"]', portfolio_photos: '["https://example.com/a.jpg"]' }],
      photographer_packages: [{ id: 'pkg-1', photographer_id: 'p-1', name: 'Ngoại cảnh', price: 600000 }],
      film_labs: [
        { id: 'lab-1', name: 'Film Shop', slogan: 'Film đẹp cho mọi khoảnh khắc', address: '36 Lý Quốc Sư', ward: 'Cửa Nam', district: 'Hoàn Kiếm', status: 'published', in_stock_films: '["Kodak Gold 200"]', product_image_url: 'https://example.com/product.jpg', cheapest_roll_name: 'Kodak Gold 200', min_roll_price: 125000, max_roll_price: 350000 },
        { id: 'lab-min-only', name: 'Shop chỉ biết giá rẻ nhất', ward: 'Cửa Nam', district: 'Hoàn Kiếm', status: 'published', in_stock_films: '["Kodak Gold 200"]', cheapest_roll_name: 'Kodak Gold 200', min_roll_price: 50000, max_roll_price: 0 },
      ],
    });
    const people = await worker.request('/api/photographers', {}, env);
    expect(people.status).toBe(200);
    expect(await people.json()).toMatchObject([{ id: 'p-1', styles: ['MàuFilm'], portfolioPhotos: ['https://example.com/a.jpg'] }]);
    const directory = await worker.request('/api/services', {}, env);
    expect(directory.status).toBe(200);
    const directoryData = await directory.json();
    expect(directoryData).toContainEqual(expect.objectContaining({ id: 'p-1', category: 'photographer', shootSpots: ['Hồ Tây'], address: '15 Ngọc Thụy, Hà Nội', district: 'Long Biên' }));
    expect(directoryData).toContainEqual(expect.objectContaining({ id: 'lab-1', category: 'filmLab', slogan: 'Film đẹp cho mọi khoảnh khắc', address: 'Cửa Nam, Hoàn Kiếm, Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm', productImageUrl: 'https://example.com/product.jpg', cheapestRollName: 'Kodak Gold 200', minRollPrice: 125000, maxRollPrice: 350000, price: '125.000đ – 350.000đ/cuộn' }));
    expect(directoryData).toContainEqual(expect.objectContaining({ id: 'lab-min-only', minRollPrice: 50000, maxRollPrice: 0, price: 'Từ 50.000đ/cuộn' }));
    const labs = await worker.request('/api/labs', {}, environment({ film_labs: [{ id: 'lab-1', name: 'Film Shop', address: '36 Lý Quốc Sư', ward: 'Cửa Nam', district: 'Hoàn Kiếm', status: 'published' }] }));
    expect(await labs.json()).toMatchObject([{ id: 'lab-1', address: 'Cửa Nam, Hoàn Kiếm, Hà Nội', ward: 'Cửa Nam' }]);
  });
  it('publishes a photographer with package and persisted portfolio images', async () => {
    const env = environment();
    const response = await submit('/api/partner/register-photographer', photographer, [jpg(), jpg(), jpg()], env);
    expect(response.status).toBe(201);
    const result = await response.json() as { id: string; status: string; url: string };
    expect(result.status).toBe('published');
    expect(result.url).toContain(`partner=${result.id}`);
    expect(env.writes.some(({ sql, values }) => sql.includes('INSERT INTO photographers') && values.includes('Minh Studio') && values.includes('published'))).toBe(true);
    expect(env.writes.some(({ sql, values }) => sql.includes('INSERT INTO photographer_packages') && values.includes(600000))).toBe(true);
    expect(env.bucket.put).toHaveBeenCalledTimes(3);
    const photo = env.bucket.put.mock.calls[0][0];
    const fetched = await worker.request(`/api/partner/images/${photo}`, {}, env);
    expect(fetched.status).toBe(200);
  });

  it('rejects too few portfolio images without persisting anything', async () => {
    const env = environment();
    const response = await submit('/api/partner/register-photographer', photographer, [jpg()], env);
    expect(response.status).toBe(400);
    expect(env.writes).toHaveLength(0);
    expect(env.bucket.put).not.toHaveBeenCalled();
  });

  it('rejects invalid image signatures without publishing', async () => {
    const env = environment();
    const response = await submit('/api/partner/register-photographer', photographer, [jpg(), jpg(), new File(['bad'], 'fake.jpg', { type: 'image/jpeg' })], env);
    expect(response.status).toBe(415);
    expect(env.writes).toHaveLength(0);
  });

  it('does not expose arbitrary R2 keys through the image route', async () => {
    const response = await worker.request('/api/partner/images/admin/photographers/private.jpg', {}, environment());
    expect(response.status).toBe(404);
  });

  it('publishes a film shop using ward and district only without geocoding an exact address', async () => {
    const env = environment();
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    try {
      const response = await submit('/api/partner/register-lab', { name: 'Lab Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm', phone: '0912345678', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000, maxRollPrice: 340000, fast2h: true }, [jpg()], env);
      expect(response.status).toBe(201);
      expect(fetchMock).not.toHaveBeenCalled();
      const insert = env.writes.find(({ sql }) => sql.includes('INSERT INTO film_labs'));
      expect(insert?.sql).toContain('ward');
      expect(insert?.sql).toContain('cheapest_roll_name');
      expect(insert?.values).toContain('Cửa Nam');
      expect(insert?.values).toContain('Kodak Gold 200');
      expect(insert?.values).toContain(null);
      expect(insert?.values).toContain('published');
    } finally { fetchMock.mockRestore(); }
  });

  it('persists multiple validated branch locations for one film shop', async () => {
    const env = environment();
    const locations = [
      { ward: 'Cửa Nam', district: 'Hoàn Kiếm', openingHours: '09:00–18:00' },
      { ward: 'Dịch Vọng', district: 'Cầu Giấy', openingHours: '10:00–20:00' },
    ];
    const response = await submit('/api/partner/register-lab', {
      name: 'Tiệm Film', locations, phone: '0912345678', filmStocks: ['Kodak Gold 200'],
      cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000,
    }, [], env);
    expect(response.status).toBe(201);
    const insert = env.writes.find(({ sql }) => sql.includes('INSERT INTO film_labs'));
    expect(insert?.sql).toContain('locations');
    expect(insert?.values).toContain(JSON.stringify(locations));
    expect(insert?.values).toContain('Cửa Nam');
  });

  it('rejects invalid film-shop branch locations without uploading or writing', async () => {
    const env = environment();
    const invalid = await submit('/api/partner/register-lab', {
      name: 'Tiệm Film', locations: [{ ward: 'Cửa Nam', district: 'Không tồn tại' }], phone: '0912345678',
      filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000,
    }, [jpg()], env);
    expect(invalid.status).toBe(400);
    expect(env.writes).toHaveLength(0);
    expect(env.bucket.put).not.toHaveBeenCalled();
  });

  it('caps a shop at three Hanoi branches', async () => {
    const env = environment();
    const locations = Array.from({ length: 4 }, (_, index) => ({ ward: `Phường ${index + 1}`, district: 'Cầu Giấy' }));
    const response = await submit('/api/partner/register-lab', {
      name: 'Tiệm Film', locations, phone: '0912345678', filmStocks: ['Kodak Gold 200'],
      cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000,
    }, [], env);
    expect(response.status).toBe(400);
    expect(env.writes).toHaveLength(0);
  });

  it('accepts a shop registration with only the cheapest roll price', async () => {
    const env = environment();
    const response = await submit('/api/partner/register-lab', {
      name: 'Tiệm Film', ward: 'Cửa Nam', district: 'Hoàn Kiếm', phone: '0912345678',
      filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000,
    }, [], env);
    expect(response.status).toBe(201);
    const insert = env.writes.find(({ sql }) => sql.includes('INSERT INTO film_labs'));
    expect(insert?.values).toContain(120000);
    expect(insert?.values).toContain(0);
  });

  it('stores the product photo and comparable film roll price range for a shop', async () => {
    const env = environment();
    const form = new FormData();
    form.set('payload', JSON.stringify({ name: 'Lab Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm', phone: '0912345678', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 125000, maxRollPrice: 350000 }));
    form.set('productPhoto', jpg());
    const response = await worker.request('/api/partner/register-lab', { method: 'POST', headers: { Origin: 'https://chupgibaygio.com' }, body: form }, env);
    expect(response.status).toBe(201);
    const insert = env.writes.find(({ sql }) => sql.includes('INSERT INTO film_labs'));
    expect(insert?.sql).toContain('product_image_url');
    expect(insert?.sql).toContain('cheapest_roll_name');
    expect(insert?.sql).toContain('min_roll_price');
    expect(insert?.sql).toContain('max_roll_price');
    expect(insert?.values).toEqual(expect.arrayContaining([125000, 350000, 'Cửa Nam']));
    expect(insert?.values.some((value) => typeof value === 'string' && value.includes('/api/partner/images/partner/lab/'))).toBe(true);
    expect(env.bucket.put).toHaveBeenCalledOnce();
  });

  it('rejects a shop registration without the cheapest film roll name', async () => {
    const env = environment();
    const response = await submit('/api/partner/register-lab', {
      name: 'Lab Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm', phone: '0912345678',
      filmStocks: [], minRollPrice: 120000, maxRollPrice: 340000,
    }, [], env);
    expect(response.status).toBe(400);
    expect(env.writes).toHaveLength(0);
    expect(env.bucket.put).not.toHaveBeenCalled();
  });

  it('requires the chosen cheapest roll to be one of the shop stock entries', async () => {
    const env = environment();
    const response = await submit('/api/partner/register-lab', {
      name: 'Lab Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm', phone: '0912345678',
      filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Fujifilm 200', minRollPrice: 120000, maxRollPrice: 340000,
    }, [], env);
    expect(response.status).toBe(400);
    expect(env.writes).toHaveLength(0);
    expect(env.bucket.put).not.toHaveBeenCalled();
  });

  it('persists a shop slogan of up to 50 characters', async () => {
    const env = environment();
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    try {
      const response = await submit('/api/partner/register-lab', {
        name: 'Lab Hà Nội', slogan: 'a'.repeat(50), ward: 'Cửa Nam', district: 'Hoàn Kiếm',
        phone: '0912345678', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000, maxRollPrice: 340000,
      }, [], env);
      expect(response.status).toBe(201);
      const insert = env.writes.find(({ sql }) => sql.includes('INSERT INTO film_labs'));
      expect(insert?.sql).toContain('slogan');
      expect(insert?.values).toContain('a'.repeat(50));
      expect(insert?.values).toContain('Cửa Nam');
      expect(fetchMock).not.toHaveBeenCalled();
    } finally { fetchMock.mockRestore(); }
  });

  it('rejects a shop slogan longer than 50 characters without writing or geocoding', async () => {
    const env = environment();
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    try {
      const response = await submit('/api/partner/register-lab', {
        name: 'Lab Hà Nội', slogan: 'a'.repeat(51), ward: 'Cửa Nam', district: 'Hoàn Kiếm',
        phone: '0912345678', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000, maxRollPrice: 340000,
      }, [], env);
      expect(response.status).toBe(400);
      expect(env.writes).toHaveLength(0);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally { fetchMock.mockRestore(); }
  });

  it('rejects an inverted film price range without storing the shop or image', async () => {
    const env = environment();
    const response = await submit('/api/partner/register-lab', {
      name: 'Lab Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm', phone: '0912345678',
      filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 350000, maxRollPrice: 125000,
    }, [jpg()], env);
    expect(response.status).toBe(400);
    expect(env.writes).toHaveLength(0);
    expect(env.bucket.put).not.toHaveBeenCalled();
  });

  it('requires a ward and district instead of an exact shop address', async () => {
    const env = environment();
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    try {
      const response = await submit('/api/partner/register-lab', { name: 'Lab Hà Nội', district: 'Hoàn Kiếm', phone: '0912345678', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000, maxRollPrice: 340000 }, [], env);
      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(env.writes).toHaveLength(0);
    } finally { fetchMock.mockRestore(); }
  });
});