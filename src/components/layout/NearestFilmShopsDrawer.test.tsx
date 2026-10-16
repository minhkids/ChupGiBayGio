// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { NearestFilmShopsDrawer } from './NearestFilmShopsDrawer';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('shows shops without coordinates separately from map-ranked labs', async () => {
  const fetcher = vi.fn(async (url: string) => Response.json(url === '/api/labs' ? [{
    id: 'lab-priced', name: 'Lab vẫn trên bản đồ', lat: 21.0285, lng: 105.8542, min_roll_price: 80000,
  }] : [{
    id: 'area-only-shop', name: 'Shop theo khu vực', ward: 'Cửa Nam', district: 'Hoàn Kiếm',
    lat: null, lng: null, min_roll_price: 0, max_roll_price: 0,
    cheapest_roll_name: 'Kodak Gold 200', in_stock_films: '["Kodak Gold 200"]', express_delivery_2h: 1,
    locations: [{ ward: 'Cửa Nam', district: 'Hoàn Kiếm' }],
  }]));
  vi.stubGlobal('fetch', fetcher);
  render(<NearestFilmShopsDrawer isOpen onClose={vi.fn()} />);

  await waitFor(() => expect(screen.getByText('Shop theo khu vực (chưa ghim bản đồ)')).toBeTruthy());
  expect(screen.getByRole('heading', { name: /Shop theo khu vực/ })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'Giao hỏa tốc trong 2 giờ' }).textContent).toBe('2h');
  expect(screen.getByText('Lab vẫn trên bản đồ')).toBeTruthy();
  const areaSection = screen.getByRole('region', { name: 'Shop theo khu vực chưa ghim bản đồ' });
  expect(within(areaSection).queryByText(/từ bạn/i)).toBeNull();
  expect(within(areaSection).queryByRole('button', { name: 'Xem Map' })).toBeNull();
  expect(new Set(fetcher.mock.calls.map(([url]) => url))).toEqual(new Set(['/api/labs', '/api/film-shops']));
});
