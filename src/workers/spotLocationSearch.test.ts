import { afterEach, expect, it, vi } from 'vitest';
import worker from './index';

const query = 'số 20 ngõ 465 Ngọc Thuỵ LB HN';
const feature = { geometry: { type: 'Point', coordinates: [105.8664828, 21.0650745] }, properties: { countrycode: 'VN', name: 'DIEUHOUSE Bar & Cafe', housenumber: 'Số 20', street: 'Ngõ 465 Đường Ngọc Thụy', city: 'Hà Nội', type: 'house' } };
function environment() {
  const values = new Map<string, string>();
  return { CACHE: { get: vi.fn(async (key: string) => values.get(key) || null), put: vi.fn(async (key: string, value: string) => { values.set(key, value); }) } };
}
afterEach(() => vi.unstubAllGlobals());
it('returns selectable coordinates and provider address without rewriting the query', async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({ features: [feature] }));
  vi.stubGlobal('fetch', fetcher);
  const response = await worker.request(`/api/spot-location-search?q=${encodeURIComponent(query)}`, {}, environment());
  expect(response.status).toBe(200);
  expect(new URL(fetcher.mock.calls[0][0]).searchParams.get('q')).toBe(query);
  expect(await response.json()).toEqual([expect.objectContaining({ lat: 21.0650745, lng: 105.8664828, address: 'Số 20 Ngõ 465 Đường Ngọc Thụy, Hà Nội', precision: 'address' })]);
});
it('filters null, zero, nonnumeric and foreign coordinates and labels streets approximate', async () => {
  const malformed = [[null, null], [0, 0], ['105.8', 21], [105, Infinity], [2.3, 48.8]];
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ features: [
    ...malformed.map(coordinates => ({ ...feature, geometry: { type: 'Point', coordinates } })),
    { ...feature, properties: { ...feature.properties, type: 'street', housenumber: undefined } },
  ] })));
  const response = await worker.request('/api/spot-location-search?q=Ngoc', {}, environment());
  expect(await response.json()).toEqual([expect.objectContaining({ precision: 'area', address: 'Ngõ 465 Đường Ngọc Thụy, Hà Nội' })]);
});
it('caches exact queries and limits uncached requests independently of partner quotas', async () => {
  const fetcher = vi.fn(async () => Response.json({ features: [] }));
  vi.stubGlobal('fetch', fetcher);
  const env = environment();
  await worker.request('/api/spot-location-search?q=Ngoc', {}, env);
  await worker.request('/api/spot-location-search?q=Ngoc', {}, env);
  expect(fetcher).toHaveBeenCalledTimes(1);
  for (let i = 0; i < 9; i++) expect((await worker.request(`/api/spot-location-search?q=Ngoc${i}`, {}, env)).status).toBe(200);
  expect((await worker.request('/api/spot-location-search?q=another', {}, env)).status).toBe(429);
  expect(fetcher).toHaveBeenCalledTimes(10);
});
it.each([null, {}, { features: null }])('reports malformed provider bodies as unavailable: %j', async data => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(data)));
  expect((await worker.request('/api/spot-location-search?q=Ngoc', {}, environment())).status).toBe(503);
});
it('handles provider failure and bounds query and timeout', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('timeout'));
  vi.stubGlobal('fetch', fetcher);
  expect((await worker.request('/api/spot-location-search?q=ab', {}, environment())).status).toBe(400);
  expect((await worker.request(`/api/spot-location-search?q=${'a'.repeat(161)}`, {}, environment())).status).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
  expect((await worker.request('/api/spot-location-search?q=Ngoc', {}, environment())).status).toBe(503);
  expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
});