import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  Compass,
  MessageCircle,
  RotateCw,
  Search,
  Sparkles,
  Film,
  Navigation
} from 'lucide-react';
import { useNearestLabs, type NearestFilmLab } from '../../hooks/useNearestLabs';
import type { FilmLab } from '../../data/filmLabsData';

interface NearestFilmShopsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterFilm?: string;
  onFlyToLab?: (lab: FilmLab) => void;
  selectedLabId?: string | null;
}

export const NearestFilmShopsDrawer: React.FC<NearestFilmShopsDrawerProps> = ({
  isOpen,
  onClose,
  filterFilm: initialFilterFilm,
  onFlyToLab,
  selectedLabId
}) => {
  const {
    labs,
    isLocating,
    isUsingFallback,
    filmFilter,
    setFilmFilter,
    requestLocation
  } = useNearestLabs(initialFilterFilm);

  const [searchQuery, setSearchQuery] = useState('');

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync film filter when prop changes
  useEffect(() => {
    if (initialFilterFilm) {
      setFilmFilter(initialFilterFilm);
    }
  }, [initialFilterFilm, setFilmFilter]);

  // Filter with additional text search query if any
  const displayedLabs = labs.filter((lab) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lab.name.toLowerCase().includes(q) ||
      lab.address.toLowerCase().includes(q) ||
      lab.district.toLowerCase().includes(q) ||
      lab.availableFilms.some((f) => f.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer container - 420px Dark Editorial Theme */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="nearest-labs-title"
            className="w-[420px] max-w-full fixed top-0 right-0 bottom-0 z-50 bg-[#E8DEC7] text-[#2C2621] border-l border-[#D8CFBD] shadow-2xl flex flex-col font-sans select-none"
          >
            {/* Header */}
            <div className="shrink-0 p-5 border-b border-[#D8CFBD] bg-[#FAF8F4]/95 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-amber-500">
                      Cẩm Nang Film · Hà Nội
                    </span>
                    <h2
                      id="nearest-labs-title"
                      className="text-lg font-bold text-[#2C2621] tracking-tight leading-snug"
                    >
                      Điểm Mua Film & Lab Gần Nhất
                    </h2>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng bảng tìm lab"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6E655B] hover:text-[#2C2621] hover:bg-[#ECE4D0] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Geolocation Status Banner & Refresh Button */}
              <div className="mt-3.5 flex items-center justify-between text-xs bg-[#F7F5F0] rounded-xl px-3 py-2 border border-[#D8CFBD]">
                <div className="flex items-center space-x-2 truncate">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isUsingFallback ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        isUsingFallback ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </span>
                  <span className="text-[#554D43] font-mono text-[11px] truncate">
                    {isUsingFallback
                      ? '📍 Tọa độ gốc: Hồ Gươm (Mặc định)'
                      : '📍 Vị trí GPS của bạn'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={isLocating}
                  title="Cập nhật lại GPS"
                  className="flex items-center space-x-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors shrink-0 disabled:opacity-50"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`}
                  />
                  <span>{isLocating ? 'Đang dò...' : 'Định vị lại'}</span>
                </button>
              </div>

              {/* Active Film Roll Filter Tag (if triggered from film card) */}
              {filmFilter && (
                <div className="mt-2.5 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-amber-300">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      Chỉ lọc lab còn sẵn:{' '}
                      <strong className="text-amber-200">{filmFilter}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilmFilter('')}
                    className="text-amber-400 hover:text-white p-0.5 rounded transition-colors ml-2 shrink-0 text-[11px] underline"
                  >
                    Bỏ lọc
                  </button>
                </div>
              )}

              {/* Search input for labs or film */}
              <div className="mt-3 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên lab, quận, dòng film..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D8CFBD] rounded-lg text-xs text-[#2C2621] placeholder:text-[#8C8377] focus:outline-none focus:border-[#C76B3C]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* List of Labs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#F7F5F0]">
              {displayedLabs.length === 0 ? (
                <div className="py-12 text-center text-[#8C8377] space-y-2">
                  <Film className="w-10 h-10 mx-auto text-[#8C8377]" />
                  <p className="text-sm font-medium text-[#554D43]">
                    Không tìm thấy Lab nào khớp
                  </p>
                  <p className="text-xs text-[#8C8377]">
                    Thử bỏ lọc loại cuộn film hoặc tìm từ khóa khác.
                  </p>
                  {filmFilter && (
                    <button
                      type="button"
                      onClick={() => setFilmFilter('')}
                      className="mt-2 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-md border border-amber-500/30 hover:bg-amber-500/20"
                    >
                      Xem tất cả Lab
                    </button>
                  )}
                </div>
              ) : (
                displayedLabs.map((lab) => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    isHighlighted={selectedLabId === lab.id}
                    activeFilmFilter={filmFilter}
                    onFlyToMap={() => onFlyToLab?.(lab)}
                  />
                ))
              )}
            </div>

            {/* Footer advice note */}
            <div className="shrink-0 p-3.5 border-t border-[#D8CFBD] bg-[#E8DEC7] text-[11px] text-[#6E655B] flex items-center justify-between">
              <span>💡 Nên liên hệ trước qua Zalo để check date & số lượng.</span>
              <span className="font-mono text-amber-500/80">
                {displayedLabs.length} địa điểm
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

interface LabCardProps {
  lab: NearestFilmLab;
  isHighlighted?: boolean;
  activeFilmFilter?: string;
  onFlyToMap: () => void;
}

const LabCard: React.FC<LabCardProps> = ({
  lab,
  isHighlighted,
  activeFilmFilter,
  onFlyToMap
}) => {
  return (
    <article
      className={`rounded-2xl p-4 transition-all duration-200 relative bg-white border ${
        lab.isNearest
          ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
          : isHighlighted
          ? 'border-[#C76B3C] bg-[#FAF8F4]'
          : 'border-[#E2DAD0] hover:border-[#D8CFBD]'
      }`}
    >
      {/* Top Header: Name, Distance & Nearest Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-[#2C2621] flex items-center space-x-1.5">
              <span>{lab.name}</span>
            </h3>
            {lab.isNearest && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-black shadow-xs">
                GẦN NHẤT
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#6E655B] mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#8C8377] shrink-0" />
            <span className="truncate max-w-[280px]" title={lab.address}>
              {lab.address}
            </span>
          </div>
        </div>

        {/* Distance Badge */}
        <div className="text-right shrink-0">
          <span
            className={`font-mono text-sm font-bold tabular-nums block ${
              lab.isNearest ? 'text-amber-400' : 'text-neutral-300'
            }`}
          >
            {lab.distanceFormatted}
          </span>
          <span className="text-[10px] text-[#8C8377] block uppercase font-mono">
            từ bạn
          </span>
        </div>
      </div>

      {/* Opening Hours & Fast service badge */}
      <div className="flex flex-wrap items-center gap-2 my-2.5 text-xs">
        <span className="flex items-center space-x-1 text-[#6E655B] bg-[#FAF8F4] px-2 py-1 rounded-md border border-[#D8CFBD]">
          <Clock className="w-3 h-3 text-[#8C8377]" />
          <span>{lab.openingHours}</span>
        </span>


      </div>

      {/* Available Films in Stock */}
      <div className="my-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6E655B] mb-1.5 flex items-center justify-between">
          <span>Film đang sẵn có tại tiệm:</span>
          {lab.priceRange && (
            <span className="text-[10px] text-[#8C8377]">{lab.priceRange}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {lab.availableFilms.map((film, idx) => {
            const isMatched =
              activeFilmFilter &&
              film.toLowerCase().includes(activeFilmFilter.toLowerCase());
            return (
              <span
                key={idx}
                className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                  isMatched
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-[#F3EAD7] text-[#8C4A1F] border border-[#DFCDB2]'
                }`}
              >
                {film}
              </span>
            );
          })}
        </div>
      </div>

      {/* 3 Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/70">
        {/* Button 1: Xem Map */}
        <button
          type="button"
          onClick={onFlyToMap}
          className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-[#ECE4D0] hover:bg-[#E0D5BE] text-[#554D43] text-xs font-semibold transition-colors border border-[#D0C4AA]"
          title="Bay camera Mapbox đến Lab này"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>Xem Map</span>
        </button>

        {/* Button 2: Chỉ đường */}
        <button
          type="button"
          onClick={() => window.open(lab.googleMapsUrl, '_blank')}
          className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-[#ECE4D0] hover:bg-[#E0D5BE] text-[#554D43] text-xs font-semibold transition-colors border border-[#D0C4AA]"
          title="Mở Google Maps chỉ đường"
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Chỉ đường</span>
        </button>

        {/* Button 3: Nhắn tiệm */}
        <button
          type="button"
          onClick={() => window.open(lab.zaloUrl || lab.fanpageUrl, '_blank')}
          className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-[#FAF0E4] hover:bg-[#F3EAD7] text-[#8C4A1F] text-xs font-semibold transition-colors border border-[#EAD3B9]"
          title="Nhắn Zalo hoặc Fanpage tiệm"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#C76B3C]" />
          <span>Nhắn tiệm</span>
        </button>
      </div>
    </article>
  );
};
