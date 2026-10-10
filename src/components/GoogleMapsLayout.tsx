import React, { lazy, Suspense, useState, useEffect } from 'react';
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
import type { Spot, FilterState } from '../types';
import { CONCEPT_METADATA } from '../utils/season';
import { REGIONS } from '../data/regions';
import { SpotMap } from './map/SpotMap';
import { AtmosphericFX } from './features/AtmosphericFX';
import { FilmSpecsCard } from './cards/FilmSpecsCard';
import { LeftNavRail } from './navigation/LeftNavRail';
import { PoseCamera } from './features/PoseCamera';
import { useWeather } from '../hooks/useWeather';
import { trendArticleApi, type TrendArticle, type TrendArticleSection } from '../services/trendArticleApi';
import { TrendArticleFeed } from './views/TrendArticleFeed';
import { POSES, type PoseItem } from '../data/poses';
import { TapToShopImage } from './outfit/TapToShopImage';
import { NearestFilmShopsDrawer } from './layout/NearestFilmShopsDrawer';
import type { ServicesTab } from './layout/ShootServicesHubDrawer';
import type { FilmLab } from '../data/filmLabsData';
import { SingleFilmLabCard } from './layout/SingleFilmLabCard';

const ShootServicesHubDrawer = lazy(() => import('./layout/ShootServicesHubDrawer').then(m => ({ default: m.ShootServicesHubDrawer })));

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
  activeView: 'map' | 'grid' | 'moodboard' | 'film' | 'services';
  onChangeView: (view: 'map' | 'grid' | 'moodboard' | 'film' | 'services') => void;
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

  // Selected section for the trend and upcoming-spots feed.
  const [sidebarTab, setSidebarTab] = useState<TrendArticleSection>('hotTrend');

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

  // State quản lý Drawer Tìm Lab & Điểm mua film gần nhất
  const [isAllLabsDrawerOpen, setIsAllLabsDrawerOpen] = useState(false);
  const [filmFilterForLabs, setFilmFilterForLabs] = useState('');
  const [selectedLabForMap, setSelectedLabForMap] = useState<FilmLab | null>(null);
  const [focusedCoordinates, setFocusedCoordinates] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // State quản lý Shoot Services Hub Drawer (Trang phục + Thợ chụp + Tiệm film)
  const [isServicesHubOpen, setIsServicesHubOpen] = useState(false);
  const [servicesHubTab, setServicesHubTab] = useState<ServicesTab>('outfit');

  // Lắng nghe sự kiện toàn cục mở Shoot Services Hub (từ tab, nút dịch vụ...)
  useEffect(() => {
    const handleOpenHub = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: ServicesTab }>;
      if (customEvent.detail?.tab) {
        setServicesHubTab(customEvent.detail.tab);
      }
      setIsServicesHubOpen(true);
    };

    window.addEventListener('chupgi:open-services-hub', handleOpenHub);
    return () => window.removeEventListener('chupgi:open-services-hub', handleOpenHub);
  }, []);

  // Lắng nghe sự kiện toàn cục mở Drawer Lab gần nhất (từ nút cuộn film, chi tiết điểm, ...)
  useEffect(() => {
    const handleOpenLabs = (e: Event) => {
      const customEvent = e as CustomEvent<{ filmName?: string }>;
      if (customEvent.detail?.filmName) {
        setFilmFilterForLabs(customEvent.detail.filmName);
      } else {
        setFilmFilterForLabs('');
      }
      setIsAllLabsDrawerOpen(true);
    };

    window.addEventListener('chupgi:open-nearest-labs', handleOpenLabs);
    return () => window.removeEventListener('chupgi:open-nearest-labs', handleOpenLabs);
  }, []);

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

  const [trendArticles, setTrendArticles] = useState<TrendArticle[]>([]);
  const [trendArticlesLoading, setTrendArticlesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    trendArticleApi.list().then((items) => { if (active) setTrendArticles(items); })
      .catch((error: unknown) => { console.warn('Không tải được bài viết xu hướng.', error); if (active) setTrendArticles([]); })
      .finally(() => { if (active) setTrendArticlesLoading(false); });
    return () => { active = false; };
  }, []);

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
      } catch {
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
          onOpenNearestLabs={() => {
            setFilmFilterForLabs('');
            setIsAllLabsDrawerOpen(true);
          }}

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
          selectedFilmLab={selectedLabForMap}
          onSelectFilmLab={(lab) => {
            setSelectedLabForMap(lab);
            setIsAllLabsDrawerOpen(false);
            setFocusedCoordinates({ lat: lab.lat, lng: lab.lng, zoom: 15 });
          }}
          focusedCoordinates={focusedCoordinates}
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
                placeholder="Tìm bài hot hoặc địa điểm sắp nổi..."
                className="w-full bg-transparent text-sm text-[#2C2621] placeholder-[#8C8377] focus:outline-none font-medium"
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
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-[76px] z-30 w-[440px] max-w-[calc(100vw-76px)] bg-[#E8DEC7] border-r border-[#D8CFBD] text-[#2C2621] shadow-2xl overflow-hidden transition-transform duration-300 ease-out ${isSidebarCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0'
          }`}
      >
        {/* Collapse Toggle Floating Tab Button [‹] */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(true)}
          className="absolute -right-7 top-1/2 -translate-y-1/2 w-7 h-16 bg-[#E8DEC7] border-y border-r border-[#D8CFBD] rounded-r-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-[#DDD3BD] hover:w-8 text-[#554D43] z-50 transition-all pointer-events-auto group"
          title="Thu gọn danh sách"
        >
          <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* ─── STICKY HEADER (EXACTLY 2 CLEAN FILTER ROWS + iOS SEGMENTED SWITCH) ─── */}
        <div className="px-5 py-4 border-b border-[#D8CFBD] shrink-0 space-y-3.5 bg-[#E8DEC7]">

          {/* ROW 1: Search Bar + Clear/Reset Actions */}
          <div className="h-12 w-full rounded-2xl bg-[#FAF8F4] border border-[#D8CFBD] shadow-sm px-4 flex items-center justify-between transition-colors focus-within:ring-2 focus-within:ring-[#C76B3C]/30 focus-within:border-[#C76B3C]">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onChangeFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Tìm bài hot hoặc địa điểm sắp nổi..."
                className="w-full bg-transparent text-sm text-[#2C2621] placeholder-[#8C8377] focus:outline-none font-medium"
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
                className="text-xs font-semibold px-3 py-1 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title="Đặt lại bộ lọc"
              >
                Đặt lại
              </button>
            </div>
          </div>



          <TrendArticleFeed articles={trendArticles} regionId={activeRegionId} searchQuery={filters.searchQuery} activeSection={sidebarTab} onSectionChange={setSidebarTab} tabsOnly />
        </div>

        {/* ─── SCROLLABLE EDITORIAL FEED ─── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <TrendArticleFeed articles={trendArticles} regionId={activeRegionId} searchQuery={filters.searchQuery} loading={trendArticlesLoading} activeSection={sidebarTab} onSectionChange={setSidebarTab} showTabs={false} />
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
            className={`hidden lg:flex flex-col fixed top-3 bottom-3 z-30 w-[420px] rounded-2xl shadow-2xl border border-[#D8CFBD] bg-[#FAF8F4] text-[#2C2621] overflow-hidden transition-all duration-300 ease-out ${isSidebarCollapsed ? 'left-[96px] max-w-[calc(100vw-112px)]' : 'left-[560px] max-w-[calc(100vw-576px)]'
              }`}
          >
            {/* Cover Photo Gallery Banner */}
            {/* Cover Photo Gallery Banner with Visual Outfit Tap-to-Shop */}
            <div className="relative h-52 bg-neutral-900 shrink-0">
              <TapToShopImage
                src={selectedSpot.galleryUrls?.[activePhotoIdx] || selectedSpot.coverImageUrl}
                alt={selectedSpot.name}
                spotId={selectedSpot.id}
                aspectRatio="h-52"
                imageClassName="w-full h-full object-cover"
              />

              {/* Dismiss Button ✕ */}
              <button
                type="button"
                onClick={() => onSelectSpot(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md z-30"
                title="Đóng chi tiết"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Status Badge */}
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-terracotta text-white text-xs font-semibold shadow-sm">
                {selectedSpot.seasonalTrend?.status === 'PEAK' ? 'Đang rộ' : (selectedSpot.seasonalTrend?.status || 'Đang rộ')}
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
            <div className="px-5 pt-4 pb-4 border-b border-[#D8CFBD] shrink-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-semibold text-terracotta block truncate">
                    {selectedSpot.seasonalTrend?.trendTitle}
                  </span>
                  <h2 className="font-editorial text-2xl font-bold leading-tight text-[#2C2621] line-clamp-2 mt-1">
                    {selectedSpot.name}
                  </h2>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleSave(selectedSpot.id)}
                    className="p-2 rounded-lg bg-[#ECE4D0] hover:text-terracotta text-[#554D43]"
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
              <div className="flex items-center p-1 bg-[#ECE4D0] rounded-lg text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setDetailTab('info')}
                  className={`flex-1 py-1.5 rounded-md transition-all ${detailTab === 'info'
                      ? 'bg-[#FAF8F4] text-[#2C2621] shadow-xs'
                      : 'text-[#6E655B] hover:text-[#2C2621]'
                    }`}
                >
                  Cẩm Nang & Góc Chụp
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('posts')}
                  className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center space-x-1 ${detailTab === 'posts'
                      ? 'bg-[#FAF8F4] text-blue-700 shadow-xs'
                      : 'text-[#6E655B] hover:text-[#2C2621]'
                    }`}
                >
                  <span>Bài Đăng FB</span>
                  <span className="text-xs px-1.5 bg-blue-100 text-blue-700 rounded font-mono-spec">
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
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#F3EAD7] hover:bg-[#ECE4D0] text-[#2C2621] transition-colors group"
                    >
                      <Navigation className="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold mt-1.5">Chỉ đường</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareSpot(selectedSpot)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#F3EAD7] hover:bg-[#ECE4D0] text-[#2C2621] transition-colors group"
                    >
                      <Share2 className="w-4 h-4 text-neutral-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold mt-1.5">Chia sẻ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenReportModal(selectedSpot)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#F3EAD7] hover:bg-[#ECE4D0] text-[#2C2621] transition-colors group"
                    >
                      <Flag className="w-4 h-4 text-amberFilm group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold mt-1.5">Báo nở</span>
                    </button>
                  </div>

                  {/* Bloom Condition Summary */}
                  <div className="bg-[#F3EAD7] border border-[#D8CFBD] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono-spec">
                      <span className="font-bold text-[#2C2621]">
                        TÌNH TRẠNG HOA / PHONG CẢNH
                      </span>
                      <span className="font-bold text-terracotta">
                        {selectedSpot.seasonalTrend?.bloomPercentage || 85}% ĐANG NỞ
                      </span>
                    </div>
                    <div className="w-full bg-[#E2DAD0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-terracotta h-full transition-all duration-500"
                        style={{ width: `${selectedSpot.seasonalTrend?.bloomPercentage || 85}%` }}
                      />
                    </div>
                    <p className="text-sm text-[#554D43] font-sans leading-relaxed pt-1">
                      {selectedSpot.description}
                    </p>
                  </div>

                  {/* FILM PHOTOGRAPHY ADVISOR SPEC CARD */}
                  <FilmSpecsCard
                    spot={selectedSpot}
                    onSelectFilmFilter={(filmId) => onChangeFilters(prev => ({ ...prev, filmId }))}
                    onOpenNearestLabs={(filmName) => {
                      setFilmFilterForLabs(filmName || '');
                      setIsAllLabsDrawerOpen(true);
                    }}
                  />

                  {/* PHOTOGRAPHY TIPS (Ống kính, Giờ vàng, Concept) */}
                  <div className="space-y-3 pt-1">
                    <h3 className="text-sm font-bold text-[#2C2621] flex items-center">
                      <Camera className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
                      Cẩm nang chụp ảnh & thiết bị
                    </h3>

                    {/* Golden Hour / Best Time */}
                    <div className="flex items-start space-x-2.5 text-sm">
                      <Clock className="w-4 h-4 text-amberFilm shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#2C2621]">Khung giờ đẹp: </span>
                        <span className="text-[#6E655B]">{selectedSpot.bestTimeDescription}</span>
                      </div>
                    </div>

                    {/* Recommended Lenses */}
                    <div className="flex items-start space-x-2.5 text-sm">
                      <Camera className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#2C2621]">Ống kính khuyên dùng: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSpot.recommendedLenses.map((lens, lIdx) => (
                            <span key={lIdx} className="px-2 py-0.5 bg-[#ECE4D0] rounded-md font-mono-spec text-xs text-[#554D43]">
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
                        <span className="font-bold text-[#2C2621]">Concept & Trang phục: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSpot.seasonalTrend?.conceptTags.map((tag, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs">
                              {CONCEPT_METADATA[tag]?.label || `#${tag}`}
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
                    <span className="text-xs font-mono-spec font-bold text-blue-700">
                      BÀI ĐĂNG THỰC TẾ ({selectedSpot.inspirationPosts?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenAddPostModal(selectedSpot.id)}
                      className="text-xs text-blue-700 font-mono-spec font-bold hover:underline"
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
                        className="p-4 rounded-xl border border-[#D8CFBD] bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-sm font-bold text-[#2C2621]">
                                {post.authorName}
                              </div>
                              <div className="text-xs text-[#8C8377] font-mono-spec">
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

                        <p className="text-sm text-[#554D43] font-sans leading-relaxed">
                          {post.fullContent || post.caption}
                        </p>

                        {post.cameraSettings && (
                          <div className="text-xs font-mono-spec text-[#6E655B] bg-[#F3EAD7] px-2 py-1 rounded">
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

            <div className="mr-2 min-w-0 flex-1">
              <TrendArticleFeed articles={trendArticles} regionId={activeRegionId} searchQuery={filters.searchQuery} activeSection={sidebarTab} onSectionChange={setSidebarTab} tabsOnly />
            </div>

            {/* Snap Toggle Indicator */}
            <div className="flex items-center space-x-1 text-neutral-400 pl-2 shrink-0">
              <span className="text-[11px] font-medium hidden sm:inline">
                {mobileSnap === 'peek' ? 'Kéo lên' : mobileSnap === 'half' ? 'Nửa màn' : 'Thu gọn'}
              </span>
              {mobileSnap !== 'full' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Mobile Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <TrendArticleFeed articles={trendArticles} regionId={activeRegionId} searchQuery={filters.searchQuery} loading={trendArticlesLoading} activeSection={sidebarTab} onSectionChange={setSidebarTab} showTabs={false} />
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
            className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-[#FAF8F4] text-[#2C2621] border-t border-[#D8CFBD] rounded-t-3xl shadow-2xl max-h-[84vh] flex flex-col overflow-hidden pb-safe"
          >
            {/* Mobile Detail Drag Handle & Dismiss Header */}
            <div className="relative pt-2 pb-1 flex flex-col items-center shrink-0 border-b border-[#E2DAD0]">
              <div className="w-10 h-1.5 bg-[#D0C5AC] rounded-full mb-1" />

              <div className="w-full px-4 py-1 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono-spec font-bold text-terracotta uppercase block truncate">
                    {selectedSpot.seasonalTrend?.trendTitle}
                  </span>
                  <h3 className="font-editorial text-lg font-bold text-[#2C2621] truncate">
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
                    className="w-8 h-8 rounded-full bg-[#ECE4D0] hover:bg-[#E2DAD0] flex items-center justify-center text-[#554D43] shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Detail Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Cover Photo with Visual Outfit Tap-to-Shop */}
              <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-900 shrink-0 shadow-md">
                <TapToShopImage
                  src={selectedSpot.galleryUrls?.[activePhotoIdx] || selectedSpot.coverImageUrl}
                  alt={selectedSpot.name}
                  spotId={selectedSpot.id}
                  aspectRatio="h-48"
                  imageClassName="w-full h-full object-cover"
                />

                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-terracotta text-white text-[11px] font-semibold shadow-md">
                  {selectedSpot.seasonalTrend?.status === 'PEAK' ? 'Đang rộ' : (selectedSpot.seasonalTrend?.status || 'Đang rộ')}
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
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F3EAD7] text-[#2C2621]"
                >
                  <Bookmark className={`w-4 h-4 ${savedSpotIds.includes(selectedSpot.id) ? 'text-terracotta fill-terracotta' : ''}`} />
                  <span className="text-[11px] font-semibold mt-1">
                    {savedSpotIds.includes(selectedSpot.id) ? 'Đã lưu' : 'Lưu'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareSpot(selectedSpot)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F3EAD7] text-[#2C2621]"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-[11px] font-semibold mt-1">Chia sẻ</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenReportModal(selectedSpot)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F3EAD7] text-[#2C2621]"
                >
                  <Flag className="w-4 h-4 text-amberFilm" />
                  <span className="text-[11px] font-semibold mt-1">Báo nở</span>
                </button>
              </div>

              {/* Condition Progress Bar */}
              <div className="bg-[#F3EAD7] border border-[#D8CFBD] rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-spec">
                  <span className="font-bold text-[#2C2621]">
                    TÌNH TRẠNG HOA / PHONG CẢNH
                  </span>
                  <span className="font-bold text-terracotta">
                    {selectedSpot.seasonalTrend?.bloomPercentage || 85}% ĐANG NỞ
                  </span>
                </div>
                <div className="w-full bg-[#E2DAD0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-terracotta h-full transition-all duration-500"
                    style={{ width: `${selectedSpot.seasonalTrend?.bloomPercentage || 85}%` }}
                  />
                </div>
                <p className="text-xs text-[#554D43] font-sans leading-relaxed pt-1">
                  {selectedSpot.description}
                </p>
              </div>

              {/* FILM PHOTOGRAPHY ADVISOR SPEC CARD (Mobile) */}
              <FilmSpecsCard
                spot={selectedSpot}
                onSelectFilmFilter={(filmId) => onChangeFilters(prev => ({ ...prev, filmId }))}
                onOpenNearestLabs={(filmName) => {
                  setFilmFilterForLabs(filmName || '');
                  setIsAllLabsDrawerOpen(true);
                }}
              />

              {/* Photography Guide */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-[#2C2621] flex items-center">
                  <Camera className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
                  Cẩm nang chụp ảnh & thiết bị
                </h4>

                <div className="flex items-start space-x-2 text-xs">
                  <Clock className="w-4 h-4 text-amberFilm shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2C2621]">Khung giờ đẹp: </span>
                    <span className="text-[#6E655B]">{selectedSpot.bestTimeDescription}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <Camera className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2C2621]">Ống kính khuyên dùng: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSpot.recommendedLenses.map((lens, lIdx) => (
                        <span key={lIdx} className="px-2 py-0.5 bg-[#ECE4D0] text-[#554D43] rounded font-mono-spec text-[10px]">
                          {lens}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2C2621]">Concept & Trang phục: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSpot.seasonalTrend?.conceptTags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px]">
                          {CONCEPT_METADATA[tag]?.label || `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Facebook Posts */}
              {selectedSpot.inspirationPosts && selectedSpot.inspirationPosts.length > 0 && (
                <div className="border-t border-[#E2DAD0] pt-3 space-y-2.5">
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
                    <div key={post.id} className="p-3 rounded-2xl bg-white space-y-2 border border-[#D8CFBD]">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <img src={post.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-bold">{post.authorName}</span>
                        </div>
                        <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-[#554D43] leading-relaxed">
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

      {/* Ghost Pose Camera z-[100] sits above the detail panels (z-30/z-50) */}
      {showPoseCamera && selectedPose && (
        <PoseCamera
          pose={selectedPose}
          onClose={() => { setShowPoseCamera(false); setSelectedPose(null); }}
        />
      )}

      {/* Shoot Services & Gear Hub Drawer (Trang phục + Thợ chụp + Tiệm film) */}
      <Suspense fallback={null}>
      <ShootServicesHubDrawer
        isOpen={isServicesHubOpen}
        onClose={() => setIsServicesHubOpen(false)}
        initialTab={servicesHubTab}
        onFlyToLab={(lab) => {
          setSelectedLabForMap(lab);
          setIsServicesHubOpen(false);
          setFocusedCoordinates({ lat: lab.lat, lng: lab.lng, zoom: 16 });
        }}
        selectedLabId={selectedLabForMap?.id}
      />
      </Suspense>

      {/* Nearest Film Shops & Labs Finder Drawer */}
      <NearestFilmShopsDrawer
        isOpen={isAllLabsDrawerOpen}
        onClose={() => setIsAllLabsDrawerOpen(false)}
        filterFilm={filmFilterForLabs}
        selectedLabId={selectedLabForMap?.id}
        onFlyToLab={(lab) => {
          setSelectedLabForMap(lab);
          setIsAllLabsDrawerOpen(false);
          setFocusedCoordinates({ lat: lab.lat, lng: lab.lng, zoom: 16 });
        }}
      />

      <AnimatePresence>
        {selectedLabForMap && !isAllLabsDrawerOpen && (
          <SingleFilmLabCard
            key={selectedLabForMap.id}
            lab={selectedLabForMap}
            userCoords={filters.userCoords}
            onClose={() => setSelectedLabForMap(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
