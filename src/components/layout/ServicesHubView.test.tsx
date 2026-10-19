// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { ServicesHubView } from './ServicesHubView';
import { serviceHubApi } from '../../services/serviceHubApi';

vi.mock('../../services/serviceHubApi', () => ({
  filmShopLocations: (shop: { locations?: { ward: string; district: string; openingHours?: string }[]; ward?: string; district?: string; openingHours?: string }) => shop.locations?.length ? shop.locations : (shop.ward || shop.district ? [{ ward: shop.ward || '', district: shop.district || '', openingHours: shop.openingHours }] : []),
  serviceHubApi: {
    list: vi.fn().mockResolvedValue([]), adminList: vi.fn().mockResolvedValue([]),
    listPlaceCategories: vi.fn().mockResolvedValue([
      { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 },
      { id: 'VINTAGE', label: 'Vintage', sortOrder: 2 },
      { id: 'SHOPPING_MALL', label: 'Trung tâm thương mại', sortOrder: 3 },
      { id: 'RED_RIVER', label: 'Gần sông Hồng', sortOrder: 4 },
      { id: 'SUNSET', label: 'Chụp hoàng hôn', sortOrder: 5 },
    ]),
    login: vi.fn().mockResolvedValue(undefined), logout: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn()
  }
}));

afterEach(() => { cleanup(); sessionStorage.clear(); window.history.replaceState(null, '', '/'); });
const renderView = () => render(<ShootPlanProvider><ServicesHubView onClose={() => undefined} /></ShootPlanProvider>);

describe('ServicesHubView', () => {
  it('shows an in-development notice when the user tries the outfit image search', async () => {
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Tìm Shopee' }));

    const dialog = await screen.findByRole('dialog', { name: /Admin đang phát triển tính năng này/ });
    expect(dialog.textContent).toContain('Bạn vui lòng đợi thêm một chút nhé.');
    const icon = within(dialog).getByRole('img', { name: 'Mặt buồn dễ thương' });
    expect(icon.getAttribute('src')).toMatch(/pleading-face\.svg/);
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /Admin đang phát triển tính năng này/ })).toBeNull());
  });

  it('shows the same in-development notice when users try to upload a reference outfit', async () => {
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Tải ảnh trang phục mẫu' }));

    expect(await screen.findByText('Admin đang phát triển tính năng này.')).toBeTruthy();
    expect(screen.getByText('Bạn vui lòng đợi thêm một chút nhé.')).toBeTruthy();
  });

  it('does not show empty states when rental and outfit records exist', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([
      { id: 'rental-1', category: 'rental', name: 'Thuê áo dài' },
      { id: 'outfit-1', category: 'outfit', name: 'Áo dài trắng' },
    ]);
    renderView();

    expect(await screen.findByText('Thuê áo dài')).toBeTruthy();
    expect(screen.getByText('Áo dài trắng')).toBeTruthy();
    expect(screen.queryByText('Chưa có tiệm thuê nào. Quản trị viên có thể thêm thông tin.')).toBeNull();
    expect(screen.queryByText('Chưa có trang phục nào. Quản trị viên có thể thêm thông tin.')).toBeNull();
  });

  it('reloads the mounted service catalogue after an admin update event', async () => {
    vi.mocked(serviceHubApi.list)
      .mockResolvedValueOnce([{ id: 'rental-old', category: 'rental', name: 'Cửa hàng cũ' }])
      .mockResolvedValueOnce([{ id: 'rental-new', category: 'rental', name: 'Cửa hàng mới' }]);
    renderView();
    expect(await screen.findByText('Cửa hàng cũ')).toBeTruthy();

    fireEvent(window, new Event('chupgi:catalog-updated'));

    expect(await screen.findByText('Cửa hàng mới')).toBeTruthy();
    expect(serviceHubApi.list).toHaveBeenCalledTimes(2);
  });

  it('shows the shop slogan instead of a contact action on the outer card', async () => {
    window.history.replaceState(null, '', '/?services=film&partner=film-shop-1');
    Element.prototype.scrollIntoView = vi.fn();
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'film-shop-1', category: 'filmShop', name: 'Shop Film', slogan: 'Film đẹp cho mọi khoảnh khắc',
      address: 'Cửa Nam, Hoàn Kiếm, Hà Nội', ward: 'Cửa Nam', district: 'Hoàn Kiếm', phone: '0912345678', link: 'https://example.com/shop', filmStocks: ['Kodak Gold 200'],
      minRollPrice: 50000, maxRollPrice: 200000, cheapestRollName: 'Kodak Gold 200', price: '50.000đ – 200.000đ/cuộn',
    }]);
    renderView();
    const shopCard = await screen.findByTestId('film-shop-card');
    expect(screen.queryByTestId('partner-featured-card')).toBeNull();
    expect(screen.getAllByText('Shop Film')).toHaveLength(1);
    expect(shopCard.querySelector('[data-testid="film-shop-slogan"]')?.textContent).toBe('Film đẹp cho mọi khoảnh khắc');
    expect(within(shopCard).getByRole('group', { name: 'Cuộn rẻ nhất: Kodak Gold 200 · 50.000đ/cuộn' }).textContent).toContain('50.000đ/cuộn');
    expect(shopCard.querySelector('a[href="https://example.com/shop"]')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Liên hệ' })).toBeNull();
    expect(shopCard.textContent).not.toContain('0912345678');
    expect(screen.queryByRole('link', { name: 'Gọi' })).toBeNull();
    expect(shopCard.id).toBe('partner-film-shop-1');
  });

  it('shows the shop photo on the film card and the price-list image first in details', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'film-shop-1', category: 'filmShop', name: 'Shop Film', address: '36 Lý Quốc Sư',
      imageUrl: 'https://example.com/shop.jpg',
      productImageUrl: 'https://chupgibaygio.com/api/partner/images/partner/lab/shop/photo.jpg',
      price: '125.000đ – 350.000đ/cuộn', filmStocks: ['Kodak Gold 200'],
    }]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));

    expect(await screen.findByText('Shop Film')).toBeTruthy();
    expect(screen.getByText('125.000đ – 350.000đ/cuộn')).toBeTruthy();
    expect(screen.getByTestId('film-shop-card').className).toContain('p-3');
    expect(screen.getByRole('img', { name: 'Ảnh shop Shop Film' }).getAttribute('src')).toBe('https://example.com/shop.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết Shop Film' }));
    const detail = await screen.findByRole('dialog', { name: 'Shop Film' });
    expect(within(detail).getByRole('img', { name: 'Bảng giá của Shop Film' }).getAttribute('src')).toBe('https://chupgibaygio.com/api/partner/images/partner/lab/shop/photo.jpg');
  });

  it('shows phone contact only after opening the shop detail', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'film-shop-phone-only', category: 'filmShop', name: 'Shop gọi điện', phone: '0912345678', minRollPrice: 50000,
    }]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    const card = await screen.findByTestId('film-shop-card');
    expect(card.textContent).not.toContain('0912345678');
    expect(screen.queryByRole('link', { name: 'Liên hệ' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết Shop gọi điện' }));
    const detail = await screen.findByRole('dialog', { name: 'Shop gọi điện' });
    expect(detail.textContent).toContain('0912345678');
    expect(detail.querySelector('a[href="tel:0912345678"]')?.textContent).toContain('0912345678');
  });

  it('opens complete shop details with contact and phone while hiding the street address', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'film-shop-detail', category: 'filmShop', name: 'Tiệm Film Chi Tiết', slogan: 'Film đẹp mỗi ngày',
      address: '123 Đường Mẫu, Cửa Nam, Hoàn Kiếm', ward: 'Cửa Nam', district: 'Hoàn Kiếm',
      phone: '0912345678', link: 'https://example.com/film-shop', openingHours: '09:00–20:00',
      description: 'Có film màu và film đen trắng.', imageUrl: 'https://example.com/shop.jpg',
      productImageUrl: 'https://example.com/film.jpg', minRollPrice: 50000, maxRollPrice: 200000,
      cheapestRollName: 'Kodak Gold 200', price: '50.000đ – 200.000đ/cuộn', filmStocks: ['Kodak Gold 200', 'Fujifilm 200', 'Ilford HP5'],
    }]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xem chi tiết Tiệm Film Chi Tiết' }));

    const detail = await screen.findByRole('dialog', { name: 'Tiệm Film Chi Tiết' });
    expect(detail.textContent).toContain('Film đẹp mỗi ngày');
    expect(detail.textContent).toContain('50.000đ – 200.000đ/cuộn');
    expect(detail.textContent).not.toContain('Cuộn rẻ nhất');
    expect(detail.textContent).toContain('Fujifilm 200');
    expect(detail.textContent).toContain('Ilford HP5');
    expect(detail.textContent).toContain('09:00–20:00');
    expect(detail.textContent).toContain('Cửa Nam');
    expect(detail.textContent).toContain('Hoàn Kiếm');
    expect(detail.textContent).not.toContain('123 Đường Mẫu');
    expect(detail.textContent).toContain('0912345678');
    expect(detail.textContent).toContain('Có film màu và film đen trắng.');
    expect(detail.querySelector('img[src="https://example.com/film.jpg"]')).toBeTruthy();
    expect(detail.querySelector('a[href="https://example.com/film-shop"]')?.textContent).toContain('Liên hệ shop');
    expect(detail.querySelector('a[href="tel:0912345678"]')?.textContent).toContain('Gọi shop');
    expect(detail.querySelector('a[href="tel:0912345678"]')?.textContent).toContain('0912345678');

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Tiệm Film Chi Tiết' })).toBeNull());
  });

  it('shows a clear image fallback when a shop photo fails to load', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'film-shop-no-image', category: 'filmShop', name: 'Shop thiếu ảnh',
      productImageUrl: 'https://example.com/missing.jpg', minRollPrice: 50000,
    }]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xem chi tiết Shop thiếu ảnh' }));
    const detail = await screen.findByRole('dialog', { name: 'Shop thiếu ảnh' });
    const image = detail.querySelector('section[aria-label="Ảnh cửa hàng và bảng giá"] img');
    if (!(image instanceof HTMLImageElement)) throw new Error('Expected the price-list image');
    fireEvent.error(image);
    expect(detail.textContent).toContain('Không tải được bảng giá');
    expect(detail.querySelector('img')).toBeNull();
  });

  it('hides the redundant shop heading and refresh action in the film-buying tab', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'film-shop-1', category: 'filmShop', name: 'Shop Film', district: 'Hoàn Kiếm', filmStocks: ['Kodak Gold 200'], minRollPrice: 50000,
    }]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    expect(await screen.findByText('Shop Film')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Cửa hàng bán film' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Làm mới' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Lab' }));
    expect(await screen.findByRole('heading', { name: 'Danh sách Lab' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Làm mới' })).toBeTruthy();
  });

  it('shows seven labs and one explicitly categorized shop without duplicates', async () => {
    const labs = Array.from({ length: 7 }, (_, index) => ({
      id: `lab-${index + 1}`, category: 'filmLab' as const, name: `Lab ${index + 1}`, district: 'Hoàn Kiếm',
      filmStocks: ['Kodak Gold 200'], services: ['Tráng C-41'], openingHours: '09:00–18:00',
    }));
    const shop = {
      id: 'shop-1', category: 'filmShop' as const, name: 'Tiệm Film', district: 'Ba Đình',
      filmStocks: ['Kodak Gold 200'], minRollPrice: 50000, maxRollPrice: 200000, price: '50.000đ – 200.000đ/cuộn',
    };
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([...labs, shop]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Lab' }));
    expect(await screen.findByRole('heading', { name: 'Danh sách Lab' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('7 lab');
    expect(screen.getAllByTestId('film-shop-card')).toHaveLength(7);
    expect(screen.getByText('Lab 1')).toBeTruthy();
    expect(screen.queryByText('Tiệm Film')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    expect(screen.queryByRole('heading', { name: 'Cửa hàng bán film' })).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('1 shop');
    expect(screen.getByText('Tiệm Film')).toBeTruthy();
    expect(screen.queryByText('Lab 1')).toBeNull();
  });

  it('keeps a priced lab and a zero-price shop for the same business in their own tabs', async () => {
    window.history.replaceState(null, '', '/?services=labs');
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([
      { id: 'same-business-lab', category: 'filmLab', name: 'Cùng Tiệm', phone: '0912345678', services: ['Tráng riêng'], price: '80.000đ', minRollPrice: 80000 },
      { id: 'same-business-shop', category: 'filmShop', name: 'Cùng Tiệm', phone: '0912345678', slogan: 'Bán riêng', minRollPrice: 0, maxRollPrice: 0 },
    ]);
    renderView();
    expect(await screen.findByText('Tráng riêng')).toBeTruthy();
    expect(screen.getAllByText('Cùng Tiệm')).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toBe('1 lab');
    expect(screen.queryByText('Bán riêng')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    expect(await screen.findByText('Bán riêng')).toBeTruthy();
    expect(screen.getAllByText('Cùng Tiệm')).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toBe('1 shop');
    expect(screen.queryByText('Tráng riêng')).toBeNull();
    expect(screen.getAllByTestId('film-shop-card')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết Cùng Tiệm' }));
    expect((await screen.findByRole('dialog', { name: 'Cùng Tiệm' })).textContent).toContain('0912345678');
  });

  it('clears a district filter that does not exist in the other directory', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'lab-1', category: 'filmLab', name: 'Hoàn Kiếm Lab', district: 'Hoàn Kiếm',
    }, {
      id: 'shop-1', category: 'filmShop', name: 'Ba Đình Film Shop', district: 'Ba Đình', minRollPrice: 50000,
    }]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    expect(await screen.findByText('Ba Đình Film Shop')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Quận / huyện'), { target: { value: 'Ba Đình' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lab' }));
    expect(await screen.findByRole('heading', { name: 'Danh sách Lab' })).toBeTruthy();
    const districtFilter = screen.getByLabelText('Quận / huyện');
    if (!(districtFilter instanceof HTMLSelectElement)) throw new Error('District filter must be a select');
    expect(districtFilter.value).toBe('all');
    expect(screen.getByRole('status').textContent).toBe('1 lab');
    expect(screen.getByText('Hoàn Kiếm Lab')).toBeTruthy();
  });

  it('shows the district selector as a labeled field and keeps the count aligned with the search', async () => {
    window.history.replaceState(null, '', '/?services=film');
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'film-shop-1', category: 'filmShop', name: 'Shop Film', district: 'Hoàn Kiếm', filmStocks: ['Kodak Gold 200'], minRollPrice: 50000,
    }]);
    renderView();
    const district = await screen.findByLabelText('Quận / huyện');
    expect(screen.getByText('Tìm kiếm')).toBeTruthy();
    expect(district.tagName).toBe('SELECT');
    expect(district.className).toContain('w-full');
    expect(screen.getByText('1 shop')).toBeTruthy();
  });

  it('does not show an empty-directory message when loading failed', async () => {
    vi.mocked(serviceHubApi.list).mockRejectedValueOnce(new Error('API trả về trang HTML thay vì JSON.'));
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    expect((await screen.findByRole('alert')).textContent).toContain('API trả về trang HTML thay vì JSON.');
    expect(screen.queryByText('Chưa có shop bán film nào.')).toBeNull();
  });

  it('shows and filters film shops by ward and district without street addresses', async () => {
    window.history.replaceState(null, '', '/?services=film');
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'film-shop-1', category: 'filmShop', name: 'Shop Film', address: 'Cửa Nam, Hoàn Kiếm, Hà Nội',
      ward: 'Cửa Nam', district: 'Hoàn Kiếm', filmStocks: ['Kodak Gold 200'], minRollPrice: 50000, maxRollPrice: 200000,
    }]);
    renderView();
    expect(await screen.findByText('Shop Film')).toBeTruthy();
    expect(screen.getByText('Cửa Nam, Hoàn Kiếm, Hà Nội')).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText('Tìm film, cửa hàng, phường hoặc quận'), { target: { value: 'Cửa Nam' } });
    expect(screen.getByText('Shop Film')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Quận / huyện'), { target: { value: 'Ba Đình' } });
    expect(screen.queryByText('Shop Film')).toBeNull();
  });

  it('filters one shop by any of its branch areas and shows every branch in its details', async () => {
    window.history.replaceState(null, '', '/?services=film');
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'multi-branch-shop', category: 'filmShop', name: 'Nhiều Chi Nhánh', minRollPrice: 50000,
      locations: [
        { ward: 'Cửa Nam', district: 'Hoàn Kiếm', openingHours: '09:00–18:00' },
        { ward: 'Dịch Vọng', district: 'Cầu Giấy', openingHours: '10:00–20:00' },
      ],
    }]);
    renderView();

    expect(await screen.findByText('Nhiều Chi Nhánh')).toBeTruthy();
    const district = screen.getByLabelText('Quận / huyện');
    expect([...district.querySelectorAll('option')].map((option) => option.textContent)).toContain('Cầu Giấy');
    fireEvent.change(district, { target: { value: 'Cầu Giấy' } });
    const ward = screen.getByLabelText('Phường / xã');
    expect([...ward.querySelectorAll('option')].map((option) => option.textContent)).toContain('Dịch Vọng');
    fireEvent.change(ward, { target: { value: 'Dịch Vọng' } });
    expect(screen.getByRole('status').textContent).toBe('1 shop');
    const card = screen.getByTestId('film-shop-card');
    expect(card.textContent).toContain('2 cơ sở');
    expect(card.textContent).toContain('Cửa Nam, Hoàn Kiếm, Hà Nội');
    expect(card.textContent).toContain('Dịch Vọng, Cầu Giấy, Hà Nội');
    fireEvent.click(within(card).getByRole('button', { name: 'Xem chi tiết Nhiều Chi Nhánh' }));
    const detail = await screen.findByRole('dialog', { name: 'Nhiều Chi Nhánh' });
    expect(detail.textContent).toContain('Cửa Nam, Hoàn Kiếm, Hà Nội');
    expect(detail.textContent).toContain('Dịch Vọng, Cầu Giấy, Hà Nội');
    expect(detail.textContent).toContain('09:00–18:00');
    expect(detail.textContent).toContain('10:00–20:00');
  });

  it('starts the directories empty and uses equal-width navigation tabs', async () => {
    renderView();
    expect(screen.getByRole('heading', { name: 'Chuẩn bị cho buổi chụp' })).toBeDefined();
    expect(await screen.findByText('Chưa có tiệm thuê nào. Quản trị viên có thể thêm thông tin.')).toBeDefined();
    expect(screen.getByText('Chưa có trang phục nào. Quản trị viên có thể thêm thông tin.')).toBeDefined();
    expect(screen.queryByText('Tiệm Áo Dài Thơ')).toBeNull();
    const nav = screen.getByRole('navigation', { name: 'Danh mục dịch vụ' });
    expect(nav.firstElementChild?.className).toContain('grid-cols-4');
    expect(nav.querySelectorAll('button')).toHaveLength(4);
    expect(nav.querySelector('button')?.className).toContain('w-full');
    expect(nav.querySelector('button span')?.className).toContain('whitespace-nowrap');

    fireEvent.click(screen.getByRole('button', { name: /Nhiếp ảnh gia/i }));
    expect(await screen.findByText('Chưa có nhiếp ảnh gia nào. Quản trị viên có thể thêm thông tin.')).toBeDefined();
    expect(screen.queryByText('Dương Tuấn Anh')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Lab' }));
    expect(await screen.findByText('Chưa có phòng lab nào.')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Mua film' }));
    expect(await screen.findByText('Chưa có shop bán film nào.')).toBeDefined();
    expect(screen.queryByText('Nadar Club')).toBeNull();
    expect(screen.queryByRole('dialog', { name: /Admin đang phát triển tính năng này/ })).toBeNull();
  });

  it('opens the admin screen and prompts for the admin password', async () => {
    window.history.replaceState(null, '', '/admin/spots');
    renderView();
    expect(await screen.findByRole('heading', { name: 'Quản lý thông tin dịch vụ' })).toBeDefined();
    expect(screen.getByLabelText('Mật khẩu')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Quản lý dịch vụ' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'example' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByRole('heading', { name: 'Thêm thông tin mới' })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tiệm thuê trang phục/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /Màu Film/ })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Màu Film/ }));
    expect(screen.getByLabelText('ISO')).toBeDefined();
    expect(screen.getByLabelText('Mã màu palette (HEX)')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Tiệm thuê trang phục/ }));
    fireEvent.change(screen.getByLabelText(/Tên hiển thị/), { target: { value: 'Tiệm mới' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm mục' }));
    expect(serviceHubApi.create).toHaveBeenCalledWith(expect.objectContaining({ category: 'rental', name: 'Tiệm mới' }));
  });

  it('highlights a photographer starting price without showing address details', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'photographer-1', category: 'photographer', name: 'Minh Studio', price: '400000',
      address: 'Địa chỉ riêng', district: 'Long Biên',
    }]);
    renderView();
    fireEvent.click(await screen.findByRole('button', { name: /Nhiếp ảnh gia/i }));
    const card = screen.getByText('Minh Studio').closest('article');
    expect(card?.textContent).toContain('Giá từ 400.000đ');
    expect(card?.textContent).not.toContain('Địa chỉ riêng');
    expect(card?.textContent).not.toContain('Long Biên');
  });

  it('does not expose an admin entry point in the public service directory', async () => {
    renderView();
    expect(await screen.findByRole('heading', { name: 'Chuẩn bị cho buổi chụp' })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Quản lý dịch vụ' })).toBeNull();
  });

  it('returns from the private admin route to the public directory', async () => {
    window.history.replaceState(null, '', '/admin/spots');
    renderView();
    const publicServicesLink = await screen.findByRole('link', { name: 'Quay lại dịch vụ' });
    expect(publicServicesLink.getAttribute('href')).toBe('/?services=outfit');
  });
});
