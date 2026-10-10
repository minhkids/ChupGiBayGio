// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrendArticlesAdminView } from './TrendArticlesAdminView';
import { trendArticleApi } from '../../services/trendArticleApi';

vi.mock('../../services/trendArticleApi', () => ({
  trendArticleApi: { adminList: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('./AdminImageField', () => ({ AdminImageField: ({ label }: { label: string }) => <div>{label}</div> }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(trendArticleApi.adminList).mockResolvedValue([]);
  vi.mocked(trendArticleApi.create).mockResolvedValue({ id: 'new-1', section: 'upcomingSpot', title: 'Nơi mới', content: 'Chi tiết', imageUrl: '', location: 'Đà Lạt', regionId: 'dalat', sourceUrl: '', isPublished: true, createdAt: '2026-10-10' });
});
afterEach(cleanup);

describe('TrendArticlesAdminView', () => {
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
