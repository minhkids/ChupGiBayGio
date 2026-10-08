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
    const env = environment({ photographers: [{ id: 'p-1', name: 'Minh Studio', status: 'published', address: '15 Ngọc Thụy, Hà Nội', district: 'Long Biên', styles: '["MàuFilm"]', preferred_spots: '["Hồ Tây"]', portfolio_photos: '["https://example.com/a.jpg"]' }], photographer_packages: [{ id: 'pkg-1', photographer_id: 'p-1', name: 'Ngoại cảnh', price: 600000 }] });
    const people = await worker.request('/api/photographers', {}, env);
    expect(people.status).toBe(200);
    expect(await people.json()).toMatchObject([{ id: 'p-1', styles: ['MàuFilm'], portfolioPhotos: ['https://example.com/a.jpg'] }]);
    const directory = await worker.request('/api/services', {}, env);
    expect(directory.status).toBe(200);
    expect(await directory.json()).toContainEqual(expect.objectContaining({ id: 'p-1', category: 'photographer', shootSpots: ['Hồ Tây'], address: '15 Ngọc Thụy, Hà Nội', district: 'Long Biên' }));
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

  it('requires a Hanoi geocode before publishing a film lab', async () => {
    const env = environment();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify([{ lat: '21.03', lon: '105.85' }]), { status: 200 }));
    try {
      const response = await submit('/api/partner/register-lab', { name: 'Lab Hà Nội', address: '36 Lý Quốc Sư', district: 'Hoàn Kiếm', phone: '0912345678', filmStocks: ['Kodak Gold 200'], fast2h: true }, [jpg()], env);
      expect(response.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(env.writes.some(({ sql, values }) => sql.includes('INSERT INTO film_labs') && values.includes(21.03) && values.includes('published') && values[8] === 0)).toBe(true);
    } finally { fetchMock.mockRestore(); }
  });

  it('refuses unverifiable addresses instead of pinning a fake location', async () => {
    const env = environment();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('[]', { status: 200 }));
    try {
      const response = await submit('/api/partner/register-lab', { name: 'Lab Hà Nội', address: 'Không tìm được', district: 'Hoàn Kiếm', phone: '0912345678', filmStocks: [] }, [], env);
      expect(response.status).toBe(422);
      expect(env.writes).toHaveLength(0);
    } finally { fetchMock.mockRestore(); }
  });
});