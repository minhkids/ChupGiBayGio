// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { CyclingWaypoint } from '../../types/planner';
import { ArrivalSpotPopup } from './ArrivalSpotPopup';

const spot: CyclingWaypoint = {
  id: 'spot-1', name: 'Phố Phan Đình Phùng', kind: 'spot', lat: 21.04, lng: 105.837,
  address: 'Ba Đình, Hà Nội', imageUrl: '/spot.jpg', seasonalLabel: 'Mùa lá sấu',
  bestTime: '07:30 - 09:30', photoTip: 'Ngược sáng tán cây sấu',
};
afterEach(cleanup);

it('keeps a narrow-screen card below the pin and parked bike instead of clamping over them', () => {
  const map = {
    getContainer: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844 }) }),
    latLngToContainerPoint: () => ({ x: 195, y: 422 }),
    on: () => {}, off: () => {},
  } as unknown as import('leaflet').Map;
  const { getByRole } = render(<ArrivalSpotPopup map={map} stop={spot} distanceKm={3.2} durationMinutes={14} visible />);
  const card = getByRole('dialog');
  expect(Number.parseFloat(card.style.top)).toBeGreaterThanOrEqual(462);
  expect(card.style.overflowY).toBe('auto');
  expect(Number.parseFloat(card.style.maxHeight)).toBeLessThanOrEqual(282);
});

it('reveals the destination, photo advice and real route totals after arrival', () => {
  render(<ArrivalSpotPopup map={null} stop={spot} distanceKm={3.2} durationMinutes={14} visible />);
  expect(screen.getByRole('dialog', { name: 'Đã đến Phố Phan Đình Phùng' })).toBeTruthy();
  expect(screen.getByText('Tới nơi rồi!')).toBeTruthy();
  expect(screen.getByTestId('arrival-celebration')).toBeTruthy();
  expect(screen.getByText('Mùa lá sấu')).toBeTruthy();
  expect(screen.getByText('07:30 - 09:30')).toBeTruthy();
  expect(screen.getByText('Ngược sáng tán cây sấu')).toBeTruthy();
  expect(screen.getByText('Đã đi 3,2 km')).toBeTruthy();
  expect(screen.getByText('~14 phút đạp xe')).toBeTruthy();
});

it('does not show the arrival card before the bike reaches the destination', () => {
  const { container } = render(<ArrivalSpotPopup map={null} stop={spot} distanceKm={3.2} durationMinutes={14} visible={false} />);
  expect(container.firstChild).toBeNull();
});