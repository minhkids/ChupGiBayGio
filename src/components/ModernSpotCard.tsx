import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Sparkles, MapPin } from 'lucide-react';
import type { Spot } from '../types';
import { getStatusBadgeInfo } from '../utils/season';

interface ModernSpotCardProps {
  spot: Spot;
  isSaved?: boolean;
  onToggleSave?: (spotId: string) => void;
  onSelectSpot: (spot: Spot) => void;
}

export const ModernSpotCard: React.FC<ModernSpotCardProps> = ({
  spot,
  isSaved = false,
  onToggleSave,
  onSelectSpot,
}) => {
  const statusInfo = getStatusBadgeInfo(spot.seasonalTrend.status, spot.seasonalTrend.daysLeftInPeak);

  return (
    <motion.article 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelectSpot(spot)}
      className="group relative flex flex-col bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer select-none"
    >
      {/* Khung ảnh tỷ lệ 4:5 tràn viền (Modern Curated Aesthetic) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <motion.img
          layoutId={`spot-cover-img-${spot.id}`}
          src={spot.coverImageUrl}
          alt={spot.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
          loading="lazy"
        />
        
        {/* Subtle cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 pointer-events-none" />

        {/* Badge trạng thái kính mờ (Frosted glass) */}
        <div className="absolute top-3.5 left-3.5 backdrop-blur-md bg-black/40 border border-white/20 text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${
            spot.seasonalTrend.status === 'PEAK' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`} />
          <span>{statusInfo.label}</span>
          {spot.seasonalTrend.bloomPercentage && (
            <span className="opacity-80 pl-1 border-l border-white/30 text-[10px]">
              {spot.seasonalTrend.bloomPercentage}%
            </span>
          )}
        </div>

        {/* Save / Bookmark Button */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(spot.id);
            }}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full backdrop-blur-md bg-black/40 border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90"
            title={isSaved ? 'Bỏ lưu' : 'Lưu địa điểm'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </button>
        )}

        {/* Bảng màu trang phục gợi ý (Glassmorphism Pill) */}
        {spot.colorPalette && spot.colorPalette.length > 0 && (
          <div className="absolute bottom-3.5 right-3.5 backdrop-blur-md bg-black/45 px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-white/15 shadow-sm">
            <span className="text-[10px] text-white/80 mr-1 font-mono">Palette</span>
            {spot.colorPalette.slice(0, 4).map((color, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-white/40 inline-block shadow-2xs"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Best time badge */}
        <div className="absolute bottom-3.5 left-3.5 text-white/90 text-[11px] font-mono flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="line-clamp-1">{spot.bestTimeDescription}</span>
        </div>
      </div>

      {/* Nội dung thông tin tối giản */}
      <div className="p-4 sm:p-5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-mono">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-neutral-400" />
            {spot.address.split(',').slice(-2).join(',')}
          </span>
          <span className="text-neutral-600 dark:text-neutral-300 font-semibold">{spot.ticketPriceRange}</span>
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 transition-colors tracking-tight line-clamp-1">
          {spot.name}
        </h3>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {spot.seasonalTrend.trendTitle} — {spot.description}
        </p>

        {/* Lens info chip */}
        <div className="pt-2 mt-1 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>{spot.recommendedLenses[0] || 'Lens tiêu chuẩn'}</span>
          <span className="text-amber-600 font-medium group-hover:translate-x-0.5 transition-transform">
            Xem hồ sơ →
          </span>
        </div>
      </div>
    </motion.article>
  );
};
