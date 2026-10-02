import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Bookmark,
  Share2,
  Flag,
  Camera,
  Clock,
  Sparkles,
  MapPin,
  Check,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  PlusCircle,
  MessageSquare,
  Layers
} from 'lucide-react';
import type { Spot, FilterState, ConceptTag } from '../types';
import { REGIONS } from '../data/regions';
import { SpotMap } from './SpotMap';
import { AtmosphericFX } from './AtmosphericFX';
import { FilmSpecsCard } from './FilmSpecsCard';
import { SpotCard } from './SpotCard';
import { LeftNavRail } from './LeftNavRail';
import { PoseCamera } from './PoseCamera';
import { useWeather } from '../hooks/useWeather';
import { getStatusBadgeInfo } from '../utils/season';
import { POSES, type PoseItem } from '../data/poses';

interface GoogleMapsLayoutProps {
  spots: Spot[];
  filteredSpots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot | null) => void;
  savedSpotIds: string[];
  onToggleSave: (spotId: string) => void;
  filters: FilterState;
  onChangeFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  activeRegionId: string;
  onSelectRegion: (regionId: string) => void;
  activeView: 'map' | 'grid' | 'moodboard' | 'film';
  onChangeView: (view: 'map' | 'grid' | 'moodboard' | 'film') => void;
  onOpenSubmitSpotModal: () => void;
  onOpenSavedModal: () => void;
  onOpenReportModal: (spot: Spot) => void;
  onOpenAddPostModal: (spotId?: string) => void;
  uiTheme?: 'modern' | 'editorial';
  onToggleUiTheme?: () => void;
}

const QUICK_CHIPS = [
  { label: '🌸 Cúc họa mi', query: 'cúc họa mi' },
  { label: '🍂 Thu Hà Nội', query: 'Phan Đình Phùng' },
  { label: '🎞️ Kodak Gold 200', filmId: 'kodak-gold-200' },
  { label: '🌙 CineStill 800T', filmId: 'cinestill-800t' },
  { label: '🌿 Fuji 400', filmId: 'fujifilm-400' },
  { label: '🌅 Hoàng hôn', timeOfDay: 'SUNSET' as const },
  { label: '☕ Vintage Film', concept: 'VINTAGE' as ConceptTag },
  { label: '✨ Đang Rộ (Peak)', status: 'PEAK' as const }
];

export const GoogleMapsLayout: React.FC<GoogleMapsLayoutProps> = ({
  spots,
  filteredSpots,
  selectedSpot,
  onSelectSpot,
  savedSpotIds,
  onToggleSave,
  filters,
  onChangeFilters,
  onResetFilters,
  activeRegionId,
  onSelectRegion,
  activeView,
  onChangeView,
  onOpenSubmitSpotModal,
  onOpenSavedModal,
  onOpenReportModal,
  onOpenAddPostModal,
  uiTheme = 'modern',
  onToggleUiTheme
}) => {
  // Desktop sidebar collapse toggle state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sidebar tab state: 'spots' (Địa điểm) | 'posts' (Bài viết Facebook bên cạnh)
  const [sidebarTab, setSidebarTab] = useState<'spots' | 'posts'>('spots');

  // Detail card tab state: 'info' (Cẩm nang) | 'posts' (Bài viết liên quan)
  const [detailTab, setDetailTab] = useState<'info' | 'posts'>('info');

  // Post category filter tag
  const [postTagFilter, setPostTagFilter] = useState<string>('ALL');

  // Mobile drawer snap: 'peek' (110px) | 'half' (48vh) | 'full' (86vh)
  const [mobileSnap, setMobileSnap] = useState<'peek' | 'half' | 'full'>('half');

  // Mobile view switcher dropdown open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick active photo gallery index for detail card
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  // Ghost Pose Camera visibility (map view has its own detail UI, so the
  // camera is mounted here rather than reusing SpotDetailModal).
  const [showPoseCamera, setShowPoseCamera] = useState(false);
  const [selectedPose, setSelectedPose] = useState<PoseItem | null>(null);

  // Find a matching pose for a spot
  const findMatchingPose = (spot: Spot): PoseItem => {
    // First, try to find a pose with matchedSpots containing this spot's name or slug
    const matched = POSES.find(p =>
      p.matchedSpots?.some(s =>
        s.toLowerCase().includes(spot.name.toLowerCase()) ||
        s.toLowerCase().includes(spot.slug.toLowerCase())
      )
    );
    if (matched) return matched;

    // Fallback: use the first female pose as default
    return POSES.find(p => p.category === 'female') || POSES[0];
  };

  const openPoseCamera = (spot: Spot) => {
    setSelectedPose(findMatchingPose(spot));
    setShowPoseCamera(true);
  };

  // Show/hide atmospheric effects toggle
  const [isAtmosphericActive, setIsAtmosphericActive] = useState(true);

  // Real-time weather from Open-Meteo API (Hanoi)
  const weather = useWeather();

  // Collect all crawled Facebook posts across spots with spot reference
  const allPostsWithSpot = useMemo(() => {
    return spots.flatMap(spot =>
      (spot.inspirationPosts || []).map(post => ({
        ...post,
        spot
      }))
    );
  }, [spots]);

  // Filtered posts based on search query & tag filter
  const filteredPosts = useMemo(() => {
    let list = allPostsWithSpot;
    if (postTagFilter !== 'ALL') {
      const tagLower = postTagFilter.toLowerCase();
      list = list.filter(p =>
        p.caption.toLowerCase().includes(tagLower) ||
        (p.fullContent || '').toLowerCase().includes(tagLower) ||
        p.spot.name.toLowerCase().includes(tagLower)
      );
    }
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.authorName.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q) ||
        (p.fullContent || '').toLowerCase().includes(q) ||
        p.spot.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allPostsWithSpot, postTagFilter, filters.searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Google Maps directions launcher
  const handleOpenDirections = (spot: Spot) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Share handler
  const handleShareSpot = async (spot: Spot) => {
    const shareData = {
      title: `${spot.name} — Chụp Gì Bây Giờ`,
      text: `Điểm chụp ${spot.name}: ${spot.seasonalTrend?.trendTitle} (${spot.description})`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast('Đã chia sẻ địa điểm!');
        return;
      } catch (err) {
        // User cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết vào clipboard!');
    } catch {
      showToast('Không thể sao chép liên kết');
    }
  };

  // Quick chip click handler
  const handleChipClick = (chip: typeof QUICK_CHIPS[number]) => {
    if ('filmId' in chip && chip.filmId) {
      onChangeFilters(prev => ({
        ...prev,
        filmId: prev.filmId === chip.filmId ? 'ALL' : chip.filmId
      }));
    } else if (chip.query) {
      onChangeFilters(prev => ({
        ...prev,
        searchQuery: prev.searchQuery === chip.query ? '' : chip.query
      }));
    } else if (chip.timeOfDay) {
      onChangeFilters(prev => ({
        ...prev,
        timeOfDay: prev.timeOfDay === chip.timeOfDay ? 'ALL' : chip.timeOfDay
      }));
    } else if (chip.concept) {
      onChangeFilters(prev => ({
        ...prev,
        concept: prev.concept === chip.concept ? 'ALL' : chip.concept
      }));
    } else if (chip.status) {
      onChangeFilters(prev => ({
        ...prev,
        status: prev.status === chip.status ? 'ALL' : chip.status
      }));
    }
  };

  const isChipActive = (chip: typeof QUICK_CHIPS[number]) => {
    if ('filmId' in chip && chip.filmId) return filters.filmId === chip.filmId;
    if (chip.query) return filters.searchQuery === chip.query;
    if (chip.timeOfDay) return filters.timeOfDay === chip.timeOfDay;
    if (chip.concept) return filters.concept === chip.concept;
    if (chip.status) return filters.status === chip.status;
    return false;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950 font-sans select-none">

      {/* ========================================================================= */}
      {/* 1. LAYER 1: VERTICAL NAVIGATION RAIL (76px - LEFT MOST) */}
      {/* ========================================================================= */}
      <div className="hidden lg:block">
        <LeftNavRail
          activeView={activeView}
          onChangeView={onChangeView}
          savedCount={savedSpotIds.length}
          onOpenSavedModal={onOpenSavedModal}
          onOpenSubmitSpotModal={onOpenSubmitSpotModal}
          weather={weather}
          isAtmosphericActive={isAtmosphericActive}
          onToggleAtmospheric={() => setIsAtmosphericActive(prev => !prev)}
          activeRegionId={activeRegionId}
          onSelectRegion={onSelectRegion}
          uiTheme={uiTheme}
          onToggleUiTheme={onToggleUiTheme}
          onSelectFilmFilter={() => onChangeFilters(prev => ({ ...prev, filmId: prev.filmId === 'kodak-gold-200' ? 'ALL' : 'kodak-gold-200' }))}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. LAYER 2: MAP CANVAS (Occupies viewport starting from 76px nav rail) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 lg:pl-[76px]">
        <SpotMap
          spots={filteredSpots}
          selectedSpot={selectedSpot}
          onSelectSpot={(spot) => {
            onSelectSpot(spot);
            setActivePhotoIdx(0);
            setDetailTab('info');
          }}
          activeRegionId={activeRegionId}
          userCoords={null}
        />
      </div>

      {/* ATMOSPHERIC WEATHER FX CANVAS (z-5: above map, below UI overlays) */}
      <AtmosphericFX
        effect={weather.effect}
        season={weather.season}
        timeOfDay={weather.timeOfDay}
        particleDensity={weather.particleDensity}
        overlayOpacity={weather.overlayOpacity}
        colorTemperature={weather.colorTemperature}
        windSpeed={weather.windSpeed}
        isActive={isAtmosphericActive}
      />

      {/* Toast Feedback Notification Pill */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 text-white border border-neutral-700/80 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md text-xs font-mono-spec flex items-center space-x-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MOBILE TOP FLOATING SEARCH & FILTER HEADER (< lg) */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed top-2.5 inset-x-2.5 z-30 flex flex-col gap-2 pointer-events-none">

        {/* Mobile Search Row + Action Pills */}
        <div className="flex items-center gap-2 pointer-events-auto">

          {/* Search Box Pill */}
          <div className="flex-1 h-12 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rounded-full shadow-lg px-4 flex items-center justify-between transition-all focus-within:ring-2 focus-within:ring-terracotta/40">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onChangeFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Tìm điểm chụp, cúc họa mi..."
                className="w-full bg-transparent text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
              />
            </div>

            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onChangeFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Region Switcher Pill (Compact for Mobile) */}
          <div className="h-12 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rounded-full shadow-lg px-3 flex items-center space-x-1.5 shrink-0">
            <MapPin className="w-4 h-4 text-terracotta shrink-0" />
            <select
              value={activeRegionId}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer max-w-[70px] truncate"
            >
              {REGIONS.map(reg => (
                <option key={reg.id} value={reg.id} className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Menu / View Toggle Pill */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="h-12 w-12 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rounded-full shadow-lg flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:text-terracotta transition-colors"
              title="Menu chế độ xem"
            >
              <Layers className="w-5 h-5" />
            </button>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute right-0 top-12 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-2 space-y-1 text-xs font-medium z-50 pointer-events-auto"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChangeView('map');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between ${activeView === 'map' ? 'bg-terracotta text-white font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                  >
                    <span>🗺️ Bản Đồ Check-in</span>
                    {activeView === 'map' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeView('grid');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between ${activeView === 'grid' ? 'bg-terracotta text-white font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                  >
                    <span>📖 Tạp Chí ẢNH</span>
                    {activeView === 'grid' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeView('moodboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between ${activeView === 'moodboard' ? 'bg-terracotta text-white font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                  >
                    <span>🎨 Moodboard Màu Film</span>
                    {activeView === 'moodboard' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeView('film');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between ${activeView === 'film' ? 'bg-terracotta text-white font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                  >
                    <span>🎞️ Màu Film</span>
                    {activeView === 'film' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSavedModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <span className="flex items-center">
                        <Bookmark className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
                        <span>Đã lưu</span>
                      </span>
                      {savedSpotIds.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-terracotta text-white rounded-full text-[10px] font-mono-spec">
                          {savedSpotIds.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenSubmitSpotModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-terracotta"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                      <span>+ Đóng góp điểm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAtmosphericActive(prev => !prev)}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                      <span>Hiệu ứng thời tiết</span>
                      <span>{isAtmosphericActive ? 'Bật' : 'Tắt'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Filter Chips (Mobile horizontal scroll) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
          {QUICK_CHIPS.map((chip, idx) => {
            const active = isChipActive(chip);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm backdrop-blur-md transition-all shrink-0 ${active
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold scale-105'
                    : 'bg-white/90 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800 hover:bg-white'
                  }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING RE-OPEN BUTTON (Attached right next to Nav Rail when panel collapsed) */}
      {/* ========================================================================= */}
      {isSidebarCollapsed && (
        <div className="hidden lg:flex fixed top-1/2 left-[76px] -translate-y-1/2 z-40 items-center pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-7 h-16 bg-white dark:bg-neutral-900 border-y border-r border-neutral-200 dark:border-neutral-800 rounded-r-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:w-8 text-neutral-600 dark:text-neutral-300 transition-all group"
            title="Mở lại danh sách địa điểm"
          >
            <ChevronRight className="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className="ml-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rounded-full shadow-lg px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100 hover:scale-105 hover:border-terracotta transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <span>Danh sách điểm ({filteredSpots.length})</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LAYER 3: CONTENT PANEL SIDEBAR (w-[420px] NEXT TO NAV RAIL AT left-[76px]) */}
      {/* ========================================================================= */}
      <div
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-[76px] z-30 w-[420px] max-w-[calc(100vw-76px)] bg-white/95 dark:bg-neutral-900/95 border-r border-neutral-200/80 dark:border-neutral-800 shadow-2xl backdrop-blur-md overflow-hidden transition-transform duration-300 ease-out ${isSidebarCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0'
          }`}
      >
        {/* Collapse Toggle Floating Tab Button [‹] */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(true)}
          className="absolute -right-7 top-1/2 -translate-y-1/2 w-7 h-16 bg-white dark:bg-neutral-900 border-y border-r border-neutral-200 dark:border-neutral-800 rounded-r-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:w-8 text-neutral-600 dark:text-neutral-300 z-50 transition-all pointer-events-auto group"
          title="Thu gọn danh sách"
        >
          <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* ─── STICKY HEADER (EXACTLY 2 CLEAN FILTER ROWS + iOS SEGMENTED SWITCH) ─── */}
        <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0 space-y-2.5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm">

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

          {/* ROW 2: SINGLE SCROLLABLE CHIP ROW ([🔥 Đang rộ] [📍 Gần tôi] [🌸 Cúc họa mi]...) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_CHIPS.map((chip, idx) => {
              const active = isChipActive(chip);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
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
              <span>Điểm Chụp ({filteredSpots.length})</span>
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
              <span>Bài Viết FB ({filteredPosts.length})</span>
            </button>
          </div>
        </div>

        {/* ─── SCROLLABLE FEED BODY (Large Visual Spot Cards or Facebook Posts) ─── */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {sidebarTab === 'spots' ? (
            /* TAB 1: LARGE VISUAL SPOTS LIST */
            filteredSpots.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-neutral-500">
                <Sparkles className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="font-editorial text-base">Không tìm thấy địa điểm phù hợp</p>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs font-mono-spec font-bold text-terracotta hover:underline"
                >
                  Xóa bộ lọc để xem lại
                </button>
              </div>
            ) : (
              filteredSpots.map(spot => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  isSaved={savedSpotIds.includes(spot.id)}
                  onToggleSave={onToggleSave}
                  onSelectSpot={(s) => {
                    onSelectSpot(s);
                    setActivePhotoIdx(0);
                    setDetailTab('info');
                  }}
                  className={selectedSpot?.id === spot.id ? 'ring-2 ring-terracotta' : ''}
                />
              ))
            )
          ) : (
            /* TAB 2: REAL FACEBOOK COMMUNITY POSTS FEED */
            filteredPosts.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-neutral-500">
                <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="font-editorial text-base">Chưa có bài viết nào phù hợp</p>
                <button
                  type="button"
                  onClick={() => {
                    setPostTagFilter('ALL');
                    onChangeFilters(prev => ({ ...prev, searchQuery: '' }));
                  }}
                  className="text-xs font-mono-spec font-bold text-blue-600 hover:underline"
                >
                  Xem lại tất cả bài viết
                </button>
              </div>
            ) : (
              filteredPosts.map(post => (
                <div
                  key={post.id}
                  className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-850/80 hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all space-y-2.5 shadow-xs"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center space-x-1">
                          <span>{post.authorName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-mono-spec font-semibold">
                            Aphoto
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono-spec">
                          {post.postDate}
                        </div>
                      </div>
                    </div>

                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Mở bài viết gốc trên Facebook"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Caption & Post Content */}
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-3 leading-relaxed font-sans">
                    {post.fullContent || post.caption}
                  </p>

                  {/* Photo Preview Strip */}
                  {post.galleryUrls && post.galleryUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
                      {post.galleryUrls.slice(0, 3).map((img, imgIdx) => (
                        <div key={imgIdx} className="relative aspect-4/3 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          {imgIdx === 2 && (post.galleryUrls || []).length > 3 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-mono-spec font-bold">
                              +{(post.galleryUrls || []).length - 3}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Camera Settings Snippet */}
                  {post.cameraSettings && (
                    <div className="text-[10px] font-mono-spec text-neutral-500 dark:text-neutral-400 flex items-center space-x-1 truncate bg-neutral-50 dark:bg-neutral-800/60 px-2 py-1 rounded">
                      <Camera className="w-3 h-3 text-terracotta shrink-0" />
                      <span className="truncate">{post.cameraSettings}</span>
                    </div>
                  )}

                  {/* Spot Badge & Focus Map Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-[200px] flex items-center">
                      <MapPin className="w-3 h-3 text-terracotta mr-1 shrink-0" />
                      <span className="truncate">{post.spot.name}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectSpot(post.spot);
                        setActivePhotoIdx(0);
                        setDetailTab('posts');
                      }}
                      className="text-xs font-semibold text-terracotta hover:underline flex items-center space-x-1"
                    >
                      <span>Xem trên bản đồ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DETAIL CARD (DESKTOP): Slides out beside the sidebar */}
      {/* (w-[390px] fixed top-3 bottom-3 left-[436px]) with Tabs for Info vs Posts! */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedSpot && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`hidden lg:flex flex-col fixed top-3 bottom-3 z-30 w-[390px] max-w-[calc(100vw-450px)] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md overflow-hidden transition-all duration-300 ease-out ${isSidebarCollapsed ? 'left-3' : 'left-[436px]'
              }`}
          >
            {/* Cover Photo Gallery Banner */}
            <div className="relative h-52 bg-neutral-900 shrink-0">
              <img
                src={selectedSpot.galleryUrls?.[activePhotoIdx] || selectedSpot.coverImageUrl}
                alt={selectedSpot.name}
                className="w-full h-full object-cover"
              />

              {/* Dismiss Button ✕ */}
              <button
                type="button"
                onClick={() => onSelectSpot(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md z-10"
                title="Đóng chi tiết"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Status Badge */}
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-terracotta text-white font-mono-spec text-[10px] font-bold shadow-md uppercase tracking-wider">
                {selectedSpot.seasonalTrend?.status === 'PEAK' ? 'ĐANG RỘ (PEAK)' : (selectedSpot.seasonalTrend?.status || 'PEAK')}
              </span>

              {/* Ghost Pose Camera launcher */}
              <button
                type="button"
                onClick={() => openPoseCamera(selectedSpot)}
                aria-label="Mở camera hướng dẫn tạo dáng"
                title="Camera hướng dẫn tạo dáng"
                className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amberFilm text-neutral-900 shadow-md hover:bg-neutral-900 hover:text-amberFilm transition-colors"
              >
                <Camera className="w-3.5 h-3.5" strokeWidth={2.4} />
                <span className="font-mono-spec text-[10px] font-bold uppercase tracking-wider">Dáng chụp</span>
              </button>

              {/* Gallery Thumbnails Strip */}
              {selectedSpot.galleryUrls && selectedSpot.galleryUrls.length > 1 && (
                <div className="absolute bottom-2 inset-x-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
                  {selectedSpot.galleryUrls.map((photo: string, pIdx: number) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setActivePhotoIdx(pIdx)}
                      className={`relative w-9 h-9 rounded-md overflow-hidden border-2 shrink-0 transition-transform ${activePhotoIdx === pIdx ? 'border-terracotta scale-105' : 'border-white/60 opacity-80'
                        }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DETAIL CARD NAVBAR TABS: Cẩm nang vs Bài viết liên quan */}
            <div className="p-3 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono-spec font-bold text-terracotta uppercase block truncate">
                    {selectedSpot.seasonalTrend?.trendTitle}
                  </span>
                  <h2 className="font-editorial text-xl font-extrabold text-neutral-900 dark:text-white truncate">
                    {selectedSpot.name}
                  </h2>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleSave(selectedSpot.id)}
                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:text-terracotta text-neutral-600 dark:text-neutral-300"
                    title={savedSpotIds.includes(selectedSpot.id) ? 'Đã lưu' : 'Lưu'}
                  >
                    <Bookmark className={`w-4 h-4 ${savedSpotIds.includes(selectedSpot.id) ? 'text-terracotta fill-terracotta' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDirections(selectedSpot)}
                    className="p-1.5 rounded-lg bg-terracotta text-white hover:bg-terracotta-dark"
                    title="Chỉ đường Google Maps"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-navbar inside detail card */}
              <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDetailTab('info')}
                  className={`flex-1 py-1 rounded-md transition-all ${detailTab === 'info'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  Cẩm Nang & Góc Chụp
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('posts')}
                  className={`flex-1 py-1 rounded-md transition-all flex items-center justify-center space-x-1 ${detailTab === 'posts'
                      ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <span>Bài Đăng FB</span>
                  <span className="text-[10px] px-1 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded font-mono-spec">
                    {selectedSpot.inspirationPosts?.length || 0}
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Detail Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {detailTab === 'info' ? (
                <>
                  {/* Quick Action Row */}
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleOpenDirections(selectedSpot)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
                    >
                      <Navigation className="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold mt-1">Chỉ đường</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareSpot(selectedSpot)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
                    >
                      <Share2 className="w-4 h-4 text-neutral-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold mt-1">Chia sẻ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenReportModal(selectedSpot)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
                    >
                      <Flag className="w-4 h-4 text-amberFilm group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold mt-1">Báo nở</span>
                    </button>
                  </div>

                  {/* Bloom Condition Summary */}
                  <div className="bg-amber-50/70 dark:bg-neutral-800/70 border border-amber-200/60 dark:border-neutral-700/60 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono-spec">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        TÌNH TRẠNG HOA / PHONG CẢNH
                      </span>
                      <span className="font-bold text-terracotta">
                        {selectedSpot.seasonalTrend?.bloomPercentage || 85}% ĐANG NỞ
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-terracotta h-full transition-all duration-500"
                        style={{ width: `${selectedSpot.seasonalTrend?.bloomPercentage || 85}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed pt-1">
                      {selectedSpot.description}
                    </p>
                  </div>

                  {/* FILM PHOTOGRAPHY ADVISOR SPEC CARD */}
                  <FilmSpecsCard
                    spot={selectedSpot}
                    onSelectFilmFilter={(filmId) => onChangeFilters(prev => ({ ...prev, filmId }))}
                  />

                  {/* PHOTOGRAPHY TIPS (Ống kính, Giờ vàng, Concept) */}
                  <div className="space-y-3 pt-1">
                    <h3 className="font-mono-spec text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center">
                      <Camera className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
                      CẨM NANG NHIẾP ẢNH & THIẾT BỊ
                    </h3>

                    {/* Golden Hour / Best Time */}
                    <div className="flex items-start space-x-2.5 text-xs">
                      <Clock className="w-4 h-4 text-amberFilm shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Khung giờ đẹp: </span>
                        <span className="text-neutral-600 dark:text-neutral-400">{selectedSpot.bestTimeDescription}</span>
                      </div>
                    </div>

                    {/* Recommended Lenses */}
                    <div className="flex items-start space-x-2.5 text-xs">
                      <Camera className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Ống kính khuyên dùng: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSpot.recommendedLenses.map((lens, lIdx) => (
                            <span key={lIdx} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md font-mono-spec text-[10px] text-neutral-700 dark:text-neutral-300">
                              {lens}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Concept & Outfits */}
                    <div className="flex items-start space-x-2.5 text-xs">
                      <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Concept & Trang phục: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSpot.seasonalTrend?.conceptTags.map((tag, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-md text-[10px]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* DETAIL TAB: REAL POSTS SPECIFICALLY FOR THIS SPOT */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-spec font-bold text-blue-600 dark:text-blue-400">
                      BÀI ĐĂNG THỰC TẾ ({selectedSpot.inspirationPosts?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenAddPostModal(selectedSpot.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-mono-spec font-bold hover:underline"
                    >
                      + Thêm bài viết
                    </button>
                  </div>

                  {(!selectedSpot.inspirationPosts || selectedSpot.inspirationPosts.length === 0) ? (
                    <div className="py-8 text-center text-neutral-400 text-xs">
                      Chưa có bài viết nào cho điểm chụp này. Hãy là người đầu tiên chia sẻ!
                    </div>
                  ) : (
                    selectedSpot.inspirationPosts.map(post => (
                      <div
                        key={post.id}
                        className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-850/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                {post.authorName}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono-spec">
                                {post.postDate}
                              </div>
                            </div>
                          </div>

                          <a
                            href={post.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-blue-600 p-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
                          {post.fullContent || post.caption}
                        </p>

                        {post.cameraSettings && (
                          <div className="text-[10px] font-mono-spec text-neutral-500 bg-white dark:bg-neutral-800 px-2 py-1 rounded">
                            📷 {post.cameraSettings}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. RESPONSIVE MOBILE ADAPTATIONS: Bottom Sheet Drawer (3 Snaps) */}
      {/* Includes Full Search Tabs: 'Điểm Chụp' + 'Bài Viết FB' + Month Slider! */}
      {/* ========================================================================= */}
      <motion.div
        animate={{
          height: mobileSnap === 'peek' ? '110px' : mobileSnap === 'half' ? '48vh' : '86vh'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800 rounded-t-3xl shadow-2xl flex flex-col will-change-transform pb-safe"
      >
        {/* Grab Handle Header */}
        <div
          onClick={() => {
            if (mobileSnap === 'peek') setMobileSnap('half');
            else if (mobileSnap === 'half') setMobileSnap('full');
            else setMobileSnap('peek');
          }}
          className="cursor-pointer py-3 px-4 flex flex-col items-center border-b border-neutral-100 dark:border-neutral-800 shrink-0 select-none"
        >
          <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mb-3" />

          <div className="w-full flex items-center justify-between font-mono-spec">

            {/* Mobile Tab Pill Switcher */}
            <div className="flex flex-1 items-center space-x-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mr-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarTab('spots');
                  if (mobileSnap === 'peek') setMobileSnap('half');
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${sidebarTab === 'spots'
                    ? 'bg-white dark:bg-neutral-900 text-terracotta shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                📍 Điểm chụp ({filteredSpots.length})
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarTab('posts');
                  if (mobileSnap === 'peek') setMobileSnap('half');
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${sidebarTab === 'posts'
                    ? 'bg-white dark:bg-neutral-900 text-blue-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                📸 Bài viết FB ({filteredPosts.length})
              </button>
            </div>

            {/* Snap Toggle Indicator */}
            <div className="flex items-center space-x-1 text-neutral-400 pl-2 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
                {mobileSnap === 'peek' ? 'Kéo lên' : mobileSnap === 'half' ? 'Nửa màn' : 'Thu gọn'}
              </span>
              {mobileSnap !== 'full' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Filters conditional on Tab (visible in half / full snaps) */}
        {mobileSnap !== 'peek' && (
          <div className="px-3 pt-2 pb-1.5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
            {sidebarTab === 'spots' ? (
              <div className="space-y-1.5">
                {/* Month Quick Slider (T1 - T12) on Mobile */}
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
                <div className="flex items-center space-x-2 text-xs font-mono-spec mt-2 pb-1">
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
            ) : (
              /* Mobile Post Tags */
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
          </div>
        )}

        {/* Mobile Feed Spots or Posts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sidebarTab === 'spots' ? (
            filteredSpots.map(spot => {
              const isSelected = selectedSpot?.id === spot.id;
              const statusInfo = getStatusBadgeInfo(spot.seasonalTrend?.status || 'PEAK', spot.seasonalTrend?.daysLeftInPeak || 0);

              return (
                <div
                  key={spot.id}
                  onClick={() => {
                    onSelectSpot(spot);
                    setActivePhotoIdx(0);
                  }}
                  className={`p-3.5 rounded-xl border flex space-x-3 transition-colors cursor-pointer ${isSelected
                      ? 'bg-amber-50 dark:bg-neutral-800 border-terracotta shadow-md ring-1 ring-terracotta/40'
                      : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                >
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                    <img
                      src={spot.coverImageUrl}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className={`absolute top-0.5 left-0.5 text-[8px] font-mono-spec font-bold px-1 py-0.2 rounded ${statusInfo.classNames}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="text-[10px] font-mono-spec text-terracotta uppercase font-bold truncate">
                        {spot.seasonalTrend?.trendTitle}
                      </div>
                      <h4 className="font-editorial text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {spot.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {spot.address}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono-spec text-neutral-400 pt-1">
                      <span>{spot.distanceKm ? `${spot.distanceKm} km` : 'Hà Nội'}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(spot.id);
                        }}
                        className="p-1 hover:text-terracotta"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${savedSpotIds.includes(spot.id) ? 'text-terracotta fill-terracotta' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            filteredPosts.map(post => (
              <div
                key={post.id}
                onClick={() => {
                  onSelectSpot(post.spot);
                  setActivePhotoIdx(0);
                  setMobileSnap('peek');
                }}
                className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-850 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {post.authorName}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono-spec">
                        {post.postDate}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-mono-spec">
                    Aphoto
                  </span>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                  {post.fullContent || post.caption}
                </p>

                {post.galleryUrls && post.galleryUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                    {post.galleryUrls.slice(0, 3).map((img, i) => (
                      <div key={i} className="aspect-4/3 bg-neutral-200 overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
                  <span className="text-neutral-600 dark:text-neutral-400 font-medium truncate flex items-center">
                    <MapPin className="w-3 h-3 text-terracotta mr-1 shrink-0" />
                    <span className="truncate">{post.spot.name}</span>
                  </span>

                  <span className="text-terracotta font-bold shrink-0">
                    Xem vị trí →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 6. MOBILE SPOT DETAIL SHEET (< lg) */}
      {/* When a spot is selected on mobile, full-featured bottom sheet slides up! */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedSpot && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 rounded-t-3xl shadow-2xl max-h-[84vh] flex flex-col overflow-hidden pb-safe"
          >
            {/* Mobile Detail Drag Handle & Dismiss Header */}
            <div className="relative pt-2 pb-1 flex flex-col items-center shrink-0 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mb-1" />

              <div className="w-full px-4 py-1 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono-spec font-bold text-terracotta uppercase block truncate">
                    {selectedSpot.seasonalTrend?.trendTitle}
                  </span>
                  <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-white truncate">
                    {selectedSpot.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openPoseCamera(selectedSpot)}
                    aria-label="Mở camera hướng dẫn tạo dáng"
                    title="Camera hướng dẫn tạo dáng"
                    className="h-8 px-2.5 rounded-full bg-amberFilm text-neutral-900 hover:bg-neutral-900 hover:text-amberFilm flex items-center gap-1 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" strokeWidth={2.4} />
                    <span className="font-mono-spec text-[10px] font-bold uppercase tracking-wider">Dáng chụp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSpot(null)}
                    className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Detail Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Cover Photo */}
              <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-900 shrink-0 shadow-md">
                <img
                  src={selectedSpot.galleryUrls?.[activePhotoIdx] || selectedSpot.coverImageUrl}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover"
                />

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-terracotta text-white font-mono-spec text-[10px] font-bold shadow-md">
                  {selectedSpot.seasonalTrend?.status === 'PEAK' ? 'ĐANG RỘ (PEAK)' : (selectedSpot.seasonalTrend?.status || 'PEAK')}
                </span>

                {/* Thumbnails */}
                {selectedSpot.galleryUrls && selectedSpot.galleryUrls.length > 1 && (
                  <div className="absolute bottom-2 inset-x-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {selectedSpot.galleryUrls.map((photo, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setActivePhotoIdx(pIdx)}
                        className={`w-9 h-9 rounded-md overflow-hidden border-2 shrink-0 ${activePhotoIdx === pIdx ? 'border-terracotta scale-105' : 'border-white/60 opacity-80'
                          }`}
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDirections(selectedSpot)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-terracotta text-white shadow-sm"
                >
                  <Navigation className="w-4 h-4" />
                  <span className="text-[11px] font-bold mt-1">Chỉ đường</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleSave(selectedSpot.id)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  <Bookmark className={`w-4 h-4 ${savedSpotIds.includes(selectedSpot.id) ? 'text-terracotta fill-terracotta' : ''}`} />
                  <span className="text-[11px] font-semibold mt-1">
                    {savedSpotIds.includes(selectedSpot.id) ? 'Đã lưu' : 'Lưu'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareSpot(selectedSpot)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-[11px] font-semibold mt-1">Chia sẻ</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenReportModal(selectedSpot)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  <Flag className="w-4 h-4 text-amberFilm" />
                  <span className="text-[11px] font-semibold mt-1">Báo nở</span>
                </button>
              </div>

              {/* Condition Progress Bar */}
              <div className="bg-amber-50/70 dark:bg-neutral-800/70 border border-amber-200/60 dark:border-neutral-700/60 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-spec">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    TÌNH TRẠNG HOA / PHONG CẢNH
                  </span>
                  <span className="font-bold text-terracotta">
                    {selectedSpot.seasonalTrend?.bloomPercentage || 85}% ĐANG NỞ
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-terracotta h-full transition-all duration-500"
                    style={{ width: `${selectedSpot.seasonalTrend?.bloomPercentage || 85}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed pt-1">
                  {selectedSpot.description}
                </p>
              </div>

              {/* Photography Guide */}
              <div className="space-y-3 pt-1">
                <h4 className="font-mono-spec text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center">
                  <Camera className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
                  CẨM NANG CHỤP ẢNH & THIẾT BỊ
                </h4>

                <div className="flex items-start space-x-2 text-xs">
                  <Clock className="w-4 h-4 text-amberFilm shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">Khung giờ đẹp: </span>
                    <span className="text-neutral-600 dark:text-neutral-400">{selectedSpot.bestTimeDescription}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <Camera className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">Ống kính khuyên dùng: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSpot.recommendedLenses.map((lens, lIdx) => (
                        <span key={lIdx} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono-spec text-[10px]">
                          {lens}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">Concept & Trang phục: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSpot.seasonalTrend?.conceptTags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 rounded text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Facebook Posts */}
              {selectedSpot.inspirationPosts && selectedSpot.inspirationPosts.length > 0 && (
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono-spec">
                    <span className="font-bold text-blue-600">
                      BÀI ĐĂNG FACEBOOK APHOTO ({selectedSpot.inspirationPosts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenAddPostModal(selectedSpot.id)}
                      className="text-blue-600 hover:underline"
                    >
                      + Thêm bài
                    </button>
                  </div>

                  {selectedSpot.inspirationPosts.map(post => (
                    <div key={post.id} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-850 space-y-2 border border-neutral-200/70 dark:border-neutral-800">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <img src={post.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-bold">{post.authorName}</span>
                        </div>
                        <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {post.fullContent || post.caption}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ghost Pose Camera — z-[100] sits above the detail panels (z-30/z-50) */}
      {showPoseCamera && selectedPose && (
        <PoseCamera
          pose={selectedPose}
          onClose={() => { setShowPoseCamera(false); setSelectedPose(null); }}
        />
      )}

    </div>
  );
};
