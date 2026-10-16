import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BellRing, CircleCheck, ExternalLink, LogOut, MapPin, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { serviceHubApi, type ServiceCategory, type ServiceListing } from '../../services/serviceHubApi';
import { AdminImageField, type AdminHotspot } from './AdminImageField';
import { LeafletCoordinatePicker } from './LeafletCoordinatePicker';
import { BulkImportPanel } from './BulkImportPanel';
import type { BulkRecord } from './bulkImport';
import { TrendArticlesAdminView } from './TrendArticlesAdminView';
import { PlaceCategoriesAdminPanel } from './PlaceCategoriesAdminPanel';
import { CONCEPT_METADATA } from '../../utils/season';
import { DEFAULT_PLACE_CATEGORIES } from '../../utils/placeCategories';
import type { ConceptTag, PlaceCategory } from '../../types';

const conceptTags = Object.keys(CONCEPT_METADATA) as ConceptTag[];

const categories: { id: ServiceCategory; label: string }[] = [
  { id: 'spot', label: 'Điểm chụp ảnh' },
  { id: 'rental', label: 'Tiệm thuê trang phục' },
  { id: 'outfit', label: 'Trang phục mua' },
  { id: 'photographer', label: 'Nhiếp ảnh gia' },
  { id: 'filmLab', label: 'Lab' },
  { id: 'filmShop', label: 'Mua film' },
  { id: 'filmColor', label: 'Màu Film' }
];
const blank = (category: ServiceCategory): ServiceListing => ({
  id: '', category, name: '', tags: [], filmStocks: [], services: [],
  ...(category === 'spot' ? { bloomPercentage: 85, conceptTags: [], placeCategories: [], recommendedLenses: [] } : {}),
});
const inputClass = 'w-full rounded-xl border border-[#D8CFBD] bg-white px-3 py-2.5 text-sm text-[#2C2621] outline-none focus:border-[#C76B3C]';
const initialCategory = (): ServiceCategory => {
  const path = window.location.pathname;
  if (path.startsWith('/admin/spots')) return 'spot';
  if (path.startsWith('/admin/outfits')) return 'outfit';
  if (path.startsWith('/admin/photographers')) return 'photographer';
  if (path.startsWith('/admin/film-shops')) return 'filmShop';
  if (path.startsWith('/admin/labs')) return 'filmLab';
  if (path.startsWith('/admin/films')) return 'filmColor';
  return 'rental';
};
const summary = (record: ServiceListing) => {
  if (record.category !== 'filmShop') return record.address || record.price || record.description || 'Chưa có mô tả';
  const minimum = Number(record.minRollPrice) || 0;
  const maximum = Number(record.maxRollPrice) || 0;
  const rollPrice = minimum && maximum
    ? `${minimum.toLocaleString('vi-VN')}–${maximum.toLocaleString('vi-VN')}đ/cuộn`
    : minimum ? `${minimum.toLocaleString('vi-VN')}đ/cuộn` : 'Chưa nhập giá';
  return [record.cheapestRollName || 'Chưa khai báo cuộn rẻ nhất', rollPrice, record.ward, record.district].filter(Boolean).join(' · ');
};
const isPendingCommunitySpot = (record: ServiceListing) => record.category === 'spot'
  && record.slug?.startsWith('community-') === true
  && record.isActive === false;

interface Props { onBack: () => void }

export const ServicesHubAdminView: React.FC<Props> = ({ onBack }) => {
  const [tokenValid, setTokenValid] = useState(Boolean(sessionStorage.getItem('service_admin_token')));
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(initialCategory);
  const [records, setRecords] = useState<ServiceListing[]>([]);
  const [placeCategories, setPlaceCategories] = useState<PlaceCategory[]>(DEFAULT_PLACE_CATEGORIES);
  const [draft, updateDraft] = useState<ServiceListing>(() => blank(initialCategory()));
  const [listText, setListText] = useState<Partial<Record<keyof ServiceListing, string>>>({});
  const setDraft: React.Dispatch<React.SetStateAction<ServiceListing>> = (next) => {
    // Replacing a record starts a fresh editing session; field updates keep raw input.
    if (typeof next !== 'function') setListText({});
    updateDraft(next);
  };
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [trendArticlesOpen, setTrendArticlesOpen] = useState(false);
  const [placeCategoriesOpen, setPlaceCategoriesOpen] = useState(false);
  const [placeFilter, setPlaceFilter] = useState('all');
  const editorRef = useRef<HTMLFormElement>(null);
  const editRecord = (record: ServiceListing) => {
    setDraft(record);
    editorRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };
  const changePlaceCategories = (next: PlaceCategory[]) => {
    setPlaceCategories(next);
    if (placeFilter !== 'all' && placeFilter !== 'unassigned' && !next.some(item => item.id === placeFilter)) setPlaceFilter('all');
  };
  const pendingCommunitySpots = records.filter(isPendingCommunitySpot);
  const spots = records.filter(record => record.category === 'spot' && !isPendingCommunitySpot(record));
  const visibleRecords = records.filter(record => record.category === category && !isPendingCommunitySpot(record) && (category !== 'spot' || placeFilter === 'all' || (placeFilter === 'unassigned' ? !record.placeCategories?.length : record.placeCategories?.includes(placeFilter))));

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [items, categoryOptions] = await Promise.all([serviceHubApi.adminList(), serviceHubApi.listPlaceCategories().catch(() => DEFAULT_PLACE_CATEGORIES)]);
      setRecords(items);
      setPlaceCategories(categoryOptions);
    }
    catch (err) {
      serviceHubApi.logout();
      setTokenValid(false);
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
    } finally { setLoading(false); }
  };
  useEffect(() => {
    if (!tokenValid) return;
    let active = true;
    Promise.all([serviceHubApi.adminList(), serviceHubApi.listPlaceCategories().catch(() => DEFAULT_PLACE_CATEGORIES)]).then(([items, categoryOptions]) => {
      if (active) { setRecords(items); setPlaceCategories(categoryOptions); }
    })
      .catch((err: unknown) => {
        serviceHubApi.logout();
        if (active) {
          setTokenValid(false);
          setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
        }
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tokenValid]);

  useEffect(() => {
    if (!tokenValid) return;
    let active = true;
    const refreshSubmissions = () => {
      if (document.visibilityState === 'hidden') return;
      serviceHubApi.adminList().then(items => { if (active) setRecords(items); }).catch(() => undefined);
    };
    const interval = window.setInterval(refreshSubmissions, 45_000);
    window.addEventListener('focus', refreshSubmissions);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshSubmissions);
    };
  }, [tokenValid]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try { await serviceHubApi.login(password); setPassword(''); setTokenValid(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.'); }
    finally { setLoading(false); }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (draft.id) await serviceHubApi.update(draft);
      else await serviceHubApi.create(draft);
      setDraft(blank(category));
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không lưu được mục dịch vụ.'); }
    finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa mục dịch vụ này?')) return;
    setLoading(true);
    setError('');
    try { await serviceHubApi.remove(id, category); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không xóa được mục dịch vụ.'); }
    finally { setLoading(false); }
  };

  const reviewCommunitySpot = async (record: ServiceListing, approve: boolean) => {
    if (!approve && !window.confirm(`Từ chối và xóa địa điểm “${record.name}” khỏi hàng chờ?`)) return;
    setLoading(true);
    setError('');
    setNotice('');
    try {
      if (approve) await serviceHubApi.approveCommunitySpot(record.id);
      else await serviceHubApi.rejectCommunitySpot(record.id);
      setRecords(await serviceHubApi.adminList());
      setNotice(approve ? `Đã duyệt và xuất bản “${record.name}”.` : `Đã từ chối “${record.name}”.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xử lý được địa điểm chờ duyệt.');
    } finally { setLoading(false); }
  };

  const importRecords = async (items: BulkRecord[]) => {
    let imported = 0;
    const failures: { index: number; message: string }[] = [];
    for (let start = 0; start < items.length; start += 8) {
      const batch = items.slice(start, start + 8);
      const results = await Promise.allSettled(batch.map((item) => serviceHubApi.create(item)));
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') imported += 1;
        else failures.push({ index: start + index, message: result.reason instanceof Error ? result.reason.message : 'Lỗi lưu dữ liệu' });
      });
    }
    try {
      const [items, categoryOptions] = await Promise.all([serviceHubApi.adminList(), serviceHubApi.listPlaceCategories().catch(() => DEFAULT_PLACE_CATEGORIES)]);
      setRecords(items);
      setPlaceCategories(categoryOptions);
    }
    catch (err) { setError(err instanceof Error ? err.message : 'Đã nhập nhưng không làm mới được danh sách.'); }
    return { imported, failures };
  };

  const setField = (field: keyof ServiceListing, value: string | boolean) => setDraft((current) => ({ ...current, [field]: value }));
  const textField = (label: string, field: keyof ServiceListing, placeholder = '', required = false) => (
    <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">{label}<input className={inputClass} value={String(draft[field] ?? '')} placeholder={placeholder} required={required} onChange={(event) => setField(field, event.target.value)} /></label>
  );
  const textareaField = (label: string, field: 'description' | 'bestTimeDescription', required = false) => (
    <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">{label}<textarea className={`${inputClass} min-h-24`} value={String(draft[field] ?? '')} required={required} onChange={(event) => setField(field, event.target.value)} /></label>
  );
  const percentageField = (
    <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Mức độ nở / hiện trạng (%)<input aria-label="Mức độ nở / hiện trạng (%)" className={inputClass} type="number" min="0" max="100" step="1" required value={draft.bloomPercentage ?? 85} onChange={(event) => setDraft((current) => ({ ...current, bloomPercentage: event.target.value === '' ? undefined : Number(event.target.value) }))} /></label>
  );
  const numberField = (label: string, field: 'minRollPrice' | 'maxRollPrice', required = false) => (
    <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">{label}<input className={inputClass} type="number" min={field === 'minRollPrice' ? 1 : Number(draft.minRollPrice) || 1} max="50000000" step="1" value={draft[field] ?? ''} required={required} onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value === '' ? undefined : Number(event.target.value) }))} /></label>
  );
  const listField = (label: string, field: 'tags' | 'filmStocks' | 'services' | 'paletteHex' | 'portfolioPhotos' | 'suitableSeasons' | 'recommendedLenses') => (
    <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">{label}<textarea className={`${inputClass} min-h-20`} value={listText[field] ?? (draft[field] || []).join(', ')} placeholder="Phân tách từng mục bằng dấu phẩy" onChange={(event) => {
      const value = event.target.value;
      setListText((current) => ({ ...current, [field]: value }));
      setDraft((current) => ({ ...current, [field]: value.split(',').map((item) => item.trim()).filter(Boolean) }));
    }} /></label>
  );
  const conceptTagPicker = (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-[#554D43]">Concept & trang phục gợi ý</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {conceptTags.map((tag) => {
          const selected = (draft.conceptTags || []).includes(tag);
          return <label key={tag} className="flex items-center gap-2 rounded-lg border border-[#D8CFBD] bg-white px-3 py-2 text-xs font-medium text-[#554D43]">
            <input type="checkbox" aria-label={`Concept: ${CONCEPT_METADATA[tag].label}`} checked={selected} onChange={(event) => setDraft((current) => ({
              ...current,
              conceptTags: event.target.checked
                ? [...(current.conceptTags || []), tag]
                : (current.conceptTags || []).filter((item) => item !== tag),
            }))} />
            {CONCEPT_METADATA[tag].label}
          </label>;
        })}
      </div>
    </fieldset>
  );
  const placeCategoryPicker = (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-[#554D43]">Nhóm địa điểm (có thể chọn nhiều)</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {placeCategories.map(({ id, label }) => {
                  const selected = (draft.placeCategories || []).includes(id);
                  return <label key={id} className="flex items-center gap-2 rounded-lg border border-[#D8CFBD] bg-white px-3 py-2 text-xs font-medium text-[#554D43]">
                    <input type="checkbox" aria-label={`Nhóm địa điểm: ${label}`} checked={selected} onChange={(event) => setDraft((current) => ({
                      ...current,
                      placeCategories: event.target.checked
                        ? [...(current.placeCategories || []), id]
                        : (current.placeCategories || []).filter((item) => item !== id),
            }))} />
            {label}
          </label>;
        })}
      </div>
    </fieldset>
  );
  const mapLat = draft.lat === undefined || String(draft.lat).trim() === '' ? undefined : Number(draft.lat);
  const mapLng = draft.lng === undefined || String(draft.lng).trim() === '' ? undefined : Number(draft.lng);

  if (tokenValid && trendArticlesOpen) return <TrendArticlesAdminView
    onBack={() => setTrendArticlesOpen(false)}
    onEditSpot={(spot) => { setTrendArticlesOpen(false); setCategory('spot'); setDraft(spot); }}
  />;


  return (
    <section className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#F7F5F0] text-[#2C2621]" aria-label="Quản trị dịch vụ">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CFBD] bg-[#FAF8F4] px-4 py-3 sm:px-8">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C76B3C]">Bảng quản trị</p><h1 className="text-xl font-bold">Quản lý thông tin dịch vụ</h1></div>
        <div className="flex flex-wrap gap-2">
          {tokenValid && pendingCommunitySpots.length > 0 && <button type="button" onClick={() => { setCategory('spot'); setDraft(blank('spot')); }} className="inline-flex items-center gap-1.5 rounded-full bg-[#F4D2A9] px-3 py-2 text-xs font-bold text-[#713719]"><BellRing className="h-4 w-4" />{pendingCommunitySpots.length} địa điểm chờ duyệt</button>}
          {tokenValid && <button type="button" onClick={() => setTrendArticlesOpen(true)} className="rounded-full bg-[#ECE4D0] px-3 py-2 text-xs font-semibold">Bài viết xu hướng</button>}
          {tokenValid && <button type="button" aria-expanded={placeCategoriesOpen && category === 'spot'} onClick={() => { if (category !== 'spot') { setCategory('spot'); setDraft(blank('spot')); } setPlaceCategoriesOpen(current => !current || category !== 'spot'); }} className="rounded-full bg-[#ECE4D0] px-3 py-2 text-xs font-semibold">Quản lý nhóm địa điểm</button>}
          {tokenValid && <button type="button" onClick={() => { serviceHubApi.logout(); setTokenValid(false); setRecords([]); }} className="rounded-full bg-[#ECE4D0] px-3 py-2 text-xs font-semibold"><LogOut className="mr-1 inline h-4 w-4" />Đăng xuất</button>}
          <button type="button" onClick={onBack} className="rounded-full bg-[#E8DEC7] px-3 py-2 text-xs font-semibold"><ArrowLeft className="mr-1 inline h-4 w-4" />Quay lại dịch vụ</button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
        {error && <p role="alert" className="mx-auto mb-4 max-w-5xl rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mx-auto mb-4 max-w-5xl rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
        {!tokenValid ? (
          <form onSubmit={login} className="mx-auto mt-12 max-w-md rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-6">
            <h2 className="text-lg font-bold">Đăng nhập quản trị</h2><p className="mb-5 mt-1 text-sm text-[#6E655B]">Nhập mật khẩu quản trị để quản lý nội dung dịch vụ.</p>
            <label className="mb-4 block space-y-1.5 text-xs font-semibold">Mật khẩu<input autoComplete="current-password" autoFocus type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></label>
            <button disabled={loading} className="w-full rounded-xl bg-[#C76B3C] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Đang xác thực…' : 'Đăng nhập'}</button>
          </form>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <section className="rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap gap-2">{categories.map((item) => <button key={item.id} type="button" onClick={() => { setCategory(item.id); setDraft(blank(item.id)); }} className={`rounded-full px-3 py-2 text-xs font-semibold ${category === item.id ? 'bg-[#2C2621] text-white' : 'bg-[#ECE4D0] text-[#554D43]'}`}>{item.label} ({item.id === 'spot' ? spots.length : records.filter((record) => record.category === item.id).length})</button>)}</div>
              <h2 className="mb-3 font-bold">{categories.find((item) => item.id === category)?.label}</h2>
              {category === 'spot' && <p className="mb-3 text-xs leading-relaxed text-[#6E655B]">Chọn nhóm để sửa trực tiếp địa điểm trên bản đồ. Một địa điểm có thể thuộc nhiều nhóm; bài viết biên tập vẫn quản lý riêng tại “Bài viết xu hướng”.</p>}
              {category === 'spot' && pendingCommunitySpots.length > 0 && <section role="region" aria-label="Địa điểm cộng đồng chờ duyệt" className="mb-5 space-y-3 rounded-2xl border border-[#E4A566] bg-[#FFF7EB] p-4">
                <header className="flex items-start gap-3">
                  <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[#A64B22]" />
                  <div><h3 className="font-bold text-[#713719]">Có {pendingCommunitySpots.length} địa điểm mới chờ bạn duyệt</h3><p className="mt-1 text-xs text-[#765A47]">Yêu cầu mới được kiểm tra lại khi trang admin mở hoặc đang hoạt động.</p></div>
                </header>
                <div className="space-y-2">
                  {pendingCommunitySpots.map(record => <article key={record.id} className="rounded-xl border border-[#EAD3B6] bg-white p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1.5">
                        <h4 className="text-sm font-bold">{record.name}</h4>
                        <p className="text-xs text-[#6E655B]">{record.address} · {record.regionId === 'hanoi' ? 'Hà Nội' : record.regionId}</p>
                        <p className="text-xs text-[#8A4A2C]">Nhóm: {(record.placeCategories || []).map(id => placeCategories.find(item => item.id === id)?.label || id).join(', ') || 'Chưa gán'}</p>
                        {record.description && <p className="text-sm leading-relaxed text-[#554D43]">{record.description}</p>}
                        {typeof record.lat === 'number' && typeof record.lng === 'number' && <a href={`https://www.google.com/maps?q=${record.lat},${record.lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A4A2C] underline"><MapPin className="h-3.5 w-3.5" />Xem vị trí trên bản đồ<ExternalLink className="h-3 w-3" /></a>}
                        {record.coverImageUrl && record.coverImageUrl !== '/spot-image-pending.svg' && <img src={record.coverImageUrl} alt={`Ảnh gửi kèm: ${record.name}`} className="mt-2 max-h-40 rounded-lg object-contain" />}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                        <button type="button" disabled={loading} aria-label={`Duyệt và xuất bản ${record.name}`} onClick={() => void reviewCommunitySpot(record, true)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#38734A] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><CircleCheck className="h-4 w-4" />Duyệt và xuất bản</button>
                        <button type="button" disabled={loading} aria-label={`Từ chối ${record.name}`} onClick={() => void reviewCommunitySpot(record, false)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-60"><Trash2 className="h-4 w-4" />Từ chối</button>
                      </div>
                    </div>
                  </article>)}
                </div>
              </section>}
              {category === 'spot' && placeCategoriesOpen && <PlaceCategoriesAdminPanel embedded categories={placeCategories} onCategoriesChange={changePlaceCategories} onBack={() => setPlaceCategoriesOpen(false)} />}
              {category === 'spot' && <nav aria-label="Lọc nhóm địa điểm" className="mb-4 grid gap-2 sm:grid-cols-2">
                {[{ id: 'all', label: 'Tất cả', count: spots.length }, { id: 'unassigned', label: 'Chưa phân nhóm', count: spots.filter(spot => !spot.placeCategories?.length).length }, ...placeCategories.map(item => ({ ...item, count: spots.filter(spot => spot.placeCategories?.includes(item.id)).length }))].map(item => <button key={item.id} type="button" aria-pressed={placeFilter === item.id} onClick={() => setPlaceFilter(item.id)} className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-semibold ${placeFilter === item.id ? 'border-[#2C2621] bg-[#2C2621] text-white' : 'border-[#D8CFBD] bg-white text-[#554D43]'}`}>{item.label} ({item.count})</button>)}
              </nav>}
              {loading && <p className="mb-3 text-xs text-[#6E655B]">Đang tải…</p>}
              <div className="space-y-2">
                {visibleRecords.map((record) => <article key={record.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E2DAD0] p-3"><div className="min-w-0"><h3 className="truncate text-sm font-bold">{record.name}</h3><p className="truncate text-xs text-[#6E655B]">{summary(record)}</p></div><div className="flex shrink-0 gap-1"><button type="button" aria-label={`Sửa ${record.name}`} onClick={() => editRecord(record)} className="rounded-lg p-2 hover:bg-[#EFE9DF]"><Pencil className="h-4 w-4" /></button><button type="button" aria-label={`Xóa ${record.name}`} onClick={() => void remove(record.id)} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></article>)}
                {!loading && visibleRecords.length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-[#6E655B]">Chưa có thông tin trong nhóm này. Thêm mục mới hoặc chọn nhóm khác.</p>}
              </div>
              <div className="mt-5"><BulkImportPanel key={category} category={category} onImport={importRecords} /></div>
            </section>
            <form ref={editorRef} onSubmit={save} className="min-w-0 space-y-3 rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 sm:p-6">
              <div className="flex items-center justify-between"><h2 className="font-bold">{draft.id ? 'Chỉnh sửa thông tin' : 'Thêm thông tin mới'}</h2>{draft.id && <button type="button" onClick={() => setDraft(blank(category))} className="text-xs text-[#8A4A2C]">Tạo mới</button>}</div>
              {textField('Tên hiển thị *', 'name', 'Tên tiệm / nhiếp ảnh gia / sản phẩm')}
              {category === 'spot' ? <>{textField('Slug *', 'slug')}{textField('Khu vực / tỉnh thành', 'regionId', 'hanoi')}{textField('Quận / huyện', 'district')}{textField('Địa chỉ *', 'address')}{textField('Vĩ độ', 'lat')}{textField('Kinh độ', 'lng')}<div className="space-y-2"><p className="text-xs font-semibold text-[#554D43]">Chọn vị trí trên bản đồ</p><LeafletCoordinatePicker value={mapLat !== undefined && mapLng !== undefined && Number.isFinite(mapLat) && Number.isFinite(mapLng) ? { lat: mapLat, lng: mapLng } : undefined} onChange={({ lat, lng }) => setDraft((current) => ({ ...current, lat, lng }))} /><p className="text-[11px] text-[#6E655B]">Bấm vào bản đồ để ghim tọa độ; bạn cũng có thể sửa số ở hai ô phía trên.</p></div>{percentageField}{textField('Giờ vàng', 'goldenHour')}{textField('Thời điểm chụp (mã)', 'bestTimeOfDay', 'morning / afternoon / evening')}{textareaField('Khung giờ đẹp (mô tả)', 'bestTimeDescription')}{listField('Ống kính khuyên dùng', 'recommendedLenses')}<label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Trạng thái mùa<select className={inputClass} value={draft.spotStatus || 'ACTIVE'} onChange={(event) => setField('spotStatus', event.target.value as 'PEAK' | 'ACTIVE' | 'ENDING_SOON')}><option value="ACTIVE">Quanh năm (ACTIVE)</option><option value="PEAK">Đang rộ nhất (PEAK)</option><option value="ENDING_SOON">Sắp hết mùa (ENDING_SOON)</option></select></label>{draft.spotStatus && draft.spotStatus !== 'ACTIVE' && textField('Hạn kiểm chứng (YYYY-MM-DD) *', 'statusValidUntil', '2026-10-19')}{textField('Phí vé', 'entryFee')}{textField('Phí gửi xe', 'parkingFee')}{textareaField('Mô tả tình trạng hoa / phong cảnh', 'description')}{conceptTagPicker}{placeCategoryPicker}{textField('Link nguồn Facebook / TikTok', 'sourceUrl')}<div><p className="mb-2 text-xs font-semibold text-[#554D43]">Tháng đẹp nhất</p><div className="grid grid-cols-6 gap-1.5">{Array.from({ length: 12 }, (_, index) => index + 1).map((month) => { const selected = (draft.bestMonths || []).includes(month); return <button key={month} type="button" aria-pressed={selected} onClick={() => setDraft((current) => ({ ...current, bestMonths: selected ? (current.bestMonths || []).filter((item) => item !== month) : [...(current.bestMonths || []), month] }))} className={`rounded-lg border px-2 py-2 text-xs ${selected ? 'border-[#C76B3C] bg-[#C76B3C] text-white' : 'border-[#D8CFBD] bg-white'}`}>T{month}</button>; })}</div></div></> : category === 'filmLab' || category === 'filmShop' ? <>{textField('Mô tả', 'description')}{textField('Địa chỉ khu vực', 'address')}{textField('Phường / xã', 'ward')}{textField('Quận / huyện', 'district')}</> : <>{textField('Mô tả', 'description')}{textField('Địa chỉ', 'address')}{textField('Giá tham khảo', 'price')}</>}
              {category === 'outfit' && <>{textField('ID địa điểm liên kết (tùy chọn)', 'spotId')}{textField('Chất liệu', 'material')}</>}
              {category === 'photographer' && <>{textField('Thiết bị — Body', 'gearBody')}{textField('Thiết bị — Lens', 'gearLens')}{textField('Đánh giá', 'rating', 'Ví dụ: 4.9 / 5')}{textField('Số lượt đánh giá', 'reviewCount')}{listField('URL ảnh portfolio', 'portfolioPhotos')}<label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Gói chụp (JSON)<textarea className={`${inputClass} min-h-24`} placeholder='[{"name":"Gói cơ bản","price":1500000,"duration":"2 giờ","deliveredPhotos":20}]' value={JSON.stringify(draft.packages || [])} onChange={(event) => { try { const parsed: unknown = JSON.parse(event.target.value); if (Array.isArray(parsed)) setDraft((current) => ({ ...current, packages: parsed })); } catch { /* Keep last valid package list until JSON is valid. */ } }} /></label></>}
              {category === 'spot' && <>
                <fieldset className="space-y-3 rounded-xl border border-[#D8CFBD] p-3">
                  <legend className="text-xs font-bold">Dự kiến mùa tới</legend>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.upcoming === true} onChange={event => setField('upcoming', event.target.checked)} />Có thể hot mùa tới (? pin)</label>
                  <p className="text-xs text-[#6E655B]">Dự báo, không phải xác nhận đang rộ. Chọn ít nhất một tháng khi bật; PEAK đã kiểm chứng vẫn ưu tiên nhãn đang rộ.</p>
                  <div className="grid grid-cols-6 gap-2">{Array.from({ length: 12 }, (_, index) => index + 1).map(month => <label key={month} className="flex items-center gap-1 text-xs"><input type="checkbox" aria-label={`Tháng dự kiến: ${month}`} checked={draft.expectedMonths?.includes(month) ?? false} onChange={event => setDraft(current => ({ ...current, expectedMonths: event.target.checked ? [...(current.expectedMonths || []), month] : (current.expectedMonths || []).filter(value => value !== month) }))} />T.{month}</label>)}</div>
                </fieldset>
                <AdminImageField label="Ảnh bìa địa điểm" value={draft.coverImageUrl || ''} entity="spots" onChange={(url) => setField('coverImageUrl', url)} />
              </>}
              {category === 'outfit' && <AdminImageField label="Ảnh mẫu outfit" value={draft.imageUrl || ''} entity="outfits" hotspots={Array.isArray(draft.hotspots) ? draft.hotspots as AdminHotspot[] : []} onChange={(url) => setField('imageUrl', url)} onHotspotsChange={(hotspots) => setDraft((current) => ({ ...current, hotspots }))} />}
              {category === 'photographer' && <AdminImageField label="Avatar / ảnh portfolio đại diện" value={draft.imageUrl || ''} entity="photographers" onChange={(url) => setField('imageUrl', url)} />}
              {textField('Số điện thoại', 'phone')}
              {textField('Liên kết chính', 'link', 'Fanpage, Zalo, cửa hàng…')}
              {textField('Liên kết phụ / chỉ đường', 'secondaryLink')}
              {listField('Hashtag / phong cách', 'tags')}
              {category === 'filmLab' && <>{textField('Slogan', 'slogan')}{textField('Giờ mở cửa', 'openingHours')}{textField('Vĩ độ', 'lat')}{textField('Kinh độ', 'lng')}{listField('Film đang có', 'filmStocks')}{listField('Dịch vụ', 'services')}</>}
              {category === 'filmShop' && <>{textField('Slogan', 'slogan')}<label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#D8CFBD] bg-white px-3 py-2.5 text-sm font-semibold text-[#554D43]"><input type="checkbox" checked={Boolean(draft.expressDelivery2h)} onChange={(event) => setField('expressDelivery2h', event.target.checked)} className="h-4 w-4 accent-emerald-700" />Có ship hỏa tốc trong 2 giờ</label><label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Địa chỉ chi nhánh (JSON)<textarea className={`${inputClass} min-h-28 font-mono text-xs`} value={listText.locations ?? JSON.stringify(draft.locations?.length ? draft.locations : (draft.ward || draft.district ? [{ ward: draft.ward || '', district: draft.district || '', openingHours: draft.openingHours || '' }] : []), null, 2)} placeholder={'[{"ward":"Cửa Nam","district":"Hoàn Kiếm","openingHours":"09:00–18:00"}]'} onChange={(event) => { const value = event.target.value; setListText((current) => ({ ...current, locations: value })); try { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed)) setDraft((current) => ({ ...current, locations: parsed as ServiceListing['locations'] })); } catch { /* Keep last valid array while JSON is incomplete. */ } }} /><span className="text-[11px] font-normal text-[#6E655B]">Mỗi địa chỉ gồm ward, district và openingHours tùy chọn. Tối đa 3 địa chỉ tại Hà Nội.</span></label>{textField('Cuộn film rẻ nhất', 'cheapestRollName', '', true)}{numberField('Giá cuộn rẻ nhất (VNĐ)', 'minRollPrice', true)}{numberField('Giá cuộn film đắt nhất (VNĐ)', 'maxRollPrice', true)}{listField('Film đang bán', 'filmStocks')}</>}
              {category === 'filmColor' && <>{textField('ISO', 'iso', '200')}{textField('Khổ film', 'format', '35mm / 120')}{textField('Tone màu', 'recommendedTime')}{listField('Mùa thích hợp', 'suitableSeasons')}{listField('Mã màu palette (HEX)', 'paletteHex')}</>}
              {category === 'filmColor' && <><AdminImageField label="Ảnh vỏ cuộn film" value={draft.filmImageUrl || ''} entity="films" onChange={(url) => setField('filmImageUrl', url)} /><AdminImageField label="Ảnh chụp demo" value={draft.imageUrl || ''} entity="films" onChange={(url) => setField('imageUrl', url)} /></>}
              <button disabled={loading} type="submit" className="w-full rounded-xl bg-[#C76B3C] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{draft.id ? <><Save className="mr-2 inline h-4 w-4" />Lưu thay đổi</> : <><Plus className="mr-2 inline h-4 w-4" />Thêm mục</>}</button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
