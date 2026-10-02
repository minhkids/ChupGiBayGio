import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { ChevronUp, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import type { Spot } from '../types';
import { SpotCard } from './SpotCard';
import { cameraSpring } from '../utils/motion-tokens';

interface MobileMapDrawerProps {
  spots: Spot[];
  savedSpotIds: string[];
  onToggleSave: (spotId: string) => void;
  onSelectSpot: (spot: Spot) => void;
  selectedSpot: Spot | null;
  onResetFilters: () => void;
}

type SnapState = 'peek' | 'half' | 'full';

export const MobileMapDrawer: React.FC<MobileMapDrawerProps> = ({
  spots,
  savedSpotIds,
  onToggleSave,
  onSelectSpot,
  onResetFilters
}) => {
  const [snapState, setSnapState] = useState<SnapState>('half');
  const dragControls = useDragControls();

  // Trigger haptic vibration
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }
  };

  // Height configurations for 3 snap points
  // Peek: ~90px (15% screen), Half: 50vh, Full: 88vh
  const heightVariants = {
    peek: { height: '110px' },
    half: { height: '48vh' },
    full: { height: '88vh' }
  };

  const peakSpotsCount = spots.filter(s => s.seasonalTrend.status === 'PEAK').length;

  const cycleSnap = (direction: 'up' | 'down') => {
    triggerHaptic();
    if (direction === 'up') {
      if (snapState === 'peek') setSnapState('half');
      else if (snapState === 'half') setSnapState('full');
    } else {
      if (snapState === 'full') setSnapState('half');
      else if (snapState === 'half') setSnapState('peek');
    }
  };

  return (
    <motion.div
      variants={heightVariants}
      initial="half"
      animate={snapState}
      transition={cameraSpring.tactile}
      className="fixed bottom-0 inset-x-0 z-40 bg-paper-light border-t-2 border-slateInk shadow-hard-lg lg:hidden flex flex-col will-change-transform"
    >
      {/* Drawer Grab Bar & Header */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="touch-none cursor-grab active:cursor-grabbing bg-paper-warm border-b border-paper-border px-4 py-2 flex flex-col items-center select-none shrink-0"
      >
        {/* Tactile Handle Capsule */}
        <div className="w-12 h-1.5 bg-slateInk/40 rounded-full mb-1.5 hover:bg-terracotta transition-colors" />

        <div className="w-full flex items-center justify-between text-xs font-mono-spec">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-terracotta animate-pulse" />
            <span className="font-bold text-slateInk uppercase">
              {peakSpotsCount > 0 ? `${peakSpotsCount} ĐIỂM ĐANG RỘ HÔM NAY` : `${spots.length} ĐIỂM CHỤP`}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-slateInk-muted">
              {snapState === 'peek' ? '15% (Chạm kéo lên)' : snapState === 'half' ? '50% (Đang xem ghim)' : '90% (Xem toàn bộ)'}
            </span>

            {snapState !== 'full' ? (
              <button
                type="button"
                onClick={() => cycleSnap('up')}
                className="p-1 hover:bg-paper-light rounded-xs text-slateInk"
                title="Mở rộng danh sách"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => cycleSnap('down')}
                className="p-1 hover:bg-paper-light rounded-xs text-slateInk"
                title="Thu nhỏ danh sách"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {spots.length === 0 ? (
          <div className="p-6 text-center bg-paper-warm border border-slateInk space-y-2">
            <AlertCircle className="w-6 h-6 text-terracotta mx-auto" />
            <p className="font-editorial text-base text-slateInk">Không có điểm chụp phù hợp</p>
            <button
              onClick={onResetFilters}
              className="px-3 py-1 bg-slateInk text-white font-mono-spec text-xs font-bold"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {spots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                isSaved={savedSpotIds.includes(spot.id)}
                onToggleSave={onToggleSave}
                onSelectSpot={onSelectSpot}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
