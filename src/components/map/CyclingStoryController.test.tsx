// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { CyclingWaypoint } from '../../types/planner';
import type { CyclingRoute } from '../../services/cyclingRouteService';
import { CyclingStoryController } from './CyclingStoryController';

const fetchRoute = vi.fn();
vi.mock('../../services/cyclingRouteService', () => ({ fetchCyclingRoute: (...args: unknown[]) => fetchRoute(...args) }));

const stops: CyclingWaypoint[] = [
  { id: 'lab', name: 'Nadar', kind: 'filmLab', lat: 21.03, lng: 105.83 },
  { id: 'spot', name: 'Phan Đình Phùng', kind: 'spot', lat: 21.04, lng: 105.84 },
];
const route: CyclingRoute = {
  geometry: { type: 'LineString', coordinates: [[105.83, 21.03], [105.835, 21.035], [105.84, 21.04]] },
  distanceKm: 1.4, durationMinutes: 8, legs: [{ distanceKm: 1.4, durationMinutes: 8 }], attribution: '© OpenStreetMap contributors',
};
const addLayerSpy = vi.fn();
const map = {
  addLayer: addLayerSpy, removeLayer: vi.fn(), closePopup: vi.fn(), openPopup: vi.fn(), flyTo: vi.fn(), panTo: vi.fn(), on: vi.fn(), off: vi.fn(),
  getContainer: () => document.createElement('div'), latLngToContainerPoint: () => ({ x: 40, y: 40 }),
} as unknown as LeafletMap;

beforeEach(() => { fetchRoute.mockReset().mockResolvedValue(route); addLayerSpy.mockClear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it('requests an ordered multi-stop cycling route and flies to the real route origin', async () => {
  render(<CyclingStoryController map={map} isOpen mode="plan" targetSpot={null} waypoints={stops} isVertical={false} onVerticalModeChange={vi.fn()} onClose={vi.fn()} />);
  await waitFor(() => expect(fetchRoute).toHaveBeenCalledOnce());
  expect(fetchRoute).toHaveBeenCalledWith(stops, expect.any(AbortSignal));
  expect(map.flyTo).toHaveBeenCalledWith([21.03, 105.83], 15.5, expect.objectContaining({ duration: 1.5 }));
  expect(map.openPopup).toHaveBeenCalledOnce();
  expect(await screen.findByText('1,4 km · ~8 phút · © OpenStreetMap contributors')).toBeTruthy();
});

it('renders layered vintage vectors, bounded rear dust and clean cased route without obsolete glimmer', async () => {
  render(<CyclingStoryController map={map} isOpen mode="plan" targetSpot={null} waypoints={stops} isVertical={false} onVerticalModeChange={vi.fn()} onClose={vi.fn()} />);
  await waitFor(() => expect(fetchRoute).toHaveBeenCalledOnce());
  const layers = addLayerSpy.mock.calls.map(([layer]) => layer as L.Layer);
  const bikeMarker = layers.find(layer => layer instanceof L.Marker && (layer.options.icon as L.DivIcon).options.className === 'cycling-story-bike-icon') as L.Marker;
  expect((bikeMarker.options.icon as L.DivIcon).options.html).toContain('cycling-story-flower');
  const icon = bikeMarker.options.icon as L.DivIcon;
  const artwork = document.createElement('div'); artwork.innerHTML = String(icon.options.html);
  expect(icon.options.iconSize).toEqual([112, 100]); expect(icon.options.iconAnchor).toEqual([56, 86]);
  expect(artwork.querySelector('[data-cycling-bike-shadow]')).not.toBeNull();
  expect(artwork.querySelector('[data-cycling-bike-basket]')).not.toBeNull();
  expect(artwork.querySelectorAll('linearGradient').length).toBeGreaterThan(1);
  for (const part of ['wheel-front', 'wheel-back', 'pedal-crank', 'bike-frame']) expect(artwork.querySelector(`g[data-part="${part}"]`)).not.toBeNull();
  expect(artwork.querySelectorAll('[data-dust]').length).toBe(3);
  expect(layers.some(layer => layer instanceof L.Polyline && layer.options.className === 'cycling-story-glimmer')).toBe(false);
  expect(layers.some(layer => layer instanceof L.Polyline && layer.options.weight === 7)).toBe(true);
  expect(document.querySelector('style')?.textContent).toContain('@keyframes cyclingStoryBob');
  expect(document.querySelector('style')?.textContent).toContain('prefers-reduced-motion');
  for (const motion of ['cyclingStoryLaunch', 'cyclingStoryBasket', 'cyclingStoryFlower', 'cyclingStoryFrameSettle']) expect(document.querySelector('style')?.textContent).toContain(`@keyframes ${motion}`);
});

it('anticipates launch and settles the basket and flowers independently on braking and parking', async () => {
  render(<CyclingStoryController map={map} isOpen mode="plan" targetSpot={null} waypoints={stops} isVertical={false} onVerticalModeChange={vi.fn()} onClose={vi.fn()} />);
  await waitFor(() => expect(fetchRoute).toHaveBeenCalledOnce());
  const css = [...document.querySelectorAll('style')].map(node => node.textContent).join('\n');
  expect(css).toMatch(/\[data-motion="launch"\] \[data-part="basket-sway"\]\s*\{animation:cyclingStoryBasketLaunch/);
  expect(css).toMatch(/\[data-motion="brake"\] \[data-part="basket-sway"\]\s*\{animation:cyclingStoryBasketBrake/);
  expect(css).toMatch(/\[data-motion="parked"\] \[data-part="basket-sway"\]\s*\{animation:cyclingStoryBasketSettle/);
  expect(css).toMatch(/\[data-motion="parked"\] \.cycling-story-flower\s*\{animation:cyclingStoryFlowerSettle/);
  expect(css).toMatch(/\[data-motion="parked"\] \.bike-frame\s*\{animation:cyclingStoryFrameSettle/);
  expect(css).toContain('.cycling-story-bike[data-motion="parked"]{animation:cyclingStoryPark');
  expect(css).toMatch(/\[data-motion="ride"\]\[data-riding="true"\] \.bike-frame\{animation:cyclingStoryBob/);
  expect(css).toMatch(/\[data-motion="ride"\]\[data-riding="true"\] \[data-part="basket-sway"\]\{animation:cyclingStoryBasket/);
  expect(css).toMatch(/@media\(prefers-reduced-motion:reduce\)\{[^}]*animation:none!important/);
});

it('shows a clear error when a route cannot be returned', async () => {
  fetchRoute.mockRejectedValueOnce(new Error('Không có tuyến xe đạp hợp lệ.'));
  render(<CyclingStoryController map={map} isOpen mode="plan" targetSpot={null} waypoints={stops} isVertical={false} onVerticalModeChange={vi.fn()} onClose={vi.fn()} />);
  expect(await screen.findByText('Không có tuyến xe đạp hợp lệ.')).toBeTruthy();
});

it('keeps wheel and suspension still under reduced motion while following a westbound turn', async () => {
  vi.useFakeTimers();
  fetchRoute.mockResolvedValue({ ...route, geometry: { type: 'LineString', coordinates: [[105.84, 21.04], [105.83, 21.03]] } });
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addListener: vi.fn(), removeListener: vi.fn() })));
  let nextFrame: FrameRequestCallback = () => {};
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { nextFrame = callback; return 1; });
  const element = document.createElement('div'); vi.spyOn(L.Marker.prototype, 'getElement').mockReturnValue(element);
  await act(async () => { render(<CyclingStoryController map={map} isOpen mode="plan" targetSpot={null} waypoints={stops} isVertical={false} onVerticalModeChange={vi.fn()} onClose={vi.fn()} />); });
  const marker = addLayerSpy.mock.calls.map(([layer]) => layer).find(layer => layer instanceof L.Marker && layer.options.icon?.options.className === 'cycling-story-bike-icon') as L.Marker;
  element.innerHTML = String((marker.options.icon as L.DivIcon).options.html);
  await act(async () => { vi.advanceTimersByTime(1500); }); act(() => nextFrame(0)); act(() => nextFrame(2000));
  expect(element.querySelector('[data-cycling-bike]')?.getAttribute('data-riding')).toBe('false');
  expect(element.querySelector('[data-part="wheel-front"]')?.getAttribute('transform')).toBe('rotate(0)');
  expect(element.querySelector('[data-part="frame-pose"]')?.getAttribute('transform')).toBe('rotate(0 54 65)');
  expect(element.querySelector<HTMLElement>('[data-cycling-bike-rotate]')?.style.transform).toBe('scaleX(-1)');
  expect(marker.getLatLng().lng).toBeCloseTo(105.835, 3);
  vi.unstubAllGlobals();
});

it('keeps a westbound bicycle upright on its route and parks its animation at arrival', async () => {
  vi.useFakeTimers();
  fetchRoute.mockResolvedValue({ ...route, geometry: { type: 'LineString', coordinates: [[105.84, 21.04], [105.83, 21.03]] } });
  let nextFrame: FrameRequestCallback = () => {};
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { nextFrame = callback; return 1; });
  const element = document.createElement('div'); vi.spyOn(L.Marker.prototype, 'getElement').mockReturnValue(element);
  await act(async () => { render(<CyclingStoryController map={map} isOpen mode="plan" targetSpot={null} waypoints={[...stops].reverse()} isVertical={false} onVerticalModeChange={vi.fn()} onClose={vi.fn()} />); });
  const bike = addLayerSpy.mock.calls.map(([layer]) => layer).find(layer => layer instanceof L.Marker && layer.options.icon?.options.className === 'cycling-story-bike-icon') as L.Marker;
  element.innerHTML = String((bike.options.icon as L.DivIcon).options.html);
  await act(async () => { vi.advanceTimersByTime(1500); }); act(() => nextFrame(0)); act(() => nextFrame(2000));
  expect(element.querySelector('[data-cycling-bike]')?.getAttribute('data-motion')).toBe('ride');
  expect(element.querySelector('[data-part="frame-pose"]')?.getAttribute('transform')).toMatch(/rotate\(/);
  expect(element.querySelector('[data-cycling-bike]')?.getAttribute('data-riding')).toBe('true');
  expect(element.querySelector<HTMLElement>('[data-cycling-bike-rotate]')?.style.transform).toContain('scaleX(-1)');
  const wheel = element.querySelector('[data-part="wheel-front"]'); expect(wheel?.getAttribute('transform')).toMatch(/rotate\(/);
  expect(bike.getLatLng().lng).toBeCloseTo(105.835, 3);
  const angle = () => Number(wheel?.getAttribute('transform')?.match(/rotate\(([^)]+)\)/)?.[1]);
  const phase = angle(); act(() => nextFrame(2050));
  const cruiseStep = (angle() - phase + 360) % 360; expect(cruiseStep).toBeGreaterThan(38); expect(cruiseStep).toBeLessThanOrEqual(40);
  act(() => nextFrame(3900)); const brakingPhase = angle(); act(() => nextFrame(3950));
  expect(element.querySelector('[data-cycling-bike]')?.getAttribute('data-motion')).toBe('brake');
  expect((angle() - brakingPhase + 360) % 360).toBeLessThan(5);
  act(() => nextFrame(4000));
  expect(element.querySelector('[data-cycling-bike]')?.getAttribute('data-motion')).toBe('parked');
  expect(bike.getLatLng().lng).toBeCloseTo(105.83, 5);
  expect(element.querySelector('[data-cycling-bike]')?.getAttribute('data-riding')).toBe('false');
  expect(element.querySelector<HTMLElement>('[data-cycling-bike]')?.style.transform).toBe('');
  expect(element.querySelector('[data-part="frame-pose"]')?.getAttribute('transform')).toBe('rotate(0 54 65)');
  const arrival = addLayerSpy.mock.calls.map(([layer]) => layer).find(layer => layer instanceof L.Marker && layer.options.icon?.options.className === 'cycling-story-arrival-icon') as L.Marker;
  const arrivalDOM = document.createElement('div'); arrivalDOM.innerHTML = String((arrival.options.icon as L.DivIcon).options.html);
  expect(arrivalDOM.querySelectorAll('.cycling-story-ripple')).toHaveLength(2);
});