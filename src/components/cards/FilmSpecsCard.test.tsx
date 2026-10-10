// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilmSpecsCard } from './FilmSpecsCard';
import { MOCK_SPOTS } from '../../data/mockSpots';

vi.mock('../planner/PinReferenceButton', () => ({ PinReferenceButton: () => null }));

vi.mock('../../utils/filmAdvisor', () => ({
  recommendFilmForSpot: () => ({
    film: {
      id: 'kodak-gold-200',
      fullName: 'Kodak Gold 200',
      name: 'Gold 200',
      format: '35mm / 120',
      iso: 200,
      badgeBg: 'bg-amber-100',
      paletteHex: ['#E09F3E'],
      sampleImageUrl: 'https://example.com/gold-200.jpg',
      sampleImageCredit: {
        author: 'Willwongprd',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Duliang_Pavilion_of_Xuyi_County.jpg',
        licenseName: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
      }
    },
    recommendedSettings: 'f/4.0 · 1/250s',
    rationale: 'Tone vàng ấm, hợp ánh nắng chiều.'
  })
}));

describe('FilmSpecsCard', () => {
  it('uses an actual Gold 200 sample with source and license attribution', async () => {
    const actual = await vi.importActual<typeof import('../../utils/filmAdvisor')>('../../utils/filmAdvisor');
    const film = actual.FILM_STOCKS['kodak-gold-200'];

    expect(film.sampleImageUrl).toContain('Duliang_Pavilion_of_Xuyi_County.jpg');
    expect(film.sampleImageCredit).toMatchObject({ author: 'Willwongprd', licenseName: 'CC BY-SA 4.0' });
  });

  it('keeps the film advice compact and exposes one lab action', () => {
    const onOpenNearestLabs = vi.fn();
    render(<FilmSpecsCard spot={MOCK_SPOTS[0]} onOpenNearestLabs={onOpenNearestLabs} />);

    expect(screen.getByText('Kodak Gold 200')).toBeTruthy();
    expect(screen.queryByText('Địa điểm tráng & mua film gợi ý:')).toBeNull();
    expect(screen.queryByText('36+ Film Lab')).toBeNull();
    expect(screen.queryByText('Lọc địa điểm phù hợp với cuộn Gold 200')).toBeNull();
    expect(screen.getByRole('img', { name: 'Ảnh mẫu Kodak Gold 200' }).getAttribute('src')).toBe('https://example.com/gold-200.jpg');
    expect(screen.getByRole('link', { name: 'Willwongprd' }).getAttribute('href')).toBe('https://commons.wikimedia.org/wiki/File:Duliang_Pavilion_of_Xuyi_County.jpg');
    expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' }).getAttribute('href')).toBe('https://creativecommons.org/licenses/by-sa/4.0');
    const labButton = screen.getByRole('button', { name: 'Tìm lab gần đây' });
    expect(screen.getAllByRole('button')).toHaveLength(1);

    fireEvent.click(labButton);
    expect(onOpenNearestLabs).toHaveBeenCalledWith('Kodak Gold 200');
  });
});
