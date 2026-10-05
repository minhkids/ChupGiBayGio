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
  Layers
} from 'lucide-react';
import type { Spot, FilterState, ConceptTag } from '../types';
import { REGIONS } from '../data/regions';
import { SpotMap } from './SpotMap';
import { AtmosphericFX } from './AtmosphericFX';
import { FilmSpecsCard } from './FilmSpecsCard';
import { LeftNavRail } from './LeftNavRail';
import { PoseCamera } from './PoseCamera';
import { useWeather } from '../hooks/useWeather';
import { getLocalInsights } from '../data/localInsights';
import { LocalInsightFeed } from './LocalInsightFeed';
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
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number; address?: string } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
}

const QUICK_CHIPS = [
  { label: '🍂 Thu Hà Nội', query: 'Phan Đình Phùng' },
  { label: '🎞️ Kodak Gold 200', filmId: 'kodak-gold-200' },
  { label: '🌙 CineStill 800T', filmId: 'cinestill-800t' },
  { label: '🌿 Fuji 400', filmId: 'fujifilm-400' },
  { label: '🌅 Hoàng hôn', timeOfDay: 'SUNSET' as const },
  { label: '☕ Vintage Film', concept: 'VINTAGE' as ConceptTag },
  { label: '✨ Đang Rộ (Peak)', status: 'PEAK' as const }
];

export const GoogleMapsLayout: React.FC<GoogleMapsLayoutProps> = ({
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
  onToggleUiTheme,
  isPickingLocation = false,
  pickedLocation = null,
  onPickLocation
}) => {
  // Desktop sidebar collapse toggle state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sidebar tab state: 'spots' (Địa điểm) | 'posts' (Bài viết Facebook bên cạnh)
  const [sidebarTab, setSidebarTab] = useState<'outfit' | 'camera' | 'film'>('outfit');

  // Detail card tab state: 'info' (Cẩm nang) | 'posts' (Bài viết liên quan)
  const [detailTab, setDetailTab] = useState<'info' | 'posts'>('info');

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
  void openPoseCamera;

  // Show/hide atmospheric effects toggle
  const [isAtmosphericActive, setIsAtmosphericActive] = useState(true);

  // Real-time weather from Open-Meteo API (Hanoi)
  const weather = useWeather();

  // Ưu đãi & xu hướng theo khu vực / spot đang chọn (thay cho tab bài viết FB)
  // Dữ liệu theo 3 tab chuyên môn nhiếp ảnh
  const outfitInsights = useMemo(
    () => getLocalInsights({
      regionId: activeRegionId,
      category: ['OUTFIT', 'PROP'],
      searchQuery: filters.searchQuery,
      selectedSpot,
    }),
    [activeRegionId, filters.searchQuery, selectedSpot]
  );

  const cameraInsights = useMemo(
    () => getLocalInsights({
      regionId: activeRegionId,
      category: ['RENTAL'],
      searchQuery: filters.searchQuery,
      selectedSpot,
    }),
    [activeRegionId, filters.searchQuery, selectedSpot]
  );

  const filmInsights = useMemo(
    () => getLocalInsights({
      regionId: activeRegionId,
      category: ['FILM', 'LAB'],
      searchQuery: filters.searchQuery,
      selectedSpot,
    }),
    [activeRegionId, filters.searchQuery, selectedSpot]
  );

  const currentInsights = useMemo(() => {
    switch (sidebarTab) {
      case 'outfit':
        return outfitInsights;
      case 'camera':
        return cameraInsights;
      case 'film':
        return filmInsights;
      default:
        return outfitInsights;
    }
  }, [sidebarTab, outfitInsights, cameraInsights, filmInsights]);

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
          isPickingLocation={isPickingLocation}
          pickedLocation={pickedLocation}
          onPickLocation={onPickLocation}
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
        <div className="hidden lg:flex fixed top-1/2 left-[76px] -translate-y-1/2 z-[var(--z-rail)] items-center pointer-events-auto">
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
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-[76px] z-30 w-[440px] max-w-[calc(100vw-76px)] bg-white/95 dark:bg-neutral-900/95 border-r border-neutral-200/80 dark:border-neutral-800 shadow-2xl backdrop-blur-md overflow-hidden transition-transform duration-300 ease-out ${isSidebarCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0'
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
        <div className="px-5 py-4 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0 space-y-3.5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm">

          {/* ROW 1: Search Bar + Clear/Reset Actions */}
          <div className="h-12 w-full rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/80 px-4 flex items-center justify-between transition-all focus-within:ring-2 focus-within:ring-terracotta/40 focus-within:bg-white dark:focus-within:bg-neutral-850">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onChangeFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder={
                  sidebarTab === 'outfit'
                    ? 'Tìm trang phục, áo dài, tiệm thuê đồ...'
                    : sidebarTab === 'camera'
                    ? 'Tìm máy ảnh, ống kính 85mm, tiệm thuê...'
                    : 'Tìm cuộn film, lab tráng scan...'
                }
                className="w-full bg-transparent text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none font-medium"
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
                className="text-xs font-mono-spec font-bold px-3 py-1 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title="Đặt lại bộ lọc"
              >
                Reset
              </button>
            </div>
          </div>

          {/* ROW 2: SINGLE SCROLLABLE CHIP ROW ([🔥 Đang rộ] [📍 Gần tôi] [🌸 Cúc họa mi]...) */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {QUICK_CHIPS.map((chip, idx) => {
              const active = isChipActive(chip);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-xs transition-all shrink-0 ${active
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold scale-105 shadow-sm'
                      : 'bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 hover:bg-white dark:hover:bg-neutral-750'
                    }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* 3 PHOTOGRAPHY TABS: 👗 Quần áo | 📷 Thuê máy ảnh | 🎞️ Mua film */}
          <div className="grid grid-cols-3 p-1 bg-neutral-100/90 dark:bg-neutral-800/90 rounded-xl text-xs font-semibold border border-neutral-200/50 dark:border-neutral-750/50 gap-1">
            <button
              type="button"
              onClick={() => setSidebarTab('outfit')}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg transition-all text-center ${sidebarTab === 'outfit'
                  ? 'bg-white dark:bg-neutral-900 text-terracotta font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              <span className="truncate">👗 Quần áo ({outfitInsights.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('camera')}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg transition-all text-center ${sidebarTab === 'camera'
                  ? 'bg-white dark:bg-neutral-900 text-terracotta font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              <span className="truncate">📷 Thuê máy ({cameraInsights.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('film')}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg transition-all text-center ${sidebarTab === 'film'
                  ? 'bg-white dark:bg-neutral-900 text-terracotta font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              <span className="truncate">🎞️ Mua film ({filmInsights.length})</span>
            </button>
          </div>
        </div>

        {/* ─── SCROLLABLE FEED BODY (Quần áo / Thuê máy ảnh / Mua film) ─── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <LocalInsightFeed
            insights={currentInsights}
            onResetFilters={() => {
              onChangeFilters(prev => ({ ...prev, searchQuery: '' }));
            }}
          />
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
            className={`hidden lg:flex flex-col fixed top-3 bottom-3 z-30 w-[420px] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md overflow-hidden transition-all duration-300 ease-out ${isSidebarCollapsed ? 'left-[96px] max-w-[calc(100vw-112px)]' : 'left-[560px] max-w-[calc(100vw-576px)]'
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
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-terracotta text-white font-mono-spec text-xs font-bold shadow-md uppercase tracking-wider">
                {selectedSpot.seasonalTrend?.status === 'PEAK' ? 'ĐANG RỘ (PEAK)' : (selectedSpot.seasonalTrend?.status || 'PEAK')}
              </span>

              {/* Ghost Pose Camera launcher (temporarily disabled)
              <button
                type="button"
                onClick={() => openPoseCamera(selectedSpot)}
                aria-label="Mở camera hướng dẫn tạo dáng"
                title="Camera hướng dẫn tạo dáng"
                className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amberFilm text-neutral-900 shadow-md hover:bg-neutral-900 hover:text-amberFilm transition-colors"
              >
                <Camera className="w-3.5 h-3.5" strokeWidth={2.4} />
                <span className="font-mono-spec text-xs font-bold uppercase tracking-wider">Dáng chụp</span>
              </button>
              */}

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
            <div className="px-5 pt-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-mono-spec font-bold text-terracotta uppercase tracking-wide block truncate">
                    {selectedSpot.seasonalTrend?.trendTitle}
                  </span>
                  <h2 className="font-editorial text-2xl font-extrabold leading-tight text-neutral-900 dark:text-white line-clamp-2 mt-1">
                    {selectedSpot.name}
                  </h2>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleSave(selectedSpot.id)}
                    className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:text-terracotta text-neutral-600 dark:text-neutral-300"
                    title={savedSpotIds.includes(selectedSpot.id) ? 'Đã lưu' : 'Lưu'}
                  >
                    <Bookmark className={`w-4 h-4 ${savedSpotIds.includes(selectedSpot.id) ? 'text-terracotta fill-terracotta' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDirections(selectedSpot)}
                    className="p-2 rounded-lg bg-terracotta text-white hover:bg-terracotta-dark"
                    title="Chỉ đường Google Maps"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-navbar inside detail card */}
              <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setDetailTab('info')}
                  className={`flex-1 py-1.5 rounded-md transition-all ${detailTab === 'info'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  Cẩm Nang & Góc Chụp
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('posts')}
                  className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center space-x-1 ${detailTab === 'posts'
                      ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <span>Bài Đăng FB</span>
                  <span className="text-xs px-1.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded font-mono-spec">
                    {selectedSpot.inspirationPosts?.length || 0}
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Detail Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {detailTab === 'info' ? (
                <>
                  {/* Quick Action Row */}
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleOpenDirections(selectedSpot)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
                    >
                      <Navigation className="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold mt-1.5">Chỉ đường</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareSpot(selectedSpot)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
                    >
                      <Share2 className="w-4 h-4 text-neutral-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold mt-1.5">Chia sẻ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenReportModal(selectedSpot)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
                    >
                      <Flag className="w-4 h-4 text-amberFilm group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold mt-1.5">Báo nở</span>
                    </button>
                  </div>

                  {/* Bloom Condition Summary */}
                  <div className="bg-amber-50/70 dark:bg-neutral-800/70 border border-amber-200/60 dark:border-neutral-700/60 rounded-xl p-4 space-y-2">
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
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed pt-1">
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
                    <h3 className="font-mono-spec text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center">
                      <Camera className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
                      CẨM NANG NHIẾP ẢNH & THIẾT BỊ
                    </h3>

                    {/* Golden Hour / Best Time */}
                    <div className="flex items-start space-x-2.5 text-sm">
                      <Clock className="w-4 h-4 text-amberFilm shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Khung giờ đẹp: </span>
                        <span className="text-neutral-600 dark:text-neutral-400">{selectedSpot.bestTimeDescription}</span>
                      </div>
                    </div>

                    {/* Recommended Lenses */}
                    <div className="flex items-start space-x-2.5 text-sm">
                      <Camera className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Ống kính khuyên dùng: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSpot.recommendedLenses.map((lens, lIdx) => (
                            <span key={lIdx} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md font-mono-spec text-xs text-neutral-700 dark:text-neutral-300">
                              {lens}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Concept & Outfits */}
                    <div className="flex items-start space-x-2.5 text-sm">
                      <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Concept & Trang phục: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSpot.seasonalTrend?.conceptTags.map((tag, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-md text-xs">
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
                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-850/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                {post.authorName}
                              </div>
                              <div className="text-xs text-neutral-400 font-mono-spec">
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

                        <p className="text-sm text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
                          {post.fullContent || post.caption}
                        </p>

                        {post.cameraSettings && (
                          <div className="text-xs font-mono-spec text-neutral-500 bg-white dark:bg-neutral-800 px-2 py-1 rounded">
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
            <div className="grid grid-cols-3 flex-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mr-2 gap-1 text-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarTab('outfit');
                  if (mobileSnap === 'peek') setMobileSnap('half');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all truncate ${sidebarTab === 'outfit'
                    ? 'bg-white dark:bg-neutral-900 text-terracotta shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                👗 Quần áo ({outfitInsights.length})
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarTab('camera');
                  if (mobileSnap === 'peek') setMobileSnap('half');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all truncate ${sidebarTab === 'camera'
                    ? 'bg-white dark:bg-neutral-900 text-terracotta shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                📷 Thuê máy ({cameraInsights.length})
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarTab('film');
                  if (mobileSnap === 'peek') setMobileSnap('half');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all truncate ${sidebarTab === 'film'
                    ? 'bg-white dark:bg-neutral-900 text-terracotta shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                🎞️ Mua film ({filmInsights.length})
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

        {/* Mobile Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <LocalInsightFeed
            insights={currentInsights}
            compact
            onResetFilters={() => {
              onChangeFilters(prev => ({ ...prev, searchQuery: '' }));
            }}
          />
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
                  {/* Ghost Pose Camera launcher (temporarily disabled)
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
                  */}

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
