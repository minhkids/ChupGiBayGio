// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TrendArticleFeed } from './TrendArticleFeed';
import type { TrendArticle } from '../../services/trendArticleApi';
import { MOCK_SPOTS } from '../../data/mockSpots';

const articles: TrendArticle[] = [
  { id: 'hot-1', section: 'hotTrend', title: 'Hoa đang được săn ảnh', content: 'Nội dung xu hướng', imageUrl: '', location: 'Hà Nội', regionId: 'hanoi', sourceUrl: '', isPublished: true, createdAt: '2026-10-10' },
  { id: 'upcoming-1', section: 'upcomingSpot', title: 'Điểm có thể nổi mùa tới', content: 'Gợi ý địa điểm mới', imageUrl: '', location: 'Đà Lạt', regionId: 'dalat', sourceUrl: '', isPublished: true, createdAt: '2026-10-10' },
];

describe('TrendArticleFeed', () => {
  afterEach(cleanup);
  it('shows exactly two editorial tabs and switches the article list', () => {
    render(<TrendArticleFeed articles={articles} regionId="all" />);

    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByText('Hoa đang được săn ảnh')).toBeTruthy();
    expect(screen.queryByText('Điểm có thể nổi mùa tới')).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: /các điểm có thể hot sắp tới/i }));
    expect(screen.getByText('Điểm có thể nổi mùa tới')).toBeTruthy();
    expect(screen.queryByText('Hoa đang được săn ảnh')).toBeNull();
  });

  it('includes nationwide posts with the selected region and hides other regions', () => {
    render(<TrendArticleFeed articles={[...articles, { ...articles[0], id: 'all-1', title: 'Toàn quốc', regionId: 'all' }]} regionId="hanoi" />);

    expect(screen.getByText('Toàn quốc')).toBeTruthy();
    expect(screen.queryByText('Điểm có thể nổi mùa tới')).toBeNull();
  });

  it('links current PEAK spots into Hot trend and opens the selected spot', () => {
    const hotSpot = {
      ...MOCK_SPOTS[0],
      id: 'spot-peak',
      name: 'Cầu Dải lụa ký ức – Hồ Gươm',
      address: 'Phố Lê Thái Tổ, Hà Nội',
      regionId: 'hanoi',
      seasonalTrend: {
        ...MOCK_SPOTS[0].seasonalTrend,
        trendTitle: 'Đang rộ đến hết 2/12',
        status: 'PEAK' as const,
        statusValidUntil: '2099-12-31'
      }
    };
    const activeSpot = { ...hotSpot, id: 'spot-active', name: 'Điểm quanh năm', seasonalTrend: { ...hotSpot.seasonalTrend, status: 'ACTIVE' as const } };
    const expiredSpot = { ...hotSpot, id: 'spot-expired', name: 'Điểm đã hết rộ', seasonalTrend: { ...hotSpot.seasonalTrend, statusValidUntil: '2020-01-01' } };
    const onOpenSpot = vi.fn();
    render(<TrendArticleFeed articles={[]} regionId="hanoi" spots={[hotSpot, activeSpot, expiredSpot]} onOpenSpot={onOpenSpot} />);

    expect(screen.getByRole('tab', { name: /hot trend \(1\)/i })).toBeTruthy();
    expect(screen.getByText('Cầu Dải lụa ký ức – Hồ Gươm')).toBeTruthy();
    expect(screen.queryByText('Điểm quanh năm')).toBeNull();
    expect(screen.queryByText('Điểm đã hết rộ')).toBeNull();
    expect(screen.getByText('Đang rộ')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /xem địa điểm/i }));
    expect(onOpenSpot).toHaveBeenCalledWith(hotSpot);
  });
});
