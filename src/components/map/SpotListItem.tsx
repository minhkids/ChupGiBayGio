import React, { useState } from 'react';
import { Navigation, Bookmark } from 'lucide-react';
import type { Spot } from '../../types';
import { getStatusBadgeInfo } from '../../utils/season';

interface SpotListItemProps {
  spot: Spot;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: () => void;
  onToggleSave: (spotId: string) => void;
}

export const SpotListItem: React.FC<SpotListItemProps> = ({
  spot,
  isSelected,
  isSaved,
  onSelect,
  onToggleSave,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const statusInfo = getStatusBadgeInfo(
    spot.seasonalTrend?.status || 'PEAK',
    spot.seasonalTrend?.daysLeftInPeak || 0
  );

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl p-2.5 transition-all cursor-pointer border flex space-x-3 ${
        isSelected
          ? 'bg-amber-50/70 dark:bg-neutral-800/90 border-terracotta shadow-md ring-1 ring-terracotta/40'
          : 'bg-white dark:bg-neutral-850/70 border-neutral-200/70 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm'
      }`}
    >
      {/* Photo Thumbnail (3:2 Ratio) */}
      <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
        {!imageFailed ? <img
          src={spot.coverImageUrl}
          alt={spot.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
          : <div role="img" aria-label={`Không tải được ảnh: ${spot.name}`} className="absolute inset-0 flex items-center justify-center bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            <Navigation className="h-5 w-5 opacity-50" aria-hidden="true" />
          </div>}

        {/* Glassmorphism Status Badge */}
        <span className="absolute top-1 left-1 text-[10px] font-mono-spec font-bold px-2 py-0.5 rounded-full backdrop-blur-md bg-black/40 text-white border border-white/20 shadow-sm">
          {statusInfo.label}
        </span>

        {/* Bookmark Overlay on Image */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(spot.id);
          }}
          className={`absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            isSaved
              ? 'bg-terracotta/90 text-white shadow-sm'
              : 'bg-black/30 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-black/50'
          }`}
          title={isSaved ? 'Bỏ lưu' : 'Lưu điểm chụp'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Spot Metadata */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="text-[10px] font-mono-spec text-terracotta uppercase tracking-wider font-bold truncate">
            {spot.seasonalTrend?.trendTitle}
          </div>

          <h3 className="font-editorial text-sm font-bold text-neutral-900 dark:text-white mt-0.5 group-hover:text-terracotta transition-colors line-clamp-2 leading-snug">
            {spot.name}
          </h3>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            {spot.address}
          </p>
        </div>

        {/* Bottom Micro Bar: Distance */}
        <div className="flex items-center text-[11px] font-mono-spec text-neutral-500 pt-1">
          <Navigation className="w-3 h-3 mr-1 text-neutral-400" />
          <span>{spot.distanceKm ? `${spot.distanceKm} km` : 'Hà Nội'}</span>
        </div>
      </div>
    </div>
  );
};
