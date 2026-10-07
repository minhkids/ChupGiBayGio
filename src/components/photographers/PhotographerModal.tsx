import React, { useState, useEffect } from 'react';
import { PinReferenceButton } from '../planner/PinReferenceButton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Camera, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Image as ImageIcon,
  ClipboardList,
  Check
} from 'lucide-react';
import type { Photographer, PricingPackage, PortfolioAlbum } from '../../types';
import { useShootPlan } from '../../context/ShootPlanContext';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface PhotographerModalProps {
  photographer: Photographer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotographerModal: React.FC<PhotographerModalProps> = ({
  photographer,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'portfolio'>('packages');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const shootPlan = useShootPlan();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhoto) {
          setSelectedPhoto(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedPhoto, onClose]);

  // Reset tab when photographer changes
  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- reset modal active tab on photographer switch
    if (photographer) {
      setActiveTab('packages');
      setSelectedPhoto(null);
    }
  }, [photographer]);

  if (!photographer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-modal,70)] flex justify-end pointer-events-none">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto"
            aria-hidden="true"
          />

          {/* Showcase Drawer Panel (Slides in from right) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl md:max-w-2xl h-full bg-neutral-900 border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl pointer-events-auto overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label={`Portfolio của ${photographer.name}`}
          >
            {/* 1. Header with Cover & Photographer Bio */}
            <div className="relative shrink-0 border-b border-neutral-800 bg-neutral-950">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Bar with Close button */}
              <div className="flex items-center justify-between p-4 pb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                  Hồ Sơ Nhiếp Ảnh Gia Hà Nội
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label="Đóng bảng chi tiết"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Details */}
              <div className="px-5 pb-5 pt-1">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={photographer.avatarUrl}
                      alt={photographer.name}
                      className="w-18 h-18 rounded-2xl object-cover border-2 border-amber-400/80 shadow-lg shadow-black/60"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-neutral-950 text-white rounded-full p-0.5" title="Sẵn sàng nhận lịch">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                        {photographer.name}
                      </h3>
                      {photographer.badge && (
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {photographer.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {photographer.bio}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-300 flex-wrap">
                      <div className="flex items-center text-amber-400 font-bold gap-1 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{photographer.rating.toFixed(1)}</span>
                        <span className="text-neutral-400 font-normal">({photographer.reviewCount} đánh giá)</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
                        <Camera className="w-3.5 h-3.5 text-neutral-300" />
                        <span className="font-mono-spec truncate max-w-[200px]">{photographer.gear}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specialty spots pills */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" /> Địa điểm tủ:
                  </span>
                  {photographer.specialtySpots.map((spot, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-900 text-amber-300 border border-neutral-800"
                    >
                      {spot}
                    </span>
                  ))}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-t border-neutral-800/80 px-5 gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('packages')}
                  className={`py-3 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'packages'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bảng Giá Gói Chụp ({photographer.packages.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('portfolio')}
                  className={`py-3 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'portfolio'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Bộ Ảnh Thực Tế ({photographer.albums.length})</span>
                </button>
              </div>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-neutral-900/90 custom-scrollbar">
              {activeTab === 'packages' ? (
                /* PACKAGES TAB */
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Cam kết trả <strong className="text-white">100% file gốc/RAW</strong> đã chụp và blend màu đúng tone yêu cầu.
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {photographer.packages.map((pkg: PricingPackage) => (
                      <div
                        key={pkg.id}
                        className={`rounded-2xl p-4.5 transition-all relative ${
                          pkg.highlight
                            ? 'bg-gradient-to-b from-neutral-950 to-neutral-900 border-2 border-amber-400/80 shadow-lg shadow-amber-500/10'
                            : 'bg-neutral-950 border border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {pkg.highlight && (
                          <span className="absolute -top-2.5 right-4 bg-amber-400 text-neutral-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                            Gói Khuyên Dùng
                          </span>
                        )}

                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                              {pkg.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Thời lượng: <strong>{pkg.duration}</strong></span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-black text-amber-400 tracking-tight">
                              {pkg.priceFormatted}
                            </span>
                            <span className="block text-[10px] text-neutral-400">/ buổi chụp</span>
                          </div>
                        </div>

                        {/* Deliverables Checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                          <div className="flex items-center gap-2 text-neutral-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Ảnh gốc: <strong className="text-white">{pkg.deliverables.totalOriginalPhotos}</strong></span>
                          </div>

                          <div className="flex items-center gap-2 text-neutral-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Ảnh chỉnh sửa: <strong className="text-white">{pkg.deliverables.retouchedPhotos}</strong></span>
                          </div>

                          <div className="flex items-center gap-2 text-neutral-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Thời gian trả ảnh: <strong className="text-white">{pkg.deliverables.turnaroundTime}</strong></span>
                          </div>

                          {pkg.deliverables.supportProps && (
                            <div className="flex items-center gap-2 text-neutral-300">
                              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>Đạo cụ: <strong className="text-white">{pkg.deliverables.supportProps}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Nút [+ Chọn gói này] vào Kế Hoạch & Dự Toán */}
                        <div className="pt-3 border-t border-neutral-800/60 mt-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              const isThisPackageSelected = 
                                shootPlan?.photographer?.id === photographer.id &&
                                shootPlan?.photographer?.packageId === pkg.id;

                              if (isThisPackageSelected) {
                                shootPlan?.removePhotographer();
                              } else {
                                shootPlan?.setPhotographer(photographer, pkg.id);
                              }
                            }}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all border cursor-pointer ${
                              shootPlan?.photographer?.id === photographer.id &&
                              shootPlan?.photographer?.packageId === pkg.id
                                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md shadow-amber-500/20'
                                : 'bg-neutral-900 hover:bg-neutral-850 text-white border-neutral-700 hover:border-amber-400/50'
                            }`}
                          >
                            {shootPlan?.photographer?.id === photographer.id &&
                            shootPlan?.photographer?.packageId === pkg.id ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Đã chọn gói này trong Kế hoạch</span>
                              </>
                            ) : (
                              <>
                                <ClipboardList className="w-4 h-4 text-amber-400" />
                                <span>+ Chọn gói này vào Kế hoạch ({pkg.priceFormatted})</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* PORTFOLIO MASONRY GRID TAB */
                <div className="space-y-6">
                  {photographer.albums.map((album: PortfolioAlbum) => (
                    <div key={album.id} className="space-y-3">
                      {/* Album Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-400" />
                          <h4 className="text-sm font-bold text-white">{album.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                            📍 {album.spotName}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                            #{album.vibe}
                          </span>
                        </div>
                      </div>

                      {/* Photo Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {album.photoUrls.map((url, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => setSelectedPhoto(url)}
                            className="group relative rounded-xl overflow-hidden bg-neutral-950 aspect-4/5 cursor-pointer border border-neutral-800 hover:border-amber-400/80 transition-all shadow-md"
                          >
                            <img
                              src={url}
                              alt={`${album.title} - Ảnh ${pIdx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
          <PinReferenceButton imageUrl={url} label={`${album.title} - Ảnh ${pIdx + 1}`} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[11px] font-bold text-white bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                                Xem phóng to
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Sticky Bottom Direct Contact CTAs */}
            <div className="shrink-0 p-4 border-t border-neutral-800 bg-neutral-950 flex flex-col gap-2.5 shadow-2xl">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>Giá từ <strong className="text-amber-400 text-sm">{photographer.startingPriceFormatted}</strong></span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Phản hồi Zalo trong vòng 15 phút
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Zalo Button */}
                <a
                  href={photographer.contact.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-kodak-amber hover:bg-amber-400 active:scale-[0.98] text-editorial-bg font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Nhắn Zalo Ngay</span>
                </a>

                {/* Direct Call Button */}
                <a
                  href={`tel:${photographer.contact.phone}`}
                  className="py-3 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition-all"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>{photographer.contact.phone}</span>
                </a>

                {/* Instagram button (if available) */}
                {photographer.contact.instagram && (
                  <a
                    href={`https://instagram.com/${photographer.contact.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-pink-400 hover:text-pink-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition-all"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    <span className="truncate">{photographer.contact.instagram}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Fullscreen Photo Lightbox Modal */}
            <AnimatePresence>
              {selectedPhoto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white z-10 transition-colors cursor-pointer"
                    aria-label="Đóng ảnh"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <PinReferenceButton imageUrl={selectedPhoto} label={`Tác phẩm của ${photographer.name}`} className="absolute top-4 left-4" />
                  <motion.img
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    src={selectedPhoto}
                    alt="Phóng to tác phẩm"
                    className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl border border-neutral-800 shadow-2xl"
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
