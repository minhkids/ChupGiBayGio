import { 
  MapPin, 
  Sun, 
  Navigation,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Spot } from '../../types';
import { getStatusBadgeInfo } from '../../utils/season';
import { formatDistance } from '../../utils/geo';
import { cameraSpring } from '../../utils/motion-tokens';
import { AnimatedBookmark } from '../animations/AnimatedBookmark';

interface SpotCardProps {
  spot: Spot;
  isSaved: boolean;
  onToggleSave: (spotId: string) => void;
  onSelectSpot: (spot: Spot) => void;
  className?: string;
}

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  isSaved,
  onToggleSave,
  onSelectSpot,
  className = ''
}) => {
  const statusInfo = getStatusBadgeInfo(
    spot.seasonalTrend?.status || 'PEAK',
    spot.seasonalTrend?.daysLeftInPeak || 0
  );

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      transition={cameraSpring.tactile}
      onClick={() => onSelectSpot(spot)}
      className={`group bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-terracotta/60 dark:hover:border-terracotta/60 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col ${className}`}
    >
      {/* 1. ẢNH LỚN TRÀN VIỀN (h-44 w-full) - TÔN VINH GÓC CHỤP NHIẾP ẢNH */}
      <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        <img 
          src={spot.coverImageUrl} 
          alt={spot.name} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Badge kính mờ tinh tế nổi góc trên bên trái */}
        <div className="absolute top-3 left-3 backdrop-blur-md bg-black/40 border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor} animate-pulse`} />
          <span>{statusInfo.label}</span>
          {spot.seasonalTrend?.bloomPercentage && (
            <span className="text-xs text-white/80 font-mono-spec">· {spot.seasonalTrend.bloomPercentage}%</span>
          )}
        </div>

        {/* Nút lưu góc chụp nổi góc trên bên phải */}
        <div className="absolute top-3 right-3 z-10">
          <AnimatedBookmark
            isSaved={isSaved}
            onToggle={() => onToggleSave(spot.id)}
          />
        </div>

        {/* Distance Badge if available */}
        {spot.distanceKm !== undefined && (
          <div className="absolute bottom-2.5 left-3 backdrop-blur-md bg-neutral-900/75 text-white border border-white/10 text-xs font-mono-spec font-semibold px-2.5 py-0.5 rounded-full flex items-center">
            <Navigation className="w-3 h-3 mr-1 text-terracotta" />
            <span>Cách {formatDistance(spot.distanceKm)}</span>
          </div>
        )}
      </div>

      {/* 2. THÔNG TIN CHI TIẾT ĐỦ KHÔNG GIAN THỞ (P-4 FLEX FLEX-COL GAP-2) */}
      <div className="p-5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="font-semibold text-terracotta dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md text-xs font-mono-spec uppercase tracking-wider truncate max-w-[240px]">
            {spot.seasonalTrend?.trendTitle || 'Mùa thu Hà Nội'}
          </span>
          <span className="text-xs font-mono-spec text-neutral-500 dark:text-neutral-400 flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3 text-neutral-400" />
            {spot.recommendedLenses[0]?.split(' ')[0] || '35mm'}
          </span>
        </div>

        {/* Tiêu đề hiển thị trọn vẹn 2 dòng - KHÔNG bị cắt cụt */}
        <h3 className="font-editorial text-lg sm:text-xl font-bold text-neutral-900 dark:text-white group-hover:text-terracotta transition-colors line-clamp-2 leading-snug">
          {spot.name}
        </h3>

        {/* Địa chỉ cụ thể */}
        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="truncate">{spot.address}</span>
        </p>

        {/* Thông số giờ vàng & vé vào cửa */}
        <div className="mt-1 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 text-sm font-mono-spec text-neutral-600 dark:text-neutral-300">
          <span className="flex items-center gap-1.5 truncate min-w-0">
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <strong className="font-semibold truncate">{spot.bestTimeDescription}</strong>
          </span>

          <span className={`font-bold text-xs shrink-0 ${spot.costType === 'FREE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
            {spot.costType === 'FREE' ? 'Miễn phí vé' : spot.ticketPriceRange}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
