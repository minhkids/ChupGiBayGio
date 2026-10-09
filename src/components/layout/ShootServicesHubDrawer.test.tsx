// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ShootServicesHubDrawer } from './ShootServicesHubDrawer';
import { ShootPlanProvider } from '../../context/ShootPlanContext';

describe('ShootServicesHubDrawer', () => {
  afterEach(cleanup);

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
});
