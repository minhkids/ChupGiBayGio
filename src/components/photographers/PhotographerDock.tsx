import React, { useState, useMemo } from 'react';
import { 
  X, 
  Camera, 
  Search, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';
import { PhotographerCard } from './PhotographerCard';
import { filterPhotographers } from '../../data/mockPhotographers';
import type { Photographer, PhotographerBudgetCategory, PhotographerVibe } from '../../types';

interface PhotographerDockProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhotographer: (photographer: Photographer) => void;
}

const BUDGET_OPTIONS: { id: PhotographerBudgetCategory; label: string; desc: string }[] = [
  { id: 'all', label: 'Tất cả', desc: 'Mọi mức giá' },
  { id: 'student', label: 'HSSV (< 500k)', desc: 'Tiết kiệm' },
  { id: 'standard', label: 'Phổ thông (500k - 1tr)', desc: 'Phổ biến' },
  { id: 'premium', label: 'Cao cấp (> 1.2tr)', desc: 'Lookbook / VIP' },
];

const VIBE_OPTIONS: { id: PhotographerVibe | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả style' },
  { id: 'MàuFilm', label: '#MàuFilm' },
  { id: 'NàngThơ', label: '#NàngThơ' },
  { id: 'ÁoDài', label: '#ÁoDài' },
  { id: 'ĐườngPhố', label: '#ĐườngPhố' },
  { id: 'ChụpĐêm', label: '#ChụpĐêm' },
];

export const PhotographerDock: React.FC<PhotographerDockProps> = ({
  isOpen,
  onClose,
  onSelectPhotographer,
}) => {
  const [selectedBudget, setSelectedBudget] = useState<PhotographerBudgetCategory>('all');
  const [selectedVibe, setSelectedVibe] = useState<PhotographerVibe | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered photographers
  const filteredList = useMemo(() => {
    let result = filterPhotographers(selectedBudget, selectedVibe);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialtySpots.some((s) => s.toLowerCase().includes(q)) ||
          p.gear.toLowerCase().includes(q) ||
          p.vibes.some((v) => v.toLowerCase().includes(q))
      );
    }
    return result;
  }, [selectedBudget, selectedVibe, searchQuery]);

  if (!isOpen) return null;

  return (
    <aside
      className="w-[calc(100vw-24px)] sm:w-[420px] fixed top-20 left-3 sm:left-[92px] bottom-5 z-20 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-5 overflow-y-auto shadow-2xl flex flex-col gap-4 text-neutral-100 animate-in fade-in slide-in-from-left-4 duration-300 custom-scrollbar"
      role="region"
      aria-label="Danh sách Nhiếp Ảnh Gia Hà Nội"
    >
      {/* 1. Header: Title + Close Button */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
            <Camera className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Nhiếp Ảnh Gia</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                Hà Nội
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Đặt lịch chụp theo giá & gu ảnh thực tế
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Đóng bảng nhiếp ảnh gia"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên thợ, địa điểm tủ, máy móc..."
          className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* 3. Budget Filter (Khoảng giá) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400">
          <span className="flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Khoảng giá:
          </span>
          <span className="text-amber-400 font-bold">
            {BUDGET_OPTIONS.find((b) => b.id === selectedBudget)?.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedBudget(opt.id)}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedBudget === opt.id
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-sm'
                  : 'bg-neutral-950/80 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="text-[11px] font-bold truncate">{opt.label}</div>
              <div
                className={`text-[9px] truncate ${
                  selectedBudget === opt.id ? 'text-neutral-900/80 font-medium' : 'text-neutral-500'
                }`}
              >
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Vibe Tags (Phong cách) */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Phong cách (Vibe):
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {VIBE_OPTIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVibe(v.id)}
              className={`text-xs px-2.5 py-1 rounded-lg shrink-0 font-medium border transition-all cursor-pointer ${
                selectedVibe === v.id
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Count Indicator */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
        <span>
          Tìm thấy <strong className="text-white">{filteredList.length}</strong> thợ chụp phù hợp
        </span>
        {(selectedBudget !== 'all' || selectedVibe !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedBudget('all');
              setSelectedVibe('all');
              setSearchQuery('');
            }}
            className="text-amber-400 hover:underline text-[11px] cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* 6. Photographer Cards List */}
      <div className="flex flex-col gap-3.5 pb-2">
        {filteredList.length > 0 ? (
          filteredList.map((photographer) => (
            <PhotographerCard
              key={photographer.id}
              photographer={photographer}
              onSelectPortfolio={onSelectPhotographer}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-neutral-950/60 rounded-2xl border border-neutral-800/80 space-y-2">
            <Camera className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-neutral-300">Không tìm thấy thợ chụp phù hợp</p>
            <p className="text-xs text-neutral-500">
              Hãy thử chọn khoảng giá khác hoặc đặt lại bộ lọc phong cách.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedBudget('all');
                setSelectedVibe('all');
                setSearchQuery('');
              }}
              className="mt-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-400 transition-colors"
            >
              Xem tất cả thợ
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
