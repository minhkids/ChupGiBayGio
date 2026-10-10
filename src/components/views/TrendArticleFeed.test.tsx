// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TrendArticleFeed } from './TrendArticleFeed';
import type { TrendArticle } from '../../services/trendArticleApi';

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
});
