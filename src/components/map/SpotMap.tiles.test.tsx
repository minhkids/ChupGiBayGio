// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SpotMap } from './SpotMap';

const props = { spots: [], activeRegionId: 'hanoi', selectedSpot: null, onSelectSpot: vi.fn(), userCoords: null };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('reports the actual initial OSM provider rather than CARTO', () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  const { container } = render(<SpotMap {...props} />);
  expect(container.querySelector('.leaflet-tile')?.getAttribute('src')).toContain('tile.openstreetmap.org');
  expect(screen.getByText(/POSTGIS LAYER \(OSM\)/)).toBeTruthy();
});

it('does not fly to the same region immediately after initializing the map', () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  let flyTo: ReturnType<typeof vi.spyOn> | undefined;
  render(<SpotMap {...props} onMapReady={map => { if (map) flyTo = vi.spyOn(map, 'flyTo'); }} />);
  expect(flyTo).toBeDefined();
  expect(flyTo).not.toHaveBeenCalled();
});

it('shows an actionable failure when tiles cannot load and retries the same provider', () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  const { container } = render(<SpotMap {...props} />);
  expect(container.querySelector('.leaflet-tile')).toBeTruthy();
  container.querySelectorAll('.leaflet-tile').forEach(tile => fireEvent.error(tile));
  expect(screen.getByRole('alert').textContent).toMatch(/Không tải được bản đồ/);
  fireEvent.click(screen.getByRole('button', { name: /Thử tải lại bản đồ/ }));
  expect(screen.queryByRole('alert')).toBeNull();
  expect(container.querySelector('.leaflet-tile')?.getAttribute('src')).toContain('tile.openstreetmap.org');
});