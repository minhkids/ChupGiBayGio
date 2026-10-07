import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ShoppingBag,
  Camera,
  Film,
  Shirt,
  Upload,
  ExternalLink,
  Star,
  MapPin,
  Compass,
  MessageCircle,
  Zap,
  Check,
  Plus,
  RefreshCw,
  Search,
  Phone
} from 'lucide-react';
import { useNearestLabs } from '../../hooks/useNearestLabs';
import { type FilmLab } from '../../data/filmLabsData';
import { MOCK_PHOTOGRAPHERS } from '../../data/mockPhotographers';
import { RENTAL_SHOPS } from '../../data/rentalShops';
import { MOCK_POST_OUTFITS, buildShopeeSearchUrl, buildTikTokShopSearchUrl } from '../../data/mockOutfits';
import { useShootPlan } from '../../context/ShootPlanContext';
import type { Photographer } from '../../types';

export type ServicesTab = 'outfit' | 'photographers' | 'film';

interface ShootServicesHubDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ServicesTab;
  onSelectPhotographer?: (photographer: Photographer) => void;
  onFlyToLab?: (lab: FilmLab) => void;
  selectedLabId?: string | null;
}

// Preset tags for visual outfit search
const POPULAR_OUTFIT_TAGS = [
  'Áo dài lụa tơ tằm trắng ngà',
  'Váy vintage cổ vuông hoa nhí',
  'Cổ phục Nhật Bình lụa đỏ',
  'Nón lá bài thơ / Nón quai thao',
  'Túi cói vintage nàng thơ',
  'Khăn lụa quàng cổ retro'
];

export const ShootServicesHubDrawer: React.FC<ShootServicesHubDrawerProps> = ({
  isOpen,
  onClose,
  initialTab = 'outfit',
  onSelectPhotographer,
  onFlyToLab,
  selectedLabId
}) => {
  const [activeTab, setActiveTab] = useState<ServicesTab>(initialTab);
  const shootPlan = useShootPlan();

  // Tab 1 (Outfit) State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [outfitSearchKeyword, setOutfitSearchKeyword] = useState('áo dài trắng dáng suông');
  const [isOutfitCopied, setIsOutfitCopied] = useState(false);

  // Tab 2 (Photographers) State
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under500' | '500to1000' | 'above1000'>('all');
  const [photographerSearch, setPhotographerSearch] = useState('');

  // Tab 3 (Film Labs) State
  const [filmSearch, setFilmSearch] = useState('');
  const { labs, userCoords, isFallback, isLocating, refreshLocation } = useNearestLabs({
    filmStockQuery: filmSearch
  });

  // Keep active tab in sync if initialTab changes when opening
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Filtered Photographers
  const filteredPhotographers = useMemo(() => {
    return MOCK_PHOTOGRAPHERS.filter((p) => {
      // Search matching
      if (photographerSearch.trim()) {
        const q = photographerSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesVibe = p.vibes?.some((v) => v.toLowerCase().includes(q));
        const matchesGear = p.gear?.toLowerCase().includes(q);
        if (!matchesName && !matchesVibe && !matchesGear) return false;
      }

      // Budget filtering
      if (budgetFilter === 'under500') return p.startingPrice <= 500000;
      if (budgetFilter === '500to1000') return p.startingPrice > 500000 && p.startingPrice <= 1000000;
      if (budgetFilter === 'above1000') return p.startingPrice > 1000000;
      return true;
    });
  }, [budgetFilter, photographerSearch]);

  // Outfit rental shops
  const outfitShops = useMemo(() => {
    return RENTAL_SHOPS.filter((s) => s.type === 'OUTFIT');
  }, []);

  // Handle image upload for bóc đồ
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        setOutfitSearchKeyword('Áo dài lụa tơ tằm trắng cách tân');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePinUploadedOutfit = () => {
    if (!uploadedImage) return;
    shootPlan?.addReferencePhoto({
      imageUrl: uploadedImage,
      label: 'Trang phục bóc từ ảnh',
      note: outfitSearchKeyword
    });
    setIsOutfitCopied(true);
    setTimeout(() => setIsOutfitCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 lg:pointer-events-none">
        {/* Mobile backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs lg:hidden pointer-events-auto"
        />

        {/* Drawer Panel */}
        <motion.aside
          initial={{ x: -440, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -440, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="fixed top-0 bottom-0 left-0 w-full sm:w-[420px] lg:left-[var(--rail-width,76px)] lg:w-[420px] z-40 bg-[#E8DEC7] text-[#2C2621] border-r border-[#D8CFBD] shadow-2xl flex flex-col font-sans select-none overflow-hidden pointer-events-auto"
        >
          {/* ─── DRAWER HEADER ─── */}
          <header className="px-5 py-4 border-b border-[#D8CFBD] bg-[#FAF8F4]/90 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#F3EAD7] border border-[#DFCDB2] flex items-center justify-center text-[#C76B3C] shadow-sm">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono-spec tracking-wider uppercase text-[#C76B3C] font-bold">
                    SHOOT HUB
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#ECE4D0] text-[#6E655B] rounded font-mono-spec">
                    3 Dịch vụ
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#2C2621] flex items-center space-x-1.5 mt-0.5">
                  <span>Trang Bị & Dịch Vụ Buổi Chụp</span>
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#ECE4D0] hover:bg-[#E0D5BE] text-[#6E655B] hover:text-[#2C2621] flex items-center justify-center transition-colors"
              title="Đóng trang bị"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* ─── 3 SEGMENTED CONTROL TABS ─── */}
          <div className="p-3 bg-[#E8DEC7] border-b border-[#D8CFBD] shrink-0">
            <div className="grid grid-cols-3 p-1 bg-[#DDD3BD] rounded-xl border border-[#D8CFBD] text-xs font-semibold gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('outfit')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-1 rounded-lg transition-all text-center ${
                  activeTab === 'outfit'
                    ? 'bg-[#C76B3C] text-white font-bold shadow-md'
                    : 'text-[#6E655B] hover:text-[#2C2621] hover:bg-[#FAF8F4]'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Trang phục</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photographers')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-1 rounded-lg transition-all text-center ${
                  activeTab === 'photographers'
                    ? 'bg-[#C76B3C] text-white font-bold shadow-md'
                    : 'text-[#6E655B] hover:text-[#2C2621] hover:bg-[#FAF8F4]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Thợ chụp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('film')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-1 rounded-lg transition-all text-center ${
                  activeTab === 'film'
                    ? 'bg-[#C76B3C] text-white font-bold shadow-md'
                    : 'text-[#6E655B] hover:text-[#2C2621] hover:bg-[#FAF8F4]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Mua film</span>
              </button>
            </div>
          </div>

          {/* ─── TAB CONTENT BODY (SCROLLABLE) ─── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-[#F7F5F0] text-[#2C2621]">
            {/* ============================================================== */}
            {/* TAB 1: 👗 TRANG PHỤC (BÓC ĐỒ TỪ ẢNH & TIỆM THUÊ HOT) */}
            {/* ============================================================== */}
            {activeTab === 'outfit' && (
              <div className="space-y-5">
                {/* Visual Tap-to-Shop & AI Outfit Finder */}
                <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#D8CFBD] space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#2C2621]">Bóc đồ từ ảnh tham khảo</h3>
                        <p className="text-[11px] text-[#6E655B]">Tìm kiếm trang phục trên Shopee & TikTok</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono-spec font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      AI Scan
                    </span>
                  </div>

                  {/* Upload Dropzone */}
                  {!uploadedImage ? (
                    <label className="border-2 border-dashed border-[#D8CFBD] hover:border-[#C76B3C] rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white group">
                      <div className="w-10 h-10 rounded-full bg-[#ECE4D0]/80 group-hover:bg-[#F3EAD7] text-[#6E655B] group-hover:text-[#C76B3C] flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-[#554D43] group-hover:text-[#2C2621]">
                          Chọn hoặc kéo thả ảnh để bóc đồ
                        </p>
                        <p className="text-[10px] text-[#8C8377] mt-0.5">Hỗ trợ JPG, PNG, WebP (Ảnh mẫu, outfit)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-neutral-700 max-h-48 bg-black flex items-center justify-center">
                        <img
                          src={uploadedImage}
                          alt="Ảnh tham khảo"
                          className="w-full h-48 object-cover opacity-90"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-xs"
                          title="Chọn ảnh khác"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-300 font-mono-spec border border-amber-500/30">
                          ✓ Đã quét mẫu đồ
                        </span>
                      </div>

                      {/* Pin to shoot plan button */}
                      <button
                        type="button"
                        onClick={handlePinUploadedOutfit}
                        className="w-full py-2 px-3 rounded-xl bg-[#ECE4D0] hover:bg-neutral-700 text-xs font-semibold text-[#2C2621] flex items-center justify-center space-x-1.5 transition-colors border border-neutral-700"
                      >
                        {isOutfitCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Đã ghim vào Kế hoạch!</span>
                          </>
                        ) : (
                          <>
                            <span>📌</span>
                            <span>Ghim ảnh này vào Kế hoạch chụp</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Keyword Quick Tags */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-mono-spec text-[#6E655B] block">
                      Gợi ý từ khóa tìm mua trang phục:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_OUTFIT_TAGS.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setOutfitSearchKeyword(tag)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left ${
                            outfitSearchKeyword === tag
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                              : 'bg-[#ECE4D0]/60 text-[#6E655B] border-[#D8CFBD] hover:text-[#2C2621] hover:border-[#C76B3C]'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Shopee & TikTok Shop Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={buildShopeeSearchUrl(outfitSearchKeyword)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#EE4D2D] hover:bg-[#d63f20] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Tìm Shopee →</span>
                    </a>
                    <a
                      href={buildTikTokShopSearchUrl(outfitSearchKeyword)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#2C2621] hover:bg-[#443A32] border border-[#2C2621] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <span>🎵</span>
                      <span>TikTok Shop →</span>
                    </a>
                  </div>
                </div>

                {/* Hot Vintage & Modern Outfits from Inspiration Posts */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono-spec uppercase text-[#6E655B] font-bold tracking-wider">
                      Mẫu Trang Phục Hot Tại Điểm Chụp
                    </h3>
                    <span className="text-[10px] text-amber-400 font-mono-spec">
                      {MOCK_POST_OUTFITS.length} gợi ý
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {MOCK_POST_OUTFITS.slice(0, 3).map((outfit) => (
                      <div
                        key={outfit.id}
                        className="p-3 rounded-xl bg-white border border-[#E2DAD0] hover:border-[#C76B3C]/50 transition-colors flex gap-3"
                      >
                        <img
                          src={outfit.imageUrl}
                          alt={outfit.itemName}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-neutral-700"
                        />
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[#2C2621] line-clamp-1">{outfit.itemName}</h4>
                            <p className="text-[11px] text-amber-400/90 font-mono-spec mt-0.5">
                              {outfit.priceEstimate}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1.5">
                            <a
                              href={outfit.shopeeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-orange-400 hover:underline flex items-center space-x-0.5"
                            >
                              <span>Shopee</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <span className="text-neutral-600">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                shootPlan?.addItem({
                                  id: outfit.id,
                                  name: outfit.itemName,
                                  category: 'outfit',
                                  priceText: outfit.priceEstimate,
                                  imageUrl: outfit.imageUrl,
                                  type: 'purchase'
                                });
                              }}
                              className="text-[10px] font-bold text-[#6E655B] hover:text-[#C76B3C]"
                            >
                              + Thêm vào kế hoạch
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danh Sách Tiệm Thuê Áo Dài & Trang Phục Hà Nội */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono-spec uppercase text-[#6E655B] font-bold tracking-wider">
                      Tiệm Thuê Áo Dài & Trang Phục Uy Tín
                    </h3>
                    <span className="text-[10px] text-[#6E655B] font-mono-spec">
                      Hà Nội ({outfitShops.length})
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {outfitShops.map((shop) => (
                      <div
                        key={shop.id}
                        className="p-3.5 rounded-xl bg-white border border-[#E2DAD0] hover:border-[#C76B3C]/50 transition-colors flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[#2C2621]">{shop.name}</h4>
                            <p className="text-xs text-[#6E655B] flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-terracotta shrink-0" />
                              <span className="truncate">{shop.address}</span>
                            </p>
                          </div>
                          <span className="text-xs font-mono-spec text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            {shop.priceRange}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#EFE9DF] text-xs">
                          {shop.phone && (
                            <a
                              href={`tel:${shop.phone}`}
                              className="text-[#6E655B] hover:text-white flex items-center space-x-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span className="font-mono-spec">{shop.phone}</span>
                            </a>
                          )}
                          <div className="flex items-center space-x-2 ml-auto">
                            {shop.link && (
                              <a
                                href={shop.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6E655B] hover:text-amber-300 font-medium text-[11px]"
                              >
                                Fanpage ↗
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                shootPlan?.addItem({
                                  id: shop.id,
                                  name: `Thuê tại ${shop.name}`,
                                  category: 'outfit',
                                  priceText: shop.priceRange,
                                  shopName: shop.name,
                                  link: shop.link,
                                  type: 'rent'
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#ECE4D0] hover:bg-neutral-700 text-[#2C2621] text-[11px] font-semibold transition-colors"
                            >
                              + Lưu vào kế hoạch
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: 📸 THỢ CHỤP (BỘ LỌC GIÁ, PORTFOLIO & ZALO CHAT) */}
            {/* ============================================================== */}
            {activeTab === 'photographers' && (
              <div className="space-y-4">
                {/* Search Bar for Photographers */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E655B]" />
                  <input
                    type="text"
                    value={photographerSearch}
                    onChange={(e) => setPhotographerSearch(e.target.value)}
                    placeholder="Tìm tên thợ, phong cách (Film, Áo dài...)"
                    className="w-full bg-white border border-[#D8CFBD] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#2C2621] placeholder:text-[#8C8377] focus:outline-none focus:border-[#C76B3C] font-medium"
                  />
                  {photographerSearch && (
                    <button
                      type="button"
                      onClick={() => setPhotographerSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Price Bracket Segmented Control (<500k, 500k-1tr, >1tr) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono-spec text-[#6E655B]">
                    <span>MỨC GIÁ THEO BUỔI CHỤP:</span>
                    <span className="text-amber-400 font-bold">{filteredPhotographers.length} thợ</span>
                  </div>
                  <div className="grid grid-cols-4 p-1 bg-[#DDD3BD] rounded-xl border border-neutral-800 text-[11px] font-semibold gap-1">
                    <button
                      type="button"
                      onClick={() => setBudgetFilter('all')}
                      className={`py-1.5 px-1 rounded-lg transition-colors text-center ${
                        budgetFilter === 'all'
                          ? 'bg-[#C76B3C] text-white font-bold'
                          : 'text-[#6E655B] hover:text-white'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetFilter('under500')}
                      className={`py-1.5 px-1 rounded-lg transition-colors text-center ${
                        budgetFilter === 'under500'
                          ? 'bg-[#C76B3C] text-white font-bold'
                          : 'text-[#6E655B] hover:text-white'
                      }`}
                    >
                      &lt; 500k
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetFilter('500to1000')}
                      className={`py-1.5 px-1 rounded-lg transition-colors text-center ${
                        budgetFilter === '500to1000'
                          ? 'bg-[#C76B3C] text-white font-bold'
                          : 'text-[#6E655B] hover:text-white'
                      }`}
                    >
                      500k-1tr
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetFilter('above1000')}
                      className={`py-1.5 px-1 rounded-lg transition-colors text-center ${
                        budgetFilter === 'above1000'
                          ? 'bg-[#C76B3C] text-white font-bold'
                          : 'text-[#6E655B] hover:text-white'
                      }`}
                    >
                      &gt; 1tr
                    </button>
                  </div>
                </div>

                {/* Photographer Cards List */}
                <div className="space-y-3.5">
                  {filteredPhotographers.length === 0 ? (
                    <div className="p-8 text-center text-[#6E655B] text-xs">
                      Không tìm thấy thợ chụp phù hợp với bộ lọc hiện tại.
                    </div>
                  ) : (
                    filteredPhotographers.map((photographer) => {
                      const isChosen = shootPlan?.photographer?.id === photographer.id;
                      return (
                        <div
                          key={photographer.id}
                          className="p-4 rounded-2xl bg-[#FAF8F4] border border-neutral-800 hover:border-amber-500/50 transition-all flex flex-col gap-3 shadow-md"
                        >
                          {/* Header: Avatar, Name, Badge, Starting Price */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={photographer.avatarUrl}
                                  alt={photographer.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-neutral-700"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-1.5 flex-wrap">
                                  <h4 className="text-sm font-bold text-[#2C2621] truncate">
                                    {photographer.name}
                                  </h4>
                                  {photographer.badge && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      {photographer.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] text-[#6E655B] mt-0.5">
                                  <div className="flex items-center text-amber-400 font-bold">
                                    <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                                    <span>{photographer.rating.toFixed(1)}</span>
                                  </div>
                                  <span>•</span>
                                  <span>{photographer.reviewCount} đánh giá</span>
                                </div>
                              </div>
                            </div>

                            <span className="text-xs font-mono-spec font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0">
                              {photographer.startingPriceFormatted}
                            </span>
                          </div>

                          {/* Vibes tags */}
                          <div className="flex flex-wrap gap-1">
                            {photographer.vibes?.map((vibe, vIdx) => (
                              <span
                                key={vIdx}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#ECE4D0] text-[#554D43] font-mono-spec"
                              >
                                #{vibe}
                              </span>
                            ))}
                          </div>

                          {/* Portfolio Thumbnails Row */}
                          {photographer.featuredPhotos && photographer.featuredPhotos.length > 0 && (
                            <div className="grid grid-cols-4 gap-1.5 rounded-xl overflow-hidden">
                              {photographer.featuredPhotos.slice(0, 4).map((photo, pIdx) => (
                                <img
                                  key={pIdx}
                                  src={photo}
                                  alt={`Portfolio ${photographer.name}`}
                                  className="w-full h-16 object-cover rounded-lg border border-neutral-800"
                                />
                              ))}
                            </div>
                          )}

                          {/* Action Buttons: Chat Zalo, Xem Portfolio, Ghim vào Kế hoạch */}
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/80">
                            <a
                              href={photographer.contact?.zaloUrl || `https://zalo.me/${photographer.contact?.zaloPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Chat Zalo</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => onSelectPhotographer?.(photographer)}
                              className="py-2 px-1 rounded-xl bg-[#ECE4D0] hover:bg-neutral-700 text-[#2C2621] text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                            >
                              <span>Portfolio</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isChosen) {
                                  shootPlan?.removePhotographer();
                                } else {
                                  shootPlan?.setPhotographer(photographer);
                                }
                              }}
                              className={`py-2 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors ${
                                isChosen
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                              }`}
                            >
                              {isChosen ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Đã ghim</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Ghim Plan</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: 🎞️ MUA FILM (GPS ĐỊNH VỊ LAB & TIỆM GẦN NHẤT) */}
            {/* ============================================================== */}
            {activeTab === 'film' && (
              <div className="space-y-4">
                {/* Geolocation Status Banner */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F4]/90 border border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-lg">📍</span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#2C2621] truncate">
                        {isFallback ? 'Vị trí mặc định: Hồ Gươm' : 'Tọa độ GPS thực tế của bạn'}
                      </p>
                      <p className="text-[11px] text-[#6E655B]">
                        {userCoords ? `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}` : 'Đang lấy vị trí...'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={refreshLocation}
                    disabled={isLocating}
                    className="shrink-0 ml-2 px-2.5 py-1.5 rounded-xl bg-[#ECE4D0] hover:bg-neutral-700 text-[#554D43] text-[11px] font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>Lấy lại vị trí</span>
                  </button>
                </div>

                {/* Film Roll Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E655B]" />
                  <input
                    type="text"
                    value={filmSearch}
                    onChange={(e) => setFilmSearch(e.target.value)}
                    placeholder="Tìm cuộn film còn sẵn (Kodak Gold, CineStill...)"
                    className="w-full bg-white border border-[#D8CFBD] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#2C2621] placeholder:text-[#8C8377] focus:outline-none focus:border-[#C76B3C] font-medium"
                  />
                  {filmSearch && (
                    <button
                      type="button"
                      onClick={() => setFilmSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Labs Count Header */}
                <div className="flex items-center justify-between text-[11px] font-mono-spec text-[#6E655B]">
                  <span>DANH SÁCH LAB FILM HÀ NỘI:</span>
                  <span className="text-amber-400 font-bold">{labs.length} tiệm</span>
                </div>

                {/* Labs Cards Sorted by Distance */}
                <div className="space-y-3">
                  {labs.length === 0 ? (
                    <div className="p-8 text-center text-[#6E655B] text-xs">
                      Không tìm thấy tiệm film nào có cuộn film &quot;{filmSearch}&quot;.
                    </div>
                  ) : (
                    labs.map((lab) => {
                      const isSelected = selectedLabId === lab.id;
                      return (
                        <div
                          key={lab.id}
                          className={`p-4 rounded-2xl bg-[#FAF8F4] border transition-all flex flex-col gap-3 shadow-md ${
                            lab.isNearest
                              ? 'border-[#C76B3C] bg-[#FAF0E4]'
                              : isSelected
                              ? 'border-[#C76B3C] bg-[#FAF8F4]'
                              : 'border-[#E2DAD0] hover:border-[#D8CFBD]'
                          }`}
                        >
                          {/* Header: Name, Distance badge, Nearest badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-bold text-[#2C2621] truncate">{lab.name}</h4>
                                {lab.isNearest && (
                                  <span className="text-[9px] font-mono-spec font-bold px-1.5 py-0.2 rounded bg-amber-500 text-neutral-950">
                                    GẦN NHẤT
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#6E655B] flex items-center space-x-1 mt-1">
                                <MapPin className="w-3 h-3 text-terracotta shrink-0" />
                                <span className="truncate">{lab.address}</span>
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-mono-spec font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {lab.distanceDisplay}
                              </span>
                            </div>
                          </div>

                          {/* Hours & 2h Turnaround Badge */}
                          <div className="flex items-center justify-between text-xs text-[#6E655B] pt-0.5">
                            <span className="font-mono-spec text-[11px]">{lab.openingHours}</span>
                            {lab.hasFastService && (
                              <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
                                <Zap className="w-3 h-3 mr-0.5 fill-current" />
                                ⚡ Tráng lấy ngay 2h
                              </span>
                            )}
                          </div>

                          {/* Available Films in stock */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono-spec text-[#8C8377] uppercase block">
                              Sẵn kho:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {lab.availableFilms.map((filmName, fIdx) => (
                                <span
                                  key={fIdx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-[#ECE4D0] text-[#554D43] font-mono-spec"
                                >
                                  {filmName}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 3 Quick Action Buttons: [📍 Xem Map] [🧭 Chỉ đường] [💬 Nhắn tiệm] */}
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/80">
                            <button
                              type="button"
                              onClick={() => onFlyToLab?.(lab)}
                              className="py-2 px-1 rounded-xl bg-[#ECE4D0] hover:bg-neutral-700 text-amber-300 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Xem Map</span>
                            </button>

                            <a
                              href={lab.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-1 rounded-xl bg-[#ECE4D0] hover:bg-neutral-700 text-[#2C2621] text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                            >
                              <Compass className="w-3.5 h-3.5 text-blue-400" />
                              <span>Chỉ đường</span>
                            </a>

                            <a
                              href={lab.zaloUrl || lab.fanpageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Nhắn tiệm</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
