import React, { useState, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Sun, 
  Bookmark, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  Camera,
  TrendingUp, 
  MessageSquarePlus, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Spot } from '../../types';
import { getStatusBadgeInfo, MONTH_SHORT_LABELS } from '../../utils/season';
import { formatCoordinates, formatDistance } from '../../utils/geo';
import { FacebookPostCard } from '../cards/FacebookPostCard';
import { FilmSpecsCard } from '../cards/FilmSpecsCard';
import { OutfitAdvisorCard } from '../cards/OutfitAdvisorCard';
import { CameraGearAdvisorCard } from '../cards/CameraGearAdvisorCard';
import { PoseCamera } from '../features/PoseCamera';
import { cameraSpring, modalShutterVariants, backdropVariants } from '../../utils/motion-tokens';
import { POSES, type PoseItem } from '../../data/poses';

interface SpotDetailModalProps {
  spot: Spot | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (spotId: string) => void;
  onOpenReportModal: (spot: Spot) => void;
  onOpenAddPostModal?: (spotId: string) => void;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  onClose,
  isSaved,
  onToggleSave,
  onOpenReportModal,
  onOpenAddPostModal
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [copiedCoords, setCopiedCoords] = useState(false);
    const [showPoseCamera, setShowPoseCamera] = useState(false);
    const [selectedPose, setSelectedPose] = useState<PoseItem | null>(null);
    const currentMonth = useMemo(() => new Date().getMonth() + 1, []); // eslint-disable-line react/purity — runs once

  // Find a matching pose for the spot
  const findMatchingPose = (currentSpot: Spot): PoseItem => {
    // First, try to find a pose with matchedSpots containing this spot's name or slug
    const matched = POSES.find(p => 
      p.matchedSpots?.some(s => 
        s.toLowerCase().includes(currentSpot.name.toLowerCase()) ||
        s.toLowerCase().includes(currentSpot.slug.toLowerCase())
      )
    );
    if (matched) return matched;

    // Fallback: use the first female pose as default
    return POSES.find(p => p.category === 'female') || POSES[0];
  };

  const openPoseCamera = () => {
    if (!spot) return;
    setSelectedPose(findMatchingPose(spot));
    setShowPoseCamera(true);
  };

  if (!spot) return null;

  const allImages = [spot.coverImageUrl, ...(spot.galleryUrls || [])];
  const statusInfo = getStatusBadgeInfo(spot.seasonalTrend.status, spot.seasonalTrend.daysLeftInPeak);
  const coordsFormatted = formatCoordinates(spot.lat, spot.lng);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${spot.lat}, ${spot.lng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`, '_blank');
  };

  return (
    <motion.div 
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slateInk/70 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6"
    >
      <motion.div 
        variants={modalShutterVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-paper-light border-2 border-slateInk w-[95vw] max-w-[1400px] shadow-hard-lg my-auto overflow-hidden reticle-corner reticle-tl reticle-tr reticle-bl reticle-br flex flex-col max-h-[92vh] will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Editorial Header Bar */}
        <div className="border-b border-slateInk bg-paper-warm px-4 py-2.5 flex items-center justify-between font-mono-spec text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-terracotta">CHỤP GÌ BÂY GIỜ</span>
            <span className="text-slateInk-muted">•</span>
            <span className="text-slateInk uppercase font-semibold truncate max-w-[200px] sm:max-w-none">
              HỒ SƠ ĐỊA ĐIỂM #{spot.slug}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={openPoseCamera}
              aria-label="Mở camera hướng dẫn tạo dáng"
              title="Camera hướng dẫn tạo dáng"
              className="w-8 h-8 border border-slateInk bg-amberFilm text-slateInk hover:bg-slateInk hover:text-amberFilm flex items-center justify-center shadow-hard transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleSave(spot.id)}
              className={`px-2.5 py-1 border border-slateInk flex items-center shadow-hard text-xs ${
                isSaved ? 'bg-terracotta text-white font-bold' : 'bg-paper-light text-slateInk hover:bg-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 mr-1 ${isSaved ? 'fill-white' : ''}`} />
              {isSaved ? 'Đã Lưu' : 'Lưu'}
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 border border-slateInk bg-paper-light hover:bg-slateInk hover:text-white flex items-center justify-center shadow-hard transition-colors"
              aria-label="Đóng modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...cameraSpring.tactile, delay: 0.05 }}
          className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-slateInk"
        >
          
          {/* Section: Title & Status Banner */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-mono-spec font-bold uppercase tracking-wider border shadow-hard ${statusInfo.classNames}`}>
                {statusInfo.label}
              </span>

              {spot.seasonalTrend.bloomPercentage && (
                <span className="px-2.5 py-0.5 text-xs font-mono-spec font-bold bg-slateInk text-white border border-slateInk">
                  Tình trạng hoa nở: {spot.seasonalTrend.bloomPercentage}%
                </span>
              )}

              {spot.distanceKm !== undefined && (
                <span className="px-2.5 py-0.5 text-xs font-mono-spec font-semibold bg-paper-warm text-slateInk border border-slateInk">
                  Cách bạn {formatDistance(spot.distanceKm)}
                </span>
              )}
            </div>

            <h1 className="font-editorial text-2xl sm:text-4xl font-extrabold text-slateInk tracking-tight leading-tight">
              {spot.name}
            </h1>

            {/* Pose guide — the entry point for the Ghost Pose Camera sits next
                to the tip it actually illustrates. (temporarily disabled)
            {spot.poseTip && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-amberFilm bg-paper-warm pl-3 pr-3 py-2.5">
                <div className="min-w-0">
                  <span className="font-mono-spec text-[10px] font-bold uppercase tracking-[0.16em] text-terracotta block">
                    Gợi ý tư thế
                  </span>
                  <p className="text-slateInk text-sm leading-snug mt-0.5">{spot.poseTip}</p>
                </div>

                <button
                  onClick={openPoseCamera}
                  className="shrink-0 inline-flex items-center justify-center gap-2 border border-slateInk bg-amberFilm px-3.5 py-2 font-mono-spec text-[11px] font-bold uppercase tracking-[0.14em] text-slateInk shadow-hard hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all"
                >
                  <Camera className="w-4 h-4" strokeWidth={2.2} />
                  Camera dáng chụp
                </button>
              </div>
            )}
            */}

            {/* Address & GPS Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-paper-border pb-3">
              <div className="flex items-center text-xs sm:text-sm text-slateInk font-sans">
                <MapPin className="w-4 h-4 mr-1 text-terracotta shrink-0" />
                <span>{spot.address}</span>
              </div>

              <div className="flex items-center space-x-2 font-mono-spec text-xs">
                <span className="text-slateInk-muted bg-paper-warm px-2 py-1 border border-paper-border">
                  {coordsFormatted}
                </span>

                <button
                  onClick={handleCopyCoords}
                  className="px-2 py-1 border border-slateInk bg-paper-light hover:bg-paper-warm flex items-center shadow-hard"
                  title="Sao chép tọa độ Lat, Lng"
                >
                  {copiedCoords ? <Check className="w-3.5 h-3.5 text-terracotta mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedCoords ? 'Đã chép' : 'Copy'}
                </button>

                <button
                  onClick={openGoogleMaps}
                  className="px-2 py-1 border border-slateInk bg-terracotta text-white hover:bg-terracotta-dark flex items-center shadow-hard"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Google Maps
                </button>
              </div>
            </div>
          </div>

          {/* Section: Image Gallery & Film Aspect Viewer (Shared Element Transition) */}
          <div className="space-y-2">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-slateInk border border-slateInk overflow-hidden shadow-hard">
              <motion.img
                layoutId={activeImageIndex === 0 ? `spot-cover-img-${spot.id}` : undefined}
                src={allImages[activeImageIndex]}
                alt={spot.name}
                className="w-full h-full object-cover will-change-transform"
              />

              {/* Navigation arrows if multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-paper-light/90 border border-slateInk flex items-center justify-center shadow-hard hover:bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-paper-light/90 border border-slateInk flex items-center justify-center shadow-hard hover:bg-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image Index indicator */}
              <div className="absolute bottom-2 right-2 bg-slateInk/80 text-white font-mono-spec text-[10px] px-2 py-0.5 border border-white/20">
                FRAME {activeImageIndex + 1} / {allImages.length}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-12 shrink-0 border overflow-hidden transition-all ${
                      activeImageIndex === idx ? 'border-2 border-terracotta shadow-hard scale-102' : 'border-slateInk/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section: Description & Narrative */}
          <div className="bg-paper-warm border border-slateInk/30 p-4">
            <h3 className="font-editorial text-lg font-bold text-slateInk mb-1">
              Ghi Chú Không Gian & Bối Cảnh
            </h3>
            <p className="text-sm font-sans text-slateInk leading-relaxed">
              {spot.description}
            </p>
          </div>

          {/* Section 3.2 Requirement: THƯỚC ĐO THỜI VỤ (Seasonality Gauge) */}
          <div className="border border-slateInk bg-paper-light p-4 space-y-3 shadow-hard">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-terracotta" />
                <h3 className="font-mono-spec text-xs font-bold uppercase tracking-wider text-slateInk">
                  THƯỚC ĐO THỜI VỤ (SEASONALITY GAUGE) — 12 THÁNG
                </h3>
              </div>
              <span className="text-xs font-mono-spec text-terracotta font-semibold">
                Đỉnh điểm: Tuần {spot.seasonalTrend.peakStartWeek || 45} – Tuần {spot.seasonalTrend.peakEndWeek || 48}
              </span>
            </div>

            {/* 12-month Visual Bar */}
            <div className="grid grid-cols-12 gap-1 text-center font-mono-spec">
              {MONTH_SHORT_LABELS.map((label, idx) => {
                const month = idx + 1;
                const { startMonth, endMonth } = spot.seasonalTrend;
                let isActive = false;
                if (startMonth <= endMonth) {
                  isActive = month >= startMonth && month <= endMonth;
                } else {
                  isActive = month >= startMonth || month <= endMonth;
                }
                const isPeak = isActive && spot.seasonalTrend.status === 'PEAK';
                const isCurrentCalendar = currentMonth === month;

                return (
                  <div key={month} className="flex flex-col items-center">
                    <span className="text-[10px] text-slateInk-muted mb-1">{label}</span>
                    <div
                      className={`w-full h-7 border flex items-center justify-center text-[10px] font-bold transition-all ${
                        isPeak
                          ? 'bg-terracotta text-white border-terracotta shadow-xs'
                          : isActive
                          ? 'bg-amberFilm/60 text-slateInk border-amberFilm'
                          : 'bg-paper-warm text-slateInk/30 border-paper-border'
                      } ${isCurrentCalendar ? 'ring-2 ring-slateInk' : ''}`}
                    >
                      {isPeak ? 'PEAK' : isActive ? 'RỘ' : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slateInk-muted font-sans italic">
              * Biểu đồ thể hiện mức độ nở hoa và tính hoàn mỹ của bối cảnh theo từng tháng. Ô có viền đen là tháng hiện tại.
            </p>
          </div>

          {/* Section: Film Photography Recommendation Engine Card */}
          <FilmSpecsCard spot={spot} />

          {/* Section: Thông số nhiếp ảnh thực tế (Photography Specs Box) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: Ánh sáng & Giờ vàng */}
            <div className="border border-slateInk p-4 bg-paper-card shadow-hard space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono-spec font-bold uppercase text-amberFilm-dark border-b border-paper-border pb-2">
                <Sun className="w-4 h-4 text-amberFilm" />
                <span>HƯỚNG SÁNG & GIỜ VÀNG (GOLDEN HOUR)</span>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div>
                  <span className="font-mono-spec font-bold text-slateInk block">Khung giờ vàng đẹp nhất:</span>
                  <p className="text-slateInk mt-0.5">{spot.bestTimeDescription}</p>
                </div>

                <div>
                  <span className="font-mono-spec font-bold text-slateInk block">Hướng mặt trời & bóng đổ:</span>
                  <p className="text-slateInk mt-0.5">{spot.sunOrientation}</p>
                </div>

                <div>
                  <span className="font-mono-spec font-bold text-slateInk block">Lưu ý ánh sáng (Lighting notes):</span>
                  <p className="text-slateInk text-slateInk-muted mt-0.5">{spot.lightingNotes}</p>
                </div>
              </div>
            </div>

            {/* Box 2: Camera & Gear Advisor */}
            <CameraGearAdvisorCard spot={spot} />
          </div>

          {/* Section: Outfit Advisor */}
          <OutfitAdvisorCard spot={spot} />

          {/* Section: Bài viết thực tế từ Facebook Group Aphoto & Cảm hứng */}
          {spot.inspirationPosts && spot.inspirationPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-paper-border pb-2 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-xs">
                    f
                  </span>
                  <h3 className="font-mono-spec text-xs font-bold uppercase tracking-wider text-slateInk">
                    BÀI VIẾT THỰC ĐỊA TỪ HỘI ĐAM MÊ NHIẾP ẢNH - APHOTO ({spot.inspirationPosts.length})
                  </h3>
                </div>

                {onOpenAddPostModal && (
                  <button
                    onClick={() => onOpenAddPostModal(spot.id)}
                    className="px-2.5 py-1 bg-paper-warm border border-slateInk hover:bg-paper-light text-slateInk font-mono-spec text-[11px] font-bold flex items-center shadow-xs self-start sm:self-auto"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1 text-[#1877F2]" />
                    Gắn Link Post Facebook
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {spot.inspirationPosts.map((post) => (
                  <FacebookPostCard 
                    key={post.id} 
                    post={post}
                    spot={spot}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Báo cáo thực tế cộng đồng (Live Community Check-in) */}
          <div className="border border-slateInk bg-paper-light p-4 shadow-hard space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-paper-border pb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-olive" />
                <h3 className="font-mono-spec text-xs font-bold uppercase tracking-wider text-slateInk">
                  BÁO CÁO TÌNH TRẠNG THỰC TẾ HÔM NAY (CROWDSOURCING)
                </h3>
              </div>

              <button
                onClick={() => onOpenReportModal(spot)}
                className="px-3 py-1 bg-terracotta text-white font-mono-spec text-xs font-bold flex items-center shadow-hard hover:bg-terracotta-dark self-start sm:self-auto"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />
                Gửi Báo Cáo Mới
              </button>
            </div>

            {spot.recentReports && spot.recentReports.length > 0 ? (
              <div className="space-y-2">
                {spot.recentReports.map((report) => (
                  <div key={report.id} className="p-3 bg-paper-warm border border-paper-border text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono-spec text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slateInk">{report.authorName}</span>
                        <span className="text-slateInk-muted">•</span>
                        <span className="text-slateInk-muted">{report.reportedAt}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.2 bg-terracotta/10 text-terracotta border border-terracotta/30 font-semibold">
                          Hoa nở: {report.bloomPercentage}%
                        </span>
                        <span className="px-1.5 py-0.2 bg-paper-light border border-slateInk/30 text-slateInk">
                          {report.crowdLevel}
                        </span>
                      </div>
                    </div>
                    <p className="text-slateInk font-sans">{report.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slateInk-muted font-sans">
                Chưa có báo cáo nào trong hôm nay. Bạn đang ở đây? Hãy là người đầu tiên cập nhật tình trạng!
              </p>
            )}
          </div>

        </motion.div>

        {/* Modal Footer Bar */}
        <div className="border-t border-slateInk bg-paper-warm px-4 py-3 flex flex-wrap items-center justify-between gap-2 font-mono-spec text-xs">
          <div className="text-slateInk-muted">
            TỌA ĐỘ: {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-slateInk bg-paper-light hover:bg-paper-warm text-slateInk font-medium shadow-hard"
            >
              Đóng
            </button>
            <button
              onClick={openGoogleMaps}
              className="px-4 py-1.5 border border-slateInk bg-slateInk text-white hover:bg-slateInk-soft font-bold shadow-hard flex items-center"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Chỉ Đường Google Maps
            </button>
          </div>
        </div>

      </motion.div>

      {/* Ghost Pose Camera — mounted at modal level so it is reachable from the
          header action without scrolling through every advisor section. */}
      {showPoseCamera && selectedPose && (
        <PoseCamera
          pose={selectedPose}
          onClose={() => { setShowPoseCamera(false); setSelectedPose(null); }}
        />
      )}
    </motion.div>
  );
};
