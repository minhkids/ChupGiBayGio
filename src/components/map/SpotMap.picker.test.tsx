// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import L from 'leaflet';
import { SpotMap } from './SpotMap';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it('centers the real Leaflet map on the picker marker and updates and removes it', () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  const center = vi.spyOn(L.Map.prototype, 'setView');
  const props = { spots: [], activeRegionId: 'hanoi', selectedSpot: null, onSelectSpot: vi.fn(), userCoords: null };
  const location = { lat: 21.0650745, lng: 105.8664828, address: 'Số 20' };
  const { container, rerender } = render(<SpotMap {...props} pickedLocation={location} />);
  expect(container.querySelectorAll('.custom-picked-pin')).toHaveLength(1);
  expect(center).toHaveBeenLastCalledWith([location.lat, location.lng], 18, expect.objectContaining({ animate: false }));
  const moved = { ...location, lat: 21.066 };
  rerender(<SpotMap {...props} pickedLocation={moved} />);
  expect(container.querySelectorAll('.custom-picked-pin')).toHaveLength(1);
  expect(center).toHaveBeenLastCalledWith([moved.lat, moved.lng], 18, expect.objectContaining({ animate: false }));
  rerender(<SpotMap {...props} pickedLocation={null} />);
  expect(container.querySelectorAll('.custom-picked-pin')).toHaveLength(0);
});