// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShootServicesHubDrawer } from './ShootServicesHubDrawer';
import { ShootPlanProvider } from '../../context/ShootPlanContext';

describe('ShootServicesHubDrawer', () => {
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

    // Switch to Film Labs tab
    const filmTabBtn = screen.getByRole('button', { name: /mua film/i });
    fireEvent.click(filmTabBtn);
    expect(screen.getByPlaceholderText(/tìm cuộn film/i)).toBeDefined();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /đóng/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
