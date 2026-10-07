// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { ServicesHubView } from './ServicesHubView';

afterEach(cleanup);

describe('ServicesHubView', () => {
  it('shows the warm editorial shell and switches between the three service directories', () => {
    render(<ShootPlanProvider><ServicesHubView onClose={() => undefined} /></ShootPlanProvider>);

    expect(screen.getByRole('heading', { name: 'Chuẩn bị cho buổi chụp' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Tiệm thuê trang phục uy tín' })).toBeDefined();
    expect(screen.getByText(/Kéo thả ảnh mẫu để tìm đồ trên Shopee & TikTok Shop/i)).toBeDefined();
    const tabNav = screen.getByRole('navigation', { name: 'Danh mục dịch vụ' });
    expect(tabNav.firstElementChild?.className).toContain('grid-cols-3');
    expect(tabNav.querySelectorAll('button')).toHaveLength(3);
    expect(tabNav.querySelector('button')?.className).toContain('w-full');
    expect(tabNav.querySelector('button span')?.className).toContain('whitespace-nowrap');

    fireEvent.click(screen.getByRole('button', { name: /Nhiếp ảnh gia/i }));
    expect(screen.getByPlaceholderText(/Tìm nhiếp ảnh gia hoặc phong cách/i)).toBeDefined();
    expect(screen.getAllByRole('link', { name: /Nhắn Zalo/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Mua film & Lab/i }));
    expect(screen.getByText(/Đang hiển thị tiệm quanh khu vực Hồ Gươm/i)).toBeDefined();
    expect(screen.queryByText(/21\.\d+,\s*105\./)).toBeNull();
  });
});
