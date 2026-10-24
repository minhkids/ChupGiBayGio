import { expect, it } from 'vitest';
import { along, bearing, length, lineString } from '@turf/turf';
import { easeInOutQuad, getCyclingStoryFrame } from './cyclingStoryMotion';

const route = lineString([[105.8542, 21.0285], [105.858, 21.032], [105.8665, 21.0651]]);

it('looks exactly 50m ahead on a bend, including the starting frame', () => {
  const bend = lineString([[105.85, 21], [105.8502, 21], [105.8502, 21.01]]);
  for (const raw of [0, .1, .5, .99]) {
    const frame = getCyclingStoryFrame(bend, raw);
    const expected = bearing(along(bend, frame.distanceKm), along(bend, Math.min(length(bend), frame.distanceKm + .05)));
    expect(frame.bearing).toBeCloseTo(expected, 8);
    expect(frame.bearing).toBeGreaterThanOrEqual(-180);
    expect(frame.bearing).toBeLessThanOrEqual(180);
  }
});

it('uses quadratic ease-in-out with stable endpoints and midpoint', () => {
  expect(easeInOutQuad(0)).toBe(0);
  expect(easeInOutQuad(0.25)).toBe(0.125);
  expect(easeInOutQuad(0.5)).toBe(0.5);
  expect(easeInOutQuad(0.75)).toBe(0.875);
  expect(easeInOutQuad(1)).toBe(1);
});

it('returns an interpolated bicycle position and only the traveled route segment', () => {
  const start = getCyclingStoryFrame(route, 0);
  const middle = getCyclingStoryFrame(route, 0.5);
  const end = getCyclingStoryFrame(route, 1);

  expect(start.position).toEqual([105.8542, 21.0285]);
  expect(start.traveled).toBeNull();
  expect(middle.position).not.toEqual(start.position);
  expect(middle.position).not.toEqual(end.position);
  expect(middle.traveled?.geometry.coordinates.at(-1)?.[0]).toBeCloseTo(middle.position[0], 8);
  expect(middle.traveled?.geometry.coordinates.at(-1)?.[1]).toBeCloseTo(middle.position[1], 8);
  expect(end.position).toEqual([105.8665, 21.0651]);
  expect(end.traveled?.geometry.coordinates).toEqual(route.geometry.coordinates);
});

it('smooths route bearing across the 359-to-1 degree north wrap', () => {
  const northRoute = lineString([[105.85, 21], [105.8502, 21.01], [105.8504, 21.02]]);
  const frame = getCyclingStoryFrame(northRoute, 0.5, 359);
  expect(frame.bearing).toBeGreaterThan(-1);
  expect(frame.bearing).toBeLessThan(1);
});