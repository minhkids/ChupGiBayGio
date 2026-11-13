// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SpotMap } from './SpotMap';

const props = { spots: [], activeRegionId: 'hanoi', selectedSpot: null, onSelectSpot: vi.fn(), userCoords: null };
const TILE_ERROR_LIMIT = 4;
const TILE_FALLBACK_MS = 5000;

const tileSrc = (container: HTMLElement) => container.querySelector('.leaflet-tile')?.getAttribute('src') ?? '';

const failActiveLayer = (container: HTMLElement) => {
  const started = tileSrc(container);
  expect(started).not.toBe('');
  for (let attempt = 0; attempt < TILE_ERROR_LIMIT; attempt += 1) {
    const tile = container.querySelector('.leaflet-tile');
    if (!tile || tile.getAttribute('src') !== started) return;
    fireEvent.error(tile);
  }
};

const renderMap = () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  return render(<SpotMap {...props} />);
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('starts on CARTO Voyager and labels that provider', () => {
  const { container } = renderMap();
  const src = tileSrc(container);
  expect(src).toContain('https://basemaps.cartocdn.com/rastertiles/voyager/');
  expect(src).toContain('key=');
  expect(src).not.toMatch(/\{s\}|\/\/[a-d]\.basemaps\.cartocdn\.com/);
  const tile = container.querySelector('.leaflet-tile') as HTMLImageElement;
  expect(tile.referrerPolicy).toBe('strict-origin-when-cross-origin');
  expect(screen.getByText(/POSTGIS LAYER \(CARTO\)/)).toBeTruthy();
});

it('does not fly to the same region immediately after initializing the map', () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  let flyTo: ReturnType<typeof vi.spyOn> | undefined;
  render(<SpotMap {...props} onMapReady={map => { if (map) flyTo = vi.spyOn(map, 'flyTo'); }} />);
  expect(flyTo).toBeDefined();
  expect(flyTo).not.toHaveBeenCalled();
});

it('does not alert or switch providers after a single tile error', () => {
  const { container } = renderMap();
  fireEvent.error(container.querySelector('.leaflet-tile')!);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(tileSrc(container)).toContain('basemaps.cartocdn.com');
});

it('walks carto, then esri, then the canonical OSM host before showing the alert', () => {
  const { container } = renderMap();
  failActiveLayer(container);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(tileSrc(container)).toContain('server.arcgisonline.com');
  expect(screen.getByText(/POSTGIS LAYER \(ESRI\)/)).toBeTruthy();

  failActiveLayer(container);
  expect(screen.queryByRole('alert')).toBeNull();
  const osmSrc = tileSrc(container);
  expect(osmSrc).toContain('https://tile.openstreetmap.org/');
  expect(osmSrc).not.toMatch(/\/\/[abc]\.tile\.openstreetmap\.org/);
  expect(screen.getByText(/POSTGIS LAYER \(OSM\)/)).toBeTruthy();

  failActiveLayer(container);
  expect(screen.getByRole('alert').textContent).toMatch(/Không tải được bản đồ/);
  expect(tileSrc(container)).toContain('https://tile.openstreetmap.org/');

  fireEvent.click(screen.getByRole('button', { name: /Thử tải lại bản đồ/ }));
  expect(screen.queryByRole('alert')).toBeNull();
  expect(tileSrc(container)).toContain('basemaps.cartocdn.com');
  expect(screen.getByText(/POSTGIS LAYER \(CARTO\)/)).toBeTruthy();
});

it('keeps the active provider after one tile loads', () => {
  vi.useFakeTimers();
  const { container } = renderMap();
  const tile = container.querySelector('.leaflet-tile');
  expect(tile).toBeTruthy();
  fireEvent.load(tile!);
  for (let attempt = 0; attempt < TILE_ERROR_LIMIT; attempt += 1) fireEvent.error(tile!);
  act(() => { vi.advanceTimersByTime(TILE_FALLBACK_MS); });
  expect(tileSrc(container)).toContain('basemaps.cartocdn.com');
  expect(screen.queryByRole('alert')).toBeNull();
});

it('switches to the next provider when no tile loads within a few seconds', () => {
  vi.useFakeTimers();
  const { container } = renderMap();
  expect(tileSrc(container)).toContain('basemaps.cartocdn.com');
  act(() => { vi.advanceTimersByTime(TILE_FALLBACK_MS); });
  expect(tileSrc(container)).toContain('server.arcgisonline.com');
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByText(/POSTGIS LAYER \(ESRI\)/)).toBeTruthy();
});

it('still lets the provider switcher select canonical OSM tiles', () => {
  const { container } = renderMap();
  fireEvent.click(screen.getByRole('button', { name: 'OSM' }));
  const src = tileSrc(container);
  expect(src).toContain('https://tile.openstreetmap.org/');
  expect(src).not.toMatch(/\/\/[abc]\.tile\.openstreetmap\.org/);
  expect((container.querySelector('.leaflet-tile') as HTMLImageElement).referrerPolicy).toBe('strict-origin-when-cross-origin');
  expect(screen.getByText(/POSTGIS LAYER \(OSM\)/)).toBeTruthy();
});
