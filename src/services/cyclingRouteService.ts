import type { CyclingWaypoint } from '../types/planner';
export type { CyclingWaypoint } from '../types/planner';

export interface CyclingRoute {
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  distanceKm: number;
  durationMinutes: number;
  legs: { distanceKm: number; durationMinutes: number }[];
  attribution: string;
}

const MAX_WAYPOINTS = 7;

function validCoordinates({ lat, lng }: CyclingWaypoint): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 8 && lat <= 24 && lng >= 102 && lng <= 110;
}

export async function fetchCyclingRoute(waypoints: CyclingWaypoint[], signal?: AbortSignal): Promise<CyclingRoute> {
  if (waypoints.length < 2) throw new Error('Chọn ít nhất hai điểm để tạo hành trình.');
  if (waypoints.length > MAX_WAYPOINTS) throw new Error(`Mỗi hành trình tối đa ${MAX_WAYPOINTS} điểm.`);
  if (!waypoints.every(validCoordinates)) throw new Error('Một hoặc nhiều điểm chưa có tọa độ hợp lệ tại Việt Nam.');

  let response: Response;
  try {
    response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cycling-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stops: waypoints.map(({ lat, lng }) => ({ lat, lng })) }),
      signal: signal ?? AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error('Dịch vụ định tuyến xe đạp đang tạm gián đoạn. Vui lòng thử lại.');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { error?: unknown } | null;
    throw new Error(typeof error?.error === 'string' ? error.error : 'Dịch vụ định tuyến xe đạp đang tạm gián đoạn. Vui lòng thử lại.');
  }
  const result: unknown = await response.json().catch(() => null);
  if (!result || typeof result !== 'object') throw new Error('Không có tuyến xe đạp hợp lệ cho các điểm đã chọn.');
  const row = result as Record<string, unknown>;
  const geometry = row.geometry as { type?: unknown; coordinates?: unknown } | undefined;
  const coordinates = geometry?.coordinates;
  if (geometry?.type !== 'LineString' || !Array.isArray(coordinates) || coordinates.length < 2
    || !coordinates.every(point => Array.isArray(point) && point.length >= 2
      && typeof point[0] === 'number' && Number.isFinite(point[0])
      && typeof point[1] === 'number' && Number.isFinite(point[1]))
    || typeof row.distanceKm !== 'number' || !Number.isFinite(row.distanceKm) || row.distanceKm <= 0
    || typeof row.durationMinutes !== 'number' || !Number.isFinite(row.durationMinutes) || row.durationMinutes <= 0) {
    throw new Error('Không có tuyến xe đạp hợp lệ cho các điểm đã chọn.');
  }
  const legs = Array.isArray(row.legs) ? row.legs.filter((leg): leg is { distanceKm: number; durationMinutes: number } =>
    !!leg && typeof leg === 'object'
      && typeof (leg as Record<string, unknown>).distanceKm === 'number'
      && typeof (leg as Record<string, unknown>).durationMinutes === 'number') : [];
  return {
    geometry: { type: 'LineString', coordinates: coordinates as [number, number][] },
    distanceKm: row.distanceKm,
    durationMinutes: row.durationMinutes,
    legs,
    attribution: typeof row.attribution === 'string' ? row.attribution : '© OpenStreetMap contributors',
  };
}