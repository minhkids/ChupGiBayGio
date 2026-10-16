// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { FilmShopDetailDialog } from './FilmShopDetailDialog';
import type { ServiceListing } from '../../services/serviceHubApi';

const shop: ServiceListing = {
  id: 'gallery-shop', category: 'filmShop', name: 'Tiệm Film',
  productImageUrl: '/products.jpg', imageUrl: '/shop.jpg',
  description: 'Film màu và đen trắng.', filmStocks: ['Kodak Gold 200', 'Ilford HP5'],
  phone: '0912345678', link: 'https://example.com/shop',
};
afterEach(cleanup);

it('highlights two-hour express delivery in shop details', () => {
  render(<FilmShopDetailDialog shop={{ ...shop, expressDelivery2h: true }} onClose={vi.fn()} />);
  const badge = screen.getByRole('img', { name: 'Giao hỏa tốc trong 2 giờ' });
  expect(badge.textContent).toBe('2h');
  expect(screen.getByRole('dialog', { name: shop.name }).textContent).not.toContain('Giao hỏa tốc trong 2 giờ');
});

it('cycles gallery photos with controls and arrow keys without leaving the dialog', () => {
  render(<FilmShopDetailDialog shop={shop} onClose={vi.fn()} />);
  const dialog = screen.getByRole('dialog', { name: shop.name });
  const gallery = within(dialog).getByRole('region', { name: 'Ảnh cửa hàng và bảng giá' });
  expect(within(gallery).getByRole('img', { name: 'Bảng giá của Tiệm Film' }).getAttribute('src')).toBe('/products.jpg');
  expect(within(gallery).getByText('BẢNG GIÁ')).toBeTruthy();
  fireEvent.click(within(gallery).getByRole('button', { name: 'Ảnh tiếp theo' }));
  expect(within(gallery).getByRole('img', { name: 'Ảnh cửa hàng Tiệm Film' }).getAttribute('src')).toBe('/shop.jpg');
  expect(within(gallery).getByText('02 / 02')).toBeTruthy();
  fireEvent.keyDown(dialog, { key: 'ArrowRight' });
  expect(within(gallery).getByRole('img', { name: 'Bảng giá của Tiệm Film' }).getAttribute('src')).toBe('/products.jpg');
  fireEvent.click(within(gallery).getByRole('button', { name: 'Ảnh trước' }));
  expect(within(gallery).getByRole('img', { name: 'Ảnh cửa hàng Tiệm Film' })).toBeTruthy();
});

it('opens a selected shop photo full screen and closes only the photo viewer', () => {
  render(<FilmShopDetailDialog shop={shop} onClose={vi.fn()} />);
  const detail = screen.getByRole('dialog', { name: shop.name });
  fireEvent.click(within(detail).getByRole('button', { name: 'Phóng to ảnh' }));
  const viewer = screen.getByRole('dialog', { name: 'Ảnh phóng to' });
  expect(within(viewer).getByRole('img', { name: 'Bảng giá của Tiệm Film' }).getAttribute('src')).toBe('/products.jpg');
  expect(document.activeElement).toBe(within(viewer).getByRole('button', { name: 'Đóng ảnh phóng to' }));

  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog', { name: 'Ảnh phóng to' })).toBeNull();
  expect(screen.getByRole('dialog', { name: shop.name })).toBeTruthy();
  expect(document.activeElement).toBe(within(detail).getByRole('button', { name: 'Phóng to ảnh' }));
});

it('keeps keyboard focus inside details and restores focus and scrolling on close', () => {
  const opener = document.createElement('button');
  document.body.appendChild(opener);
  opener.focus();
  document.body.style.overflow = 'auto';
  const { unmount } = render(<FilmShopDetailDialog shop={shop} onClose={vi.fn()} />);
  const close = screen.getByRole('button', { name: 'Đóng chi tiết shop' });
  const phone = screen.getByRole('link', { name: /Gọi shop/ });
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(phone);
  fireEvent.keyDown(phone, { key: 'Tab' });
  expect(document.activeElement).toBe(close);
  unmount();
  expect(document.activeElement).toBe(opener);
  expect(document.body.style.overflow).toBe('auto');
  opener.remove();
  document.body.style.overflow = '';
});
