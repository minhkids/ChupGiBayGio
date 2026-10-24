// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import L from 'leaflet';
import { SpotLocationPreview } from './SpotLocationPreview';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('uses a real Leaflet marker, centers on selection, and supports map click, drag and keyboard-center adjustment', () => {
  const center = vi.spyOn(L.Map.prototype, 'setView');
  const change = vi.fn();
  const location = { lat: 21.0650745, lng: 105.8664828, address: 'Số 20', source: 'search' as const };
  const { container, rerender } = render(<SpotLocationPreview location={location} onChange={change} />);
  const map = center.mock.contexts[0] as L.Map;
  expect(map.getCenter().lat).toBeCloseTo(location.lat);
  expect(map.getCenter().lng).toBeCloseTo(location.lng);
  let marker!: L.Marker;
  map.eachLayer(layer => { if (layer instanceof L.Marker) marker = layer; });
  expect(marker.getLatLng()).toEqual(L.latLng(location.lat, location.lng));
  expect(container.querySelector('.spot-location-preview-pin')).toBeTruthy();
  act(() => { map.fire('click', { latlng: L.latLng(21.066, 105.867) }); });
  expect(change).toHaveBeenLastCalledWith({ ...location, lat: 21.066, lng: 105.867, adjusted: true });
  act(() => { marker.setLatLng([21.067, 105.868]); marker.fire('dragend'); });
  expect(change).toHaveBeenLastCalledWith({ ...location, lat: 21.067, lng: 105.868, adjusted: true });
  rerender(<SpotLocationPreview location={{ ...location, lat: 21.068 }} onChange={change} />);
  expect(map.getCenter().lat).toBeCloseTo(21.068);
  expect(marker.getLatLng().lat).toBe(21.068);
  expect(container.querySelectorAll('.spot-location-preview-pin')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Đặt ghim ở giữa bản đồ' }));
  expect(change.mock.calls.at(-1)?.[0].lat).toBeCloseTo(21.068);
});