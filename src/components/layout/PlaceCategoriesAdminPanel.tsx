import { useState } from 'react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import type { PlaceCategory } from '../../types';
import { serviceHubApi } from '../../services/serviceHubApi';

interface Props {
  categories: PlaceCategory[];
  onCategoriesChange: (categories: PlaceCategory[]) => void;
  onBack: () => void;
  embedded?: boolean;
}

const sortCategories = (categories: PlaceCategory[]) => [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, 'vi'));
const inputClass = 'w-full rounded-xl border border-[#D8CFBD] bg-white px-3 py-2.5 text-sm text-[#2C2621] outline-none focus:border-[#C76B3C]';

export const PlaceCategoriesAdminPanel = ({ categories, onCategoriesChange, onBack, embedded = false }: Props) => {
  const [newLabel, setNewLabel] = useState('');
  const [labelDrafts, setLabelDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const created = await serviceHubApi.createPlaceCategory(newLabel);
      onCategoriesChange(sortCategories([...categories, created]));
      setNewLabel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thêm được nhóm địa điểm.');
    } finally { setLoading(false); }
  };

  const update = async (category: PlaceCategory) => {
    const label = (labelDrafts[category.id] ?? category.label).trim();
    if (!label || label === category.label) return;
    setLoading(true);
    setError('');
    try {
      const updated = await serviceHubApi.updatePlaceCategory(category.id, label);
      onCategoriesChange(sortCategories(categories.map(item => item.id === updated.id ? updated : item)));
      setLabelDrafts(current => { const next = { ...current }; delete next[category.id]; return next; });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không sửa được tên nhóm.');
    } finally { setLoading(false); }
  };

  const remove = async (category: PlaceCategory) => {
    if (!window.confirm(`Xóa nhóm “${category.label}”? Địa điểm đang dùng nhóm này phải được gỡ nhãn trước.`)) return;
    setLoading(true);
    setError('');
    try {
      await serviceHubApi.removePlaceCategory(category.id);
      onCategoriesChange(categories.filter(item => item.id !== category.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được nhóm địa điểm.');
    } finally { setLoading(false); }
  };

  return <section className={embedded ? 'mb-4 rounded-xl border border-[#D8CFBD] text-[#2C2621]' : 'fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#F7F5F0] text-[#2C2621]'} aria-label="Quản lý nhóm địa điểm">
    <header className="flex items-center justify-between border-b border-[#D8CFBD] bg-[#FAF8F4] px-4 py-3 sm:px-8">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C76B3C]">Cấu hình địa điểm</p><h1 className="text-xl font-bold">Quản lý nhóm địa điểm</h1></div>
      <button type="button" onClick={onBack} className="rounded-full bg-[#E8DEC7] px-3 py-2 text-xs font-semibold"><ArrowLeft className="mr-1 inline h-4 w-4" />{embedded ? 'Đóng cấu hình' : 'Quay lại quản trị'}</button>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <p className="text-sm leading-relaxed text-[#6E655B]">Tạo nhóm một lần, sau đó gán một hoặc nhiều nhóm cho từng địa điểm. Mã nội bộ được tạo tự động và giữ nguyên khi đổi tên.</p>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <form onSubmit={create} className="flex flex-col gap-2 rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 sm:flex-row">
          <label className="min-w-0 flex-1 space-y-1.5 text-xs font-semibold text-[#554D43]">Tên nhóm mới<input aria-label="Tên nhóm mới" className={inputClass} maxLength={80} required value={newLabel} onChange={event => setNewLabel(event.target.value)} placeholder="Ví dụ: Địa điểm chụp cưới" /></label>
          <button type="submit" disabled={loading || !newLabel.trim()} className="min-h-11 self-end rounded-xl bg-[#C76B3C] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Plus className="mr-1 inline h-4 w-4" />Thêm nhóm</button>
        </form>
        <div className="space-y-2">
          {sortCategories(categories).map(category => <div key={category.id} className="grid gap-2 rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
            <label className="min-w-0 space-y-1.5 text-xs font-semibold text-[#554D43]">Tên hiển thị<input aria-label={`Tên nhóm ${category.label}`} className={inputClass} maxLength={80} value={labelDrafts[category.id] ?? category.label} onChange={event => setLabelDrafts(current => ({ ...current, [category.id]: event.target.value }))} /><span className="font-mono text-[10px] font-normal text-[#8C8377]">Mã cố định: {category.id}</span></label>
            <button type="button" disabled={loading || (labelDrafts[category.id] ?? category.label).trim() === category.label || !(labelDrafts[category.id] ?? category.label).trim()} onClick={() => void update(category)} aria-label={`Lưu ${category.label}`} className="min-h-11 rounded-xl bg-[#ECE4D0] px-3 py-2 text-xs font-semibold disabled:opacity-40"><Save className="mr-1 inline h-4 w-4" />Lưu</button>
            <button type="button" disabled={loading} onClick={() => void remove(category)} aria-label={`Xóa ${category.label}`} className="min-h-11 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-40"><Trash2 className="mr-1 inline h-4 w-4" />Xóa</button>
          </div>)}
          {categories.length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-[#6E655B]">Chưa có nhóm địa điểm. Thêm nhóm đầu tiên ở phía trên.</p>}
        </div>
      </div>
    </div>
  </section>;
};
