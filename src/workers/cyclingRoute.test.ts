import { afterEach, expect, it, vi } from 'vitest';
import worker from './index';

const stops = [{ lat: 21.0285, lng: 105.8542 }, { lat: 21.0651, lng: 105.8665 }, { lat: 21.04, lng: 105.81 }];
const providerRoute = {
  code: 'Ok',
  routes: [{
    geometry: { type: 'LineString', coordinates: [[105.8542, 21.0285], [105.86, 21.04], [105.8665, 21.0651], [105.84, 21.05], [105.81, 21.04]] },
    distance: 3200,
    duration: 840,
    legs: [{ distance: 1500, duration: 390 }, { distance: 1700, duration: 450 }],
  }],
};
function environment() {
  const cache = new Map<string, string>();
  return { CACHE: {
    get: vi.fn(async (key: string) => cache.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => { cache.set(key, value); }),
  } };
}
afterEach(() => vi.unstubAllGlobals());

it('returns a real multi-waypoint bicycle route with distance and duration', async () => {
  const fetcher = vi.fn(async () => Response.json(providerRoute));
  vi.stubGlobal('fetch', fetcher);
  const response = await worker.request('/api/cycling-route', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stops }),
  }, environment());

  expect(response.status).toBe(200);
  const providerUrl = new URL(fetcher.mock.calls[0][0]);
  expect(providerUrl.pathname).toContain('/routed-bike/route/v1/driving/');
  expect(providerUrl.searchParams.get('overview')).toBe('full');
  expect(providerUrl.searchParams.get('geometries')).toBe('geojson');
  expect(providerUrl.pathname).toContain('105.8542,21.0285;105.8665,21.0651;105.81,21.04');
  expect(await response.json()).toMatchObject({ distanceKm: 3.2, durationMinutes: 14, geometry: providerRoute.routes[0].geometry });
});

it('rejects invalid, missing, out-of-bounds and oversized waypoint chains before routing', async () => {
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  const env = environment();
  const request = (points: unknown) => worker.request('/api/cycling-route', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stops: points }),
  }, env);

  expect((await request([{ lat: 21, lng: 105.8 }])).status).toBe(400);
  expect((await request([{ lat: 21, lng: 105.8 }, { lat: 21.1, lng: null }])).status).toBe(400);
  expect((await request([{ lat: 21, lng: 105.8 }, { lat: 0, lng: 0 }])).status).toBe(400);
  expect((await request([...stops, ...stops, ...stops])).status).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
});

it('returns a retryable error when the cycling router has no route or is unavailable', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ code: 'NoRoute', routes: [] })));
  const response = await worker.request('/api/cycling-route', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stops }),
  }, environment());
  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({ error: 'Không tìm được tuyến xe đạp cho các điểm đã chọn.' });
});