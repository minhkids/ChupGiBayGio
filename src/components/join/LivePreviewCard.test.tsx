// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { LivePreviewCard } from './LivePreviewCard';

afterEach(cleanup);

it('keeps a shop card compact while showing price, ward, district, film and contact', () => {
  render(<LivePreviewCard data={{
    kind: 'lab', name: 'Tiệm Film', image: '/shop.jpg', productImage: '/roll.jpg',
    ward: 'Bồ Đề', district: 'Long Biên', phone: '0912345678',
    filmStocks: ['Kodak Gold 200', 'Fujifilm 200', 'CineStill 800T', 'Ilford HP5'],
    cheapestRollName: 'Kodak Gold 200', minRollPrice: '50000', maxRollPrice: '200000', openingHours: '9:00–18:00',
  }} />);
  const card = screen.getByTestId('partner-preview');
  expect(card.className).toContain('max-w-sm');
  expect(within(card).getAllByRole('img')).toHaveLength(1);
  expect(within(card).getByRole('img').getAttribute('src')).toBe('/shop.jpg');
  expect(within(card).getByRole('heading', { name: 'Tiệm Film' })).toBeTruthy();
  expect(card.textContent).toContain('50.000–200.000đ/cuộn');
  expect(card.textContent).toContain('Rẻ nhất: Kodak Gold 200 · 50.000đ/cuộn');
  expect(card.textContent).toContain('Bồ Đề, Long Biên, Hà Nội');
  expect(card.textContent).toContain('Kodak Gold 200');
  expect(card.textContent).toContain('9:00–18:00');
  expect(within(card).getByRole('link', { name: /0912345678/ }).getAttribute('href')).toBe('tel:0912345678');
  expect(card.textContent).not.toContain('Thẻ thông tin khách hàng sẽ thấy trên website');
});

it('previews a shop that supplies only its cheapest roll price', () => {
  render(<LivePreviewCard data={{ kind: 'lab', name: 'Tiệm Film', cheapestRollName: 'Kodak Gold 200', minRollPrice: '50000' }} />);
  const card = screen.getByTestId('partner-preview');
  expect(card.textContent).toContain('Từ 50.000đ/cuộn');
  expect(card.textContent).toContain('Rẻ nhất: Kodak Gold 200 · 50.000đ/cuộn');
});

it('shows every shop branch in the registration preview instead of only a count', () => {
  render(<LivePreviewCard data={{ kind: 'lab', name: 'Tiệm Film', locations: [
    { ward: 'Minh Khai', district: 'Mê Linh' },
    { ward: 'Cửa Nam', district: 'Sóc Sơn' },
  ] }} />);
  const card = screen.getByTestId('partner-preview');
  expect(card.textContent).toContain('Cơ sở 1');
  expect(card.textContent).toContain('Minh Khai, Mê Linh, Hà Nội');
  expect(card.textContent).toContain('Cơ sở 2');
  expect(card.textContent).toContain('Cửa Nam, Sóc Sơn, Hà Nội');
  expect(card.textContent).not.toContain('2 địa chỉ');
});