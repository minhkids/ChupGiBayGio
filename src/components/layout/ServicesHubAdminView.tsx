import React, { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { serviceHubApi, type ServiceCategory, type ServiceListing } from '../../services/serviceHubApi';
import { AdminImageField, type AdminHotspot } from './AdminImageField';
import { LeafletCoordinatePicker } from './LeafletCoordinatePicker';
import { BulkImportPanel } from './BulkImportPanel';
import type { BulkRecord } from './bulkImport';

const categories: { id: ServiceCategory; label: string }[] = [
  { id: 'spot', label: 'Điểm chụp ảnh' },
  { id: 'rental', label: 'Tiệm thuê trang phục' },
  { id: 'outfit', label: 'Trang phục mua' },
  { id: 'photographer', label: 'Nhiếp ảnh gia' },
  { id: 'filmLab', label: 'Mua film & Lab' },
  { id: 'filmColor', label: 'Màu Film' }
];
const blank = (category: ServiceCategory): ServiceListing => ({ id: '', category, name: '', tags: [], filmStocks: [], services: [] });
const inputClass = 'w-full rounded-xl border border-[#D8CFBD] bg-white px-3 py-2.5 text-sm text-[#2C2621] outline-none focus:border-[#C76B3C]';
const initialCategory = (): ServiceCategory => {
  const path = window.location.pathname;
  if (path.startsWith('/admin/spots')) return 'spot';
  if (path.startsWith('/admin/outfits')) return 'outfit';
  if (path.startsWith('/admin/photographers')) return 'photographer';
  if (path.startsWith('/admin/labs')) return 'filmLab';
  if (path.startsWith('/admin/films')) return 'filmColor';
  return 'rental';
};

interface Props { onBack: () => void }

export const ServicesHubAdminView: React.FC<Props> = ({ onBack }) => {
  const [tokenValid, setTokenValid] = useState(Boolean(sessionStorage.getItem('service_admin_token')));
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(initialCategory);
  const [records, setRecords] = useState<ServiceListing[]>([]);
  const [draft, setDraft] = useState<ServiceListing>(() => blank(initialCategory()));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try { setRecords(await serviceHubApi.adminList()); }
    catch (err) {
      serviceHubApi.logout();
      setTokenValid(false);
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
    } finally { setLoading(false); }
  };
  useEffect(() => {
    if (!tokenValid) return;
    let active = true;
    serviceHubApi.adminList().then((items) => { if (active) setRecords(items); })
      .catch((err: unknown) => {
        serviceHubApi.logout();
        if (active) {
          setTokenValid(false);
          setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
        }
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
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
    try { setRecords(await serviceHubApi.adminList()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Đã nhập nhưng không làm mới được danh sách.'); }
    return { imported, failures };
  };

  const setField = (field: keyof ServiceListing, value: string | boolean) => setDraft((current) => ({ ...current, [field]: value }));
  const textField = (label: string, field: keyof ServiceListing, placeholder = '') => (
    <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">{label}<input className={inputClass} value={String(draft[field] ?? '')} placeholder={placeholder} onChange={(event) => setField(field, event.target.value)} /></label>
  );
  const listField = (label: string, field: 'tags' | 'filmStocks' | 'services' | 'paletteHex' | 'portfolioPhotos' | 'suitableSeasons') => (
    <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">{label}<textarea className={`${inputClass} min-h-20`} value={(draft[field] || []).join(', ')} placeholder="Phân tách từng mục bằng dấu phẩy" onChange={(event) => setField(field, event.target.value.split(',').map((value) => value.trim()).filter(Boolean) as never)} /></label>
  );
  const mapLat = draft.lat === undefined || String(draft.lat).trim() === '' ? undefined : Number(draft.lat);
  const mapLng = draft.lng === undefined || String(draft.lng).trim() === '' ? undefined : Number(draft.lng);

  return (
    <section className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#F7F5F0] text-[#2C2621]" aria-label="Quản trị dịch vụ">
      <header className="flex items-center justify-between border-b border-[#D8CFBD] bg-[#FAF8F4] px-4 py-3 sm:px-8">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C76B3C]">Bảng quản trị</p><h1 className="text-xl font-bold">Quản lý thông tin dịch vụ</h1></div>
        <div className="flex gap-2">
          {tokenValid && <button type="button" onClick={() => { serviceHubApi.logout(); setTokenValid(false); setRecords([]); }} className="rounded-full bg-[#ECE4D0] px-3 py-2 text-xs font-semibold"><LogOut className="mr-1 inline h-4 w-4" />Đăng xuất</button>}
          <button type="button" onClick={onBack} className="rounded-full bg-[#E8DEC7] px-3 py-2 text-xs font-semibold"><ArrowLeft className="mr-1 inline h-4 w-4" />Quay lại dịch vụ</button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
        {error && <p role="alert" className="mx-auto mb-4 max-w-5xl rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {!tokenValid ? (
          <form onSubmit={login} className="mx-auto mt-12 max-w-md rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-6">
            <h2 className="text-lg font-bold">Đăng nhập quản trị</h2><p className="mb-5 mt-1 text-sm text-[#6E655B]">Nhập mật khẩu quản trị để quản lý nội dung dịch vụ.</p>
            <label className="mb-4 block space-y-1.5 text-xs font-semibold">Mật khẩu<input autoComplete="current-password" autoFocus type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></label>
            <button disabled={loading} className="w-full rounded-xl bg-[#C76B3C] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Đang xác thực…' : 'Đăng nhập'}</button>
          </form>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <section className="rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap gap-2">{categories.map((item) => <button key={item.id} type="button" onClick={() => { setCategory(item.id); setDraft(blank(item.id)); }} className={`rounded-full px-3 py-2 text-xs font-semibold ${category === item.id ? 'bg-[#2C2621] text-white' : 'bg-[#ECE4D0] text-[#554D43]'}`}>{item.label} ({records.filter((record) => record.category === item.id).length})</button>)}</div>
              <h2 className="mb-3 font-bold">{categories.find((item) => item.id === category)?.label}</h2>
              <BulkImportPanel key={category} category={category} onImport={importRecords} />
              {loading && <p className="mb-3 text-xs text-[#6E655B]">Đang tải…</p>}
              <div className="space-y-2">
                {records.filter((record) => record.category === category).map((record) => <article key={record.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E2DAD0] p-3"><div className="min-w-0"><h3 className="truncate text-sm font-bold">{record.name}</h3><p className="truncate text-xs text-[#6E655B]">{record.address || record.price || record.description || 'Chưa có mô tả'}</p></div><div className="flex shrink-0 gap-1"><button type="button" aria-label={`Sửa ${record.name}`} onClick={() => setDraft(record)} className="rounded-lg p-2 hover:bg-[#EFE9DF]"><Pencil className="h-4 w-4" /></button><button type="button" aria-label={`Xóa ${record.name}`} onClick={() => void remove(record.id)} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></article>)}
                {!loading && records.filter((record) => record.category === category).length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-[#6E655B]">Chưa có thông tin. Thêm mục đầu tiên bằng biểu mẫu bên cạnh.</p>}
              </div>
            </section>
            <form onSubmit={save} className="space-y-3 rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 sm:p-6">
              <div className="flex items-center justify-between"><h2 className="font-bold">{draft.id ? 'Chỉnh sửa thông tin' : 'Thêm thông tin mới'}</h2>{draft.id && <button type="button" onClick={() => setDraft(blank(category))} className="text-xs text-[#8A4A2C]">Tạo mới</button>}</div>
              {textField('Tên hiển thị *', 'name', 'Tên tiệm / nhiếp ảnh gia / sản phẩm')}
              {category === 'spot' ? <>{textField('Slug *', 'slug')}{textField('Khu vực / tỉnh thành', 'regionId', 'hanoi')}{textField('Quận / huyện', 'district')}{textField('Địa chỉ *', 'address')}{textField('Vĩ độ', 'lat')}{textField('Kinh độ', 'lng')}<div className="space-y-2"><p className="text-xs font-semibold text-[#554D43]">Chọn vị trí trên bản đồ</p><LeafletCoordinatePicker value={mapLat !== undefined && mapLng !== undefined && Number.isFinite(mapLat) && Number.isFinite(mapLng) ? { lat: mapLat, lng: mapLng } : undefined} onChange={({ lat, lng }) => setDraft((current) => ({ ...current, lat, lng }))} /><p className="text-[11px] text-[#6E655B]">Bấm vào bản đồ để ghim tọa độ; bạn cũng có thể sửa số ở hai ô phía trên.</p></div>{textField('Giờ vàng', 'goldenHour')}{textField('Khung giờ chụp đẹp', 'bestTimeOfDay', 'morning / afternoon / evening')}{textField('Phí vé', 'entryFee')}{textField('Phí gửi xe', 'parkingFee')}{textField('Mô tả', 'description')}{textField('Link nguồn Facebook / TikTok', 'sourceUrl')}<div><p className="mb-2 text-xs font-semibold text-[#554D43]">Tháng đẹp nhất</p><div className="grid grid-cols-6 gap-1.5">{Array.from({ length: 12 }, (_, index) => index + 1).map((month) => { const selected = (draft.bestMonths || []).includes(month); return <button key={month} type="button" aria-pressed={selected} onClick={() => setDraft((current) => ({ ...current, bestMonths: selected ? (current.bestMonths || []).filter((item) => item !== month) : [...(current.bestMonths || []), month] }))} className={`rounded-lg border px-2 py-2 text-xs ${selected ? 'border-[#C76B3C] bg-[#C76B3C] text-white' : 'border-[#D8CFBD] bg-white'}`}>T{month}</button>; })}</div></div></> : <>{textField('Mô tả', 'description')}{textField('Địa chỉ', 'address')}{textField('Giá tham khảo', 'price')}</>}
              {category === 'outfit' && <>{textField('ID địa điểm liên kết (tùy chọn)', 'spotId')}{textField('Chất liệu', 'material')}</>}
              {category === 'photographer' && <>{textField('Thiết bị — Body', 'gearBody')}{textField('Thiết bị — Lens', 'gearLens')}{textField('Đánh giá', 'rating', 'Ví dụ: 4.9 / 5')}{textField('Số lượt đánh giá', 'reviewCount')}{listField('URL ảnh portfolio', 'portfolioPhotos')}<label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">Gói chụp (JSON)<textarea className={`${inputClass} min-h-24`} placeholder='[{"name":"Gói cơ bản","price":1500000,"duration":"2 giờ","deliveredPhotos":20}]' value={JSON.stringify(draft.packages || [])} onChange={(event) => { try { const parsed: unknown = JSON.parse(event.target.value); if (Array.isArray(parsed)) setDraft((current) => ({ ...current, packages: parsed })); } catch { /* Keep last valid package list until JSON is valid. */ } }} /></label></>}
              {category === 'spot' && <AdminImageField label="Ảnh bìa địa điểm" value={draft.coverImageUrl || ''} entity="spots" onChange={(url) => setField('coverImageUrl', url)} />}
              {category === 'outfit' && <AdminImageField label="Ảnh mẫu outfit" value={draft.imageUrl || ''} entity="outfits" hotspots={Array.isArray(draft.hotspots) ? draft.hotspots as AdminHotspot[] : []} onChange={(url) => setField('imageUrl', url)} onHotspotsChange={(hotspots) => setDraft((current) => ({ ...current, hotspots }))} />}
              {category === 'photographer' && <AdminImageField label="Avatar / ảnh portfolio đại diện" value={draft.imageUrl || ''} entity="photographers" onChange={(url) => setField('imageUrl', url)} />}
              {textField('Số điện thoại', 'phone')}
              {textField('Liên kết chính', 'link', 'Fanpage, Zalo, cửa hàng…')}
              {textField('Liên kết phụ / chỉ đường', 'secondaryLink')}
              {listField('Hashtag / phong cách', 'tags')}
              {category === 'filmLab' && <>{textField('Giờ mở cửa', 'openingHours')}{textField('Vĩ độ', 'lat')}{textField('Kinh độ', 'lng')}{listField('Film đang có', 'filmStocks')}{listField('Dịch vụ', 'services')}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(draft.fastService)} onChange={(event) => setField('fastService', event.target.checked)} />Có tráng lấy nhanh</label></>}
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
