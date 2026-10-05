import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Sparkles, 
  ExternalLink, 
  X, 
  Tag, 
  Layers, 
  Info,
  CheckCircle2
} from 'lucide-react';
import type { PostOutfit } from '../../types';

interface OutfitTapToShopModalProps {
  outfit: PostOutfit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OutfitTapToShopModal: React.FC<OutfitTapToShopModalProps> = ({
  outfit,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'similar'>('main');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && outfit && (
        <div className="fixed inset-0 z-[var(--z-modal,70)] flex justify-end pointer-events-none">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto"
            aria-hidden="true"
          />

          {/* Drawer Panel (Slides in from the right edge) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative w-full max-w-[480px] h-full bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200/80 dark:border-neutral-800 overflow-hidden z-10 flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            aria-label="Bóc set đồ Tap-to-Shop"
          >
            {/* Header Banner */}
            <div className="relative p-4 sm:p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EE4D2D] to-amber-500 flex items-center justify-center text-white shadow-md shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#EE4D2D] uppercase tracking-wide flex items-center truncate">
                      <Sparkles className="w-3.5 h-3.5 mr-1 shrink-0" />
                      Bóc Set Đồ Chụp Ảnh
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold shrink-0">
                      Visual AI Lens
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mt-0.5 truncate">
                    Tap-to-Shop Thông Minh
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer ml-2"
                title="Đóng (Esc)"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs (Mẫu chính vs Mẫu tương tự fallback) */}
            <div className="grid grid-cols-2 p-1.5 bg-neutral-100 dark:bg-neutral-800/80 mx-4 sm:mx-5 mt-4 rounded-xl text-xs font-semibold shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === 'main'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>Mẫu trong ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('similar')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === 'similar'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Form dáng tương tự ({outfit.similarItems?.length || 0})</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {activeTab === 'main' ? (
                <div className="space-y-4">
                  {/* Photo Preview Banner (if available) */}
                  {outfit.imageUrl && (
                    <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-800 shrink-0 shadow-inner group">
                      <img
                        src={outfit.imageUrl}
                        alt={outfit.itemName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          AI Visual Tagged
                        </span>
                        {outfit.priceEstimate && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-[11px] font-bold tabular-nums">
                            {outfit.priceEstimate}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Outfit Info Box */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850/70 border border-neutral-200/70 dark:border-neutral-800 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-[#EE4D2D]">
                          {outfit.style || 'Phong cách nàng thơ'} · {outfit.color || 'Tone màu chuẩn ảnh'}
                        </span>
                        {outfit.priceEstimate && (
                          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60">
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Giá tham khảo:</span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              {outfit.priceEstimate}
                            </span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                        {outfit.itemName}
                      </h4>
                    </div>

                    {/* AI Stylist Note */}
                    {outfit.aiNotes && (
                      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2 leading-relaxed">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block mb-0.5">Gợi ý từ Stylist AI:</strong>
                          <span>{outfit.aiNotes}</span>
                        </div>
                      </div>
                    )}

                    {/* Search Query Pill */}
                    <div className="pt-1 flex items-center space-x-1.5 text-xs text-neutral-500">
                      <span className="text-[11px] font-medium text-neutral-400 shrink-0">Từ khóa tìm kiếm:</span>
                      <code className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-[11px] truncate">
                        "{outfit.searchQuery}"
                      </code>
                    </div>
                  </div>

                  {/* 2 MAIN PROMINENT BUTTONS: SHOPEE & TIKTOK SHOP */}
                  <div className="space-y-2.5 pt-1">
                    {/* Button 1: Shopee (#EE4D2D) */}
                    <a
                      href={outfit.shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-13 rounded-2xl bg-[#EE4D2D] hover:bg-[#d83c1d] active:scale-[0.99] text-white font-bold flex items-center justify-between px-5 shadow-lg shadow-orange-500/25 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-bold block leading-none">Mua trên Shopee</span>
                          <span className="text-[11px] text-white/80 font-normal leading-tight">
                            Tìm đúng mẫu & so sánh giá ưu đãi
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* Button 2: TikTok Shop (#000000 / Dark) */}
                    <a
                      href={outfit.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-13 rounded-2xl bg-neutral-950 hover:bg-neutral-900 active:scale-[0.99] text-white font-bold flex items-center justify-between px-5 shadow-md border border-neutral-800 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-cyan-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.33a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.6a6.34 6.34 0 0 0 9.25 5.58 6.3 6.3 0 0 0 3.44-5.51V8.58a8.31 8.31 0 0 0 4.8 1.5V6.69h-1z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-bold block leading-none">Tìm trên TikTok Shop</span>
                          <span className="text-[11px] text-neutral-400 font-normal leading-tight">
                            Xem video review mặc lên dáng thực tế
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>

                  <div className="flex items-center justify-center space-x-1.5 text-[11px] text-neutral-400 text-center pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tự động áp mã giảm giá & lọc shop uy tín có lượt bán cao</span>
                  </div>
                </div>
              ) : (
                /* Fallback Tab: Similar Form & Style Products */
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      Nếu mẫu trong ảnh hết size hoặc bạn muốn nhiều mức giá khác nhau, dưới đây là các gợi ý form dáng tương đương:
                    </span>
                  </div>

                  {outfit.similarItems && outfit.similarItems.length > 0 ? (
                    <div className="space-y-2.5">
                      {outfit.similarItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/80 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5 hover:border-orange-400/40 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                                LỰA CHỌN #{idx + 1} {item.matchScore ? `· Độ khớp ${item.matchScore}%` : ''}
                              </span>
                              <h5 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                                {item.name}
                              </h5>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                              {item.priceEstimate}
                            </span>
                          </div>

                          {/* Action buttons for similar item */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <a
                              href={item.shopeeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-3 rounded-xl bg-[#EE4D2D]/10 hover:bg-[#EE4D2D] text-[#EE4D2D] hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors text-center"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Shopee</span>
                            </a>

                            <a
                              href={item.tiktokUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors text-center"
                            >
                              <span>TikTok Shop</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-neutral-400 py-6">
                      Chưa có sản phẩm thay thế cho mẫu này.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-850/90 border-t border-neutral-100 dark:border-neutral-800 text-center text-[10px] text-neutral-400 pb-safe">
              Link tiếp thị liên kết Shopee & TikTok Shop · Đảm bảo quyền lợi hoàn trả & chính hãng
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
