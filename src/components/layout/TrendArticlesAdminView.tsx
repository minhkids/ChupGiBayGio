import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { AdminImageField } from './AdminImageField';
import { REGIONS } from '../../data/regions';
import { trendArticleApi } from '../../services/trendArticleApi';
import type { TrendArticle, TrendArticleDraft, TrendArticleSection } from '../../services/trendArticleApi';
import { serviceHubApi, type ServiceListing } from '../../services/serviceHubApi';
import { getEffectiveSeasonalStatus } from '../../utils/season';

const emptyDraft = (): TrendArticleDraft => ({ section: 'hotTrend', title: '', content: '', imageUrl: '', location: '', regionId: 'all', sourceUrl: '', isPublished: true });
const inputClass = 'w-full rounded-xl border border-[#D8CFBD] bg-white px-3 py-2.5 text-sm text-[#2C2621] outline-none focus:border-[#C76B3C]';
const sectionLabels: Record<TrendArticleSection, string> = { hotTrend: 'Hot trend', upcomingSpot: 'Điểm có thể hot sắp tới' };

interface Props { onBack: () => void; onEditSpot?: (spot: ServiceListing) => void }

export const TrendArticlesAdminView = ({ onBack, onEditSpot }: Props) => {
  const [articles, setArticles] = useState<TrendArticle[]>([]);
  const [hotSpots, setHotSpots] = useState<ServiceListing[]>([]);
  const [upcomingSpots, setUpcomingSpots] = useState<ServiceListing[]>([]);
  const [spotsError, setSpotsError] = useState('');
  const [section, setSection] = useState<TrendArticleSection>('hotTrend');
  const [draft, setDraft] = useState<TrendArticleDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try { setArticles(await trendArticleApi.adminList()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được bài viết.'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    trendArticleApi.adminList().then((items) => { if (active) setArticles(items); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Không tải được bài viết.'); })
      .finally(() => { if (active) setLoading(false); });
    serviceHubApi.adminList().then((items) => {
      if (active) setUpcomingSpots(items.filter(item => item.category === 'spot' && item.upcoming === true));
      if (active) setHotSpots(items.filter((item) => item.category === 'spot'
        && getEffectiveSeasonalStatus({ status: item.spotStatus || 'ACTIVE', statusValidUntil: item.statusValidUntil }) === 'PEAK'));
    }).catch((reason: unknown) => {
      if (active) setSpotsError(reason instanceof Error ? reason.message : 'Không tải được địa điểm đang rộ.');
    });
    return () => { active = false; };
  }, []);

  const startNew = (nextSection = section) => {
    setSection(nextSection);
    setEditingId(null);
    setDraft({ ...emptyDraft(), section: nextSection });
  };
  const edit = (article: TrendArticle) => {
    setSection(article.section);
    setEditingId(article.id);
    setDraft({ section: article.section, title: article.title, content: article.content, imageUrl: article.imageUrl, location: article.location, regionId: article.regionId, sourceUrl: article.sourceUrl, isPublished: article.isPublished });
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) await trendArticleApi.update(editingId, draft);
      else await trendArticleApi.create(draft);
      startNew(draft.section);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được bài viết.'); }
    finally { setLoading(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Xóa bài viết này?')) return;
    setLoading(true);
    setError('');
    try { await trendArticleApi.remove(id); if (editingId === id) startNew(); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được bài viết.'); }
    finally { setLoading(false); }
  };
  const setField = <K extends keyof TrendArticleDraft>(field: K, value: TrendArticleDraft[K]) => setDraft((current) => ({ ...current, [field]: value }));
  const filtered = articles.filter((article) => article.section === section);

  return <section className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#F7F5F0] text-[#2C2621]" aria-label="Quản lý bài viết xu hướng">
    <header className="flex items-center justify-between gap-3 border-b border-[#D8CFBD] bg-[#FAF8F4] px-4 py-3 sm:px-8">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C76B3C]">Bảng quản trị</p><h1 className="text-xl font-bold">Bài viết xu hướng</h1></div>
      <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#E8DEC7] px-3 text-xs font-semibold"><ArrowLeft className="h-4 w-4" />Quay lại quản trị</button>
    </header>
    <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
      {error && <p role="alert" className="mx-auto mb-4 max-w-6xl rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <div className="mx-auto max-w-6xl space-y-5">
        <div role="tablist" aria-label="Chọn tab bài viết" className="grid grid-cols-2 gap-2">
          {(Object.keys(sectionLabels) as TrendArticleSection[]).map((key) => <button key={key} type="button" role="tab" aria-selected={section === key} onClick={() => startNew(key)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${section === key ? 'border-[#C76B3C] bg-[#C76B3C] text-white' : 'border-[#D8CFBD] bg-[#FAF8F4] text-[#554D43]'}`}>{sectionLabels[key]} ({articles.filter((article) => article.section === key).length})</button>)}
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
          <section className="space-y-3 rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3"><h2 className="font-bold">{sectionLabels[section]}</h2><button type="button" onClick={() => startNew()} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#ECE4D0] px-3 text-xs font-semibold"><Plus className="h-4 w-4" />Bài mới</button></div>
            {loading && <p role="status" className="text-xs text-[#6E655B]">Đang tải…</p>}
            {section === 'hotTrend' && <div className="space-y-2 rounded-xl border border-[#E6C3A8] bg-[#FFF8F2] p-3">
              <div><h3 className="text-sm font-bold">Địa điểm đang rộ trên bản đồ ({hotSpots.length})</h3><p className="mt-1 text-xs text-[#6E655B]">Các thẻ địa điểm Hot trend lấy từ trạng thái PEAK trong danh mục Điểm chụp ảnh.</p></div>
              {spotsError && <p role="alert" className="text-xs text-red-700">{spotsError}</p>}
              {hotSpots.map((spot) => <article key={spot.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#E2DAD0] bg-white p-3">
                <div className="min-w-0"><h4 className="truncate text-sm font-semibold">{spot.name}</h4><p className="truncate text-xs text-[#6E655B]">{spot.address || spot.regionId || 'Địa điểm'}</p></div>
                <button type="button" onClick={() => onEditSpot?.(spot)} className="shrink-0 rounded-lg bg-[#ECE4D0] px-3 py-2 text-xs font-semibold">Sửa địa điểm <span className="sr-only">{spot.name}</span></button>
              </article>)}
              {!spotsError && !hotSpots.length && <p className="rounded-lg bg-white p-3 text-xs text-[#6E655B]">Chưa có địa điểm nào đang ở trạng thái PEAK.</p>}
            </div>}
            {!loading && filtered.length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-[#6E655B]">Chưa có bài viết biên tập. Thêm bài mới bằng biểu mẫu.</p>}
            {section === 'upcomingSpot' && <div className="space-y-2 rounded-xl border border-[#E6C3A8] bg-[#FFF8F2] p-3">
              <h3 className="text-sm font-bold">Địa điểm dự kiến trên bản đồ ({upcomingSpots.length})</h3>
              <p className="text-xs text-[#6E655B]">Địa điểm gốc trong danh mục Điểm chụp ảnh, không phải bài viết. Hiển thị mọi mùa để quản lý; bản đồ chỉ hiện cửa sổ 3 tháng tới. Nhãn PEAK / Sắp hết đã kiểm chứng được ưu tiên hơn dự báo.</p>
              {spotsError && <p role="alert" className="text-xs text-red-700">{spotsError}</p>}
              {upcomingSpots.map(spot => <article key={spot.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#E2DAD0] bg-white p-3">
                <div className="min-w-0"><h4 className="truncate text-sm font-semibold">{spot.name}</h4><p className="text-xs text-[#6E655B]">? Dự kiến tháng {spot.expectedMonths?.join(', ') || 'chưa nhập'}</p></div>
                <button type="button" onClick={() => onEditSpot?.(spot)} className="shrink-0 rounded-lg bg-[#ECE4D0] px-3 py-2 text-xs font-semibold">Sửa địa điểm <span className="sr-only">{spot.name}</span></button>
              </article>)}
              {!spotsError && !upcomingSpots.length && <p className="text-xs text-[#6E655B]">Thêm hoặc sửa Điểm chụp ảnh, bật “Có thể hot mùa tới” và chọn tháng dự kiến.</p>}
            </div>}
            {filtered.map((article) => <article key={article.id} className="flex items-center gap-3 rounded-xl border border-[#E2DAD0] bg-white p-3">
              {article.imageUrl && <img src={article.imageUrl} alt="" className="h-16 w-20 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{article.title}</h3><p className="truncate text-xs text-[#6E655B]">{article.location || REGIONS.find((region) => region.id === article.regionId)?.name || 'Toàn quốc'} · {article.isPublished ? 'Đã đăng' : 'Bản nháp'}</p></div>
              <button type="button" aria-label={`Sửa ${article.title}`} onClick={() => edit(article)} className="rounded-lg p-2 hover:bg-[#EFE9DF]"><Pencil className="h-4 w-4" /></button>
              <button type="button" aria-label={`Xóa ${article.title}`} onClick={() => void remove(article.id)} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </article>)}
          </section>
          <form onSubmit={save} className="space-y-3 rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 sm:p-6">
            <div className="flex items-center justify-between"><h2 className="font-bold">{editingId ? 'Sửa bài viết' : 'Thêm bài viết'}</h2>{editingId && <button type="button" onClick={() => startNew()} className="text-xs text-[#8A4A2C]">Tạo mới</button>}</div>
            <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Đăng ở tab<select aria-label="Đăng ở tab" className={inputClass} value={draft.section} onChange={(event) => setField('section', event.target.value as TrendArticleSection)}><option value="hotTrend">Hot trend</option><option value="upcomingSpot">Các điểm có thể hot sắp tới</option></select></label>
            <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Tiêu đề bài viết<input aria-label="Tiêu đề bài viết" required maxLength={180} className={inputClass} value={draft.title} onChange={(event) => setField('title', event.target.value)} /></label>
            <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Nội dung bài viết<textarea aria-label="Nội dung bài viết" className={`${inputClass} min-h-32`} value={draft.content} onChange={(event) => setField('content', event.target.value)} /></label>
            <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Khu vực bài viết<select aria-label="Khu vực bài viết" className={inputClass} value={draft.regionId} onChange={(event) => setField('regionId', event.target.value)}>{REGIONS.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label>
            <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Tên địa điểm / khu vực<input className={inputClass} value={draft.location} onChange={(event) => setField('location', event.target.value)} placeholder="Ví dụ: Đường Thanh Niên, Hồ Tây" /></label>
            <AdminImageField label="Ảnh bài viết" value={draft.imageUrl} entity="trendArticles" onChange={(url) => setField('imageUrl', url)} />
            <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Link nguồn<input className={inputClass} type="url" value={draft.sourceUrl} onChange={(event) => setField('sourceUrl', event.target.value)} placeholder="https://…" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isPublished} onChange={(event) => setField('isPublished', event.target.checked)} />Hiển thị công khai</label>
            <button disabled={loading} type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{editingId ? <><Save className="h-4 w-4" />Lưu thay đổi</> : <><Plus className="h-4 w-4" />Đăng bài</>}</button>
          </form>
        </div>
      </div>
    </main>
  </section>;
};
