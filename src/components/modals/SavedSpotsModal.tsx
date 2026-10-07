import React from 'react';
import { PinReferenceButton } from '../planner/PinReferenceButton';
import { X, Bookmark, Trash2, ArrowUpRight, MapPin } from 'lucide-react';
import type { Spot } from '../../types';

interface SavedSpotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSpots: Spot[];
  onRemoveSave: (spotId: string) => void;
  onSelectSpot: (spot: Spot) => void;
}

export const SavedSpotsModal: React.FC<SavedSpotsModalProps> = ({
  isOpen,
  onClose,
  savedSpots,
  onRemoveSave,
  onSelectSpot
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] overflow-y-auto bg-slateInk/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-paper-light border-2 border-slateInk w-full max-w-xl shadow-hard-lg overflow-hidden reticle-corner reticle-tl reticle-br flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slateInk bg-paper-warm px-4 py-2.5 flex items-center justify-between font-mono-spec text-xs">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-3.5 h-3.5 text-terracotta fill-terracotta" />
            <span className="font-bold text-slateInk">ĐỊA ĐIỂM ĐÃ LƯU ({savedSpots.length})</span>
          </div>
          <button onClick={onClose} className="w-6 h-6 border border-slateInk bg-paper-light flex items-center justify-center hover:bg-slateInk hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 flex-1">
          {savedSpots.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bookmark className="w-10 h-10 text-slateInk-muted/40 mx-auto" />
              <p className="font-editorial text-lg text-slateInk">Bạn chưa lưu địa điểm nào</p>
              <p className="text-xs text-slateInk-muted font-sans max-w-xs mx-auto">
                Bấm biểu tượng Bookmark trên bất kỳ thẻ địa điểm hoặc bản đồ nào để lưu lại danh sách chụp ảnh yêu thích của bạn.
              </p>
            </div>
          ) : (
            savedSpots.map((spot) => (
              <div 
                key={spot.id}
                className="p-3 bg-paper-card border border-slateInk shadow-hard flex items-center justify-between gap-3 hover:bg-paper-warm transition-colors"
              >
                <div 
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => {
                    onSelectSpot(spot);
                    onClose();
                  }}
                >
                  <div className="relative shrink-0">
                  <PinReferenceButton imageUrl={spot.coverImageUrl} label={spot.name} className="absolute top-1 right-1" />
                  <img
                    src={spot.coverImageUrl}
                    alt={spot.name}
                    className="w-14 h-14 object-cover border border-slateInk shrink-0"
                  />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono-spec text-terracotta font-bold uppercase block truncate">
                      {spot.seasonalTrend.trendTitle}
                    </span>
                    <h4 className="font-editorial font-bold text-slateInk text-sm truncate">
                      {spot.name}
                    </h4>
                    <span className="text-[11px] text-slateInk-muted flex items-center font-sans mt-0.5 truncate">
                      <MapPin className="w-3 h-3 mr-1 shrink-0" />
                      {spot.address.split(',').slice(-2).join(',')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => {
                      onSelectSpot(spot);
                      onClose();
                    }}
                    className="p-2 border border-slateInk bg-paper-light hover:bg-slateInk hover:text-white transition-colors"
                    title="Xem chi tiết"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveSave(spot.id)}
                    className="p-2 border border-paper-border text-slateInk-muted hover:text-terracotta hover:border-terracotta transition-colors"
                    title="Bỏ lưu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slateInk bg-paper-warm px-4 py-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 border border-slateInk bg-paper-light text-slateInk font-mono-spec text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
