// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import type { Photographer } from '../../types';
import { PhotographerModal } from './PhotographerModal';

afterEach(cleanup);

const photographer: Photographer = {
  id: 'partner-1', name: 'Minh Studio', avatarUrl: 'https://example.com/avatar.jpg', bio: '',
  rating: 0, reviewCount: 0, startingPrice: 400000, startingPriceFormatted: '400.000đ',
  budgetCategory: 'student', vibes: [], specialtySpots: [], gear: '',
  contact: { zaloPhone: '0912345678', zaloUrl: 'https://zalo.me/0912345678', phone: '0912345678' },
  featuredPhotos: ['https://example.com/portfolio.jpg'], packages: [], albums: [],
};

describe('PhotographerModal partner portfolio', () => {
  it('shows registered portfolio photos only inside the portfolio detail tab', () => {
    render(<ShootPlanProvider><PhotographerModal photographer={photographer} isOpen onClose={vi.fn()} /></ShootPlanProvider>);

    expect(screen.queryByRole('img', { name: 'Ảnh portfolio Minh Studio 1' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Bộ Ảnh Thực Tế/ }));

    expect(screen.getByRole('img', { name: 'Ảnh portfolio Minh Studio 1' }).getAttribute('src')).toBe('https://example.com/portfolio.jpg');
  });
});
