// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MoodboardView } from './MoodboardView';

afterEach(cleanup);

it('keeps the film recipe explorer and removes the inspiration guide section', () => {
  render(<MoodboardView spots={[]} onSelectSpot={vi.fn()} />);

  expect(screen.getByRole('heading', { name: 'Moodboard & Công Thức Màu Phim Theo Mùa' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'KODAK PORTRA 400 / 160' })).toBeTruthy();
  expect(screen.queryByText('Cẩm Nang Góc Chụp & Tạo Dáng Thực Tế')).toBeNull();
});
