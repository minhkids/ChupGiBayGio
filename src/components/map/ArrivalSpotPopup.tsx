import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bike, Clock3, Camera, MapPin, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { CyclingWaypoint } from '../../types/planner';

interface ArrivalSpotPopupProps {
  map: LeafletMap | null;
  stop: CyclingWaypoint;
  distanceKm: number;
  durationMinutes: number;
  visible: boolean;
}

export function ArrivalSpotPopup({ map, stop, distanceKm, durationMinutes, visible }: ArrivalSpotPopupProps) {
  const [position, setPosition] = useState<{ left: number; top: number; width: number; maxHeight: number; pinX: number; pinY: number; above: boolean } | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!visible || !map) {
      setPosition(null);
      return;
    }
    const update = () => {
      try {
        const container = map.getContainer();
        const bounds = container.getBoundingClientRect();
        const point = map.latLngToContainerPoint([stop.lat, stop.lng]);
        const minX = Math.max(16, bounds.left + 16);
        const maxX = Math.min(window.innerWidth - 16, bounds.right || window.innerWidth - 16);
        const width = Math.min(330, maxX - minX);
        const pinX = bounds.left + point.x;
        const pinY = bounds.top + point.y;
        const left = Math.max(minX, Math.min(maxX - width, pinX + 24));
        const bottom = Math.min(window.innerHeight - 130, bounds.bottom || window.innerHeight);
        const below = bottom - (pinY + 40);
        const above = below < 140;
        const maxHeight = Math.max(60, Math.min(400, above ? pinY - 120 - Math.max(80, bounds.top + 16) : below));
        const top = above ? pinY - 120 - maxHeight : pinY + 40;
        setPosition({ left, top, width, maxHeight, pinX, pinY, above });
      } catch {
        setPosition(null);
      }
    };
    update();
    map.on('move zoom resize', update);
    window.addEventListener('resize', update);
    return () => {
      map.off('move zoom resize', update);
      window.removeEventListener('resize', update);
    };
  }, [map, stop.lat, stop.lng, visible]);

  if (!visible) return null;
  const placeType = stop.kind === 'filmLab' ? 'Tiệm film' : 'Điểm chụp';
  const formattedDistance = distanceKm.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <AnimatePresence>
      {position && <svg aria-hidden="true" className="pointer-events-none fixed inset-0 z-[94] h-full w-full" data-arrival-connector=""><path d={`M ${position.pinX} ${position.pinY + (position.above ? -105 : 24)} L ${Math.max(position.left + 16, Math.min(position.left + position.width - 16, position.pinX))} ${position.above ? position.top + position.maxHeight : position.top}`} stroke="#8C8377" strokeWidth="1.5" strokeDasharray="3 3" fill="none" /></svg>}
      <motion.aside
        key={stop.id}
        role="dialog"
        aria-label={`Đã đến ${stop.name}`}
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
        transition={prefersReducedMotion ? { duration: 0.12 } : { type: 'spring', stiffness: 320, damping: 26 }}
        style={position ? { position: 'fixed', left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, overflowY: 'auto' } : undefined}
        className="z-[95] w-[min(330px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-[#D8CFBD] bg-[#FAF8F4] p-3.5 text-[#2C2621] shadow-2xl"
      >
        {stop.imageUrl && <div className="relative mb-3 h-32 overflow-hidden rounded-2xl bg-[#ECE4D0]">
          <img src={stop.imageUrl} alt={stop.name} className="h-full w-full object-cover" />
          <span className="absolute bottom-2 left-2 rounded-full bg-[#FAF8F4]/95 px-2.5 py-1 text-[10px] font-semibold text-[#554D43]">{stop.seasonalLabel || placeType}</span>
        </div>}
        {!stop.imageUrl && <div className="mb-3 flex items-center gap-2 rounded-2xl bg-[#ECE4D0] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#6E655B]"><MapPin size={13} className="text-[#C76B3C]" />{stop.seasonalLabel || placeType}</div>}
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C76B3C] text-white"><Bike size={17} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C8377]">Đã đến · {placeType}</p>
              <motion.span data-testid="arrival-celebration" aria-label="Tới nơi rồi!" initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -12 }} animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: [0.65, 1.12, 1], rotate: [-8, 4, 0] }} transition={prefersReducedMotion ? { duration: 0.12 } : { duration: 0.65, delay: 0.18, ease: 'easeOut' }} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E5D3A6] bg-[#F5E8C8] px-2 py-1 text-[9px] font-bold text-[#A9552E] shadow-sm"><Sparkles size={11} />Tới nơi rồi!</motion.span>
            </div>
            <h2 className="mt-0.5 line-clamp-2 font-serif text-lg font-bold leading-tight">{stop.name}</h2>
            {stop.address && <p className="mt-1 truncate text-xs text-[#6E655B]">{stop.address}</p>}
          </div>
        </div>
        {(stop.bestTime || stop.photoTip) && <div className="mt-3 grid gap-2 rounded-2xl border border-[#E5DDCC] bg-white p-3 text-xs">
          {stop.bestTime && <p className="flex items-start gap-2"><Clock3 size={14} className="mt-0.5 shrink-0 text-[#C76B3C]" /><span><strong className="font-semibold">Giờ chụp:</strong> {stop.bestTime}</span></p>}
          {stop.photoTip && <p className="flex items-start gap-2"><Camera size={14} className="mt-0.5 shrink-0 text-[#C76B3C]" /><span><strong className="font-semibold">Góc chụp:</strong> {stop.photoTip}</span></p>}
        </div>}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#ECE4D0] px-3 py-2.5">
          <span className="text-sm font-bold">Đã đi {formattedDistance} km</span>
          <span className="text-xs font-medium text-[#6E655B]">~{Math.round(durationMinutes)} phút đạp xe</span>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}