import { PinReferenceButton } from '../planner/PinReferenceButton';
import React, { useState } from 'react';
import { 
  Sparkles, 
  Film, 
  Camera, 
  Check, 
  ArrowRight
} from 'lucide-react';
import type { Spot } from '../../types';

interface MoodboardViewProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
}

export const MoodboardView: React.FC<MoodboardViewProps> = ({ spots, onSelectSpot }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeFilmTab, setActiveFilmTab] = useState<'portra' | 'fuji' | 'cinestill' | 'blackwhite'>('portra');

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const filmPresets = {
    portra: {
      title: 'KODAK PORTRA 400 / 160',
      tagline: 'Tone da ấm áp, chuyển sắc kem mịn màng, đặc trưng cho mùa thu đông Hà Nội và cúc họa mi.',
      idealSpots: ['Bãi Đá Sông Hồng', 'Phan Đình Phùng', 'Cỏ Hồng Đà Lạt'],
      palette: ['#F9F8F6', '#E9DEC7', '#D4A373', '#C85A32', '#3D3D3D'],
      settings: 'Exposure: +0.3 • Highlights: -20 • Shadows: +15 • Warmth: +8 • Grain: Mild (Size 25, Roughness 30)'
    },
    fuji: {
      title: 'FUJIFILM CLASSIC CHROME',
      tagline: 'Màu phim tài liệu sâu lắng, sắc xanh lá ngả ngọc bích, lý tưởng cho di sản và phố cổ.',
      idealSpots: ['Bảo Tàng Mỹ Thuật', 'Đường Sắt Cầu Long Biên', 'Chung Cư Tôn Thất Đạm'],
      palette: ['#4A5844', '#BD8027', '#F4EFE6', '#1C1D1F', '#5F646D'],
      settings: 'Color: -2 • Highlight: +1 • Shadow: +2 • Dynamic Range: DR400 • White Balance: Daylight R:0 B:-2'
    },
    cinestill: {
      title: 'CINESTILL 800T (TUNGSTEN)',
      tagline: 'Hiệu ứng quầng đỏ (Halation) quanh đốm đèn lồng đêm, chất điện ảnh Hong Kong huyền ảo.',
      idealSpots: ['Phố Hàng Mã', 'Cầu Ba Son Về Đêm', 'Phố Đi Bộ Bùi Viện'],
      palette: ['#D90429', '#E09F3E', '#1C1D1F', '#2B2D42', '#FFE8D6'],
      settings: 'Kelvin: 3200K • Halation Radius: 8px • Bloom: 15% • Contrast: +30 • Blacks: +10'
    },
    blackwhite: {
      title: 'KODAK TRI-X 400 MONOCHROME',
      tagline: 'Tương phản đen trắng sắc lẹm, hạt film đanh gắt, tôn vinh hình khối kiến trúc và ánh sáng xiên.',
      idealSpots: ['Cầu Long Biên', 'Bảo Tàng Mỹ Thuật', 'Ga Sài Gòn'],
      palette: ['#000000', '#2B2B2B', '#7A7A7A', '#CCCCCC', '#FFFFFF'],
      settings: 'Monochrome: High Contrast • Red Filter: Active • Clarity: +25 • Grain: Heavy (Size 45, Roughness 60)'
    }
  };

  const currentPreset = filmPresets[activeFilmTab];

  // Extract all inspiration posts from spots
  const allInspirations = spots.flatMap(spot => 
    (spot.inspirationPosts || []).map(post => ({ ...post, spot }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Editorial Header */}
      <div className="border-b-2 border-slateInk pb-6 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono-spec text-terracotta uppercase font-bold">
          <Sparkles className="w-4 h-4" />
          <span>EDITORIAL LOOKBOOK & COLOR RECIPES</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-black text-slateInk">
          Moodboard & Công Thức Màu Phim Theo Mùa
        </h1>
        <p className="text-sm sm:text-base text-slateInk-muted font-sans max-w-2xl">
          Sự hòa quyện giữa bối cảnh thiên nhiên Việt Nam, trang phục theo mã màu Pantone, và các công thức giả lập màu phim kinh điển từ các nhiếp ảnh gia.
        </p>
      </div>

      {/* Preset Explorer Card */}
      <div className="border border-slateInk bg-paper-warm shadow-hard p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-paper-border pb-4">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-terracotta" />
            <h2 className="font-mono-spec font-bold text-sm uppercase text-slateInk">
              CÔNG THỨC MÀU PHIM KINH ĐIỂN (FILM RECIPES)
            </h2>
          </div>

          {/* Film selector tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'portra', label: 'Kodak Portra' },
              { id: 'fuji', label: 'Fuji Classic Chrome' },
              { id: 'cinestill', label: 'CineStill 800T' },
              { id: 'blackwhite', label: 'Tri-X Đen Trắng' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilmTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-mono-spec border transition-all ${
                  activeFilmTab === tab.id
                    ? 'border-slateInk bg-slateInk text-white font-bold shadow-hard'
                    : 'border-paper-border bg-paper-light text-slateInk hover:border-slateInk'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Film Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-slateInk">
                {currentPreset.title}
              </h3>
              <p className="text-sm font-sans text-slateInk-muted mt-1">
                {currentPreset.tagline}
              </p>
            </div>

            {/* Color Swatches */}
            <div>
              <span className="font-mono-spec text-xs font-bold text-slateInk uppercase block mb-2">
                BẢNG MÀU CHỦ ĐẠO (CLICK MÃ HEX ĐỂ SAO CHÉP):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {currentPreset.palette.map((hex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopyHex(hex)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-paper-light border border-slateInk shadow-xs hover:border-terracotta transition-all text-xs font-mono-spec"
                  >
                    <span 
                      className="w-5 h-5 rounded-full border border-slateInk/30 inline-block shadow-xs" 
                      style={{ backgroundColor: hex }} 
                    />
                    <span className="font-bold">{hex}</span>
                    {copiedHex === hex && <Check className="w-3.5 h-3.5 text-terracotta" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Settings Code */}
            <div className="bg-paper-light border border-slateInk p-3 font-mono-spec text-xs space-y-1">
              <span className="text-[10px] text-terracotta font-bold uppercase tracking-wider block">
                THÔNG SỐ MÔ PHỎNG LIGHTROOM / FUJI RECIPE:
              </span>
              <p className="text-slateInk">{currentPreset.settings}</p>
            </div>
          </div>

          {/* Recommended Spots for this preset */}
          <div className="border-t lg:border-t-0 lg:border-l border-paper-border pt-4 lg:pt-0 lg:pl-6 space-y-3">
            <span className="font-mono-spec text-xs font-bold text-slateInk uppercase block">
              ĐỊA ĐIỂM CHỤP PHÙ HỢP NHẤT:
            </span>
            <div className="space-y-2">
              {currentPreset.idealSpots.map((spotName, idx) => {
                const foundSpot = spots.find(s => s.name.includes(spotName));
                return (
                  <div 
                    key={idx}
                    onClick={() => foundSpot && onSelectSpot(foundSpot)}
                    className={`p-2.5 bg-paper-light border border-slateInk flex items-center justify-between text-xs font-sans transition-all ${
                      foundSpot ? 'cursor-pointer hover:bg-terracotta hover:text-white group shadow-hard' : ''
                    }`}
                  >
                    <span className="font-semibold">{spotName}</span>
                    {foundSpot && (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lookbook Feed & Poses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slateInk pb-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-terracotta" />
            <h2 className="font-editorial text-2xl font-bold text-slateInk">
              Cẩm Nang Góc Chụp & Tạo Dáng Thực Tế
            </h2>
          </div>
          <span className="text-xs font-mono-spec text-slateInk-muted">
            {allInspirations.length} gợi ý góc máy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allInspirations.map(({ spot, ...inspo }) => (
            <div 
              key={inspo.id}
              className="bg-paper-card border border-slateInk shadow-hard flex flex-col justify-between overflow-hidden group"
            >
              <div className="relative aspect-[4/5] bg-slateInk overflow-hidden">
                <img 
                                  src={inspo.thumbnailUrl} 
                                  alt={inspo.authorName} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                          <PinReferenceButton imageUrl={inspo.thumbnailUrl} label={`Ảnh tham khảo tại ${spot.name}`} />
                <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-mono-spec font-bold bg-slateInk/90 text-white border border-white/20">
                  {inspo.platform}
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="px-2 py-1 text-xs font-mono-spec font-bold bg-paper-light text-slateInk border border-slateInk shadow-hard block truncate">
                    📍 {spot.name}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slateInk">{inspo.authorName}</span>
                    <span className="font-mono-spec text-slateInk-muted">{inspo.authorHandle}</span>
                  </div>
                  <p className="text-slateInk-muted font-sans mt-1 line-clamp-2">
                    {inspo.caption}
                  </p>
                </div>

                {inspo.poseTip && (
                  <div className="bg-paper-warm p-2.5 border border-paper-border text-xs font-sans">
                    <strong className="font-mono-spec text-[10px] text-terracotta block uppercase">
                      HƯỚNG DẪN DÁNG CHỤP:
                    </strong>
                    <span className="text-slateInk">{inspo.poseTip}</span>
                  </div>
                )}

                {inspo.cameraSettings && (
                  <div className="font-mono-spec text-[10px] text-slateInk bg-paper-warm px-2 py-1 border border-slateInk/20">
                    📷 {inspo.cameraSettings}
                  </div>
                )}

                <button
                  onClick={() => onSelectSpot(spot)}
                  className="w-full py-1.5 bg-slateInk text-white font-mono-spec text-xs font-bold hover:bg-terracotta transition-colors flex items-center justify-center"
                >
                  XEM HỒ SƠ ĐỊA ĐIỂM NÀY
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
