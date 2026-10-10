import { request } from './serviceHubApi';

export type TrendArticleSection = 'hotTrend' | 'upcomingSpot';

export interface TrendArticle {
  id: string;
  section: TrendArticleSection;
  title: string;
  content: string;
  imageUrl: string;
  location: string;
  regionId: string;
  sourceUrl: string;
  isPublished: boolean;
  createdAt: string;
}

export type TrendArticleDraft = Omit<TrendArticle, 'id' | 'createdAt'>;

export const trendArticleApi = {
  list: () => request<TrendArticle[]>('/api/trend-articles'),
  adminList: async () => {
    const rows = await request<Record<string, unknown>[]>('/api/admin/cms/trendArticles');
    return rows.map((row): TrendArticle => ({
      id: String(row.id || ''), section: row.section === 'upcomingSpot' ? 'upcomingSpot' : 'hotTrend',
      title: String(row.title || ''), content: String(row.content || ''), imageUrl: String(row.image_url || ''),
      location: String(row.location || ''), regionId: String(row.region_id || 'all'), sourceUrl: String(row.source_url || ''),
      isPublished: Number(row.is_published) === 1, createdAt: String(row.created_at || ''),
    }));
  },
  create: (draft: TrendArticleDraft) => request<TrendArticle>('/api/admin/cms/trendArticles', {
    method: 'POST', body: JSON.stringify(draft),
  }),
  update: (id: string, draft: TrendArticleDraft) => request<TrendArticle>(`/api/admin/cms/trendArticles/${encodeURIComponent(id)}`, {
    method: 'PUT', body: JSON.stringify(draft),
  }),
  remove: (id: string) => request<{ success: boolean }>(`/api/admin/cms/trendArticles/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
