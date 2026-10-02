import React from 'react';
import { Search, X, MapPin } from 'lucide-react';
import type { FilterState, ConceptTag, SpotStatus, BestTimeOfDay } from '../../types';
import { REGIONS } from '../../data/regions';
import type { SpotFiltersProps } from './shared-types';

interface QuickChip {
  label: string;
  query?: string;
  filmId?: string;
  timeOfDay?: BestTimeOfDay;
  concept?: ConceptTag;
  status?: SpotStatus;
}

const QUICK_CHIPS: QuickChip[] = [
  { label: '🌸 Cúc họa mi', query: 'cúc họa mi' },
  { label: '🍂 Thu Hà Nội', query: 'Phan Đình Phùng' },
  { label: '🎞️ Kodak Gold 200', filmId: 'kodak-gold-200' },
  { label: '🌙 CineStill 800T', filmId: 'cinestill-800t' },
  { label: '🌿 Fuji 400', filmId: 'fujifilm-400' },
  { label: '🌅 Hoàng hôn', timeOfDay: 'SUNSET' as BestTimeOfDay },
  { label: '☕ Vintage Film', concept: 'VINTAGE' as ConceptTag },
  { label: '✨ Đang Rộ (Peak)', status: 'PEAK' as SpotStatus },
];

function isChipActive(chip: QuickChip, filters: FilterState): boolean {
  const { filmId, query, timeOfDay, concept, status } = chip;
  if (filmId) return filters.filmId === filmId;
  if (query) return filters.searchQuery === query;
  if (timeOfDay) return filters.timeOfDay === timeOfDay;
  if (concept) return filters.concept === concept;
  if (status) return filters.status === status;
  return false;
}

function handleChipClick(
  chip: QuickChip,
  onChangeFilters: (updater: (prev: FilterState) => FilterState) => void
) {
  const { filmId, query, timeOfDay, concept, status } = chip;
  if (filmId) {
    onChangeFilters(prev => ({ ...prev, filmId: prev.filmId === filmId ? 'ALL' : filmId }));
  } else if (query) {
    onChangeFilters(prev => ({ ...prev, searchQuery: prev.searchQuery === query ? '' : query }));
  } else if (timeOfDay) {
    onChangeFilters(prev => ({ ...prev, timeOfDay: prev.timeOfDay === timeOfDay ? 'ALL' : timeOfDay }));
  } else if (concept) {
    onChangeFilters(prev => ({ ...prev, concept: prev.concept === concept ? 'ALL' : concept }));
  } else if (status) {
    onChangeFilters(prev => ({ ...prev, status: prev.status === status ? 'ALL' : status }));
  }
}

export const SpotFilters: React.FC<SpotFiltersProps> = ({
  filters,
  activeRegionId,
  regions = REGIONS,
  callbacks,
  savedSpotIds,
  filteredSpotsCount,
  filteredPostsCount,
  sidebarTab,
  setSidebarTab,
  postTagFilter,
  setPostTagFilter,
  isMobile = false,
  mobileSnap,
  className = '',
}) => {
  const {
    onChangeFilters,
    onResetFilters,
    onSelectRegion,
    onChangeView,
    onOpenSavedModal,
    onOpenSubmitSpotModal,
    onOpenAddPostModal,
  } = callbacks;

  // Unused but required by interface
  void activeRegionId;
  void regions;
  void savedSpotIds;
  void onSelectRegion;
  void onChangeView;
  void onOpenSavedModal;
  void onOpenSubmitSpotModal;

  const showFilters = !isMobile || mobileSnap !== 'peek';

  return (
    <div className={`p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0 space-y-2.5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm ${className}`}>
      {/* ROW 1: Search Bar + Clear/Reset Actions */}
      <div className="h-11 w-full rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/80 px-3.5 flex items-center justify-between transition-all focus-within:ring-2 focus-within:ring-terracotta/40 focus-within:bg-white dark:focus-within:bg-neutral-850">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder={sidebarTab === 'spots' ? 'Tìm điểm chụp, cúc họa mi, áo dài...' : 'Tìm bài viết, tác giả, thiết bị...'}
            className="w-full bg-transparent text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center space-x-1 shrink-0 pl-1.5">
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChangeFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[10px] font-mono-spec font-bold px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            title="Đặt lại bộ lọc"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ROW 2: Quick Filter Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        {QUICK_CHIPS.map((chip, idx) => {
          const active = isChipActive(chip, filters);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip, onChangeFilters)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-xs transition-all shrink-0 ${active
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold scale-105 shadow-sm'
                  : 'bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 hover:bg-white dark:hover:bg-neutral-750'
                }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {showFilters && (
        <>
          {/* iOS-STYLE SEGMENTED SWITCH (🗺️ Điểm Chụp vs 💬 Bài Viết FB) */}
          <div className="flex items-center p-1 bg-neutral-100/90 dark:bg-neutral-800/90 rounded-xl text-xs font-semibold border border-neutral-200/50 dark:border-neutral-750/50">
            <button
              type="button"
              onClick={() => setSidebarTab('spots')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${sidebarTab === 'spots'
                  ? 'bg-white dark:bg-neutral-900 text-terracotta font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              <MapPin className="w-3.5 h-3.5 text-terracotta" />
              <span>Điểm Chụp ({filteredSpotsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('posts')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${sidebarTab === 'posts'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Bài Viết FB ({filteredPostsCount})</span>
            </button>
          </div>

          {/* Month Quick Slider (T1 - T12) on Mobile */}
          {isMobile && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                  const isSelected = filters.month === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChangeFilters(prev => ({ ...prev, month: prev.month === m ? null : m }))}
                      className={`w-9 h-9 rounded-full text-xs font-mono-spec font-bold shrink-0 flex items-center justify-center transition-all ${isSelected
                          ? 'bg-terracotta text-white shadow-xs scale-105'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                    >
                      T{m}
                    </button>
                  );
                })}
              </div>

              {/* Status Pills */}
              <div className="flex items-center space-x-2 text-xs font-mono-spec">
                <button
                  type="button"
                  onClick={() => onChangeFilters(prev => ({ ...prev, status: 'ALL' }))}
                  className={`px-3 py-1.5 rounded-full ${filters.status === 'ALL'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFilters(prev => ({ ...prev, status: 'PEAK' }))}
                  className={`px-3 py-1.5 rounded-full ${filters.status === 'PEAK'
                      ? 'bg-terracotta text-white font-bold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                >
                  ★ Đang rộ
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFilters(prev => ({ ...prev, onlyNearby: !prev.onlyNearby }))}
                  className={`px-3 py-1.5 rounded-full ${filters.onlyNearby
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                >
                  Gần tôi
                </button>
              </div>
            </div>
          )}

          {/* Mobile Post Tags */}
          {isMobile && sidebarTab === 'posts' && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                {['ALL', 'Cúc họa mi', 'Hoàng hôn', 'Áo dài', 'Vintage'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setPostTagFilter(tag)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono-spec transition-all whitespace-nowrap ${postTagFilter === tag
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                  >
                    {tag === 'ALL' ? 'Tất cả' : `#${tag}`}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onOpenAddPostModal()}
                className="text-[11px] font-mono-spec font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 pl-1"
              >
                + Thêm bài
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};