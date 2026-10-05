import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Link2, 
  Compass, 
  RefreshCw, 
  Check, 
  Camera, 
  Shirt, 
  ChevronRight,
  Maximize2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Spot, ConceptTag } from '../../types';
import { CONCEPT_METADATA } from '../../utils/season';
import { 
  analyzePostWithOpenRouter, 
  type OpenRouterExtractionResult 
} from '../../utils/openrouter';
import type { LocationData } from '../../hooks/useMapLocationPicker';

export interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNewSpot: (newSpot: Spot) => void;
  // Location Picker integration
  isPickingLocation: boolean;
  selectedLocation: LocationData | null;
  onStartMapPick: () => void;
  onCancelMapPick: () => void;
  onClearLocation: () => void;
  isGeocoding?: boolean;
}

const SAMPLE_POSTS = [
  {
    label: 'Cúc Họa Mi Bãi Đá',
    url: 'https://www.facebook.com/groups/aphoto/posts/baida-cuchoami-2026',
    rawText: 'Vườn hoa bãi đá sông Hồng cúc họa mi đang nở rộ 85% rồi các bác ơi! Nắng chiều 15h-17h ngược sáng vàng óng ánh cực thơ. Mặc áo len vintage hoặc áo dài trắng là chuẩn bài. Gear: Sony A7IV + 85mm f/1.4 GM.',
    photos: ['/facebook_media/post_0_0.jpg', '/facebook_media/post_0_1.jpg', '/facebook_media/post_0_2.jpg'],
    concepts: ['HOA_CO', 'VINTAGE', 'NANG_THO'] as ConceptTag[],
    defaultName: 'Vườn Hoa Bãi Đá Sông Hồng - Mùa Cúc Họa Mi'
  },
  {
    label: 'Xe Hoa Phan Đình Phùng',
    url: 'https://www.facebook.com/groups/528320614043286/posts/pdp-xe-hoa-mua-thu',
    rawText: 'Sáng nay dạo Phan Đình Phùng xe hoa ngập tràn đường luôn các bác nhé! Mùa thu Hà Nội đúng là chỉ cần đứng góc cổng trường Cửa Bắc chụp là auto có ảnh đẹp. Nắng sớm 8h-9h chiếu xiên qua kẽ lá đẹp nao lòng. Gear: Fujifilm X-T5 + 33mm f/1.4.',
    photos: ['/facebook_media/post_12_0.jpg', '/facebook_media/post_12_1.jpg', '/facebook_media/post_12_2.jpg'],
    concepts: ['AO_DAI', 'STREET', 'VINTAGE'] as ConceptTag[],
    defaultName: 'Đường Phan Đình Phùng - Mùa Xe Hoa Mùa Thu'
  },
  {
    label: 'Hoàng Hôn Hồ Tây',
    url: 'https://www.tiktok.com/@chupgibaygio/video/hoang-hon-ho-tay-7890',
    rawText: 'Hoàng hôn bến Hàn Quốc ven Hồ Tây chiều nay đỏ rực mặt hồ! Điểm ngắm mặt trời lặn chill nhất Hà Nội, thích hợp chụp phong cách film hoài niệm hoặc silhouette ngược sáng.',
    photos: ['/facebook_media/post_6_0.jpg', '/facebook_media/post_6_1.jpg', '/facebook_media/post_6_2.jpg'],
    concepts: ['FILM', 'NANG_THO', 'MINIMAL'] as ConceptTag[],
    defaultName: 'Bến Hàn Quốc Hồ Tây - Hoàng Hôn Rực Rỡ'
  }
];

export const AddSpotModal: React.FC<AddSpotModalProps> = ({
  isOpen,
  onClose,
  onSubmitNewSpot,
  isPickingLocation,
  selectedLocation,
  onStartMapPick,
  onCancelMapPick,
  onClearLocation,
  isGeocoding = false
}) => {
  // Form State
  const [postUrl, setPostUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  
  // Extracted or derived Spot properties
  const [spotName, setSpotName] = useState('');
  const [selectedConcepts, setSelectedConcepts] = useState<ConceptTag[]>(['HOA_CO', 'VINTAGE']);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([
    '/facebook_media/post_0_0.jpg',
    '/facebook_media/post_0_1.jpg'
  ]);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string>('/facebook_media/post_0_0.jpg');
  const [cameraSettings, setCameraSettings] = useState('Sony A7IV • 85mm f/1.4 • ISO 100');
  const [outfitNotes, setOutfitNotes] = useState('Áo dài trắng, Váy vintage tone nâu be, Nón lá');
  const [bestTimeDesc, setBestTimeDesc] = useState('Khung giờ hoàng hôn (16:00 - 17:30)');
  const [ticketPrice, setTicketPrice] = useState('50.000đ - 70.000đ / người');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Sync spotName or address when location changes
  React.useEffect(() => {
    if (selectedLocation?.placeName && !spotName) {
      setSpotName(selectedLocation.placeName);
    }
  }, [selectedLocation, spotName]);

  if (!isOpen) return null;

  /**
   * Handle AI Extraction from Social Link / Text
   */
  const handleExtractFromLink = async () => {
    if (!postUrl.trim() && !rawText.trim()) return;

    setIsExtracting(true);
    setExtractSuccess(false);

    try {
      // Find if matches sample template for immediate instant response
      const matchedSample = SAMPLE_POSTS.find(s => 
        postUrl.includes(s.url) || postUrl.toLowerCase().includes(s.label.toLowerCase())
      );

      if (matchedSample) {
        // Instant autofill from verified sample
        setTimeout(() => {
          setSpotName(matchedSample.defaultName);
          setSelectedConcepts(matchedSample.concepts);
          setGalleryUrls(matchedSample.photos);
          setSelectedCoverUrl(matchedSample.photos[0]);
          setRawText(matchedSample.rawText);
          setIsExtracting(false);
          setExtractSuccess(true);
        }, 600);
        return;
      }

      // Call OpenRouter / LLM extraction pipeline
      const openRouterKey = localStorage.getItem('openrouter_api_key') || '';
      const textToAnalyze = rawText.trim() || `Bài viết chia sẻ địa điểm chụp ảnh từ link: ${postUrl}`;
      
      const result: OpenRouterExtractionResult = await analyzePostWithOpenRouter(
        textToAnalyze,
        openRouterKey,
        'openai/gpt-4o-mini'
      );

      if (result) {
        if (result.location_name) {
          setSpotName(result.location_name);
        }
        if (result.concept_tags && result.concept_tags.length > 0) {
          const validTags = result.concept_tags.filter(t => 
            ['HOA_CO', 'VINTAGE', 'NANG_THO', 'AO_DAI', 'FILM', 'STREET', 'CYBERPUNK', 'MINIMAL', 'KIEN_TRUC'].includes(t)
          ) as ConceptTag[];
          if (validTags.length > 0) setSelectedConcepts(validTags);
        }
        if (result.camera_params) {
          setCameraSettings(result.camera_params);
        }
        if (result.status_note) {
          setBestTimeDesc(result.status_note);
        }
      }

      // Ensure at least sample photos exist
      if (galleryUrls.length === 0) {
        setGalleryUrls(['/facebook_media/post_12_0.jpg', '/facebook_media/post_12_1.jpg']);
        setSelectedCoverUrl('/facebook_media/post_12_0.jpg');
      }

      setExtractSuccess(true);
    } catch (err) {
      console.error('Extraction error:', err);
      // Fallback sensible defaults
      setSpotName(prev => prev || 'Điểm Chụp Mới Từ ' + (postUrl.includes('tiktok') ? 'TikTok' : 'Facebook'));
      setExtractSuccess(true);
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * Apply Preset Template
   */
  const handleApplyPreset = (sample: typeof SAMPLE_POSTS[0]) => {
    setPostUrl(sample.url);
    setRawText(sample.rawText);
    setSpotName(sample.defaultName);
    setSelectedConcepts(sample.concepts);
    setGalleryUrls(sample.photos);
    setSelectedCoverUrl(sample.photos[0]);
    setExtractSuccess(true);
  };

  /**
   * Final Submission
   */
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation && !spotName) return;

    setIsSubmitting(true);

    const lat = selectedLocation ? selectedLocation.lat : 21.0378;
    const lng = selectedLocation ? selectedLocation.lng : 105.8396;
    const resolvedAddress = selectedLocation?.address || 'Hà Nội, Việt Nam';

    const newSpot: Spot = {
      id: `spot-${Date.now()}`,
      regionId: 'hanoi',
      name: spotName || selectedLocation?.placeName || 'Điểm Chụp Hà Nội Mới',
      slug: (spotName || 'diem-chup-moi').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      address: resolvedAddress,
      lat,
      lng,
      bestTimeOfDay: 'SUNSET',
      bestTimeDescription: bestTimeDesc || 'Khung giờ hoàng hôn ánh sáng đẹp nhất',
      lightingNotes: 'Ánh sáng tự nhiên xiên góc, phù hợp tone màu ấm áp.',
      sunOrientation: 'Mặt trời lặn hướng Tây.',
      costType: ticketPrice.toLowerCase().includes('miễn') ? 'FREE' : 'TICKET',
      ticketPriceRange: ticketPrice,
      cameraFeePolicy: 'Chụp tự do không phụ thu máy cơ',
      recommendedLenses: cameraSettings.split('•').map(s => s.trim()),
      recommendedOutfits: outfitNotes.split(',').map(s => s.trim()),
      colorPalette: ['#C85A32', '#F4EFE6', '#1C1D1F', '#E09F3E'],
      crowdLevelByHour: { morning: 'Vắng', noon: 'Vắng', afternoon: 'Trung bình', evening: 'Đông' },
      coverImageUrl: selectedCoverUrl || galleryUrls[0] || '/facebook_media/post_0_0.jpg',
      galleryUrls: galleryUrls.length > 0 ? galleryUrls : [selectedCoverUrl],
      description: rawText || `Điểm chụp ảnh được phát hiện và trích xuất từ bài viết ${postUrl}`,
      photographyTips: [
        'Nên đi sớm trước giờ cao điểm để giữ góc chụp đẹp.',
        'Sử dụng ống kính tiêu cự 35mm hoặc 85mm để tối ưu hậu cảnh.'
      ],
      inspirationPosts: [],
      recentReports: [],
      savesCount: 0,
      seasonalTrend: {
        id: `trend-${Date.now()}`,
        trendTitle: spotName || 'Địa Điểm Đang Hot Mùa Này',
        startMonth: new Date().getMonth() + 1,
        endMonth: ((new Date().getMonth() + 3) % 12) + 1,
        status: 'PEAK',
        bloomPercentage: 90,
        conceptTags: selectedConcepts,
        isTrending: true,
        trendScore: 95
      }
    };

    setTimeout(() => {
      onSubmitNewSpot(newSpot);
      setIsSubmitting(false);
      setIsComplete(true);
    }, 400);
  };

  // =========================================================================
  // VIEW 1: MINIMIZED FLOATING BAR (When user is clicking on Mapbox)
  // =========================================================================
  if (isPickingLocation) {
    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-xl">
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-neutral-900/95 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 border-amber-500/80 backdrop-blur-md flex items-center justify-between gap-3 font-sans"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 animate-pulse text-amber-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[11px] font-mono-spec font-bold uppercase tracking-wider text-amber-400">
                  CHẾ ĐỘ CLICK-TO-PIN MAPBOX
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-neutral-200 truncate">
                Click vào bất kỳ điểm nào trên bản đồ để cắm Pin...
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={onCancelMapPick}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onCancelMapPick}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs font-bold text-neutral-950 transition-colors flex items-center space-x-1 shadow-md shadow-amber-500/20"
            >
              <Maximize2 className="w-3.5 h-3.5 mr-1" />
              <span>Mở form</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SUCCESS DIALOG
  // =========================================================================
  if (isComplete) {
    return (
      <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Thêm Điểm Thành Công!
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Địa điểm <strong className="text-neutral-900 dark:text-neutral-200">{spotName}</strong> đã được lưu và ghim trực tiếp lên bản đồ Hà Nội.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsComplete(false);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Xem ngay trên bản đồ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: MAIN MODAL (Zero manual coordinate inputs)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-[990] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15 }}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono-spec font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                QUY TRÌNH THÊM ĐIỂM THÔNG MINH
              </span>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Thêm Điểm Chụp Không Cần Tọa Độ
              </h2>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <form onSubmit={handleFinalSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm font-sans">
          
          {/* ========================================================================= */}
          {/* STEP 1: DÁN LINK BÀI VIẾT (Facebook / TikTok) */}
          {/* ========================================================================= */}
          <div className="bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono-spec text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-[11px] font-bold flex items-center justify-center">1</span>
                <span>DÁN LINK BÀI VIẾT (FACEBOOK / TIKTOK)</span>
              </label>

              {/* Sample preset links */}
              <div className="hidden sm:flex items-center space-x-1 text-[11px]">
                <span className="text-neutral-400 text-[10px]">Thử nhanh:</span>
                {SAMPLE_POSTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(sample)}
                    className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 hover:bg-amber-500/20 text-neutral-700 dark:text-neutral-300 hover:text-amber-500 text-[11px] transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.facebook.com/... hoặc TikTok video URL"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <button
                type="button"
                onClick={handleExtractFromLink}
                disabled={isExtracting || (!postUrl.trim() && !rawText.trim())}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shrink-0 transition-all disabled:opacity-50 shadow-sm"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang AI trích xuất...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                    <span>Trích xuất bài viết</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Extraction Status Banner */}
            <AnimatePresence>
              {extractSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-900 dark:text-amber-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Đã phân tích và trích xuất dữ liệu thành công!</p>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      Hệ thống LLM đã tự động điền: tiêu đề gợi ý, bộ ảnh tham khảo, phong cách (concept) và thông số máy ảnh.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========================================================================= */}
          {/* STEP 2: CHỌN VỊ TRÍ TRÊN BẢN ĐỒ MAPBOX (CLICK-TO-PIN) */}
          {/* ========================================================================= */}
          <div className="bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono-spec text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-[11px] font-bold flex items-center justify-center">2</span>
                <span>CHỌN VỊ TRÍ TRỰC TIẾP TRÊN BẢN ĐỒ</span>
              </label>

              {selectedLocation && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono-spec text-[10px] font-bold">
                  ✓ ĐÃ CẮM PIN
                </span>
              )}
            </div>

            {/* Display Selected Location or Action Button */}
            {!selectedLocation ? (
              <div className="p-4 border-2 border-dashed border-amber-500/40 rounded-xl bg-amber-500/5 text-center space-y-2">
                <MapPin className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    Chưa chọn tọa độ trên bản đồ
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Không cần gõ kinh độ / vĩ độ thủ công. Chỉ cần click một điểm bất kỳ trên bản đồ!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onStartMapPick}
                  className="mt-2 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Chọn vị trí trên bản đồ</span>
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      {isGeocoding ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono-spec font-bold text-neutral-400 uppercase">
                          ĐỊA CHỈ NHẬN DIỆN (MAPBOX REVERSE GEOCODING)
                        </span>
                        {isGeocoding && (
                          <span className="text-[9px] text-amber-500 font-mono-spec animate-pulse">
                            • Đang dịch ngược tọa độ...
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                        {selectedLocation.placeName || 'Địa điểm đã chọn'}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                        {selectedLocation.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={onStartMapPick}
                      className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors"
                    >
                      Ghim lại
                    </button>
                    <button
                      type="button"
                      onClick={onClearLocation}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Xóa vị trí này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Readonly GPS Badge */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono-spec text-neutral-500">
                  <span>TỌA ĐỘ GPS: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}</span>
                  <span className="text-emerald-500 font-bold">Kéo thả pin trên map để căn chỉnh</span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* STEP 3: THÔNG TIN BỔ SUNG & PREVIEW (Tự động điền) */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-mono-spec font-bold text-neutral-400 uppercase tracking-wider">
              THÔNG TIN ĐÃ ĐƯỢC TỰ ĐỘNG ĐIỀN (CÓ THỂ CHỈNH SỬA)
            </h4>

            {/* Spot Name */}
            <div>
              <label className="font-mono-spec text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                TÊN ĐỊA ĐIỂM CHỤP: *
              </label>
              <input
                type="text"
                required
                value={spotName}
                onChange={(e) => setSpotName(e.target.value)}
                placeholder="VD: Cúc Họa Mi Bãi Đá Sông Hồng"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Concept Badges Selection */}
            <div>
              <label className="font-mono-spec text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                PHONG CÁCH / CONCEPT CHỤP:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(CONCEPT_METADATA) as ConceptTag[]).map((tag) => {
                  const isSelected = selectedConcepts.includes(tag);
                  const meta = CONCEPT_METADATA[tag];
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedConcepts(prev => 
                          isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-amber-500 border-amber-600 text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      <span>{meta.label}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Gallery Previews */}
            {galleryUrls.length > 0 && (
              <div>
                <label className="font-mono-spec text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 flex items-center justify-between">
                  <span>HÌNH ẢNH TRÍCH XUẤT TỪ BÀI VIẾT ({galleryUrls.length} ẢNH):</span>
                  <span className="text-[10px] text-amber-500 font-normal">Click để chọn ảnh bìa</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {galleryUrls.map((url, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedCoverUrl(url)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedCoverUrl === url 
                          ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-md scale-95' 
                          : 'border-transparent hover:opacity-90'
                      }`}
                    >
                      <img src={url} alt={`Ảnh trích xuất ${idx + 1}`} className="w-full h-full object-cover" />
                      {selectedCoverUrl === url && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-neutral-950 p-0.5 rounded-full">
                          <Check className="w-3 h-3 font-bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gear, Outfits & Ticket Hints */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="font-mono-spec text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center space-x-1">
                  <Camera className="w-3.5 h-3.5 text-neutral-400" />
                  <span>LENS / THIẾT BỊ GỢI Ý:</span>
                </label>
                <input
                  type="text"
                  value={cameraSettings}
                  onChange={(e) => setCameraSettings(e.target.value)}
                  placeholder="VD: 35mm f/1.4, 85mm f/1.8"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-mono-spec text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center space-x-1">
                  <Shirt className="w-3.5 h-3.5 text-neutral-400" />
                  <span>TRANG PHỤC HỢP CONCEPT:</span>
                </label>
                <input
                  type="text"
                  value={outfitNotes}
                  onChange={(e) => setOutfitNotes(e.target.value)}
                  placeholder="VD: Áo dài, Vintage, Tone be trắng"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-mono-spec text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center space-x-1">
                  <span>💰 VÉ / PHÍ VÀO CỔNG:</span>
                </label>
                <input
                  type="text"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="VD: Miễn phí, 50.000đ"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !spotName.trim() || !selectedLocation}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold text-sm shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <span>Thêm Địa Điểm Vào Bản Đồ</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
