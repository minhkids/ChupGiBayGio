import { Bike, Download, Expand, RectangleVertical, RotateCcw, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type StoryStatus = 'loading' | 'intro' | 'playing' | 'paused' | 'arrived' | 'error';

interface StoryPlayerControlsProps {
  status: StoryStatus;
  progress: number;
  isVertical: boolean;
  onReplay: () => void;
  onToggleVertical: () => void;
  onExport: () => void;
  onClose: () => void;
  exporting: boolean;
  error?: string | null;
}

export function StoryPlayerControls({ status, progress, isVertical, onReplay, onToggleVertical, onExport, onClose, exporting, error }: StoryPlayerControlsProps) {
  const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const prefersReducedMotion = useReducedMotion();
  const bikeAnimation = prefersReducedMotion ? { y: 0, rotate: 0, scale: 1 } : status === 'playing' ? { y: [0, -2, 0], rotate: [0, -5, 2, 0], scale: [1, 1.08, 1] } : status === 'arrived' ? { scale: [1, 1.24, 1], rotate: [0, -8, 0] } : { y: 0, rotate: 0, scale: 1 };
  return (
    <div className="fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-[min(760px,calc(100vw-24px))] rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4]/95 p-3 text-[#2C2621] shadow-2xl backdrop-blur-md" role="toolbar" aria-label="Điều khiển hành trình đạp xe">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold">
          <motion.span data-testid="player-bike-motion" className="shrink-0 text-[#C76B3C]" animate={bikeAnimation} transition={{ duration: status === 'playing' && !prefersReducedMotion ? 0.95 : 0.55, repeat: status === 'playing' && !prefersReducedMotion ? Infinity : 0, ease: 'easeInOut' }}><Bike size={16} /></motion.span>
          <span className="truncate">{error || (status === 'loading' ? 'Đang tìm tuyến xe đạp…' : status === 'intro' ? 'Bắt đầu hành trình' : status === 'playing' ? 'Đang đạp xe' : status === 'paused' ? 'Đã tạm dừng' : status === 'arrived' ? 'Đã đến nơi' : 'Hành trình')}</span>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-[#8C8377]" aria-live="polite">{percent}%</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#E5DDCC]" aria-hidden="true"><div className="h-full rounded-full bg-[#C76B3C] transition-[width] duration-150" style={{ width: `${percent}%` }} /></div>
      <div className="grid grid-cols-4 gap-2">
        <button type="button" onClick={onReplay} aria-label="Phát lại" className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#D8CFBD] bg-white px-2 text-xs font-semibold hover:border-[#C76B3C] hover:text-[#A9552E]"><RotateCcw size={15} /> <span className="hidden sm:inline">Phát lại</span><span className="sm:hidden">Lại</span></button>
        <button type="button" onClick={onToggleVertical} aria-label={isVertical ? 'Tỷ lệ: Toàn màn hình' : 'Tỷ lệ: Dọc 9:16'} className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#D8CFBD] bg-white px-2 text-xs font-semibold hover:border-[#C76B3C] hover:text-[#A9552E]">{isVertical ? <Expand size={15} /> : <RectangleVertical size={15} />}<span className="hidden sm:inline">{isVertical ? 'Toàn màn hình' : 'Dọc 9:16'}</span></button>
        <button type="button" onClick={onExport} aria-label={exporting ? 'Đang xuất video…' : 'Xuất Video Story'} disabled={exporting || status === 'loading' || status === 'error'} className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#C76B3C] px-2 text-xs font-bold text-white hover:bg-[#A9552E] disabled:cursor-wait disabled:opacity-50"><Download size={15}/><span className="hidden sm:inline">{exporting ? 'Đang xuất…' : 'Xuất Video Story'}</span><span className="sm:hidden">{exporting ? 'Xuất…' : 'Xuất'}</span></button>
        <button type="button" onClick={onClose} aria-label="Đóng" className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#D8CFBD] bg-white px-2 text-xs font-semibold hover:border-[#C76B3C] hover:text-[#A9552E]"><X size={15}/><span className="hidden sm:inline">Đóng</span></button>
      </div>
    </div>
  );
}