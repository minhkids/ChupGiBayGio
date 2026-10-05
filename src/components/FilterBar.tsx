import React, { useState } from 'react'; 
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Compass, 
  Calendar,
  Tag,
  Check,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FilterState, ConceptTag } from '../types';
import { CONCEPT_METADATA } from '../utils/season';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

const MONTH_LABELS: Record<number, string> = {
  1: 'T.01 — Hoa Đào & Tết',
  2: 'T.02 — Hoa Ban Tây Bắc',
  3: 'T.03 — Hoa Sưa & Gạo',
  4: 'T.04 — Loa Kèn Trắng',
  5: 'T.05 — Sen & Bằng Lăng',
  6: 'T.06 — Sen Hồ Tây',
  7: 'T.07 — Biển Xanh',
  8: 'T.08 — Mùa Sương Mây',
  9: 'T.09 — Hoa Sữa & Cà Phê',
  10: 'T.10 — Xe Hoa Phố Cổ',
  11: 'T.11 — Cúc Họa Mi & Cỏ Hồng',
  12: 'T.12 — Dã Quỳ & Giáng Sinh'
}

/* ── Shared control language ────────────────────────────────────────────────
   Editorial, not pill-shaped: square plate, 1px ink hairline, mono-spec
   uppercase micro-label, hard offset shadow on interaction. Sized to a real
   44px hit target instead of the previous py-1.5 pill.
   ───────────────────────────────────────────────────────────────────────── */

const PLATE =
  'relative inline-flex h-11 items-center gap-2 border px-4 ' +
  'font-mono-spec text-[11px] font-bold uppercase tracking-[0.14em] ' +
  'transition-all duration-150 select-none whitespace-nowrap ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-paper-light';

const PLATE_IDLE =
  'border-slateInk/25 bg-paper-card text-slateInk ' +
  'hover:-translate-y-px hover:border-slateInk hover:bg-paper-warm hover:shadow-hard';

const PLATE_ACTIVE =
  'border-slateInk bg-slateInk text-paper-light shadow-hard';

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalFilteredCount
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMonthPopoverOpen, setIsMonthPopoverOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleToggleNearby = () => {
    if (filters.onlyNearby) {
      onChangeFilters({
        ...filters,
        onlyNearby: false,
        userCoords: null
      });
      return;
    }

    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          onChangeFilters({
            ...filters,
            onlyNearby: true,
            userCoords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        (error) => {
          console.warn('Geolocation fallback:', error);
          setIsLocating(false);
          onChangeFilters({
            ...filters,
            onlyNearby: true,
            userCoords: {
              lat: 21.0285,
              lng: 105.8542
            }
          });
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      onChangeFilters({
        ...filters,
        onlyNearby: true,
        userCoords: {
          lat: 21.0285,
          lng: 105.8542
        }
      });
    }
  };

  const hasActiveFilters = 
    filters.status !== 'ALL' ||
    filters.timeOfDay !== 'ALL' ||
    filters.concept !== 'ALL' ||
    filters.cost !== 'ALL' ||
    filters.onlyNearby ||
    filters.searchQuery.trim() !== '' ||
    filters.month !== null;

  const advancedHasValue =
    showAdvanced || filters.timeOfDay !== 'ALL' || filters.concept !== 'ALL' || filters.cost !== 'ALL';

  return (
    <div className="sticky top-0 z-30 border-b border-paper-border bg-paper-light/95 backdrop-blur-md select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        
        {/* Top Compact Search & Filter Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-stretch justify-between gap-3">
          
          {/* Main Search Bar — notched plate, mono placeholder */}
          <div className="relative flex-1 lg:max-w-xl">
            <span className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-slateInk" aria-hidden="true" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-terracotta" strokeWidth={2.2} />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Tìm theo tên điểm, cúc họa mi, áo dài, vintage..."
              aria-label="Tìm kiếm điểm chụp"
              className="w-full h-11 pl-11 pr-10 bg-paper-card border border-slateInk/25 text-sm text-slateInk placeholder:text-slateInk-light placeholder:font-mono-spec placeholder:text-[11px] placeholder:uppercase placeholder:tracking-[0.14em] focus:outline-none focus:border-slateInk focus:shadow-hard-terracotta transition-all"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onChangeFilters({ ...filters, searchQuery: '' })}
                aria-label="Xóa tìm kiếm"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center border border-slateInk/20 text-slateInk-muted hover:border-terracotta hover:bg-terracotta hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.4} />
              </button>
            )}
          </div>

          {/* Filter plates */}
          <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar">
            
            {/* Month / Season plate */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMonthPopoverOpen(prev => !prev)}
                aria-expanded={isMonthPopoverOpen}
                className={`${PLATE} ${filters.month ? PLATE_ACTIVE : PLATE_IDLE}`}
              >
                <Calendar className="w-4 h-4 text-terracotta" strokeWidth={2} />
                <span>{filters.month ? `T${filters.month}` : 'Mùa'}</span>
              </button>

              {/* Month & Season Selection Popover */}
              <AnimatePresence>
                {isMonthPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 top-12 w-72 bg-paper-card border-2 border-slateInk shadow-hard-lg p-4 z-50"
                  >
                    <div className="flex items-center justify-between border-b border-slateInk/15 pb-2.5">
                      <span className="font-mono-spec text-[11px] font-bold uppercase tracking-[0.14em] text-slateInk">
                        Lọc theo tháng nở hoa
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onChangeFilters({ ...filters, month: null });
                          setIsMonthPopoverOpen(false);
                        }}
                        className="font-mono-spec text-[10px] font-bold uppercase tracking-[0.14em] text-terracotta hover:text-terracotta-dark hover:underline"
                      >
                        Cả năm
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-px mt-3 bg-slateInk/15">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            onChangeFilters({ ...filters, month: filters.month === m ? null : m });
                            setIsMonthPopoverOpen(false);
                          }}
                          aria-pressed={filters.month === m}
                          className={`px-3 py-2.5 text-left font-mono-spec text-[11px] font-bold tracking-[0.1em] transition-colors ${
                            filters.month === m
                              ? 'bg-terracotta text-white'
                              : 'bg-paper-card text-slateInk hover:bg-paper-warm'
                          }`}
                        >
                          <span className="block truncate">{MONTH_LABELS[m]?.split(' — ')[0]}</span>
                          {filters.month === m && <Check className="w-3 h-3 shrink-0 mt-0.5" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status segmented control — one bordered plate, divided segments */}
            <div
              role="group"
              aria-label="Trạng thái mùa"
              className="inline-flex h-11 items-stretch border border-slateInk/25 bg-paper-card"
            >
              <button
                type="button"
                onClick={() => onChangeFilters({ ...filters, status: 'ALL' })}
                aria-pressed={filters.status === 'ALL'}
                className={`px-4 font-mono-spec text-[11px] font-bold uppercase tracking-[0.14em] border-r border-slateInk/15 transition-colors ${
                  filters.status === 'ALL'
                    ? 'bg-slateInk text-paper-light'
                    : 'text-slateInk-muted hover:bg-paper-warm hover:text-slateInk'
                }`}
              >
                Tất cả
              </button>

              <button
                type="button"
                onClick={() => onChangeFilters({ ...filters, status: 'PEAK' })}
                aria-pressed={filters.status === 'PEAK'}
                className={`relative px-4 font-mono-spec text-[11px] font-bold uppercase tracking-[0.14em] border-r border-slateInk/15 transition-colors ${
                  filters.status === 'PEAK'
                    ? 'bg-terracotta text-white'
                    : 'text-slateInk-muted hover:bg-paper-warm hover:text-slateInk'
                }`}
              >
                <span className="absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-terracotta animate-pulse" aria-hidden="true" />
                <span className="pl-3">Rộ</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeFilters({ ...filters, status: 'ENDING_SOON' })}
                aria-pressed={filters.status === 'ENDING_SOON'}
                className={`px-4 font-mono-spec text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  filters.status === 'ENDING_SOON'
                    ? 'bg-amberFilm text-slateInk'
                    : 'text-slateInk-muted hover:bg-paper-warm hover:text-slateInk'
                }`}
              >
                Tắt dần
              </button>
            </div>

            {/* GPS Nearby plate */}
            <button
              type="button"
              onClick={handleToggleNearby}
              aria-pressed={filters.onlyNearby}
              className={`${PLATE} ${
                filters.onlyNearby
                  ? 'border-terracotta bg-terracotta text-white shadow-hard-terracotta'
                  : PLATE_IDLE
              }`}
            >
              <Compass className={`w-4 h-4 ${filters.onlyNearby ? 'text-white' : 'text-terracotta'} ${isLocating ? 'animate-spin' : ''}`} strokeWidth={2} />
              <span>{filters.onlyNearby ? '<25km' : 'Gần tôi'}</span>
            </button>

            {/* Advanced Filters plate */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              className={`${PLATE} ${advancedHasValue ? PLATE_ACTIVE : PLATE_IDLE}`}
            >
              <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
              <span>Bộ lọc</span>
            </button>

            {/* Reset plate */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                aria-label="Xóa toàn bộ bộ lọc"
                title="Xóa bộ lọc"
                className={`${PLATE} shrink-0 border-terracotta/50 bg-terracotta-10 text-terracotta hover:-translate-y-px hover:border-terracotta hover:shadow-hard-terracotta`}
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2.2} />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>

        {/* Count summary line */}
        <div className="flex items-center justify-between gap-3 text-[11px] font-mono-spec uppercase tracking-[0.14em] text-slateInk-muted">
          <span className="text-slateInk">Hiển thị {totalFilteredCount} địa điểm chụp ánh — Hà Nội</span>
          <span className="hidden sm:inline">Dữ liệu kiểm chứng bởi cộng đồng nhiếp ảnh</span>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="border-2 border-slateInk bg-paper-warm p-4 space-y-3">
            <div>
              <div className="text-[11px] font-mono-spec font-bold uppercase tracking-[0.14em] text-slateInk mb-2 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-terracotta" strokeWidth={2.2} />
                Concept &amp; phong cách chụp
              </div>
              <div className="flex flex-wrap gap-2">
                {(['ALL', 'AO_DAI', 'VINTAGE', 'HOA_CO', 'STREET', 'NANG_THO', 'FILM'] as (ConceptTag | 'ALL')[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, concept: c })}
                    aria-pressed={filters.concept === c}
                    className={`h-9 px-3.5 font-mono-spec text-[11px] font-bold uppercase tracking-[0.12em] border transition-all ${
                      filters.concept === c
                        ? 'border-slateInk bg-slateInk text-paper-light shadow-hard'
                        : 'border-slateInk/25 bg-paper-card text-slateInk hover:-translate-y-px hover:border-slateInk hover:shadow-hard'
                    }`}
                  >
                    {c === 'ALL' ? 'Tất cả' : (CONCEPT_METADATA[c]?.label || c)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};