// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MapStyleCategoryBrowser } from './MapStyleCategoryBrowser';

describe('MapStyleCategoryBrowser', () => {
  afterEach(cleanup);

  it('shows a creative shot board instead of repeating the location list', () => {
    const onSelectCategory = vi.fn();
    render(<MapStyleCategoryBrowser
      categories={[{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }, { id: 'SUNSET', label: 'Hoàng hôn', sortOrder: 2 }]}
      selectedCategory="CAFE"
      onSelectCategory={onSelectCategory}
    />);

    expect(screen.getByRole('heading', { name: 'Bạn định chụp style gì?' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Quán cà phê' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hoàng hôn' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Một khoảng chậm giữa phố' })).toBeTruthy();
    expect(screen.getByText('Ba khung hình thử ngay')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Chưa biết chụp gì hôm nay/ }).getAttribute('href')).toBe('/chup-gi/');
    expect(screen.queryByText(/Xem trên bản đồ|Chưa có địa điểm trong nhóm/)).toBeNull();
    expect(screen.getByRole('button', { name: /Đổi mood/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hoàng hôn' }));
    expect(onSelectCategory).toHaveBeenCalledWith('SUNSET');
    expect(screen.queryByText(/hot trend|có thể hot|sắp tới/i)).toBeNull();
  });

  it('cycles to a different creative direction without changing locations', () => {
    render(<MapStyleCategoryBrowser
      categories={[{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }]}
      selectedCategory="CAFE"
      onSelectCategory={vi.fn()}
    />);
    fireEvent.click(screen.getByRole('button', { name: /Đổi mood/ }));
    expect(screen.getByRole('heading', { name: 'Tách cà phê trong khung cửa' })).toBeTruthy();
  });
});
