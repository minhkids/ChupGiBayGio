// @vitest-environment jsdom

import { afterEach, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { ShootPlanProvider, useShootPlan } from './ShootPlanContext';
import { MOCK_SPOTS } from '../data/mockSpots';

const key = 'chupgibaygio_shoot_plan';
afterEach(() => { cleanup(); localStorage.clear(); });
it('migrates old plans and persists, deduplicates, annotates and clears reference photos', () => {
  localStorage.setItem(key, JSON.stringify({ spots: [], items: [], photographer: null }));
  const { result } = renderHook(() => useShootPlan(), { wrapper: ShootPlanProvider });
  expect(result.current.referencePhotos).toEqual([]);
  act(() => result.current.addReferencePhoto({ imageUrl: 'https://example.com/a.jpg', label: 'Góc chụp' }));
  act(() => result.current.addReferencePhoto({ imageUrl: 'https://example.com/a.jpg', label: 'Góc chụp' }));
  expect(result.current.referencePhotos).toHaveLength(1);
  const id = result.current.referencePhotos[0].id;
  act(() => result.current.updateReferencePhotoNote(id, 'Ngược sáng'));
  expect(JSON.parse(localStorage.getItem(key)!).referencePhotos[0].note).toBe('Ngược sáng');
  expect(result.current.totalCount).toBe(1);
  expect(result.current.generateBriefText()).toContain('Ngược sáng');
  act(() => result.current.removeReferencePhoto(id));
  expect(result.current.referencePhotos).toEqual([]);
  act(() => result.current.addReferencePhoto({ imageUrl: 'data:image/png;base64,YQ==', label: 'Tải lên' }));
  act(() => result.current.clearPlan());
  expect(result.current.referencePhotos).toEqual([]);
});

it('persists cycling waypoints in an explicit order and removes a waypoint cleanly', () => {
  const { result } = renderHook(() => useShootPlan(), { wrapper: ShootPlanProvider });
  const lab = { id: 'lab', name: 'Nadar', lat: 21.032, lng: 105.836, kind: 'filmLab' as const };
  const firstSpot = { id: 'spot-1', name: 'Phan Đình Phùng', lat: 21.04, lng: 105.837, kind: 'spot' as const };
  const lastSpot = { id: 'spot-2', name: 'Loading T Café', lat: 21.028, lng: 105.85, kind: 'spot' as const };
  act(() => {
    result.current.addCyclingStop(lab);
    result.current.addCyclingStop(firstSpot);
    result.current.addCyclingStop(lastSpot);
    result.current.moveCyclingStop('spot-2', -1);
  });
  expect(result.current.cyclingStops.map(stop => stop.id)).toEqual(['lab', 'spot-2', 'spot-1']);
  expect(JSON.parse(localStorage.getItem(key)!).cyclingStops.map((stop: { id: string }) => stop.id)).toEqual(['lab', 'spot-2', 'spot-1']);
  act(() => result.current.removeCyclingStop('lab'));
  expect(result.current.cyclingStops.map(stop => stop.id)).toEqual(['spot-2', 'spot-1']);
});

it('adds coordinate-valid shoot-plan spots to the cycling itinerary and removes them with the spot', () => {
  const { result } = renderHook(() => useShootPlan(), { wrapper: ShootPlanProvider });
  const spot = MOCK_SPOTS[0];
  act(() => result.current.addSpot(spot));
  expect(result.current.cyclingStops).toEqual([expect.objectContaining({ id: spot.id, lat: spot.lat, lng: spot.lng, kind: 'spot' })]);
  act(() => result.current.removeSpot(spot.id));
  expect(result.current.cyclingStops).toEqual([]);
});
