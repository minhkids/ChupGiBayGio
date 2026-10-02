import React, { useState } from 'react';
import { 
  ThumbsUp, 
  MessageCircle, 
  ExternalLink, 
  Camera, 
  Globe, 
  Maximize2
} from 'lucide-react';
import type { InspirationPost, Spot } from '../types';
import { PaletteSwatch } from './PaletteSwatch';

interface FacebookPostCardProps {
  post: InspirationPost;
  spot?: Spot;
  onSelectSpot?: (spot: Spot) => void;
}

export const FacebookPostCard: React.FC<FacebookPostCardProps> = ({
  post,
  spot,
  onSelectSpot
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(() => {
    if (post.likesCount) {
      if (post.likesCount.includes('k')) {
        return Math.round(parseFloat(post.likesCount) * 1000);
      }
      return parseInt(post.likesCount) || 120;
    }
    return 245;
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const allImages = post.galleryUrls && post.galleryUrls.length > 0 
    ? post.galleryUrls 
    : [post.thumbnailUrl];

  const targetGroupUrl = post.groupUrl || 'https://www.facebook.com/groups/528320614043286';
  const targetPostUrl = post.postUrl || targetGroupUrl;

  return (
    <article className="bg-paper-card border border-slateInk shadow-hard overflow-hidden flex flex-col justify-between transition-all hover:shadow-hard-md text-slateInk">
      
      {/* Post Top Header: Group & Author info */}
      <div className="p-3.5 border-b border-paper-border bg-paper-light">
        <div className="flex items-start justify-between gap-2">
          
          <div className="flex items-center space-x-2.5">
            {/* Author Avatar or Group Icon */}
            <div className="relative">
              <img
                src={post.authorAvatar || '/facebook_media/avatar_0.jpg'}
                alt={post.authorName}
                className="w-10 h-10 rounded-full object-cover border border-slateInk"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-[10px] font-bold border border-white">
                f
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1 leading-tight">
                <span className="font-bold text-xs sm:text-sm text-slateInk hover:underline cursor-pointer">
                  {post.authorName}
                </span>
                <span className="text-slateInk-muted text-xs">▶</span>
                <a
                  href={targetGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-xs sm:text-sm text-[#1877F2] hover:underline flex items-center"
                >
                  {post.groupName || 'Hội Đam Mê Nhiếp Ảnh - Aphoto'}
                </a>
              </div>

              <div className="flex items-center space-x-1.5 text-[11px] text-slateInk-muted font-sans mt-0.5">
                <span>{post.postDate || 'Hôm qua lúc 16:30'}</span>
                <span>•</span>
                <Globe className="w-3 h-3 text-slateInk-muted inline" />
                <span>•</span>
                <span className="font-mono-spec text-[10px] text-terracotta font-semibold">
                  {post.authorHandle}
                </span>
              </div>
            </div>
          </div>

          {/* Action icon */}
          <a
            href={targetPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-slateInk-muted hover:text-[#1877F2] transition-colors"
            title="Mở trên Facebook"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Post Text Content */}
      <div className="p-3.5 space-y-2 text-xs sm:text-sm font-sans leading-relaxed text-slateInk">
        
        {/* Spot association badge if provided */}
        {spot && (
          <div 
            onClick={() => onSelectSpot && onSelectSpot(spot)}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-paper-warm border border-slateInk/30 text-xs font-mono-spec font-bold text-slateInk hover:border-terracotta cursor-pointer transition-colors mb-1"
          >
            <span className="text-terracotta">📍 ĐỊA ĐIỂM:</span>
            <span className="truncate max-w-[240px] sm:max-w-md">{spot.name}</span>
          </div>
        )}

        {/* Post Caption & Detailed Body */}
        <div className="whitespace-pre-line">
          {isExpanded ? (
            post.fullContent || post.caption
          ) : (
            <>
              {((post.fullContent || post.caption).length > 200) ? (
                <>
                  {(post.fullContent || post.caption).slice(0, 200)}...{' '}
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="font-bold text-[#1877F2] hover:underline ml-1"
                  >
                    Xem thêm
                  </button>
                </>
              ) : (
                post.fullContent || post.caption
              )}
            </>
          )}
        </div>

        {isExpanded && (post.fullContent || post.caption).length > 200 && (
          <button
            onClick={() => setIsExpanded(false)}
            className="font-bold text-[#1877F2] hover:underline text-xs block"
          >
            Thu gọn
          </button>
        )}

        {/* Pose tip if available */}
        {post.poseTip && (
          <div className="bg-paper-warm border border-paper-border p-2.5 text-xs font-sans mt-2">
            <span className="font-mono-spec font-bold text-[10px] text-terracotta uppercase block">
              GỢI Ý TẠO DÁNG (POSE):
            </span>
            <p className="text-slateInk mt-0.5">{post.poseTip}</p>
          </div>
        )}
      </div>

      {/* Post Image Gallery (Facebook Layout: 1, 2, 3 or 4 photos) */}
      <div className="relative border-y border-slateInk bg-slateInk">
        {allImages.length === 1 && (
          <div 
            className="relative aspect-[16/10] overflow-hidden cursor-pointer group"
            onClick={() => setActivePhotoModal(allImages[0])}
          >
            <img
              src={allImages[0]}
              alt={post.caption}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            />
            <div className="absolute bottom-2 right-2 bg-slateInk/80 text-white font-mono-spec text-[10px] px-2 py-0.5 flex items-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3 h-3 mr-1" />
              Xem ảnh phóng lớn
            </div>
          </div>
        )}

        {allImages.length === 2 && (
          <div className="grid grid-cols-2 gap-0.5 aspect-[16/10]">
            {allImages.map((img, idx) => (
              <div
                key={idx}
                className="relative h-full overflow-hidden cursor-pointer group"
                onClick={() => setActivePhotoModal(img)}
              >
                <img
                  src={img}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {allImages.length >= 3 && (
          <div className="grid grid-cols-3 gap-0.5 aspect-[16/10]">
            <div
              className="col-span-2 h-full overflow-hidden cursor-pointer group"
              onClick={() => setActivePhotoModal(allImages[0])}
            >
              <img
                src={allImages[0]}
                alt="Main post photo"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="grid grid-rows-2 gap-0.5 h-full">
              {allImages.slice(1, 3).map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-full overflow-hidden cursor-pointer group"
                  onClick={() => setActivePhotoModal(img)}
                >
                  <img
                    src={img}
                    alt={`Photo ${idx + 2}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {idx === 1 && allImages.length > 3 && (
                    <div className="absolute inset-0 bg-slateInk/60 text-white font-bold text-lg flex items-center justify-center font-mono-spec">
                      +{allImages.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photography Parameters Box & Color Palette */}
      <div className="p-3 bg-paper-light border-b border-paper-border space-y-2">
        {post.cameraSettings && (
          <div className="flex items-center text-xs font-mono-spec bg-paper-warm px-2.5 py-1.5 border border-slateInk/20 text-slateInk">
            <Camera className="w-3.5 h-3.5 mr-1.5 text-terracotta shrink-0" />
            <span className="font-semibold truncate">{post.cameraSettings}</span>
          </div>
        )}

        {/* Color Palette Swatches (Section 2.5: Ripple & Sliding Tooltip) */}
        {post.paletteHex && post.paletteHex.length > 0 && (
          <div className="flex items-center justify-between text-xs font-mono-spec">
            <span className="text-[11px] text-slateInk-muted">Bảng màu bài viết:</span>
            <div className="flex items-center space-x-1">
              {post.paletteHex.map((hex, idx) => (
                <PaletteSwatch
                  key={idx}
                  hex={hex}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Facebook Reactions Stats bar */}
      <div className="px-3.5 py-2 flex items-center justify-between text-xs font-sans text-slateInk-muted border-b border-paper-border">
        <div className="flex items-center space-x-1">
          <span className="w-4 h-4 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-[9px]">
            👍
          </span>
          <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] -ml-1">
            ❤️
          </span>
          <span className="ml-1 text-[11px] font-mono-spec">
            {likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono-spec">
          <span>{post.commentsCount || '142'} bình luận</span>
          <span>•</span>
          <span>{post.sharesCount || '48'} lượt chia sẻ</span>
        </div>
      </div>

      {/* Action Buttons: Like, Comment, Open in Facebook */}
      <div className="px-2 py-1.5 bg-paper-warm grid grid-cols-3 gap-1 text-xs font-mono-spec">
        <button
          onClick={handleToggleLike}
          className={`py-1.5 flex items-center justify-center rounded-none transition-colors border ${
            isLiked 
              ? 'text-[#1877F2] font-bold border-[#1877F2]/40 bg-white' 
              : 'text-slateInk hover:bg-paper-light border-transparent'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 mr-1.5 ${isLiked ? 'fill-[#1877F2]' : ''}`} />
          {isLiked ? 'Đã Thích' : 'Thích'}
        </button>

        <a
          href={targetPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 flex items-center justify-center text-slateInk hover:bg-paper-light transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
          Bình Luận
        </a>

        <a
          href={targetPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 flex items-center justify-center text-terracotta font-bold hover:bg-paper-light transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
          Xem Post FB
        </a>
      </div>

      {/* Fullscreen Photo Modal */}
      {activePhotoModal && (
        <div 
          className="fixed inset-0 z-50 bg-slateInk/90 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-paper-light border-2 border-slateInk p-2 shadow-hard-lg">
            <img 
              src={activePhotoModal} 
              alt="Ảnh phóng lớn" 
              className="max-h-[82vh] w-auto mx-auto object-contain"
            />
            <div className="mt-2 flex items-center justify-between font-mono-spec text-xs">
              <span className="text-slateInk font-bold">
                Ảnh từ bài viết của {post.authorName} ({post.groupName || 'Hội Đam Mê Nhiếp Ảnh - Aphoto'})
              </span>
              <button 
                onClick={() => setActivePhotoModal(null)}
                className="px-3 py-1 bg-slateInk text-white font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </article>
  );
};
