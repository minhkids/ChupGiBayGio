import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, Key, MapPin, Camera } from 'lucide-react';
import type { Spot, InspirationPost } from '../types';
import { 
  analyzePostWithOpenRouter, 
  type OpenRouterExtractionResult
} from '../utils/openrouter';

interface AddFacebookPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  spots: Spot[];
  selectedSpotId?: string;
  onAddPost: (spotId: string, newPost: InspirationPost) => void;
}

export const AddFacebookPostModal: React.FC<AddFacebookPostModalProps> = ({
  isOpen,
  onClose,
  spots,
  selectedSpotId,
  onAddPost
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [targetSpotId, setTargetSpotId] = useState(selectedSpotId || spots[0]?.id || '');
  
  // Form fields
  const [postUrl, setPostUrl] = useState('https://www.facebook.com/groups/528320614043286');
  const [authorName, setAuthorName] = useState('Nhiếp Ảnh Gia Aphoto');
  const [rawText, setRawText] = useState(
    'Sáng nay dạo PĐP hoa sữa chưa có nhưng xe hoa ngập tràn rồi các bác ơi! Mùa thu Hà Nội đúng là chỉ cần mặc áo dài trắng ra đứng góc cổng trường chụp là auto đẹp. Tầm 8-9h nắng chiếu xiên qua kẽ lá cực thơ nhé! Gear: Sony A7IV + FE 85mm f/1.4 GM.'
  );
  const [photosStr, setPhotosStr] = useState(
    '/facebook_media/post_0_0.jpg\n/facebook_media/post_0_1.jpg'
  );
  const [cameraSettings, setCameraSettings] = useState('Sony A7IV • 85mm f/1.4 GM • ISO 100');
  const [poseTip, setPoseTip] = useState('Đứng nghiêng 45 độ cạnh xe hoa, để nắng xiên chiếu viền tóc');
  
  // OpenRouter State
  const [openRouterKey, setOpenRouterKey] = useState<string>(() => {
    try {
      return localStorage.getItem('openrouter_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<OpenRouterExtractionResult | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle OpenRouter Analysis
  const handleRunOpenRouterExtraction = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzePostWithOpenRouter(rawText, openRouterKey, selectedModel);
      setAiResult(res);

      // Auto-fill form fields
      if (res.camera_params) {
        setCameraSettings(res.camera_params);
      }
      if (res.concept_tags && res.concept_tags.length > 0) {
        setPoseTip(`Gợi ý: ${res.concept_tags.join(', ')}. ${res.status_note}`);
      }

      // Check if matches an existing spot in Hanoi
      if (res.location_name) {
        const lowerLoc = res.location_name.toLowerCase();
        const matched = spots.find(s => 
          s.name.toLowerCase().includes(lowerLoc) || 
          lowerLoc.includes(s.name.toLowerCase()) ||
          s.address.toLowerCase().includes(lowerLoc)
        );
        if (matched) {
          setTargetSpotId(matched.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Sample templates to test extraction immediately
  const handleApplySample = (sampleType: 'pdp' | 'baida' | 'benhanquoc' | 'longbien') => {
    if (sampleType === 'pdp') {
      setRawText('Sáng nay dạo PĐP hoa sữa chưa có nhưng xe hoa ngập tràn rồi các bác ơi! Mùa thu Hà Nội đúng là chỉ cần mặc áo dài trắng ra đứng góc cổng trường chụp là auto đẹp. Tầm 8-9h nắng chiếu xiên qua kẽ lá cực thơ nhé! Gear: Sony A7IV + FE 85mm f/1.4 GM.');
      setPhotosStr('/facebook_media/post_12_0.jpg\n/facebook_media/post_12_1.jpg');
      setAuthorName('Nguyễn Phú An (Aphoto)');
    } else if (sampleType === 'baida') {
      setRawText('Vườn hoa bãi đá sông Hồng cúc họa mi đang nở rộ 85% rồi mọi người nhé. Đợt này hoa trắng muốt dày đặc, nên đi tầm 14h-16h chiều để bắt nắng vàng hoàng hôn ngược sáng. Máy: Fujifilm X-T5 + 33mm f/1.4.');
      setPhotosStr('/facebook_media/post_0_0.jpg\n/facebook_media/post_0_2.jpg');
      setAuthorName('Đức Tic (Aphoto)');
    } else if (sampleType === 'benhanquoc') {
      setRawText('Chiều ra bến sông ngắm hoàng hôn thơ mộng quá. Gió lộng và mặt trời lặn tạo vạt ray đỏ ối trên mặt nước, concept vintage cổ điển rất hợp. Máy Nikon Z6 II.');
      setPhotosStr('/facebook_media/post_9_0.jpg\n/facebook_media/post_9_1.jpg');
      setAuthorName('Thanh Thủy (Aphoto)');
    } else {
      setRawText('Góc cầu Long Biên mùa gió heo may. Bước trên đường ray gỉ sét và ngắm bãi bồi sông Hồng, chụp tone film Portra 400 cực nghệ. Nhớ cẩn thận an toàn đường sắt nhé!');
      setPhotosStr('/facebook_media/post_5_0.jpg\n/facebook_media/post_5_2.jpg');
      setAuthorName('Tony Trần (Aphoto)');
    }
    setAiResult(null);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('openrouter_api_key', openRouterKey.trim());
    setShowKeyInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || !authorName.trim()) return;

    const photos = photosStr
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const defaultThumbnail = photos[0] || '/facebook_media/post_0_0.jpg';

    const newPost: InspirationPost = {
      id: `fb-${Date.now()}`,
      platform: 'FACEBOOK',
      authorName: authorName.trim(),
      authorHandle: '@aphoto_member',
      authorAvatar: '/facebook_media/avatar_0.jpg',
      groupName: 'Hội Đam Mê Nhiếp Ảnh - Aphoto',
      groupUrl: 'https://www.facebook.com/groups/528320614043286',
      postUrl: postUrl.trim() || 'https://www.facebook.com/groups/528320614043286',
      postDate: 'Vừa xong (AI Synced)',
      caption: rawText.slice(0, 100),
      fullContent: rawText.trim(),
      thumbnailUrl: defaultThumbnail,
      galleryUrls: photos.length > 0 ? photos : [defaultThumbnail],
      paletteHex: ['#C85A32', '#F4EFE6', '#1C1D1F', '#E09F3E'],
      cameraSettings: cameraSettings.trim(),
      poseTip: poseTip.trim() || undefined,
      likesCount: '28',
      commentsCount: '5',
      sharesCount: '2'
    };

    onAddPost(targetSpotId, newPost);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slateInk/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-paper-light border-2 border-slateInk w-full max-w-2xl shadow-hard-lg overflow-hidden reticle-corner reticle-tl reticle-br flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="border-b-2 border-slateInk bg-paper-warm px-4 py-3 flex items-center justify-between font-mono-spec text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-xs font-bold">f</span>
            <span className="font-bold text-slateInk uppercase tracking-wide">
              PIPELINE OPENROUTER & GẮN PIN MAPBOX
            </span>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-7 h-7 border border-slateInk bg-paper-light flex items-center justify-center hover:bg-slateInk hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b border-slateInk bg-paper-warm text-xs font-mono-spec font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-2 px-4 flex items-center justify-center space-x-1.5 transition-colors border-r border-slateInk ${
              activeTab === 'ai' 
                ? 'bg-paper-light text-terracotta border-b-2 border-b-terracotta' 
                : 'text-slateInk hover:bg-paper-light/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI BÓC TÁCH OPENROUTER (GPT-4O-MINI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-4 flex items-center justify-center space-x-1.5 transition-colors ${
              activeTab === 'manual' 
                ? 'bg-paper-light text-slateInk border-b-2 border-b-slateInk font-bold' 
                : 'text-slateInk-muted hover:bg-paper-light/60'
            }`}
          >
            <span>NHẬP THỦ CÔNG</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-olive mx-auto animate-bounce" />
            <h3 className="font-editorial text-2xl font-bold text-slateInk">Phân Tích & Gắn Pin Thành Công!</h3>
            <p className="text-xs text-slateInk-muted font-sans max-w-md mx-auto">
              Bài viết đã được OpenRouter xử lý ngữ nghĩa, chuẩn hóa tọa độ Hà Nội và đồng bộ trực tiếp lên hệ thống bản đồ Mapbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-sans flex-1">
            
            {/* AI OpenRouter Mode Header & Quick Samples */}
            {activeTab === 'ai' && (
              <div className="space-y-3 border-b border-paper-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono-spec font-bold text-slateInk uppercase">
                      THỬ NHANH CÁC MẪU REVIEW:
                    </span>
                  </div>

                  {/* OpenRouter Key Settings Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="flex items-center space-x-1 text-[11px] font-mono-spec text-slateInk hover:text-terracotta self-start sm:self-auto"
                  >
                    <Key className="w-3.5 h-3.5 text-terracotta" />
                    <span>{openRouterKey ? 'Đã có OpenRouter Key' : 'Cấu hình API Key (Tùy chọn)'}</span>
                  </button>
                </div>

                {/* API Key Drawer if opened */}
                {showKeyInput && (
                  <div className="p-3 bg-paper-warm border border-slateInk space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-spec text-[11px] font-bold text-slateInk">OPENROUTER API KEY:</span>
                      <span className="text-[10px] text-slateInk-muted font-mono-spec">Endpoint: openrouter.ai/api/v1</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="password"
                        placeholder="sk-or-v1-..."
                        value={openRouterKey}
                        onChange={(e) => setOpenRouterKey(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slateInk font-mono-spec text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        className="px-3 py-1.5 bg-slateInk text-white font-mono-spec font-bold text-xs shadow-hard"
                      >
                        Lưu Key
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slateInk-muted">
                      <span>Model: <strong>{selectedModel}</strong></span>
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-white border border-slateInk/40 px-1 py-0.5"
                      >
                        <option value="openai/gpt-4o-mini">openai/gpt-4o-mini (Default)</option>
                        <option value="anthropic/claude-3.5-haiku">anthropic/claude-3.5-haiku (Fallback)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Sample Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplySample('pdp')}
                    className="px-2.5 py-1 bg-paper-warm border border-slateInk hover:bg-paper-light font-mono-spec text-[11px]"
                  >
                    Mẫu 1: PĐP Xe hoa mùa thu
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySample('baida')}
                    className="px-2.5 py-1 bg-paper-warm border border-slateInk hover:bg-paper-light font-mono-spec text-[11px]"
                  >
                    Mẫu 2: Bãi Đá Sông Hồng cúc họa mi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySample('benhanquoc')}
                    className="px-2.5 py-1 bg-paper-warm border border-slateInk hover:bg-paper-light font-mono-spec text-[11px]"
                  >
                    Mẫu 3: Bến Hàn Quốc Hồ Tây
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySample('longbien')}
                    className="px-2.5 py-1 bg-paper-warm border border-slateInk hover:bg-paper-light font-mono-spec text-[11px]"
                  >
                    Mẫu 4: Cầu Long Biên tone film
                  </button>
                </div>
              </div>
            )}

            {/* Input: Raw Social Post Text */}
            <div className="space-y-1">
              <label className="font-mono-spec font-bold text-slateInk flex items-center justify-between">
                <span>NỘI DUNG BÀI VIẾT TỪ FACEBOOK GROUP:</span>
                <span className="text-[11px] text-slateInk-muted font-normal">(Playwright / Scraped Text)</span>
              </label>
              <textarea
                rows={4}
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán toàn bộ văn bản review hoặc bài đăng Facebook tại đây..."
                className="w-full px-3 py-2 bg-paper-warm border border-slateInk focus:bg-white focus:outline-none focus:ring-1 focus:ring-terracotta font-sans leading-relaxed text-xs"
              />
            </div>

            {/* Trigger OpenRouter Button */}
            {activeTab === 'ai' && (
              <div>
                <button
                  type="button"
                  onClick={handleRunOpenRouterExtraction}
                  disabled={isAnalyzing || !rawText.trim()}
                  className="w-full py-2.5 bg-terracotta text-white font-mono-spec text-xs font-bold shadow-hard hover:bg-terracotta-dark flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>
                    {isAnalyzing 
                      ? 'ĐANG GỌI OPENROUTER API & CHUẨN HÓA ĐỊA DANH HÀ NỘI...' 
                      : '⚡ PHÂN TÍCH BẰNG OPENROUTER (GPT-4O-MINI)'}
                  </span>
                </button>
              </div>
            )}

            {/* AI Extraction Result Card */}
            {aiResult && (
              <div className="p-3.5 bg-paper-warm border-2 border-slateInk shadow-hard space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-paper-border pb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-olive animate-pulse" />
                    <span className="font-mono-spec font-bold text-xs uppercase text-slateInk">
                      KẾT QUẢ BÓC TÁCH OPENROUTER ({aiResult.confidence_score * 100}% CONFIDENCE)
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 bg-slateInk text-white font-mono-spec text-[10px] uppercase">
                    Tháng {aiResult.month_detected}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slateInk-muted block font-mono-spec text-[10px]">ĐỊA ĐIỂM CHUẨN HÓA:</span>
                    <span className="font-bold text-slateInk flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-terracotta shrink-0" />
                      {aiResult.location_name} {aiResult.matched_alias && `(từ '${aiResult.matched_alias}')`}
                    </span>
                  </div>

                  <div>
                    <span className="text-slateInk-muted block font-mono-spec text-[10px]">TỌA ĐỘ BBOX HÀ NỘI:</span>
                    <span className="font-mono-spec font-semibold text-slateInk">
                      {aiResult.lat?.toFixed(4)}, {aiResult.lng?.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {aiResult.concept_tags?.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-slateInk/30 text-[11px] font-mono-spec font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] bg-white p-2 border border-paper-border space-y-1">
                  <span className="font-bold text-slateInk block">Tình trạng ghi nhận:</span>
                  <p className="text-slateInk-muted">{aiResult.status_note}</p>
                </div>
              </div>
            )}

            {/* Select Destination Spot on Map */}
            <div className="space-y-1">
              <label className="font-mono-spec font-bold text-slateInk flex items-center justify-between">
                <span>GẮN VÀO ĐỊA ĐIỂM TRÊN BẢN ĐỒ:</span>
                <span className="text-[11px] text-slateInk-muted font-normal">(Chọn điểm đích)</span>
              </label>
              <select
                value={targetSpotId}
                onChange={(e) => setTargetSpotId(e.target.value)}
                className="w-full px-3 py-2 bg-paper-warm border border-slateInk font-mono-spec text-xs focus:bg-white focus:outline-none"
              >
                {spots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name} — {spot.address.split(',').slice(-2).join(',')}
                  </option>
                ))}
              </select>
            </div>

            {/* Post URL & Author Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono-spec font-bold text-slateInk">TÁC GIẢ BÀI VIẾT:</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh (Aphoto)"
                  className="w-full px-3 py-1.5 bg-paper-warm border border-slateInk focus:bg-white text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono-spec font-bold text-slateInk">LINK BÀI VIẾT FACEBOOK:</label>
                <input
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.facebook.com/groups/528320614043286/posts/..."
                  className="w-full px-3 py-1.5 bg-paper-warm border border-slateInk focus:bg-white text-xs font-mono-spec"
                />
              </div>
            </div>

            {/* Camera Settings */}
            <div className="space-y-1">
              <label className="font-mono-spec font-bold text-slateInk flex items-center">
                <Camera className="w-3.5 h-3.5 mr-1 text-olive" />
                <span>THÔNG SỐ MÁY ẢNH & THIẾT BỊ:</span>
              </label>
              <input
                type="text"
                value={cameraSettings}
                onChange={(e) => setCameraSettings(e.target.value)}
                placeholder="Ví dụ: Sony A7IV • FE 85mm f/1.4 GM • f/1.8 • ISO 100"
                className="w-full px-3 py-1.5 bg-paper-warm border border-slateInk focus:bg-white font-mono-spec text-xs"
              />
            </div>

            {/* Image URLs */}
            <div className="space-y-1">
              <label className="font-mono-spec font-bold text-slateInk flex items-center justify-between">
                <span>LINK ẢNH TRÍCH XUẤT (MỖI DÒNG 1 URL):</span>
                <span className="text-[11px] text-slateInk-muted font-normal">(1 hoặc nhiều ảnh)</span>
              </label>
              <textarea
                rows={2}
                value={photosStr}
                onChange={(e) => setPhotosStr(e.target.value)}
                placeholder="/facebook_media/post_0_0.jpg hoặc link ảnh Facebook..."
                className="w-full px-3 py-1.5 bg-paper-warm border border-slateInk focus:bg-white text-xs font-mono-spec"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-slateInk text-white font-mono-spec text-xs font-bold shadow-hard hover:bg-slateInk-soft transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>XÁC NHẬN ĐỒNG BỘ BÀI VIẾT & GẮN PIN MAPBOX</span>
                <span>→</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
