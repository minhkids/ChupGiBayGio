import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Bookmark, Share2, Flag, ExternalLink, Camera, Clock, Sparkles, X } from 'lucide-react';
import type { Spot } from '../../types';
import { getStatusBadgeInfo } from '../../utils/season';
import type { LayoutCallbacks, SharedUIState } from './shared-types';

interface MobileSheetProps {
  spot: Spot | null;
  savedSpotIds: string[];
  callbacks: LayoutCallbacks;
  uiState: Pick<SharedUIState, 'detailTab' | 'activePhotoIdx' | 'setDetailTab' | 'setActivePhotoIdx'>;
  onClose: () => void;
  className?: string;
}

export const MobileSheet: React.FC<MobileSheetProps> = ({
  spot,
  savedSpotIds,
  callbacks,
  uiState,
  onClose,
  className = '',
}) => {
  if (!spot) return null;

  const { activePhotoIdx, setActivePhotoIdx } = uiState;
  const statusInfo = getStatusBadgeInfo(spot.seasonalTrend?.status || 'PEAK', spot.seasonalTrend?.daysLeftInPeak || 0);

  const handleClose = () => {
    onClose();
  };

  const handleOpenPoseCamera = () => {
    // TODO: Connect to pose camera when available
    console.log('Open pose camera for spot:', spot.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className={`
          lg:hidden fixed inset-x-0 bottom-0 z-[var(--z-sheet)]
          bg-white dark:bg-neutral-900
          border-t border-neutral-200/80 dark:border-neutral-800
          rounded-t-3xl shadow-2xl max-h-[var(--sheet-max-height)]
          flex flex-col overflow-hidden pb-safe ${className}
        `}
      >
        {/* Mobile Detail Drag Handle & Dismiss Header */}
        <div className="relative pt-2 pb-1 flex flex-col items-center shrink-0 border-b border-neutral-100 dark:border-neutral-800">
          <div className="w-10 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mb-1" />

          <div className="w-full px-4 py-1 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-mono-spec font-bold text-terracotta uppercase block truncate">
                {spot.seasonalTrend?.trendTitle}
              </span>
              <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-white truncate">
                {spot.name}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Ghost Pose Camera launcher (temporarily disabled)
              <button
                type="button"
                onClick={handleOpenPoseCamera}
                aria-label="Mở camera hướng dẫn tạo dáng"
                title="Camera hướng dẫn tạo dáng"
                className="h-8 px-2.5 rounded-full bg-amberFilm text-neutral-900 hover:bg-neutral-900 hover:text-amberFilm flex items-center gap-1 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" strokeWidth={2.4} />
                <span className="font-mono-spec text-[10px] font-bold uppercase tracking-wider">Dáng chụp</span>
              </button>
              */}

              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Detail Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Cover Photo */}
          <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-900 shrink-0 shadow-md">
            <img
              src={spot.galleryUrls?.[activePhotoIdx] || spot.coverImageUrl}
              alt={spot.name}
              className="w-full h-full object-cover"
            />

            <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-terracotta text-white font-mono-spec text-[10px] font-bold shadow-md ${statusInfo.classNames}`}>
              {spot.seasonalTrend?.status === 'PEAK' ? 'ĐANG RỘ (PEAK)' : (spot.seasonalTrend?.status || 'PEAK')}
            </span>

            {/* Thumbnails */}
            {spot.galleryUrls && spot.galleryUrls.length > 1 && (
              <div className="absolute bottom-2 inset-x-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                {spot.galleryUrls.map((photo, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setActivePhotoIdx(pIdx)}
                    className={`w-9 h-9 rounded-md overflow-hidden border-2 shrink-0 ${activePhotoIdx === pIdx ? 'border-terracotta scale-105' : 'border-white/60 opacity-80'}`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => callbacks.handleOpenDirections(spot)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-terracotta text-white shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span className="text-[11px] font-bold mt-1">Chỉ đường</span>
            </button>

            <button
              type="button"
              onClick={() => callbacks.onToggleSave(spot.id)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <Bookmark className={`w-4 h-4 ${savedSpotIds.includes(spot.id) ? 'text-terracotta fill-terracotta' : ''}`} />
              <span className="text-[11px] font-semibold mt-1">
                {savedSpotIds.includes(spot.id) ? 'Đã lưu' : 'Lưu'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => callbacks.handleShareSpot(spot)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-[11px] font-semibold mt-1">Chia sẻ</span>
            </button>

            <button
              type="button"
              onClick={() => callbacks.onOpenReportModal(spot)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <Flag className="w-4 h-4 text-amberFilm" />
              <span className="text-[11px] font-semibold mt-1">Báo nở</span>
            </button>
          </div>

          {/* Condition Progress Bar */}
          <div className="bg-amber-50/70 dark:bg-neutral-800/70 border border-amber-200/60 dark:border-neutral-700/60 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-spec">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                TÌNH TRẠNG HOA / PHONG CẢNH
              </span>
              <span className="font-bold text-terracotta">
                {spot.seasonalTrend?.bloomPercentage || 85}% ĐANG NỞ
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-terracotta h-full transition-all duration-500"
                style={{ width: `${spot.seasonalTrend?.bloomPercentage || 85}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed pt-1">
              {spot.description}
            </p>
          </div>

          {/* Photography Guide */}
          <div className="space-y-3 pt-1">
            <h4 className="font-mono-spec text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center">
              <Camera className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
              CẨM NANG CHỤP ẢNH & THIẾT BỊ
            </h4>

            <div className="flex items-start space-x-2 text-xs">
              <Clock className="w-4 h-4 text-amberFilm shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Khung giờ đẹp: </span>
                <span className="text-neutral-600 dark:text-neutral-400">{spot.bestTimeDescription}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-xs">
              <Camera className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Ống kính khuyên dùng: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {spot.recommendedLenses.map((lens, lIdx) => (
                    <span key={lIdx} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono-spec text-[10px]">
                      {lens}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-xs">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Concept & Trang phục: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {spot.seasonalTrend?.conceptTags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 rounded text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Facebook Posts */}
          {spot.inspirationPosts && spot.inspirationPosts.length > 0 && (
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono-spec">
                <span className="font-bold text-blue-600">
                  BÀI ĐĂNG FACEBOOK APHOTO ({spot.inspirationPosts.length})
                </span>
                <button
                  type="button"
                  onClick={() => callbacks.onOpenAddPostModal(spot.id)}
                  className="text-blue-600 hover:underline"
                >
                  + Thêm bài
                </button>
              </div>

              {spot.inspirationPosts.map(post => (
                <div key={post.id} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-850 space-y-2 border border-neutral-200/70 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <img src={post.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold">{post.authorName}</span>
                    </div>
                    <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {post.fullContent || post.caption}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};