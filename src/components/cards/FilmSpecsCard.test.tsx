// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilmSpecsCard } from './FilmSpecsCard';
import { MOCK_SPOTS } from '../../data/mockSpots';

vi.mock('../../utils/filmAdvisor', () => ({
  recommendFilmForSpot: () => ({
    film: {
      id: 'kodak-gold-200',
      fullName: 'Kodak Gold 200',
      name: 'Gold 200',
      format: '35mm / 120',
      iso: 200,
      badgeBg: 'bg-amber-100',
      paletteHex: ['#E09F3E']
    },
    recommendedSettings: 'f/4.0 · 1/250s',
    rationale: 'Tone vàng ấm, hợp ánh nắng chiều.'
  })
}));

describe('FilmSpecsCard', () => {
  it('keeps the film advice compact and exposes one lab action', () => {
    const onOpenNearestLabs = vi.fn();
    render(<FilmSpecsCard spot={MOCK_SPOTS[0]} onOpenNearestLabs={onOpenNearestLabs} />);

    expect(screen.getByText('Kodak Gold 200')).toBeTruthy();
    expect(screen.queryByText('Địa điểm tráng & mua film gợi ý:')).toBeNull();
    expect(screen.queryByText('36+ Film Lab')).toBeNull();
    expect(screen.queryByText('Lọc địa điểm phù hợp với cuộn Gold 200')).toBeNull();
    const labButton = screen.getByRole('button', { name: 'Tìm lab gần đây' });
    expect(screen.getAllByRole('button')).toHaveLength(1);

    fireEvent.click(labButton);
    expect(onOpenNearestLabs).toHaveBeenCalledWith('Kodak Gold 200');
  });
});
