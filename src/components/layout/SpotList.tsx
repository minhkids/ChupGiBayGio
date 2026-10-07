import { PinReferenceButton } from '../planner/PinReferenceButton';
import React from 'react';
import { Bookmark, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Spot } from '../../types';
import { getStatusBadgeInfo } from '../../utils/season';
import type { SpotListProps } from './shared-types';

interface SpotItemProps {
  spot: Spot;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: () => void;
  onToggleSave: (e: React.MouseEvent) => void;
  onGetDirections: (e: React.MouseEvent) => void;
  index: number;
}

const SpotItem: React.FC<SpotItemProps> = ({
  spot,
  isSelected,
  isSaved,
  onSelect,
  onToggleSave,
  onGetDirections,
  index,
}) => {
  const statusInfo = getStatusBadgeInfo(spot.seasonalTrend?.status || 'PEAK', spot.seasonalTrend?.daysLeftInPeak || 0);

  return (
    <motion.div
      key={spot.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onSelect}
      className={`
        p-3.5 rounded-xl border flex space-x-3 transition-colors cursor-pointer
        ${isSelected
          ? 'bg-[#FAF8F4] border-[#C76B3C] shadow-md ring-1 ring-[#C76B3C]/30'
          : 'bg-[#FAF8F4] border-[#D8CFBD] hover:border-[#C9BDA8]'
        }
      `}
    >
      <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
        <img
          src={spot.coverImageUrl}
          alt={spot.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
          <PinReferenceButton imageUrl={spot.coverImageUrl} label={spot.name} />
        <span className={`absolute top-0.5 left-0.5 text-[8px] font-mono-spec font-bold px-1 py-0.2 rounded ${statusInfo.classNames}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="text-[10px] font-mono-spec text-terracotta uppercase font-bold truncate">
            {spot.seasonalTrend?.trendTitle}
          </div>
          <h4 className="font-editorial text-sm font-bold text-[#2C2621] truncate">
            {spot.name}
          </h4>
          <p className="text-xs text-[#6E655B] truncate mt-0.5">
            {spot.address}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono-spec text-neutral-400 pt-1">
          <span>{spot.distanceKm ? `${spot.distanceKm.toFixed(1)} km` : 'Hà Nội'}</span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={onToggleSave}
              className="p-1 hover:text-terracotta"
              aria-label={isSaved ? 'Bỏ lưu' : 'Lưu địa điểm'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-terracotta fill-terracotta' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onGetDirections}
              className="p-1 hover:text-terracotta"
              aria-label="Chỉ đường"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SpotList: React.FC<SpotListProps> = ({
  spots,
  selectedSpot,
  savedSpotIds,
  callbacks,
  className = '',
  renderItem,
}) => {
  const { onSelectSpot, onToggleSave, handleOpenDirections } = callbacks;

  if (spots.length === 0) {
    return (
      <div className={`py-12 text-center space-y-2 text-neutral-500 ${className}`}>
        <div className="w-8 h-8 text-neutral-300 mx-auto" />
        <p className="font-editorial text-base">Không tìm thấy địa điểm phù hợp</p>
        <button
          type="button"
          onClick={callbacks.onResetFilters}
          className="text-xs font-mono-spec font-bold text-terracotta hover:underline"
        >
          Xóa bộ lọc để xem lại
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {spots.map((spot, idx) => {
        const isSelected = selectedSpot?.id === spot.id;
        const isSaved = savedSpotIds.includes(spot.id);

        if (renderItem) {
          return (
            <React.Fragment key={spot.id}>
              {renderItem(spot, idx, isSelected)}
            </React.Fragment>
          );
        }

        return (
          <SpotItem
            key={spot.id}
            spot={spot}
            isSelected={isSelected}
            isSaved={isSaved}
            onSelect={() => onSelectSpot(spot)}
            onToggleSave={(e) => { e.stopPropagation(); onToggleSave(spot.id); }}
            onGetDirections={(e) => { e.stopPropagation(); handleOpenDirections(spot); }}
            index={idx}
          />
        );
      })}
    </div>
  );
};