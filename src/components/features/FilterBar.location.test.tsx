// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { FilterBar } from './FilterBar';
import type { FilterState } from '../../types';

const filters: FilterState = {
  month: null,
  season: 'all',
  regionId: 'hanoi',
  status: 'ALL',
  timeOfDay: 'ALL',
  concept: 'ALL',
  placeCategory: 'ALL',
  cost: 'ALL',
  filmId: 'ALL',
  searchQuery: '',
  onlyNearby: false,
  userCoords: null,
  radiusKm: 25,
};

it('asks for location from the nearby button and does not pretend Hanoi is the user', async () => {
  const getCurrentPosition = vi.fn((_success: PositionCallback, error?: PositionErrorCallback) => {
    error?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
  });
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition } });
  const onChangeFilters = vi.fn();
  render(<FilterBar filters={filters} onChangeFilters={onChangeFilters} onResetFilters={vi.fn()} totalFilteredCount={3} />);

  expect(getCurrentPosition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Gần tôi/ }));
  expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole('dialog', { name: 'Quyền vị trí đang bị tắt' })).toBeTruthy();
  expect(onChangeFilters).not.toHaveBeenCalled();
});
