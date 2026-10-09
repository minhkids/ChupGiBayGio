import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  Send,
  Compass,
  Maximize2
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Spot, ConceptTag } from '../../types';
import { CONCEPT_METADATA } from '../../utils/season';
import type { LocationData } from '../../hooks/useMapLocationPicker';
import { REGIONS } from '../../data/regions';

export interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNewSpot: (newSpot: Spot) => void;
  isPickingLocation: boolean;
  selectedLocation: LocationData | null;
  onStartMapPick: () => void;
  onCancelMapPick: () => void;
  onClearLocation: () => void;
  isGeocoding?: boolean;
}

export const AddSpotModal: React.FC<AddSpotModalProps> = ({
  isOpen,
  onClose,
  onSubmitNewSpot,
  isPickingLocation,
  selectedLocation,
  onStartMapPick,
  onCancelMapPick,
  onClearLocation,
}) => {
  const [spotName, setSpotName] = useState('');
  const [regionId, setRegionId] = useState('hanoi');
  const [selectedConcepts, setSelectedConcepts] = useState<ConceptTag[]>(['HOA_CO']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (selectedLocation?.placeName && !spotName) {
      setSpotName(selectedLocation.placeName);
    }
  }, [selectedLocation, spotName]);

  if (!isOpen) return null;

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation && !spotName) return;

    setIsSubmitting(true);

    const lat = selectedLocation ? selectedLocation.lat : 21.0378;
    const lng = selectedLocation ? selectedLocation.lng : 105.8396;
    const resolvedAddress = selectedLocation?.address || 'Hà Nội, Việt Nam';

    const newSpot: Spot = {
      id: `spot-${Date.now()}`,
      regionId: regionId,
      name: spotName || selectedLocation?.placeName || 'Điểm Chụp Mới',
      slug: (spotName || 'diem-chup-moi').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      address: resolvedAddress,
      lat,
      lng,
      bestTimeOfDay: 'SUNSET',
      bestTimeDescription: 'Khung giờ hoàng hôn ánh sáng đẹp nhất',
      lightingNotes: 'Ánh sáng tự nhiên.',
      sunOrientation: 'Mặt trời lặn hướng Tây.',
      costType: 'FREE',
      ticketPriceRange: 'Miễn phí',
      cameraFeePolicy: 'Chụp tự do',
      recommendedLenses: ['35mm', '50mm'],
      recommendedOutfits: ['Trang phục thoải mái'],
      colorPalette: ['#C85A32', '#F4EFE6', '#1C1D1F', '#E09F3E'],
      crowdLevelByHour: { morning: 'Vắng', noon: 'Vắng', afternoon: 'Trung bình', evening: 'Đông' },
      coverImageUrl: '/facebook_media/post_0_0.jpg',
      galleryUrls: ['/facebook_media/post_0_0.jpg'],
      description: `Điểm chụp ảnh mới được đề xuất.`,
      photographyTips: ['Nên đi sớm trước giờ cao điểm để giữ góc chụp đẹp.'],
      inspirationPosts: [],
      recentReports: [],
      savesCount: 0,
      seasonalTrend: {
        id: `trend-${Date.now()}`,
        trendTitle: spotName || 'Địa Điểm Mới',
        startMonth: new Date().getMonth() + 1,
        endMonth: ((new Date().getMonth() + 3) % 12) + 1,
        status: 'PEAK',
        bloomPercentage: 90,
        conceptTags: selectedConcepts,
        isTrending: true,
        trendScore: 85
      }
    };

    setTimeout(() => {
      onSubmitNewSpot(newSpot);
      setIsSubmitting(false);
      setIsComplete(true);
    }, 400);
  };

  const toggleConcept = (c: ConceptTag) => {
    setSelectedConcepts(prev => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  if (isPickingLocation) {
    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-paper-light border-2 border-slateInk p-3.5 sm:p-4 shadow-hard-lg flex items-center justify-between gap-3 font-sans"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 bg-paper-warm border border-slateInk flex items-center justify-center shrink-0 text-terracotta">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slateInk text-sm truncate font-mono-spec">
                CHỌN ĐIỂM TRÊN BẢN ĐỒ
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={onCancelMapPick}
              className="px-3 py-1.5 border border-slateInk bg-paper-warm hover:bg-paper-light text-xs font-mono-spec text-slateInk transition-colors"
            >
              HỦY
            </button>
            <button
              type="button"
              onClick={onCancelMapPick}
              className="px-3.5 py-1.5 border border-slateInk bg-slateInk hover:bg-slateInk/90 text-xs font-bold font-mono-spec text-white transition-colors flex items-center space-x-1"
            >
              <Maximize2 className="w-3.5 h-3.5 mr-1" />
              <span>XONG</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-[var(--z-modal)] overflow-y-auto bg-slateInk/70 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-paper-light border-2 border-slateInk p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-hard-lg reticle-corner reticle-tl reticle-br"
        >
          <div className="w-16 h-16 bg-paper-warm border border-slateInk flex items-center justify-center mx-auto text-terracotta">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-editorial text-slateInk">
            Thêm Điểm Thành Công
          </h3>
          <p className="text-sm text-slateInk-muted font-sans">
            <strong className="text-slateInk">{spotName}</strong> đã được lưu lên bản đồ.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                setIsComplete(false);
                onClose();
              }}
              className="w-full py-2.5 px-4 border border-slateInk bg-slateInk hover:bg-slateInk/90 text-white font-bold font-mono-spec text-sm transition-colors shadow-hard"
            >
              ĐÓNG
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] overflow-y-auto bg-slateInk/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-paper-light border-2 border-slateInk w-full max-w-2xl shadow-hard-lg overflow-hidden reticle-corner reticle-tl reticle-br flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slateInk bg-slateInk px-4 py-3 flex items-center justify-between font-mono-spec text-xs">
          <span className="font-bold text-white flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            THÊM ĐỊA ĐIỂM CHỤP MỚI
          </span>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleFinalSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs font-sans">
          
          <div>
            <label className="font-mono-spec font-bold text-slateInk block mb-2">
              TỌA ĐỘ TRÊN BẢN ĐỒ: *
            </label>
            {!selectedLocation ? (
              <button
                type="button"
                onClick={onStartMapPick}
                className="w-full py-4 border-2 border-dashed border-slateInk/40 bg-paper-warm text-slateInk-muted hover:border-slateInk hover:text-slateInk transition-colors flex flex-col items-center justify-center gap-2"
              >
                <MapPin className="w-6 h-6" />
                <span className="text-sm font-semibold">Click để chọn điểm trên bản đồ</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-paper-warm border border-slateInk">
                <div className="min-w-0 pr-4">
                  <p className="font-semibold text-sm text-slateInk truncate">
                    {selectedLocation.placeName || 'Địa điểm đã chọn'}
                  </p>
                  <p className="text-xs text-slateInk-muted truncate mt-0.5">
                    {selectedLocation.address}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button type="button" onClick={onStartMapPick} className="text-xs font-bold text-slateInk hover:underline font-mono-spec">SỬA</button>
                  <button type="button" onClick={onClearLocation} className="text-xs font-bold text-slateInk-muted hover:underline font-mono-spec">XÓA</button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                TÊN ĐỊA ĐIỂM: *
              </label>
              <input
                required
                type="text"
                value={spotName}
                onChange={(e) => setSpotName(e.target.value)}
                placeholder="VD: Cánh Đồng Hoa Tam Giác Mạch"
                className="w-full p-2.5 bg-paper-warm border border-slateInk/40 focus:border-slateInk text-sm font-sans focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                KHU VỰC: *
              </label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full p-2.5 bg-paper-warm border border-slateInk/40 focus:border-slateInk text-sm font-sans focus:outline-none transition-colors"
              >
                {REGIONS.filter(r => r.id !== 'all').map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
                <option value="khac">Tỉnh thành khác</option>
              </select>
            </div>
          </div>


          
          <div>
            <label className="font-mono-spec font-bold text-slateInk block mb-2">
              CONCEPT & PHONG CÁCH:
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CONCEPT_METADATA) as ConceptTag[]).map((tagKey) => {
                const isSelected = selectedConcepts.includes(tagKey);
                return (
                  <button
                    key={tagKey}
                    type="button"
                    onClick={() => toggleConcept(tagKey)}
                    className={`px-3 py-1.5 text-xs border font-mono-spec transition-all ${
                      isSelected
                        ? 'border-slateInk bg-slateInk text-white font-bold'
                        : 'border-slateInk/40 bg-paper-warm text-slateInk hover:border-slateInk'
                    }`}
                  >
                    {CONCEPT_METADATA[tagKey].label}
                  </button>
                );
              })}
            </div>
          </div>


          
          <div className="pt-4 border-t border-slateInk/20 flex items-center justify-end gap-3 font-mono-spec">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slateInk bg-paper-warm text-slateInk hover:bg-paper-light transition-colors"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !spotName.trim() || !selectedLocation}
              className="px-5 py-2 border border-slateInk bg-slateInk hover:bg-slateInk/90 disabled:opacity-50 text-white font-bold shadow-hard transition-colors flex items-center gap-2"
            >
              {isSubmitting ? 'ĐANG LƯU...' : (
                <>
                  <Send className="w-4 h-4" />
                  THÊM ĐỊA ĐIỂM
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
