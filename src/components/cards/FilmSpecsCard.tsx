import { PinReferenceButton } from '../planner/PinReferenceButton';
import React from 'react';
import { Film, Sparkles, Aperture, MapPin } from 'lucide-react';
import type { Spot } from '../../types';
import { recommendFilmForSpot } from '../../utils/filmAdvisor';

import { openNearestFilmShops } from '../../hooks/useNearestLabs';

interface FilmSpecsCardProps {
  spot: Spot;
  className?: string;
  onOpenNearestLabs?: (filmName: string) => void;
}

export const FilmSpecsCard: React.FC<FilmSpecsCardProps> = ({
  spot,
  className = '',
  onOpenNearestLabs
}) => {
  const recommendation = recommendFilmForSpot(spot);
  const { film, recommendedSettings, rationale } = recommendation;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-3 text-[#2C2621] shadow-sm sm:p-4 ${className}`}>
      
      {/* Film Sprocket Perforations Header Accent */}
      <div className="mb-2.5 flex items-center justify-between border-b border-[#E2DAD0] pb-2">
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
              <span>Film gợi ý</span>
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
        <div className="group relative mb-2.5 h-24 overflow-hidden rounded-xl border border-[#D8CFBD] sm:h-32">
          <img 
                      src={film.sampleImageUrl} 
                      alt={`Ảnh mẫu ${film.fullName}`} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <PinReferenceButton imageUrl={film.sampleImageUrl} label={`Ảnh mẫu ${film.fullName}`} />

        </div>
      )}

      {/* Brief film recommendation */}
      <p className="mb-2.5 line-clamp-2 text-xs leading-relaxed text-[#6E655B]">
        {rationale}
      </p>

      {/* Recommended Aperture & Shutter Speed Specs */}
      <div className="mb-2.5 flex items-center justify-between rounded-lg border border-[#D8CFBD] bg-white px-2.5 py-2 text-xs">
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

      <button
        type="button"
        onClick={() => {
          if (onOpenNearestLabs) {
            onOpenNearestLabs(film.fullName);
          } else {
            openNearestFilmShops(film.fullName);
          }
        }}
        className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#F3EAD7] px-3 py-2 text-xs font-semibold text-[#8A4A2C] transition-colors hover:bg-[#ECE4D0]"
      >
        <MapPin className="h-3.5 w-3.5" />
        <span>Tìm lab gần đây</span>
      </button>
    </div>
  );
};

