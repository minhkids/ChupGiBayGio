// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useNearestLabs } from './useNearestLabs';
import { serviceHubApi } from '../services/serviceHubApi';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('reloads public labs when returning from an admin tab', async () => {
  let name = 'Old lab';
  const fetcher = vi.fn(async () => new Response(JSON.stringify([{ id: 'lab-1', name, lat: 21, lng: 105 }]), { status: 200 }));
  vi.stubGlobal('fetch', fetcher);
  const { result, unmount } = renderHook(() => useNearestLabs());
  await waitFor(() => expect(result.current.labs[0]?.name).toBe('Old lab'));
  name = 'Edited lab';
  act(() => window.dispatchEvent(new Event('focus')));
  await waitFor(() => expect(result.current.labs[0]?.name).toBe('Edited lab'));
  unmount();
  const calls = fetcher.mock.calls.length;
  act(() => window.dispatchEvent(new Event('focus')));
  expect(fetcher).toHaveBeenCalledTimes(calls);
});

it('reloads public labs after a successful same-tab admin edit', async () => {
  let name = 'Old lab';
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === 'PUT') { name = 'Edited lab'; return new Response('{}'); }
    return new Response(JSON.stringify([{ id: 'lab-1', name, lat: 21, lng: 105 }]));
  }));
  const { result } = renderHook(() => useNearestLabs());
  await waitFor(() => expect(result.current.labs[0]?.name).toBe('Old lab'));
  await act(async () => { await serviceHubApi.update({ id: 'lab-1', category: 'filmLab', name: 'Edited lab', lat: 21, lng: 105 }); });
  await waitFor(() => expect(result.current.labs[0]?.name).toBe('Edited lab'));
});
