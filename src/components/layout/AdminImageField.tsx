import { useRef, useState, type MouseEvent } from 'react';
import { LoaderCircle, Upload, X } from 'lucide-react';
import { serviceHubApi } from '../../services/serviceHubApi';
import { getClickPercent } from './imageCoordinates';

export interface AdminHotspot { x: number; y: number; label: string }
interface Props {
  label: string;
  value: string;
  entity: 'spots' | 'outfits' | 'photographers' | 'films';
  onChange: (url: string) => void;
  hotspots?: AdminHotspot[];
  onHotspotsChange?: (hotspots: AdminHotspot[]) => void;
}
export const AdminImageField = ({ label, value, entity, onChange, hotspots = [], onHotspotsChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const addHotspot = (event: MouseEvent<HTMLImageElement>) => {
    if (!onHotspotsChange) return;
    const point = getClickPercent(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    onHotspotsChange([...hotspots, { ...point, label: `Điểm ${hotspots.length + 1}` }]);
  };
  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Chỉ nhận ảnh JPG, PNG hoặc WebP.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Ảnh tối đa 8 MB.'); return; }
    setUploading(true); setError('');
    try { const uploaded = await serviceHubApi.uploadImage(file, entity); onChange(uploaded.url); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Tải ảnh lên không thành công.'); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  return <div className="space-y-2">
    <label className="block space-y-1.5 text-xs font-semibold text-[#554D43]">{label}
      <div className="flex gap-2"><input className="min-w-0 flex-1 rounded-xl border border-[#D8CFBD] bg-white px-3 py-2.5 text-sm text-[#2C2621] outline-none focus:border-[#C76B3C]" value={value} placeholder="URL ảnh hoặc tải ảnh lên" onChange={(event) => onChange(event.target.value)} />
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-[#ECE4D0] px-3 text-xs font-semibold text-[#2C2621] disabled:opacity-60">
          {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploading ? 'Đang tải' : 'Tải ảnh'}
        </button>
      </div>
    </label>
    <input ref={inputRef} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files?.[0])} aria-label={`Chọn ảnh ${label}`} />
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    {value && <div className="relative overflow-hidden rounded-xl border border-[#D8CFBD] bg-[#EFE9DF]">
      <img src={value} alt={label} className={`block max-h-80 w-full object-contain ${onHotspotsChange ? 'cursor-crosshair' : ''}`} onClick={addHotspot} />
      {onHotspotsChange && <>
        <p className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white">Bấm vào ảnh để đặt điểm hotspot</p>
        {hotspots.map((point, index) => <span key={`${index}-${point.x}-${point.y}`} className="pointer-events-none absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#C76B3C] text-[10px] font-bold text-white shadow" style={{ left: `${point.x}%`, top: `${point.y}%` }}>{index + 1}</span>)}
      </>}
    </div>}
    {onHotspotsChange && hotspots.length > 0 && <ul className="space-y-1">{hotspots.map((point, index) => <li key={`${index}-${point.x}-${point.y}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs"><span>{point.label} · {point.x}% × {point.y}%</span><button type="button" aria-label={`Xóa hotspot ${index + 1}`} onClick={() => onHotspotsChange(hotspots.filter((_, itemIndex) => itemIndex !== index))} className="rounded p-1 text-[#8A4A2C] hover:bg-[#EFE9DF]"><X className="h-3.5 w-3.5" /></button></li>)}</ul>}
  </div>;
};
