import { PinReferenceButton } from '../planner/PinReferenceButton';
import React from 'react';
import { Film, Sparkles, Aperture, Sliders, MapPin, Store } from 'lucide-react';
import type { Spot } from '../../types';
import { recommendFilmForSpot } from '../../utils/filmAdvisor';

import { openNearestFilmShops } from '../../hooks/useNearestLabs';

interface FilmSpecsCardProps {
  spot: Spot;
  className?: string;
  onSelectFilmFilter?: (filmId: string) => void;
  onOpenNearestLabs?: (filmName: string) => void;
}

export const FilmSpecsCard: React.FC<FilmSpecsCardProps> = ({
  spot,
  className = '',
  onSelectFilmFilter,
  onOpenNearestLabs
}) => {
  const recommendation = recommendFilmForSpot(spot);
  const { film, recommendedSettings, rationale } = recommendation;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-5 text-[#2C2621] shadow-sm transition-all hover:shadow-md ${className}`}>
      
      {/* Film Sprocket Perforations Header Accent */}
      <div className="flex items-center justify-between mb-3 border-b border-[#E2DAD0] pb-2.5">
        <div className="flex items-center space-x-2.5">
          {film.filmImageUrl ? (
            <img 
              src={film.filmImageUrl} 
              alt={film.fullName} 
              className="w-10 h-10 object-cover rounded-xl border border-[#D8CFBD] shadow-sm shrink-0"
            />
          ) : (
            <div className="p-2 rounded-xl bg-[#ECE4D0] text-[#A7502F] shrink-0">
              <Film className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-[#A7502F] flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Gợi ý cuộn film</span>
            </div>
            <h4 className="text-base font-bold text-[#2C2621] flex items-center space-x-1.5">
              <span>{film.fullName}</span>
              <span className="text-xs font-normal text-[#8C8377]">({film.format})</span>
            </h4>
          </div>
        </div>

        {/* ISO Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums border ${film.badgeBg}`}>
          ISO {film.iso}
        </div>
      </div>

      {/* Film Sample Demo Image (if available) */}
      {film.sampleImageUrl && (
        <div className="relative mb-3 rounded-xl overflow-hidden aspect-video border border-[#D8CFBD] group">
          <img 
                      src={film.sampleImageUrl} 
                      alt={`Ảnh mẫu ${film.fullName}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <PinReferenceButton imageUrl={film.sampleImageUrl} label={`Ảnh mẫu ${film.fullName}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
            <span className="text-xs text-white/90 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
              🎞️ Ảnh demo nước màu thực tế
            </span>
          </div>
        </div>
      )}

      {/* Rationale Quote */}
      <p className="text-sm text-[#554D43] leading-relaxed font-sans mb-3 flex items-start space-x-1.5">
        <span className="text-amber-500 font-serif text-base leading-none">“</span>
        <span className="flex-1 italic">{rationale}</span>
      </p>

      {/* Recommended Aperture & Shutter Speed Specs */}
      <div className="bg-white rounded-xl p-3 border border-[#D8CFBD] flex items-center justify-between text-sm mb-3">
        <div className="flex items-center space-x-1.5 text-[#554D43]">
          <Aperture className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="font-semibold tabular-nums">{recommendedSettings}</span>
        </div>

        {/* Color Palette Swatches */}
        <div className="flex items-center space-x-1">
          {film.paletteHex.map((hex, idx) => (
            <span
              key={idx}
              className="w-3 h-3 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: hex }}
              title={`Film Color Tone: ${hex}`}
            />
          ))}
        </div>
      </div>

      {/* Nearby Film Lab Shops Section */}
      {film.nearbyShops && film.nearbyShops.length > 0 && (
        <div className="bg-[#F3EAD7] rounded-xl p-3 border border-[#D8CFBD] text-sm mb-2">
          <div className="flex items-center space-x-1.5 font-bold text-[#8A4A2C] mb-1.5">
            <Store className="w-3.5 h-3.5" />
            <span>Địa điểm tráng & mua film gợi ý:</span>
          </div>
          <div className="space-y-1.5">
            {film.nearbyShops.map((shop, idx) => (
              <div key={idx} className="flex items-start justify-between bg-white p-2 rounded-lg border border-[#E2DAD0]">
                <div>
                  <div className="font-semibold text-[#2C2621] flex items-center space-x-1">
                    <span>{shop.name}</span>
                    <span className="text-[11px] text-[#A7502F] font-normal tabular-nums">({shop.distance_to_core_spots})</span>
                  </div>
                  <div className="text-xs text-[#6E655B] flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 shrink-0 text-neutral-400" />
                    <span className="truncate max-w-[200px]">{shop.address}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end shrink-0">
                  {shop.services.map((svc: string, sIdx: number) => (
                    <span key={sIdx} className="text-[11px] px-1.5 py-0.5 bg-[#ECE4D0] text-[#6E4B1F] rounded font-medium">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearest Film Lab Finder Button */}
      <button
        type="button"
        onClick={() => {
          if (onOpenNearestLabs) {
            onOpenNearestLabs(film.fullName);
          } else {
            openNearestFilmShops(film.fullName);
          }
        }}
        className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#F3EAD7] hover:bg-[#ECE4D0] text-[#8A4A2C] text-xs font-bold transition-all border border-[#D8CFBD] flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
      >
        <span>📍 Tìm Lab gần đây còn sẵn cuộn này</span>
      </button>

      {/* Optional Filter Action Trigger */}
      {onSelectFilmFilter && (
        <button
          type="button"
          onClick={() => onSelectFilmFilter(film.id)}
          className="w-full mt-2 py-2 rounded-xl bg-[#ECE4D0] hover:bg-[#E2DAD0] text-[#8A4A2C] text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
        >
          <Sliders className="w-3 h-3" />
          <span>Lọc địa điểm phù hợp với cuộn {film.name}</span>
        </button>
      )}
    </div>
  );
};

