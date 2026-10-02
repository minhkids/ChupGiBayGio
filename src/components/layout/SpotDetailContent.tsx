import React from 'react';
import { Navigation, Share2, Flag, Bookmark, Camera, Clock, Sparkles, ExternalLink } from 'lucide-react';
import type { Spot } from '../../types';
import { getStatusBadgeInfo } from '../../utils/season';
import type { SpotDetailContentProps } from './shared-types';

interface QuickActionsProps {
  spot: Spot;
  callbacks: Pick<SpotDetailContentProps['callbacks'], 'onToggleSave' | 'handleOpenDirections' | 'handleShareSpot' | 'onOpenReportModal' | 'onOpenAddPostModal'>;
}

const QuickActions: React.FC<QuickActionsProps> = ({ spot, callbacks }) => {
  const { handleOpenDirections, handleShareSpot, onOpenReportModal } = callbacks;

  return (
    <div className="grid grid-cols-3 gap-2 py-1">
      <button
        type="button"
        onClick={() => handleOpenDirections(spot)}
        className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
      >
        <Navigation className="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-semibold mt-1">Chỉ đường</span>
      </button>

      <button
        type="button"
        onClick={() => handleShareSpot(spot)}
        className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
      >
        <Share2 className="w-4 h-4 text-neutral-500 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-semibold mt-1">Chia sẻ</span>
      </button>

      <button
        type="button"
        onClick={() => onOpenReportModal(spot)}
        className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors group"
      >
        <Flag className="w-4 h-4 text-amberFilm group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-semibold mt-1">Báo nở</span>
      </button>
    </div>
  );
};

interface BloomConditionProps {
  spot: Spot;
}

const BloomCondition: React.FC<BloomConditionProps> = ({ spot }) => {
  const percentage = spot.seasonalTrend?.bloomPercentage || 85;

  return (
    <div className="bg-amber-50/70 dark:bg-neutral-800/70 border border-amber-200/60 dark:border-neutral-700/60 rounded-xl p-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs font-mono-spec">
        <span className="font-bold text-neutral-900 dark:text-neutral-100">
          TÌNH TRẠNG HOA / PHONG CẢNH
        </span>
        <span className="font-bold text-terracotta">
          {percentage}% ĐANG NỞ
        </span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-terracotta h-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed pt-1">
        {spot.description}
      </p>
    </div>
  );
};

interface PhotographyTipsProps {
  spot: Spot;
}

const PhotographyTips: React.FC<PhotographyTipsProps> = ({ spot }) => {
  return (
    <div className="space-y-3 pt-1">
      <h3 className="font-mono-spec text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center">
        <Camera className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
        CẨM NANG NHIẾP ẢNH & THIẾT BỊ
      </h3>

      {/* Golden Hour / Best Time */}
      <div className="flex items-start space-x-2.5 text-xs">
        <Clock className="w-4 h-4 text-amberFilm shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-neutral-800 dark:text-neutral-200">Khung giờ đẹp: </span>
          <span className="text-neutral-600 dark:text-neutral-400">{spot.bestTimeDescription}</span>
        </div>
      </div>

      {/* Recommended Lenses */}
      <div className="flex items-start space-x-2.5 text-xs">
        <Camera className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-neutral-800 dark:text-neutral-200">Ống kính khuyên dùng: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {spot.recommendedLenses.map((lens, lIdx) => (
              <span key={lIdx} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md font-mono-spec text-[10px] text-neutral-700 dark:text-neutral-300">
                {lens}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Concept & Outfits */}
      <div className="flex items-start space-x-2.5 text-xs">
        <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-neutral-800 dark:text-neutral-200">Concept & Trang phục: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {spot.seasonalTrend?.conceptTags.map((tag, tIdx) => (
              <span key={tIdx} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-md text-[10px]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SpotDetailInfoTabProps {
  spot: Spot;
  savedSpotIds: string[];
  callbacks: SpotDetailContentProps['callbacks'];
}

const SpotDetailInfoTab: React.FC<SpotDetailInfoTabProps> = ({ spot, callbacks }) => {
  return (
    <>
      <QuickActions spot={spot} callbacks={callbacks} />
      <BloomCondition spot={spot} />
      {/* FilmSpecsCard is imported dynamically to avoid circular deps */}
      <PhotographyTips spot={spot} />
    </>
  );
};

interface SpotDetailPostsTabProps {
  spot: Spot;
  callbacks: SpotDetailContentProps['callbacks'];
}

const SpotDetailPostsTab: React.FC<SpotDetailPostsTabProps> = ({ spot, callbacks }) => {
  const { onOpenAddPostModal } = callbacks;

  if (!spot.inspirationPosts || spot.inspirationPosts.length === 0) {
    return (
      <div className="py-8 text-center text-neutral-400 text-xs">
        Chưa có bài viết nào cho điểm chụp này. Hãy là người đầu tiên chia sẻ!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono-spec font-bold text-blue-600 dark:text-blue-400">
          BÀI ĐĂNG THỰC TẾ ({spot.inspirationPosts.length})
        </span>
        <button
          type="button"
          onClick={() => onOpenAddPostModal(spot.id)}
          className="text-xs text-blue-600 dark:text-blue-400 font-mono-spec font-bold hover:underline"
        >
          + Thêm bài viết
        </button>
      </div>

      {spot.inspirationPosts.map(post => (
        <div
          key={post.id}
          className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-850/80 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-bold">{post.authorName}</span>
            </div>
            <a
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {post.fullContent || post.caption}
          </p>
        </div>
      ))}
    </div>
  );
};

export const SpotDetailContent: React.FC<SpotDetailContentProps> = ({
  spot,
  activePhotoIdx,
  setActivePhotoIdx,
  detailTab,
  setDetailTab,
  savedSpotIds,
  callbacks,
  className = '',
}) => {
  const statusInfo = getStatusBadgeInfo(spot.seasonalTrend?.status || 'PEAK', spot.seasonalTrend?.daysLeftInPeak || 0);
  const allImages = [spot.coverImageUrl, ...(spot.galleryUrls || [])];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Cover Photo Gallery Banner */}
      <div className="relative h-52 bg-neutral-900 shrink-0">
        <img
          src={allImages[activePhotoIdx] || spot.coverImageUrl}
          alt={spot.name}
          className="w-full h-full object-cover"
        />

        {/* Status Badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md bg-terracotta text-white font-mono-spec text-[10px] font-bold shadow-md uppercase tracking-wider ${statusInfo.classNames}`}>
          {spot.seasonalTrend?.status === 'PEAK' ? 'ĐANG RỘ (PEAK)' : (spot.seasonalTrend?.status || 'PEAK')}
        </span>

        {/* Gallery Thumbnails Strip */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 inset-x-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            {allImages.map((photo: string, pIdx: number) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => setActivePhotoIdx(pIdx)}
                className={`relative w-9 h-9 rounded-md overflow-hidden border-2 shrink-0 transition-transform ${
                  activePhotoIdx === pIdx ? 'border-terracotta scale-105' : 'border-white/60 opacity-80'
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL CARD NAVBAR TABS: Cẩm nang vs Bài viết liên quan */}
      <div className="p-3 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-mono-spec font-bold text-terracotta uppercase block truncate">
              {spot.seasonalTrend?.trendTitle}
            </span>
            <h2 className="font-editorial text-xl font-extrabold text-neutral-900 dark:text-white truncate">
              {spot.name}
            </h2>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={() => callbacks.onToggleSave(spot.id)}
              className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:text-terracotta text-neutral-600 dark:text-neutral-300"
              title={savedSpotIds.includes(spot.id) ? 'Đã lưu' : 'Lưu'}
            >
              <Bookmark className={`w-4 h-4 ${savedSpotIds.includes(spot.id) ? 'text-terracotta fill-terracotta' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => callbacks.handleOpenDirections(spot)}
              className="p-1.5 rounded-lg bg-terracotta text-white hover:bg-terracotta-dark"
              title="Chỉ đường Google Maps"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-navbar inside detail card */}
        <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setDetailTab('info')}
            className={`flex-1 py-1 rounded-md transition-all ${detailTab === 'info'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
          >
            Cẩm Nang & Góc Chụp
          </button>
          <button
            type="button"
            onClick={() => setDetailTab('posts')}
            className={`flex-1 py-1 rounded-md transition-all flex items-center justify-center space-x-1 ${detailTab === 'posts'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
          >
            <span>Bài Đăng FB</span>
            <span className="text-[10px] px-1 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded font-mono-spec">
              {spot.inspirationPosts?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable Detail Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {detailTab === 'info' ? (
          <SpotDetailInfoTab spot={spot} savedSpotIds={savedSpotIds} callbacks={callbacks} />
        ) : (
          <SpotDetailPostsTab spot={spot} callbacks={callbacks} />
        )}
      </div>
    </div>
  );
};