import { Aperture, Map, Backpack, ClipboardList, Plus, Thermometer } from 'lucide-react';
import type { WeatherData } from '../../hooks/useWeather';
import { useShootPlan } from '../../context/ShootPlanContext';

export interface ModernLeftRailProps {
  activeSection?: 'map' | 'services' | 'planner' | string;
  onMap: () => void;
  onServices: () => void;
  onPlanner?: () => void;
  onAddSpot: () => void;
  weather: WeatherData;
  isServicesOpen?: boolean;
  // Backwards compatibility props
  onFilm?: () => void;
  onPhotographers?: () => void;
  onOutfit?: () => void;
  onOpenNearestLabs?: () => void;
}

export function ModernLeftRail(props: ModernLeftRailProps) {
  const plan = useShootPlan();

  const handlePlannerAction = () => {
    if (props.onPlanner) {
      props.onPlanner();
    } else if (plan?.openDrawer) {
      plan.openDrawer();
    }
  };

  const isMapActive = props.activeSection === 'map' && !props.isServicesOpen;
  const isServicesActive = props.isServicesOpen || props.activeSection === 'services';
  const isPlannerActive = props.activeSection === 'planner' || (plan?.isDrawerOpen ?? false);

  const entries = [
    {
      id: 'map',
      label: 'Bản đồ',
      icon: Map,
      action: props.onMap,
      isActive: isMapActive,
      badge: null
    },
    {
      id: 'services',
      label: 'Dịch vụ',
      icon: Backpack,
      action: props.onServices,
      isActive: isServicesActive,
      badge: 'Hub'
    },
    {
      id: 'planner',
      label: 'Kế hoạch',
      icon: ClipboardList,
      action: handlePlannerAction,
      isActive: isPlannerActive,
      badge: plan && plan.totalCount > 0 ? `${plan.totalCount}` : null
    }
  ];

  return (
    <nav
      aria-label="Điều hướng chính"
      className="editorial-rail fixed inset-x-0 bottom-0 z-[var(--z-panel)] flex items-center justify-around border-t border-editorial-border bg-editorial-bg text-neutral-400 lg:inset-y-0 lg:right-auto lg:w-[var(--rail-width)] lg:flex-col lg:justify-start lg:border-r lg:border-t-0 select-none shadow-2xl"
    >
      {/* Top Logo / Aperture Home Button */}
      <button
        type="button"
        aria-label="Chụp Gì Bây Giờ — Bản đồ"
        onClick={props.onMap}
        className="hidden h-20 w-full items-center justify-center text-kodak-amber hover:opacity-85 transition-opacity lg:flex group"
        title="Về bản đồ trung tâm"
      >
        <Aperture size={28} strokeWidth={1.6} className="group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* 3 Main Navigation Buttons: Bản đồ, Dịch vụ (Trang bị), Kế hoạch */}
      {entries.map(({ id, label, icon: Icon, action, isActive, badge }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
          onClick={action}
          className={`relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-tight transition-all lg:w-full lg:flex-none lg:py-4 group ${
            isActive
              ? 'bg-kodak-amber/15 text-kodak-amber font-bold'
              : 'hover:bg-editorial-surface hover:text-neutral-100 text-neutral-400'
          }`}
        >
          <div className="relative">
            {id === 'services' ? (
              <span className="text-[20px] leading-none group-hover:scale-110 transition-transform">🎒</span>
            ) : (
              <Icon size={21} strokeWidth={1.7} className="group-hover:scale-110 transition-transform" />
            )}
            {badge && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono-spec font-bold bg-amber-500 text-neutral-950 shadow-xs">
                {badge}
              </span>
            )}
          </div>
          <span className="max-w-16 text-center tracking-tight">{label}</span>
        </button>
      ))}

      {/* Desktop Footer: Weather widget & Add Spot (+) button */}
      <div className="hidden lg:mt-auto lg:flex lg:flex-col lg:items-center lg:gap-4 lg:pb-5">
        <span
          title="Thời tiết Hà Nội"
          className="flex flex-col items-center gap-1 text-xs font-mono text-neutral-400"
        >
          <Thermometer size={18} strokeWidth={1.5} className="text-amber-400" />
          {props.weather.isLoading || props.weather.error ? '—' : `${Math.round(props.weather.temperature)}°`}
          <span className="text-[9px] text-neutral-500">Hà Nội</span>
        </span>
        <button
          type="button"
          aria-label="Thêm điểm mới"
          title="Đóng góp điểm chụp mới"
          onClick={props.onAddSpot}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-editorial-border text-kodak-amber hover:bg-editorial-surface hover:scale-105 transition-all shadow-md"
        >
          <Plus size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Mobile Add Spot button */}
      <button
        type="button"
        aria-label="Thêm điểm mới"
        onClick={props.onAddSpot}
        className="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] text-kodak-amber font-semibold lg:hidden hover:opacity-80"
      >
        <Plus size={20} strokeWidth={2} />
        <span>Thêm điểm</span>
      </button>
    </nav>
  );
}
