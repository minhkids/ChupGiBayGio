// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useNearestLabs } from './useNearestLabs';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('does not request location until the user asks, then explains a denial', async () => {
  const getCurrentPosition = vi.fn();
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition } });

  const { result } = renderHook(() => useNearestLabs());
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  expect(getCurrentPosition).not.toHaveBeenCalled();

  getCurrentPosition.mockImplementation((_success: PositionCallback, error?: PositionErrorCallback) => {
    error?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
  });
  result.current.requestLocation();
  expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(result.current.locationNotice?.title).toBe('Quyền vị trí đang bị tắt'));
  expect(result.current.locationNotice?.message).toContain('Cho phép');
});
