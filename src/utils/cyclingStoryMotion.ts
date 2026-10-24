import { along, bearing, length, lineSlice, point } from '@turf/turf';
import type { Feature, LineString, Point } from 'geojson';

export interface CyclingStoryFrame {
  progress: number;
  distanceKm: number;
  position: [number, number];
  bearing: number;
  traveled: Feature<LineString> | null;
}

export function easeInOutQuad(progress: number): number {
  const t = Math.max(0, Math.min(1, progress));
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function smoothAngle(previous: number, next: number, alpha = 0.18): number {
  const delta = ((next - previous + 540) % 360) - 180;
  return previous + delta * alpha;
}

export function getCyclingStoryFrame(route: Feature<LineString>, progress: number, previousBearing?: number): CyclingStoryFrame {
  const eased = easeInOutQuad(progress);
  const distanceKm = length(route, { units: 'kilometers' });
  const travelledKm = distanceKm * eased;
  const start = point(route.geometry.coordinates[0]);
  const current = along(route, travelledKm, { units: 'kilometers' });
  // Look 50m ahead on the actual 2D route, not an elevation/slope estimate.
  const ahead = along(route, Math.min(distanceKm, travelledKm + 0.05), { units: 'kilometers' });
  const behind = along(route, Math.max(0, travelledKm - 0.05), { units: 'kilometers' });
  const nextBearing = bearing((eased === 1 ? behind : current) as Feature<Point>, (eased === 1 ? current : ahead) as Feature<Point>);
  const value = (((previousBearing === undefined ? nextBearing : smoothAngle(previousBearing, nextBearing)) + 540) % 360) - 180;
  const traveled = eased <= 0 ? null : lineSlice(start, current, route);
  return {
    progress: eased,
    distanceKm: travelledKm,
    position: current.geometry.coordinates as [number, number],
    bearing: value,
    traveled,
  };
}