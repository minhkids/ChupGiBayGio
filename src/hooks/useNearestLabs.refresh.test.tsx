// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useNearestLabs } from './useNearestLabs';
import { serviceHubApi } from '../services/serviceHubApi';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('reloads public labs when returning from an admin tab', async () => {
  let name = 'Old lab';
  const fetcher = vi.fn(async () => new Response(JSON.stringify([{ id: 'lab-1', name, lat: 21.0285, lng: 105.8542 }]), { status: 200 }));
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
    return new Response(JSON.stringify([{ id: 'lab-1', name, lat: 21.0285, lng: 105.8542 }]));
  }));
  const { result } = renderHook(() => useNearestLabs());
  await waitFor(() => expect(result.current.labs[0]?.name).toBe('Old lab'));
  await act(async () => { await serviceHubApi.update({ id: 'lab-1', category: 'filmLab', name: 'Edited lab', lat: 21.0285, lng: 105.8542 }); });
  await waitFor(() => expect(result.current.labs[0]?.name).toBe('Edited lab'));
});

it('exposes a partner-submitted product photo and per-roll price range in shop results', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{
    id: 'lab-1', name: 'Film shop', slogan: 'Film đẹp cho mọi khoảnh khắc', lat: 21.0285, lng: 105.8542,
    product_image_url: 'https://chupgibaygio.com/api/partner/images/partner/lab/lab-1/photo.jpg',
    min_roll_price: 125000, max_roll_price: 350000,
    express_delivery_2h: 1,
  }]), { status: 200 })));
  const { result } = renderHook(() => useNearestLabs());

  await waitFor(() => expect(result.current.labs[0]?.productImageUrl).toContain('/photo.jpg'));
  expect(result.current.labs[0]?.priceRange).toBe('125.000đ – 350.000đ/cuộn');
  expect(result.current.labs[0]?.slogan).toBe('Film đẹp cho mọi khoảnh khắc');
  expect(result.current.labs[0]?.expressDelivery2h).toBe(true);
});

it('keeps retail shops without coordinates browseable without assigning map coordinates', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{
    id: 'area-only-shop', name: 'Shop không ghim tọa độ', ward: 'Cửa Nam', district: 'Hoàn Kiếm',
    lat: null, lng: null, min_roll_price: 50000, max_roll_price: 0,
    in_stock_films: '["Kodak Gold 200"]', express_delivery_2h: 1,
    locations: '[{"ward":"Cửa Nam","district":"Hoàn Kiếm"}]',
  }]), { status: 200 })));
  const { result } = renderHook(() => useNearestLabs());

  await waitFor(() => expect(result.current.areaOnlyShops?.[0]?.id).toBe('area-only-shop'));
  expect(result.current.labs).toEqual([]);
  expect(result.current.areaOnlyShops[0]).toMatchObject({
    category: 'filmShop', name: 'Shop không ghim tọa độ', ward: 'Cửa Nam',
    district: 'Hoàn Kiếm', minRollPrice: 50000, expressDelivery2h: true,
  });
  expect(result.current.areaOnlyShops[0]).not.toHaveProperty('lat');
  expect(result.current.areaOnlyShops[0]).not.toHaveProperty('lng');
});

it('does not assign map coordinates to a shop that only provided its ward and district', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{
    id: 'area-only-lab', name: 'Ward-only shop', ward: 'Cửa Nam', district: 'Hoàn Kiếm', lat: null, lng: null,
  }]), { status: 200 })));
  const { result } = renderHook(() => useNearestLabs());
  await waitFor(() => expect(result.current.labs).toEqual([]));
});
