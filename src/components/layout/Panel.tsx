import { PinReferenceButton } from '../planner/PinReferenceButton';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Spot } from '../../types';
import { getStatusBadgeInfo, getEffectiveSeasonalStatus } from '../../utils/season';
import { SpotDetailContent } from './SpotDetailContent';
import type { LayoutCallbacks, SharedUIState } from './shared-types';

interface PanelProps {
  spot: Spot | null;
  savedSpotIds: string[];
  callbacks: LayoutCallbacks;
  uiState: Pick<SharedUIState, 'detailTab' | 'activePhotoIdx' | 'setDetailTab' | 'setActivePhotoIdx'>;
  isSidebarCollapsed: boolean;
  onClose: () => void;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  spot,
  savedSpotIds,
  callbacks,
  uiState,
  isSidebarCollapsed,
  onClose,
  className = '',
}) => {
  if (!spot) return null;

  const { detailTab, activePhotoIdx, setDetailTab, setActivePhotoIdx } = uiState;
  const effectiveStatus = getEffectiveSeasonalStatus(spot.seasonalTrend);
  const statusInfo = getStatusBadgeInfo(effectiveStatus, spot.seasonalTrend?.daysLeftInPeak || 0);

  const handleClose = () => {
    onClose();
  };

  /* Ghost Pose Camera launcher (temporarily disabled)
  const handleOpenPoseCamera = () => {
    // TODO: Connect to pose camera when available
    console.log('Open pose camera for spot:', spot.id);
  };
  */

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`
          hidden lg:flex flex-col fixed top-[var(--space-3)] bottom-[var(--space-3)]
          z-[var(--z-panel)]
          w-[var(--panel-width)] max-w-[var(--panel-width-max)]
          rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800
          bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md overflow-hidden
          transition-all var(--transition-base) ease-out
          ${isSidebarCollapsed ? 'left-[var(--rail-width)]' : 'left-[calc(var(--rail-width)+var(--sidebar-width))]'}
          ${className}
        `}
      >
        {/* Cover Photo Gallery Banner */}
        <div className="relative h-52 bg-neutral-900 shrink-0">
          <img
            src={spot.galleryUrls?.[activePhotoIdx] || spot.coverImageUrl}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
          <PinReferenceButton imageUrl={spot.galleryUrls?.[activePhotoIdx] || spot.coverImageUrl} label={spot.name} className="absolute top-2 right-14" />

          {/* Dismiss Button ✕ */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md z-10"
            title="Đóng chi tiết"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Status Badge */}
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md font-mono-spec text-[10px] font-bold shadow-md uppercase tracking-wider ${statusInfo.classNames}`}>
            {effectiveStatus === 'PEAK' ? 'ĐANG RỘ (PEAK)' : (effectiveStatus === 'ENDING_SOON' ? 'SẮP HẾT MÙA' : 'QUANH NĂM')}
          </span>

          {/* Ghost Pose Camera launcher (temporarily disabled)
          <button
            type="button"
            onClick={handleOpenPoseCamera}
            aria-label="Mở camera hướng dẫn tạo dáng"
            title="Camera hướng dẫn tạo dáng"
            className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amberFilm text-neutral-900 shadow-md hover:bg-neutral-900 hover:text-amberFilm transition-colors"
          >
            <Camera className="w-3.5 h-3.5" strokeWidth={2.4} />
            <span className="font-mono-spec text-[10px] font-bold uppercase tracking-wider">Dáng chụp</span>
          </button>
          */}

          {/* Gallery Thumbnails Strip */}
          {spot.galleryUrls && spot.galleryUrls.length > 1 && (
            <div className="absolute bottom-2 inset-x-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
              {spot.galleryUrls.map((photo: string, pIdx: number) => (
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

        {/* SpotDetailContent handles the rest */}
        <SpotDetailContent
          spot={spot}
          activePhotoIdx={activePhotoIdx}
          setActivePhotoIdx={setActivePhotoIdx}
          detailTab={detailTab}
          setDetailTab={setDetailTab}
          savedSpotIds={savedSpotIds}
          callbacks={{
            onToggleSave: callbacks.onToggleSave,
            handleOpenDirections: callbacks.handleOpenDirections,
            handleShareSpot: callbacks.handleShareSpot,
            onOpenReportModal: callbacks.onOpenReportModal,
            onOpenAddPostModal: callbacks.onOpenAddPostModal,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};