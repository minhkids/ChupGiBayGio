import { useState, type Dispatch, type SetStateAction } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { FilterState, Spot } from '../../types';
import { REGIONS } from '../../data/regions';

interface FloatingOmnibarProps {
  filters: FilterState;
  onChangeFilters: Dispatch<SetStateAction<FilterState>>;
  onSelectRegion: (id: string) => void;
  onResetFilters: () => void;
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
}

export function FloatingOmnibar({ filters, onChangeFilters, onSelectRegion, onResetFilters, spots, onSelectSpot }: FloatingOmnibarProps) {
  const [expanded, setExpanded] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const field = 'min-h-11 min-w-0 bg-transparent px-3 text-xs text-neutral-200 outline-none focus-visible:ring-2 focus-visible:ring-kodak-amber';
  return <section aria-label="Tìm điểm chụp" className="editorial-omnibar fixed z-[var(--z-panel)]" onKeyDown={event => { if (event.key === 'Escape') { setExpanded(false); setResultsOpen(false); } }}>
    <div className="flex flex-wrap items-center rounded-3xl border border-editorial-border bg-editorial-bg p-1 shadow-lg lg:flex-nowrap lg:rounded-full">
      <div className="flex w-full items-center border-b border-editorial-border pl-3 lg:w-auto lg:flex-1 lg:border-b-0 lg:border-r">
        <Search size={18} strokeWidth={1.5} className="shrink-0 text-kodak-amber" />
        <input aria-label="Tìm điểm, loài hoa, quán cafe" placeholder="Tìm điểm, loài hoa, quán cafe..." value={filters.searchQuery} onFocus={() => setResultsOpen(!!filters.searchQuery.trim())} onChange={event => { onChangeFilters(prev => ({ ...prev, searchQuery: event.target.value })); setResultsOpen(!!event.target.value.trim()); }} className={`${field} w-full lg:min-w-64`} />
      </div>
      <select aria-label="Tháng chụp" value={filters.month ?? ''} onChange={event => onChangeFilters(prev => ({ ...prev, month: event.target.value ? Number(event.target.value) : null }))} className={`${field} flex-1 lg:flex-none`}>
        <option value="">Cả năm</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>)}
      </select>
      <select aria-label="Khu vực" value={filters.regionId} onChange={event => onSelectRegion(event.target.value)} className={`${field} flex-1 border-l border-editorial-border lg:max-w-36 lg:flex-none`}>
        {REGIONS.map(region => <option key={region.id} value={region.id}>{region.name}</option>)}
      </select>
      <button type="button" aria-expanded={expanded} aria-controls="field-filters" onClick={() => { setExpanded(!expanded); setResultsOpen(false); }} className="flex min-h-11 items-center gap-2 rounded-full border-l border-editorial-border px-3 text-xs text-kodak-amber"><SlidersHorizontal size={16} strokeWidth={1.5} />Bộ lọc</button>
    </div>
    {expanded && <div id="field-filters" className="mt-2 space-y-3 rounded-2xl border border-editorial-border bg-editorial-surface p-4 text-sm text-neutral-200">
      <div className="flex items-center justify-between"><h2 className="font-semibold">Chọn điều kiện chụp</h2><button aria-label="Đóng bộ lọc" onClick={() => setExpanded(false)} className="p-3"><X size={16} strokeWidth={1.5} /></button></div>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-xs">Chi phí<select className={`${field} block w-full rounded-lg border border-editorial-border`} value={filters.cost} onChange={event => onChangeFilters(prev => ({ ...prev, cost: event.target.value as FilterState['cost'] }))}><option value="ALL">Tất cả mức giá</option><option value="FREE">Miễn phí</option><option value="TICKET">Vé vào cửa</option><option value="COMMERCIAL_FEE">Phí chụp thương mại</option></select></label>
        <label className="space-y-1 text-xs">Mùa hoa<select className={`${field} block w-full rounded-lg border border-editorial-border`} value={filters.status} onChange={event => onChangeFilters(prev => ({ ...prev, status: event.target.value as FilterState['status'] }))}><option value="ALL">Tất cả tình trạng</option><option value="PEAK">Đang rộ</option><option value="ENDING_SOON">Sắp hết mùa</option></select></label>
      </div>
      <button type="button" onClick={onResetFilters} className="min-h-11 text-kodak-amber underline underline-offset-4">Bỏ tất cả bộ lọc</button>
    </div>}
    {!expanded && resultsOpen && <div className="mt-2 max-h-[40dvh] overflow-y-auto rounded-2xl border border-editorial-border bg-editorial-surface text-neutral-200">
      <div className="flex items-center justify-between px-4 text-xs text-neutral-400"><span>{spots.length} điểm phù hợp</span><button aria-label="Đóng kết quả tìm kiếm" onClick={() => setResultsOpen(false)} className="p-3"><X size={16} /></button></div>
      {spots.length ? spots.slice(0, 8).map(spot => <button key={spot.id} type="button" onClick={() => { onSelectSpot(spot); setResultsOpen(false); }} className="block min-h-14 w-full border-t border-editorial-border px-4 py-3 text-left hover:bg-editorial-bg"><span className="block text-sm">{spot.name}</span><span className="block truncate text-xs text-neutral-400">{spot.address}</span></button>) : <p role="status" className="p-4 text-sm">Không có điểm phù hợp. Thử đổi tháng hoặc bỏ bớt bộ lọc.</p>}
    </div>}
  </section>;
}
