import { afterEach, expect, it, vi } from 'vitest';
import { fetchCyclingRoute, type CyclingWaypoint } from './cyclingRouteService';

const waypoints: CyclingWaypoint[] = [
  { id: 'lab-nadar', name: 'Nadar Photo Club', lat: 21.032, lng: 105.836, kind: 'filmLab' },
  { id: 'spot-pdp', name: 'Phố Phan Đình Phùng', lat: 21.04, lng: 105.837, kind: 'spot' },
  { id: 'spot-loading', name: 'Loading T Café', lat: 21.028, lng: 105.85, kind: 'spot' },
];
const geometry = { type: 'LineString', coordinates: [[105.836, 21.032], [105.838, 21.038], [105.837, 21.04], [105.85, 21.028]] };
afterEach(() => vi.unstubAllGlobals());

it('requests the ordered waypoints and returns detailed route geometry and trip totals', async () => {
  const fetcher = vi.fn(async () => Response.json({ geometry, distanceKm: 3.2, durationMinutes: 14, legs: [] }));
  vi.stubGlobal('fetch', fetcher);

  const result = await fetchCyclingRoute(waypoints);

  expect(fetcher).toHaveBeenCalledWith('/api/cycling-route', expect.objectContaining({
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stops: waypoints.map(({ lat, lng }) => ({ lat, lng })) }),
  }));
  expect(result).toMatchObject({ geometry, distanceKm: 3.2, durationMinutes: 14 });
});

it('rejects both zero- and one-stop routes', async () => {
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  for (const stops of [[], [waypoints[0]]]) {
    await expect(fetchCyclingRoute(stops)).rejects.toThrow('Chọn ít nhất hai điểm');
  }
  expect(fetcher).not.toHaveBeenCalled();
});

it('rejects missing and out-of-region coordinates rather than routing a fake point', async () => {
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  await expect(fetchCyclingRoute([{ ...waypoints[0], lat: null as unknown as number }, waypoints[1]])).rejects.toThrow('tọa độ');
  await expect(fetchCyclingRoute([waypoints[0], { ...waypoints[1], lng: 0 }])).rejects.toThrow('tọa độ');
  expect(fetcher).not.toHaveBeenCalled();
});

it('reports empty, malformed and provider-error responses without inventing a straight-line route', async () => {
  const fetcher = vi.fn(async () => Response.json({ geometry: { type: 'LineString', coordinates: [[105, 21]] }, distanceKm: 0, durationMinutes: 0 }));
  vi.stubGlobal('fetch', fetcher);
  await expect(fetchCyclingRoute(waypoints)).rejects.toThrow('Không có tuyến xe đạp hợp lệ');
  fetcher.mockResolvedValueOnce(Response.json({ error: 'Dịch vụ định tuyến xe đạp đang tạm gián đoạn.' }, { status: 502 }));
  await expect(fetchCyclingRoute(waypoints)).rejects.toThrow('tạm gián đoạn');
});