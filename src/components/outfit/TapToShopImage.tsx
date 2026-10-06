import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, EyeOff } from 'lucide-react';
import type { PostOutfit } from '../../types';
import { VisualOutfitHotspot } from './VisualOutfitHotspot';
import { OutfitTapToShopModal } from './OutfitTapToShopModal';
import { fetchPostOutfits } from '../../services/outfitService';

interface TapToShopImageProps {
  src: string;
  alt: string;
  postId?: string;
  outfits?: PostOutfit[];
  className?: string;
  imageClassName?: string;
  aspectRatio?: string;
  showBadge?: boolean;
}

export const TapToShopImage: React.FC<TapToShopImageProps> = ({
  src,
  alt,
  postId,
  outfits: propOutfits,
  className = '',
  imageClassName = '',
  aspectRatio = 'aspect-4/3',
  showBadge = true,
}) => {
  const [fetchedResult, setFetchedResult] = useState<{ key: string; outfits: PostOutfit[] }>({ key: '', outfits: [] });
  const [selectedOutfit, setSelectedOutfit] = useState<PostOutfit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHotspotVisible, setIsHotspotVisible] = useState(true);
  const [failedImageSrc, setFailedImageSrc] = useState('');

  // Derive outfits: props take priority, async-fetched as fallback
  const requestKey = `${postId || ''}:${src}`;
  const fetchedOutfits = fetchedResult.key === requestKey ? fetchedResult.outfits : [];
  const outfits = (propOutfits && propOutfits.length > 0) ? propOutfits : fetchedOutfits;

  // Fetch or match outfits when no propOutfits
  useEffect(() => {
    if ((propOutfits && propOutfits.length > 0) || !postId) return;

    let isCurrent = true;
    void fetchPostOutfits(postId).then(data => {
      if (isCurrent) setFetchedResult({ key: requestKey, outfits: data.filter(outfit => outfit.imageUrl === src) });
    });
    return () => { isCurrent = false; };
  }, [postId, src, requestKey, propOutfits]);

  const handleOpenOutfit = (outfit: PostOutfit) => {
    setSelectedOutfit(outfit);
    setIsModalOpen(true);
  };

  const hasOutfits = outfits.length > 0;

  return (
    <div className={`relative overflow-hidden group select-none ${className}`}>
      {/* 1. Base Image Container */}
      <div className={`relative w-full ${aspectRatio} overflow-hidden bg-neutral-100 dark:bg-neutral-800`}>
        {failedImageSrc !== src ? <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${imageClassName}`}
          loading="lazy"
          onError={() => setFailedImageSrc(src)}
        />
          : <div role="img" aria-label={`Không tải được ảnh: ${alt}`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 px-4 text-center text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            <ShoppingBag className="h-6 w-6 opacity-50" aria-hidden="true" />
            <span className="text-xs">Ảnh hiện không khả dụng</span>
          </div>}

        {/* Subtle vignette gradient when hovered */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* 2. Visual Outfit Hotspots (Rendered right at % coordinates) */}
        {failedImageSrc !== src && hasOutfits && isHotspotVisible && (
          outfits.map((outfit) => (
            <VisualOutfitHotspot
              key={outfit.id}
              outfit={outfit}
              onClick={handleOpenOutfit}
            />
          ))
        )}

        {/* 3. Floating Tap-to-Shop Badge Toggle */}
        {failedImageSrc !== src && hasOutfits && showBadge && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenOutfit(outfits[0]);
              }}
              className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-neutral-900/90 hover:bg-[#EE4D2D] hover:text-white text-neutral-800 dark:text-neutral-200 text-xs font-semibold shadow-md backdrop-blur-md border border-white/40 flex items-center space-x-1 transition-all"
              title="Xem thông tin bóc set đồ"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D] group-hover:text-white" />
              <span>Bóc đồ ({outfits.length})</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsHotspotVisible(prev => !prev);
              }}
              className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              title={isHotspotVisible ? 'Ẩn chấm soi đồ' : 'Hiện chấm soi đồ'}
            >
              {isHotspotVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* 4. Tap-to-Shop Modal */}
      <OutfitTapToShopModal
        outfit={selectedOutfit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
