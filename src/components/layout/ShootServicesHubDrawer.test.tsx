// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ShootServicesHubDrawer } from './ShootServicesHubDrawer';
import { ShootPlanProvider } from '../../context/ShootPlanContext';

describe('ShootServicesHubDrawer', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('renders a dedicated, full-width services page layout', () => {
    render(
      <ShootPlanProvider>
        <ShootServicesHubDrawer isOpen onClose={() => undefined} standalone />
      </ShootPlanProvider>
    );

    expect(screen.getByRole('heading', { name: 'Chuẩn bị cho buổi chụp' })).toBeDefined();
    expect(screen.getByText('Tìm outfit và tiệm thuê')).toBeDefined();
    expect(screen.getByText('Chọn phong cách và ngân sách')).toBeDefined();
    expect(screen.getByText('Tìm film và lab gần bạn')).toBeDefined();
    expect(screen.getByRole('complementary').className).toContain('lg:right-0');
  });

  it('renders and switches across all 3 service tabs (Trang phục, Thợ chụp, Mua film)', () => {
    const onClose = vi.fn();

    render(
      <ShootPlanProvider>
        <ShootServicesHubDrawer isOpen={true} onClose={onClose} initialTab="outfit" />
      </ShootPlanProvider>
    );

    // Initial outfit tab
    expect(screen.getByText(/bóc đồ từ ảnh tham khảo/i)).toBeDefined();

    // Switch to Photographers tab
    const photographerTabBtn = screen.getByRole('button', { name: /thợ chụp/i });
    fireEvent.click(photographerTabBtn);
    expect(screen.getByPlaceholderText(/tìm tên thợ/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /đăng ký làm nhiếp ảnh gia/i }).getAttribute('href')).toBe('/join/photographer');

    // Switch to Film Labs tab
    const filmTabBtn = screen.getByRole('button', { name: /mua film/i });
    fireEvent.click(filmTabBtn);
    expect(screen.getByPlaceholderText(/tìm cuộn film/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /đăng ký shop bán film/i }).getAttribute('href')).toBe('/join/film-lab');

    // Close button
    const closeBtn = screen.getByRole('button', { name: /đóng/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the in-development notice when the outfit search is used from the map drawer', async () => {
    render(<ShootPlanProvider><ShootServicesHubDrawer isOpen onClose={() => undefined} /></ShootPlanProvider>);

    fireEvent.click(screen.getByRole('button', { name: /Tìm Shopee/i }));

    const dialog = await screen.findByRole('dialog', { name: /Admin đang phát triển tính năng này/ });
    expect(dialog.textContent).toContain('Bạn vui lòng đợi thêm một chút nhé.');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đã hiểu' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /Admin đang phát triển tính năng này/ })).toBeNull());
  });

  it('reloads the mounted drawer catalogue after an admin update event', async () => {
    let serviceCalls = 0;
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/services') {
        serviceCalls += 1;
        return Response.json(serviceCalls === 1 ? [] : [{ id: 'photographer-1', category: 'photographer', name: 'Nhiếp ảnh gia mới', price: '400000' }]);
      }
      return Response.json([]);
    });
    vi.stubGlobal('fetch', fetcher);
    render(<ShootPlanProvider><ShootServicesHubDrawer isOpen initialTab="photographers" onClose={() => undefined} /></ShootPlanProvider>);
    await waitFor(() => expect(fetcher.mock.calls.filter(([url]) => url === '/api/services')).toHaveLength(1));

    fireEvent(window, new Event('chupgi:catalog-updated'));

    expect(await screen.findByText('Nhiếp ảnh gia mới')).toBeTruthy();
    expect(document.body.textContent).toContain('Giá từ 400.000đ');
    expect(fetcher.mock.calls.filter(([url]) => url === '/api/services')).toHaveLength(2);
  });

  it('shows area-only shops and the same compact express badge in the mobile Mua film tab', async () => {
    const fetcher = vi.fn(async (url: string) => Response.json(url === '/api/film-shops' ? [{
      id: 'mapped-mobile-shop', name: 'Shop có ghim', ward: 'Bồ Đề', district: 'Long Biên',
      address: 'Bồ Đề, Long Biên, Hà Nội', lat: 21.04, lng: 105.88, min_roll_price: 65000, max_roll_price: 0,
      in_stock_films: '["Fuji 200"]', express_delivery_2h: 1,
      locations: [{ ward: 'Bồ Đề', district: 'Long Biên' }],
    }, {
      id: 'area-only-mobile-shop', name: 'Shop Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm',
      address: 'Cửa Nam, Hoàn Kiếm, Hà Nội', lat: null, lng: null, min_roll_price: 0, max_roll_price: 0,
      cheapest_roll_name: 'Kodak Gold 200', in_stock_films: '["Kodak Gold 200"]', express_delivery_2h: 1,
      locations: [{ ward: 'Cửa Nam', district: 'Hoàn Kiếm' }],
    }] : url === '/api/labs' ? [{ id: 'not-a-shop', name: 'Không phải shop', lat: 21.03, lng: 105.85, min_roll_price: 80000 }] : []));
    vi.stubGlobal('fetch', fetcher);
    render(<ShootPlanProvider><ShootServicesHubDrawer isOpen onClose={() => undefined} /></ShootPlanProvider>);
    fireEvent.click(screen.getByRole('button', { name: /mua film/i }));

    await waitFor(() => expect(screen.getByText('Shop theo khu vực (chưa ghim bản đồ)')).toBeTruthy());
    expect(screen.getAllByRole('img', { name: 'Giao hỏa tốc trong 2 giờ' })).toHaveLength(2);
    expect(screen.getAllByRole('img', { name: 'Giao hỏa tốc trong 2 giờ' }).every((badge) => badge.textContent === '2h')).toBe(true);
    expect(screen.getByText(/Cửa Nam, Hoàn Kiếm, Hà Nội/)).toBeTruthy();
    expect(screen.queryByText('Không phải shop')).toBeNull();
    expect(fetcher.mock.calls.map(([url]) => url)).toContain('/api/film-shops');
    expect(fetcher.mock.calls.map(([url]) => url)).not.toContain('/api/labs');
  });
});
