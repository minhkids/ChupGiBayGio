import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Palette,
  Film,
  Bookmark,
  Plus,
  Layers,
  Map,
  Camera,
  ShoppingBag,
  Sun,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WeatherData } from '../../hooks/useWeather';

interface LeftNavRailProps {
  activeView: 'map' | 'grid' | 'moodboard' | 'film' | 'services';
  onChangeView: (view: 'map' | 'grid' | 'moodboard' | 'film' | 'services') => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  onOpenSubmitSpotModal: () => void;
  weather: WeatherData;
  isAtmosphericActive: boolean;
  onToggleAtmospheric: () => void;
  activeRegionId: string;
  onSelectRegion: (regionId: string) => void;
  uiTheme?: 'modern' | 'editorial';
  onToggleUiTheme?: () => void;
  onSelectFilmFilter?: () => void;
  onOpenNearestLabs?: () => void;

}

type ViewId = 'map' | 'grid' | 'moodboard' | 'film' | 'services';

const NAV_ITEMS: { id: ViewId; label: string; short: string; icon: LucideIcon }[] = [
  { id: 'map', label: 'Bản đồ', short: 'Bản đồ', icon: Map },
  { id: 'grid', label: 'Tạp chí', short: 'Tạp chí', icon: BookOpen },
  { id: 'moodboard', label: 'Cảm hứng', short: 'Cảm hứng', icon: Palette },
  { id: 'film', label: 'Màu Film', short: 'Màu Film', icon: Layers },
  { id: 'services', label: 'Dịch vụ', short: 'Dịch vụ', icon: ShoppingBag },
];

const WEATHER_ICONS: Record<string, LucideIcon> = {
  clear: Sun,
  cloudy: CloudSun,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRainWind,
  heavy_rain: CloudRainWind,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
};

export const LeftNavRail: React.FC<LeftNavRailProps> = ({
  activeView,
  onChangeView,
  savedCount,
  onOpenSavedModal,
  onOpenSubmitSpotModal,
  weather,
  isAtmosphericActive,
  onToggleAtmospheric,
  onSelectFilmFilter,
  onOpenNearestLabs,

}) => {
  const WeatherIcon = WEATHER_ICONS[weather.effect] ?? CloudSun;
  const temperature = Math.round(weather.temperature);

  const handleNavClick = (id: ViewId) => {
    if (id === 'film' && onOpenNearestLabs) {
      onOpenNearestLabs();
    }
    onChangeView(id);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP NAVIGATION RAIL — 76px, matches the lg:pl-[76px] content offset */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 z-[var(--z-rail)] w-[76px] select-none flex-col items-center justify-between border-r border-[#D0C5AC] bg-[#E0D6BF] py-5 text-[#554D43]">
        {/* ─── TOP: brand mark + primary navigation ─── */}
        <div className="flex w-full flex-col items-center gap-4">
          {/* Brand / Home button */}
          <button
            type="button"
            onClick={() => onChangeView('map')}
            aria-label="Chụp Gì Bây Giờ — về trang bản đồ"
            className="group flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 text-amber-400 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <Camera className="h-4.5 w-4.5" strokeWidth={2.2} />
          </button>

          <span className="h-px w-10 bg-[#D0C5AC]" aria-hidden="true" />

          {/* Primary nav items */}
          <nav className="flex w-full flex-col items-center gap-0.5" aria-label="Điều hướng chính">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={[
                    'group relative flex w-full flex-col items-center gap-1 py-2.5 transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0D6BF]',
                    isActive ? 'bg-[#C76B3C] text-white shadow-md' : 'text-[#554D43] hover:bg-[#DED3B8] hover:text-[#2C2621]',
                  ].join(' ')}
                >
                  {/* Active indicator — thin bar on left edge */}
                  {isActive && (
                    <motion.span
                      layoutId="desktopNavIndicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute left-0 top-[26px] -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#C76B3C]"
                      aria-hidden="true"
                    />
                  )}

                  {/* Icon pill — active gets a soft background */}
                  <span
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-2xl transition-colors duration-200',
                      isActive ? 'text-white'
                          : 'text-[#554D43] group-hover:text-[#2C2621]',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.7} />
                  </span>

                  {/* Label — always visible, never truncated */}
                  <span
                    className={[
                      'text-[10px] font-medium leading-tight select-none',
                      isActive ? 'text-white font-bold' : 'text-[#554D43] group-hover:text-[#2C2621]',
                    ].join(' ')}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}

            {/* "Đã lưu" as the 5th nav item */}
            <motion.button
              type="button"
              onClick={onOpenSavedModal}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="group relative flex w-full flex-col items-center gap-1 py-2.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span className="relative flex h-8 w-8 items-center justify-center rounded-2xl text-neutral-400 transition-colors duration-200 group-hover:bg-neutral-50 group-hover:text-neutral-700">
                <Bookmark className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
                {savedCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-terracotta px-0.5 text-[8px] font-semibold tabular-nums text-white">
                    {savedCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium leading-tight text-neutral-400 group-hover:text-neutral-600 select-none">
                Đã lưu
              </span>
            </motion.button>


          </nav>
        </div>

        {/* ─── BOTTOM: utilities ─── */}
        <div className="flex w-full flex-col items-center gap-3">
          {/* Film filter shortcut (conditional) */}
          {onSelectFilmFilter && (
            <button
              type="button"
              onClick={onSelectFilmFilter}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-amber-500 transition-colors duration-200 hover:bg-amber-50 hover:text-amber-600"
            >
              <Film className="h-5 w-5" strokeWidth={1.7} />
            </button>
          )}

          {/* Compact weather widget */}
          <button
            type="button"
            onClick={onToggleAtmospheric}
            aria-pressed={isAtmosphericActive}
            className={[
              'flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-2 transition-colors duration-200',
              isAtmosphericActive
                ? 'bg-amber-50 text-amber-600'
                : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600',
            ].join(' ')}
          >
            <WeatherIcon className="h-4 w-4" strokeWidth={1.8} />
            <span className="text-[10px] font-medium tabular-nums leading-none">{temperature}°</span>
          </button>

          {/* Add spot — circular amber button */}
          <motion.button
            type="button"
            onClick={onOpenSubmitSpotModal}
            whileTap={{ scale: 0.92 }}
            aria-label="Đóng góp điểm chụp mới"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm transition-colors duration-200 hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </motion.button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM TAB BAR (< lg viewport) */}
      {/* ========================================================================= */}
      <nav
        aria-label="Điều hướng chính"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch gap-1 border-t border-[#D0C5AC] bg-[#E0D6BF]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors duration-200"
            >
              {isActive && (
                <motion.span
                  layoutId="mobileNavActivePill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-[#C76B3C]"
                />
              )}
              <Icon
                className={`relative h-5 w-5 ${isActive ? 'text-white' : 'text-[#554D43]'}`}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
              <span
                className={`relative text-[10px] leading-tight ${
                  isActive
                    ? 'font-bold text-white'
                    : 'text-[#554D43]'
                }`}
              >
                {item.short}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenSavedModal}
          className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Bookmark className="h-5 w-5 text-terracotta" strokeWidth={1.8} />
          <span className="text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">Đã lưu</span>
          {savedCount > 0 && (
            <span className="absolute right-1/4 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-terracotta px-1 text-[8px] font-semibold tabular-nums text-white">
              {savedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenSubmitSpotModal}
          aria-label="Đóng góp điểm chụp mới"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors duration-200"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
          </span>
          <span className="text-[10px] font-medium leading-tight text-amber-600">Thêm</span>
        </button>
      </nav>
    </>
  );
};