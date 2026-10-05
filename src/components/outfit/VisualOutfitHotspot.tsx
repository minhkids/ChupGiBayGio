import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';
import type { PostOutfit } from '../../types';

interface VisualOutfitHotspotProps {
  outfit: PostOutfit;
  onClick: (outfit: PostOutfit) => void;
  className?: string;
}

export const VisualOutfitHotspot: React.FC<VisualOutfitHotspotProps> = ({
  outfit,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${className}`}
      style={{
        left: `${outfit.xPercent}%`,
        top: `${outfit.yPercent}%`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(outfit);
      }}
    >
      {/* 1. Pulsing ring animation (animate-ping) */}
      <span className="absolute -inset-2 rounded-full bg-[#EE4D2D] opacity-75 animate-ping pointer-events-none" />

      {/* 2. Secondary soft glow pulse */}
      <span className="absolute -inset-1 rounded-full bg-orange-400/40 animate-pulse pointer-events-none" />

      {/* 3. Main Center Hotspot Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.92 }}
        className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#EE4D2D] to-amber-500 text-white shadow-lg shadow-orange-500/50 flex items-center justify-center border-2 border-white transition-transform"
        aria-label={`Bóc set đồ: ${outfit.itemName}`}
        title={`Bóc set đồ: ${outfit.itemName}`}
      >
        <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
      </motion.button>

      {/* 4. Interactive Hover Popover Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2.5 rounded-2xl bg-neutral-900/95 text-white shadow-2xl backdrop-blur-md border border-white/15 pointer-events-none z-30"
          >
            <div className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
              <Sparkles className="w-3 h-3" />
              <span>Tap để bóc set đồ</span>
            </div>
            <p className="text-xs font-semibold leading-tight line-clamp-2 mt-0.5">
              {outfit.itemName}
            </p>
            {outfit.priceEstimate && (
              <span className="text-[11px] font-bold text-emerald-400 block mt-1 tabular-nums">
                {outfit.priceEstimate}
              </span>
            )}
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-white/80 font-medium">
              <span className="text-[#EE4D2D] font-bold">Shopee & TikTok</span>
              <ChevronRight className="w-3 h-3" />
            </div>

            {/* Little downward arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
