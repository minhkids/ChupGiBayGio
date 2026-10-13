// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { NearestFilmShopsDrawer } from './NearestFilmShopsDrawer';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('shows shops without coordinates separately from map-ranked labs', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{
    id: 'area-only-shop', name: 'Shop theo khu vực', ward: 'Cửa Nam', district: 'Hoàn Kiếm',
    lat: null, lng: null, min_roll_price: 50000, max_roll_price: 0,
    cheapest_roll_name: 'Kodak Gold 200', in_stock_films: '["Kodak Gold 200"]', express_delivery_2h: 1,
    locations: [{ ward: 'Cửa Nam', district: 'Hoàn Kiếm' }],
  }]), { status: 200 })));
  render(<NearestFilmShopsDrawer isOpen onClose={vi.fn()} />);

  await waitFor(() => expect(screen.getByText('Shop theo khu vực (chưa ghim bản đồ)')).toBeTruthy());
  expect(screen.getByRole('heading', { name: /Shop theo khu vực/ })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'Giao hỏa tốc trong 2 giờ' }).textContent).toBe('2h');
  expect(screen.queryByText(/từ bạn/i)).toBeNull();
});
