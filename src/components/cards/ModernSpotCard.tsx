import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Sparkles, MapPin } from 'lucide-react';
import type { Spot } from '../../types';
import { getStatusBadgeInfo } from '../../utils/season';
import { PinReferenceButton } from '../planner/PinReferenceButton';

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
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-[#E2DAD0] shadow-[0_4px_20px_rgba(44,38,33,0.04)] hover:shadow-[0_8px_30px_rgba(44,38,33,0.08)] transition-all cursor-pointer select-none"
    >
      {/* Khung ảnh tỷ lệ 4:5 tràn viền (Modern Curated Aesthetic) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EFE9DF] border-b border-[#EFE9DF]">
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
        <div className="absolute top-3.5 left-3.5 bg-[#FAF0E4]/95 border border-[#EAD3B9] text-[#A64B1E] text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${
            spot.seasonalTrend.status === 'PEAK' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`} />
          <span>{statusInfo.label}</span>
          {spot.seasonalTrend.bloomPercentage && (
            <span className="opacity-90 pl-1 border-l border-[#DFCDB2] text-[10px]">
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
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#FAF8F4]/95 border border-[#D8CFBD] text-[#554D43] flex items-center justify-center hover:bg-white transition-transform active:scale-90 z-20 cursor-pointer"
            title={isSaved ? 'Bỏ lưu' : 'Lưu địa điểm'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C76B3C] text-[#C76B3C]' : 'text-[#554D43]'}`} />
          </button>
        )}

        {/* Pin Reference Button */}
        <PinReferenceButton
          imageUrl={spot.coverImageUrl}
          label={spot.name}
          className="absolute top-3.5 right-13"
        />

        {/* Bảng màu trang phục gợi ý (Glassmorphism Pill) */}
        {spot.colorPalette && spot.colorPalette.length > 0 && (
          <div className="absolute bottom-3.5 right-3.5 backdrop-blur-md bg-[#FAF8F4]/95 px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-[#D8CFBD] shadow-sm">
            <span className="text-[10px] text-[#554D43] mr-1 font-mono">Palette</span>
            {spot.colorPalette.slice(0, 4).map((color, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-[#D8CFBD] inline-block shadow-2xs"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Best time badge */}
        <div className="absolute bottom-3.5 left-3.5 text-white text-[11px] font-mono flex items-center gap-1 drop-shadow">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span className="line-clamp-1">{spot.bestTimeDescription}</span>
        </div>
      </div>

      {/* Nội dung thông tin tối giản */}
      <div className="p-4 sm:p-5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-[#8C8377] font-mono">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-neutral-400" />
            {spot.address.split(',').slice(-2).join(',')}
          </span>
          <span className="text-[#6E655B] font-semibold">{spot.ticketPriceRange}</span>
        </div>

        <h3 className="text-base font-bold text-[#2C2621] group-hover:text-[#C76B3C] transition-colors tracking-tight leading-snug line-clamp-1">
          {spot.name}
        </h3>

        <p className="text-xs text-[#6E655B] line-clamp-2 leading-relaxed">
          {spot.seasonalTrend.trendTitle} — {spot.description}
        </p>

        {/* Lens info chip */}
        <div className="pt-2 mt-1 border-t border-[#EFE9DF] flex items-center justify-between text-[11px] font-mono text-[#8C8377]">
          <span>{spot.recommendedLenses[0] || 'Lens tiêu chuẩn'}</span>
          <span className="text-[#C76B3C] text-xs font-bold group-hover:translate-x-0.5 transition-transform">
            Xem hồ sơ →
          </span>
        </div>
      </div>
    </motion.article>
  );
};
