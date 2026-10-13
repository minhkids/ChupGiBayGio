// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrendArticlesAdminView } from './TrendArticlesAdminView';
import { trendArticleApi } from '../../services/trendArticleApi';
import { serviceHubApi, type ServiceListing } from '../../services/serviceHubApi';

vi.mock('../../services/trendArticleApi', () => ({
  trendArticleApi: { adminList: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('../../services/serviceHubApi', () => ({ serviceHubApi: { adminList: vi.fn() } }));
vi.mock('./AdminImageField', () => ({ AdminImageField: ({ label }: { label: string }) => <div>{label}</div> }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(trendArticleApi.adminList).mockResolvedValue([]);
  vi.mocked(serviceHubApi.adminList).mockResolvedValue([
    { id: 'peak-1', category: 'spot', name: 'Điểm hot 1', spotStatus: 'PEAK' },
    { id: 'peak-2', category: 'spot', name: 'Điểm hot 2', spotStatus: 'PEAK' },
    { id: 'active-1', category: 'spot', name: 'Điểm thường', spotStatus: 'ACTIVE' },
    { id: 'not-spot', category: 'filmLab', name: 'Lab', spotStatus: 'PEAK' },
  ] as ServiceListing[]);
  vi.mocked(trendArticleApi.create).mockResolvedValue({ id: 'new-1', section: 'upcomingSpot', title: 'Nơi mới', content: 'Chi tiết', imageUrl: '', location: 'Đà Lạt', regionId: 'dalat', sourceUrl: '', isPublished: true, createdAt: '2026-10-10' });
});
afterEach(cleanup);

describe('TrendArticlesAdminView', () => {
  it('shows upcoming canonical spots separately from articles and routes edits to the spot editor', async () => {
    const candidate: ServiceListing = { id: 'future-1', category: 'spot', name: 'Mùa hoa mới', upcoming: true, expectedMonths: [11], spotStatus: 'ACTIVE' };
    vi.mocked(serviceHubApi.adminList).mockResolvedValueOnce([candidate]);
    const onEditSpot = vi.fn();
    render(<TrendArticlesAdminView onBack={() => undefined} onEditSpot={onEditSpot} />);
    fireEvent.click(screen.getByRole('tab', { name: /điểm có thể hot sắp tới/i }));
    expect(await screen.findByRole('heading', { name: 'Mùa hoa mới' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sửa địa điểm Mùa hoa mới' }));
    expect(onEditSpot).toHaveBeenCalledWith(candidate);
    expect(trendArticleApi.create).not.toHaveBeenCalled();
  });
  it('lists map hot spots separately from editorial articles and opens a spot for editing', async () => {
    const onEditSpot = vi.fn();
    render(<TrendArticlesAdminView onBack={() => undefined} onEditSpot={onEditSpot} />);

    expect(await screen.findByRole('heading', { name: 'Điểm hot 1' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Điểm hot 2' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Điểm thường' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Lab' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sửa địa điểm Điểm hot 1' }));
    expect(onEditSpot).toHaveBeenCalledWith(expect.objectContaining({ id: 'peak-1', category: 'spot' }));
  });

  it('lets admin add an article to the upcoming-hot-spots tab', async () => {
    render(<TrendArticlesAdminView onBack={() => undefined} />);

    fireEvent.change(await screen.findByLabelText('Tiêu đề bài viết'), { target: { value: 'Nơi mới' } });
    fireEvent.change(screen.getByLabelText('Nội dung bài viết'), { target: { value: 'Chi tiết' } });
    fireEvent.change(screen.getByLabelText('Khu vực bài viết'), { target: { value: 'dalat' } });
    fireEvent.change(screen.getByLabelText('Đăng ở tab'), { target: { value: 'upcomingSpot' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng bài' }));

    await waitFor(() => expect(trendArticleApi.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Nơi mới', content: 'Chi tiết', regionId: 'dalat', section: 'upcomingSpot',
    })));
  });
});
