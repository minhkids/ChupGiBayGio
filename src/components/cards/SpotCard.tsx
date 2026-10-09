import { 
  MapPin, 
  Sun, 
  Navigation,
  Tag,
  ClipboardList,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Spot } from '../../types';
import { getStatusBadgeInfo } from '../../utils/season';
import { formatDistance } from '../../utils/geo';
import { cameraSpring } from '../../utils/motion-tokens';
import { AnimatedBookmark } from '../animations/AnimatedBookmark';
import { useShootPlan } from '../../context/ShootPlanContext';
import { PinReferenceButton } from '../planner/PinReferenceButton';

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
  const shootPlan = useShootPlan();
  const isPlanned = shootPlan?.isSpotPlanned(spot.id) ?? false;
  const statusInfo = getStatusBadgeInfo(
    spot.seasonalTrend,
    spot.seasonalTrend?.daysLeftInPeak || 0
  );

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      transition={cameraSpring.tactile}
      onClick={() => onSelectSpot(spot)}
      className={`group bg-white rounded-3xl border border-[#E2DAD0] hover:border-[#D8CFBD] shadow-[0_4px_20px_rgba(44,38,33,0.04)] hover:shadow-[0_8px_30px_rgba(44,38,33,0.08)] transition-all duration-200 overflow-hidden cursor-pointer flex flex-col ${className}`}
    >
      {/* 1. ẢNH LỚN TRÀN VIỀN (h-44 w-full) - TÔN VINH GÓC CHỤP NHIẾP ẢNH */}
      <div className="relative h-48 w-full bg-[#EFE9DF] overflow-hidden border-b border-[#EFE9DF]">
        <img 
                  src={spot.coverImageUrl} 
                  alt={spot.name} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                  <PinReferenceButton imageUrl={spot.coverImageUrl} label={spot.name} className="absolute bottom-2 left-2" />
        
        {/* Badge kính mờ tinh tế nổi góc trên bên trái */}
        <div className="absolute top-3 left-3 backdrop-blur-md bg-black/40 border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor} animate-pulse`} />
          <span>{statusInfo.label}</span>
          {spot.seasonalTrend?.bloomPercentage && (
            <span className="text-xs text-white/80 font-mono-spec">· {spot.seasonalTrend.bloomPercentage}%</span>
          )}
        </div>

        {/* Nút thao tác nổi góc trên bên phải: + Kế hoạch & Lưu */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              shootPlan?.toggleSpot(spot);
            }}
            className={`h-8 px-2.5 rounded-full backdrop-blur-md border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
              isPlanned
                ? 'bg-amber-400 text-neutral-950 border-amber-300 font-bold'
                : 'bg-black/45 border-white/20 text-white hover:bg-black/65 hover:border-amber-400/50'
            }`}
            title={isPlanned ? 'Đã trong kế hoạch (Bấm để xóa)' : 'Thêm vào Kế hoạch & Dự toán chi phí'}
          >
            {isPlanned ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="text-[11px]">Đã lên lịch</span>
              </>
            ) : (
              <>
                <ClipboardList className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px]">+ Kế hoạch</span>
              </>
            )}
          </button>

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
        <div className="flex items-center justify-between text-xs text-[#8C8377]">
          <span className="font-semibold text-terracotta dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md text-xs font-mono-spec uppercase tracking-wider truncate max-w-[240px]">
            {spot.seasonalTrend?.trendTitle || 'Mùa thu Hà Nội'}
          </span>
          <span className="text-[11px] font-mono-spec text-[#8C8377] flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3 text-neutral-400" />
            {spot.recommendedLenses[0]?.split(' ')[0] || '35mm'}
          </span>
        </div>

        {/* Tiêu đề hiển thị trọn vẹn 2 dòng - KHÔNG bị cắt cụt */}
        <h3 className="font-editorial text-base font-bold text-[#2C2621] group-hover:text-[#C76B3C] transition-colors line-clamp-2 leading-snug">
          {spot.name}
        </h3>

        {/* Địa chỉ cụ thể */}
        <p className="text-xs text-[#6E655B] flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="truncate">{spot.address}</span>
        </p>

        {/* Thông số giờ vàng & vé vào cửa */}
        <div className="mt-1 pt-3 border-t border-[#EFE9DF] flex items-center justify-between gap-3 text-[11px] font-mono-spec text-[#8C8377]">
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
