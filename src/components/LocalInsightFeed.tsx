import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Tag, MapPin, Clock, Navigation, Sparkles } from 'lucide-react';
import type { InsightCategory } from '../types';
import { INSIGHT_CATEGORIES, type RankedInsight } from '../data/localInsights';

const CATEGORY_ICON: Record<InsightCategory, string> = {
  FILM: '🎞️',
  LAB: '🧪',
  OUTFIT: '👗',
  RENTAL: '📷',
  PROP: '🌼',
};

interface LocalInsightFeedProps {
  insights: RankedInsight[];
  compact?: boolean;
  onResetFilters?: () => void;
}

const openPlaceInMaps = (placeName: string, areaLabel: string) => {
  const q = encodeURIComponent(`${placeName} ${areaLabel}`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener,noreferrer');
};

interface InsightCategoryChipsProps {
  value: 'ALL' | InsightCategory;
  onChange: (value: 'ALL' | InsightCategory) => void;
  className?: string;
}

export const InsightCategoryChips: React.FC<InsightCategoryChipsProps> = ({
  value,
  onChange,
  className = '',
}) => (
  <div className={`flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 ${className}`}>
    {INSIGHT_CATEGORIES.map(cat => (
      <button
        key={cat.id}
        type="button"
        onClick={() => onChange(cat.id)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
          value === cat.id
            ? 'bg-terracotta text-white font-bold shadow-sm'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        {cat.label}
      </button>
    ))}
  </div>
);

export const LocalInsightFeed: React.FC<LocalInsightFeedProps> = ({
  insights,
  compact = false,
  onResetFilters,
}) => {
  if (insights.length === 0) {
    return (
      <div className="py-12 text-center space-y-2 text-neutral-500">
        <Sparkles className="w-8 h-8 text-neutral-300 mx-auto" />
        <p className="font-editorial text-base">Chưa có ưu đãi nào cho khu vực này</p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-mono-spec font-bold text-terracotta hover:underline"
          >
            Xem tất cả ưu đãi
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-3.5'}>
      {insights.map(item => {
        const isDeal = item.kind === 'DEAL';
        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-850/80 hover:border-terracotta/60 transition-all space-y-2.5 shadow-xs"
          >
            {/* Header: loại + độ hot */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono-spec font-bold uppercase px-2 py-0.5 rounded-full ${
                    isDeal
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                  }`}
                >
                  {isDeal ? <Tag className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                  {isDeal ? 'Ưu đãi' : 'Đang hot'}
                </span>
                {item.isNearSelected && (
                  <span className="text-[10px] font-mono-spec font-bold px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta truncate">
                    Gần điểm đang chọn
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono-spec text-neutral-400 shrink-0">
                {CATEGORY_ICON[item.category]}{' '}
                {INSIGHT_CATEGORIES.find(c => c.id === item.category)?.label.replace(/^\S+\s/, '')}
              </span>
            </div>

            {/* Tiêu đề + mô tả */}
            <div>
              <h4 className="font-editorial text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-1 line-clamp-3">
                {item.detail}
              </p>
            </div>

            {/* Giá */}
            {(item.priceNow || item.discountLabel) && (
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                {item.priceNow && (
                  <span className="text-base font-bold text-terracotta font-mono-spec">{item.priceNow}</span>
                )}
                {item.priceOld && (
                  <span className="text-xs text-neutral-400 line-through font-mono-spec">{item.priceOld}</span>
                )}
                {item.discountLabel && (
                  <span className="text-[10px] font-mono-spec font-bold px-1.5 py-0.5 rounded bg-terracotta text-white">
                    {item.discountLabel}
                  </span>
                )}
              </div>
            )}

            {/* Địa điểm + hiệu lực + chỉ đường */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="min-w-0 space-y-0.5">
                <div className="text-[11px] font-medium text-neutral-700 dark:text-neutral-200 flex items-center truncate">
                  <MapPin className="w-3 h-3 text-terracotta mr-1 shrink-0" />
                  <span className="truncate">{item.placeName}</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono-spec truncate">
                  {item.areaLabel}
                  {item.validNote && (
                    <>
                      {' · '}
                      <Clock className="w-2.5 h-2.5 inline -mt-0.5" /> {item.validNote}
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openPlaceInMaps(item.placeName, item.areaLabel)}
                className="text-xs font-semibold text-terracotta hover:underline flex items-center gap-1 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                Chỉ đường
              </button>
            </div>

            {item.sourceLabel && (
              <div className="text-[9px] font-mono-spec text-neutral-400 uppercase tracking-wider">
                {item.sourceLabel}
              </div>
            )}
          </motion.article>
        );
      })}
    </div>
  );
};
