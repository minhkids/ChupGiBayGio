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
  activeView: 'map' | 'grid' | 'moodboard' | 'film';
  onChangeView: (view: 'map' | 'grid' | 'moodboard' | 'film') => void;
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
}

type ViewId = 'map' | 'grid' | 'moodboard' | 'film';

const NAV_ITEMS: { id: ViewId; label: string; short: string; icon: LucideIcon }[] = [
  { id: 'map', label: 'Bản đồ', short: 'Bản đồ', icon: Map },
  { id: 'grid', label: 'Tạp chí', short: 'Tạp chí', icon: BookOpen },
  { id: 'moodboard', label: 'Cảm hứng', short: 'Cảm hứng', icon: Palette },
  { id: 'film', label: 'Màu Film', short: 'Màu Film', icon: Layers },
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
}) => {
  const WeatherIcon = WEATHER_ICONS[weather.effect] ?? CloudSun;
  const temperature = Math.round(weather.temperature);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP NAVIGATION RAIL — 76px, matches the lg:pl-[76px] content offset */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 z-[var(--z-rail)] w-[76px] select-none flex-col items-center justify-between border-r border-neutral-200 bg-white py-5 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex w-full flex-col items-center gap-5">
          <button
            type="button"
            onClick={() => onChangeView('map')}
            aria-label="Chụp Gì Bây Giờ — về trang bản đồ"
            title="Về bản đồ"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-amber-400 transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
          >
            <Camera className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>

          <span className="h-px w-9 bg-neutral-200 dark:bg-neutral-800" aria-hidden="true" />

          <nav className="flex w-full flex-col items-center gap-1" aria-label="Điều hướng chính">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeView(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  className={[
                    'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white',
                  ].join(' ')}
                >
                  {isActive && (
                    <motion.span
                      layoutId="desktopNavIndicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute -left-[13px] h-5 w-[3px] rounded-r-full bg-terracotta"
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="h-[21px] w-[21px]" strokeWidth={isActive ? 2.1 : 1.8} />
                  <span className="pointer-events-none absolute left-[calc(100%+10px)] z-20 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <span className="h-px w-9 bg-neutral-200 dark:bg-neutral-800" aria-hidden="true" />

          <button
            type="button"
            onClick={onOpenSavedModal}
            aria-label={`Đã lưu${savedCount > 0 ? `, ${savedCount} địa điểm` : ''}`}
            title={`Đã lưu${savedCount > 0 ? ` (${savedCount})` : ''}`}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-neutral-500 transition-colors duration-150 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white dark:focus-visible:ring-offset-neutral-950"
          >
            <Bookmark className="h-[21px] w-[21px]" strokeWidth={1.8} />
            {savedCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] font-semibold tabular-nums text-white">
                {savedCount}
              </span>
            )}
            <span className="pointer-events-none absolute left-[calc(100%+10px)] z-20 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Đã lưu
            </span>
          </button>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          {onSelectFilmFilter && (
            <button
              type="button"
              onClick={onSelectFilmFilter}
              aria-label="Lọc theo màu film"
              title="Lọc theo màu film"
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors duration-150 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white dark:focus-visible:ring-offset-neutral-950"
            >
              <Film className="h-5 w-5" strokeWidth={1.8} />
              <span className="pointer-events-none absolute left-[calc(100%+10px)] z-20 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Lọc theo màu film
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleAtmospheric}
            aria-label={`Thời tiết ${temperature} độ — ${isAtmosphericActive ? 'tắt' : 'bật'} hiệu ứng thời tiết`}
            aria-pressed={isAtmosphericActive}
            title={`Thời tiết ${temperature}° · ${isAtmosphericActive ? 'Đang bật hiệu ứng' : 'Bật hiệu ứng'}`}
            className={[
              'flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-colors duration-150',
              isAtmosphericActive
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white',
            ].join(' ')}
          >
            <WeatherIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <span className="text-[10px] font-medium tabular-nums leading-none">{temperature}°</span>
          </button>

          <button
            type="button"
            onClick={onOpenSubmitSpotModal}
            aria-label="Đóng góp điểm chụp mới"
            title="Thêm địa điểm"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white transition-colors duration-150 hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} />
            <span className="pointer-events-none absolute left-[calc(100%+10px)] z-20 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Thêm địa điểm
            </span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM TAB BAR (< lg viewport) */}
      {/* ========================================================================= */}
      <nav
        aria-label="Điều hướng chính"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch gap-1 border-t border-neutral-200/70 bg-white/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/90"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors duration-200"
            >
              {isActive && (
                <motion.span
                  layoutId="mobileNavActivePill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-neutral-100 dark:bg-neutral-800"
                />
              )}
              <Icon
                className={`relative h-5 w-5 ${isActive ? 'text-terracotta' : 'text-neutral-500 dark:text-neutral-400'}`}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
              <span
                className={`relative text-[10px] leading-tight ${
                  isActive
                    ? 'font-semibold text-neutral-900 dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400'
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