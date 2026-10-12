// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { FilmShopCard } from './FilmShopCard';

afterEach(cleanup);

it('keeps the shop card usable if both photos fail', () => {
  const shop = { id: 'shop', category: 'filmShop' as const, name: 'Tiệm Film', imageUrl: '/shop.jpg', productImageUrl: '/products.jpg', minRollPrice: 50000, cheapestRollName: 'Kodak Gold 200', filmStocks: ['Kodak Gold 200'] };
  const onOpen = vi.fn();
  render(<FilmShopCard shop={shop} onOpen={onOpen} />);
  fireEvent.error(screen.getByRole('img', { name: 'Ảnh shop Tiệm Film' }));
  const fallback = screen.getByRole('img', { name: 'Ảnh film đang bán tại Tiệm Film' });
  expect(fallback.getAttribute('src')).toBe('/products.jpg');
  fireEvent.error(fallback);
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.getByRole('group', { name: 'Cuộn rẻ nhất: Kodak Gold 200 · 50.000đ/cuộn' }).textContent).toContain('50.000đ/cuộn');
  fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết Tiệm Film' }));
  expect(onOpen).toHaveBeenCalledWith(shop);
});
