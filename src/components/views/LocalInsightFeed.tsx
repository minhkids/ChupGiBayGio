import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Tag, MapPin, Clock, Navigation, Sparkles, ShoppingBag } from 'lucide-react';
import type { InsightCategory, PostOutfit } from '../../types';
import { INSIGHT_CATEGORIES, type RankedInsight } from '../../data/localInsights';
import { OutfitTapToShopModal } from '../outfit/OutfitTapToShopModal';
import { buildShopeeSearchUrl, buildTikTokShopSearchUrl } from '../../data/mockOutfits';

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
  const [modalOutfit, setModalOutfit] = useState<PostOutfit | null>(null);

  if (insights.length === 0) {
    return (
      <div className="py-12 text-center space-y-2 text-neutral-500">
        <Sparkles className="w-8 h-8 text-neutral-300 mx-auto" />
        <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">Chưa có thông tin cho khu vực này</p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            Xem lại tất cả
          </button>
        )}
      </div>
    );
  }

  const handleOpenTapToShop = (item: RankedInsight) => {
    const isOutfit = item.category === 'OUTFIT' || item.category === 'PROP';
    const query = item.title;
    const outfitData: PostOutfit = {
      id: `outfit-${item.id}`,
      postId: item.id,
      spotId: undefined,
      imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      itemName: item.title,
      category: isOutfit ? 'AO_DAI' : 'PROP',
      color: 'Chuẩn phong cách check-in',
      style: 'Xu hướng chụp ảnh đang rộ',
      xPercent: 50,
      yPercent: 50,
      searchQuery: query,
      priceEstimate: item.priceNow || '250.000đ - 450.000đ',
      shopeeUrl: buildShopeeSearchUrl(query),
      tiktokUrl: buildTikTokShopSearchUrl(query),
      similarItems: [
        {
          id: `sim-${item.id}-1`,
          name: `${item.title} (Phiên bản dáng suông)`,
          priceEstimate: item.priceNow || '280.000đ',
          shopeeUrl: buildShopeeSearchUrl(`${query} dáng suông`),
          tiktokUrl: buildTikTokShopSearchUrl(`${query} dáng suông`),
          matchScore: 92,
        },
        {
          id: `sim-${item.id}-2`,
          name: `${item.title} (Phong cách vintage retro)`,
          priceEstimate: item.priceNow || '320.000đ',
          shopeeUrl: buildShopeeSearchUrl(`${query} vintage`),
          tiktokUrl: buildTikTokShopSearchUrl(`${query} vintage`),
          matchScore: 88,
        }
      ],
      aiNotes: item.detail,
    };

    setModalOutfit(outfitData);
  };

  return (
    <>
      <div className={compact ? 'space-y-2.5' : 'space-y-3.5'}>
        {insights.map(item => {
          const isDeal = item.kind === 'DEAL';
          const isOutfitOrProp = item.category === 'OUTFIT' || item.category === 'PROP';
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-850/80 hover:border-terracotta/40 hover:shadow-md transition-all space-y-2.5 shadow-xs"
            >
              {/* Header: loại + độ hot */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isDeal
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                        : 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60'
                    }`}
                  >
                    {isDeal ? <Tag className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                    {isDeal ? 'Ưu đãi' : 'Đang hot'}
                  </span>
                  {item.isNearSelected && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20 truncate">
                      Gần điểm đang chọn
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-400 font-medium shrink-0">
                  {CATEGORY_ICON[item.category]}{' '}
                  {INSIGHT_CATEGORIES.find(c => c.id === item.category)?.label.replace(/^\S+\s/, '')}
                </span>
              </div>

              {/* Tiêu đề + mô tả */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-1 line-clamp-3">
                  {item.detail}
                </p>
              </div>

              {/* Giá + Nút Bóc Set Đồ (Tap-to-Shop) */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                {(item.priceNow || item.discountLabel) && (
                  <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                    {item.priceNow && (
                      <span className="text-base font-bold text-terracotta tabular-nums">{item.priceNow}</span>
                    )}
                    {item.priceOld && (
                      <span className="text-xs text-neutral-400 line-through tabular-nums">{item.priceOld}</span>
                    )}
                    {item.discountLabel && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-terracotta text-white shadow-xs">
                        {item.discountLabel}
                      </span>
                    )}
                  </div>
                )}

                {isOutfitOrProp && (
                  <button
                    type="button"
                    onClick={() => handleOpenTapToShop(item)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EE4D2D]/10 hover:bg-[#EE4D2D] text-[#EE4D2D] hover:text-white text-xs font-bold transition-all ml-auto"
                    title="Bóc set đồ & tìm trên Shopee / TikTok Shop"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Bóc set đồ</span>
                  </button>
                )}
              </div>

              {/* Địa điểm + hiệu lực + chỉ đường */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center truncate">
                    <MapPin className="w-3.5 h-3.5 text-terracotta mr-1 shrink-0" />
                    <span className="truncate">{item.placeName}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
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
                  className="text-xs font-semibold text-terracotta hover:text-terracotta-dark hover:underline flex items-center gap-1 shrink-0 py-1 px-2 rounded-lg hover:bg-terracotta/5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Chỉ đường
                </button>
              </div>

              {item.sourceLabel && (
                <div className="text-[11px] text-neutral-400 font-medium">
                  Nguồn: {item.sourceLabel}
                </div>
              )}
            </motion.article>
          );
        })}
      </div>

      {/* Modal Bóc Set Đồ Tap-to-Shop */}
      <OutfitTapToShopModal
        outfit={modalOutfit}
        isOpen={Boolean(modalOutfit)}
        onClose={() => setModalOutfit(null)}
      />
    </>
  );
};
