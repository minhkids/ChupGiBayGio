import React from 'react';
import { Film, Sparkles, Aperture, Sliders, MapPin, Store } from 'lucide-react';
import type { Spot } from '../types';
import { recommendFilmForSpot } from '../utils/filmAdvisor';

interface FilmSpecsCardProps {
  spot: Spot;
  className?: string;
  onSelectFilmFilter?: (filmId: string) => void;
}

export const FilmSpecsCard: React.FC<FilmSpecsCardProps> = ({
  spot,
  className = '',
  onSelectFilmFilter
}) => {
  const recommendation = recommendFilmForSpot(spot);
  const { film, recommendedSettings, rationale } = recommendation;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 dark:from-neutral-900/90 dark:via-neutral-900 dark:to-neutral-850/80 p-5 shadow-md backdrop-blur-md transition-all hover:shadow-lg ${className}`}>
      
      {/* Film Sprocket Perforations Header Accent */}
      <div className="flex items-center justify-between mb-3 border-b border-amber-200/50 dark:border-neutral-800 pb-2.5">
        <div className="flex items-center space-x-2.5">
          {film.filmImageUrl ? (
            <img 
              src={film.filmImageUrl} 
              alt={film.fullName} 
              className="w-10 h-10 object-cover rounded-xl border border-amber-200 dark:border-neutral-700 shadow-sm shrink-0" 
            />
          ) : (
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Film className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="text-xs font-mono-spec font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Gợi ý cuộn film</span>
            </div>
            <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
              <span>{film.fullName}</span>
              <span className="text-xs font-mono-spec font-normal text-neutral-400">({film.format})</span>
            </h4>
          </div>
        </div>

        {/* ISO Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-mono-spec font-bold border ${film.badgeBg}`}>
          ISO {film.iso}
        </div>
      </div>

      {/* Film Sample Demo Image (if available) */}
      {film.sampleImageUrl && (
        <div className="relative mb-3 rounded-xl overflow-hidden aspect-video border border-amber-200/40 dark:border-neutral-800 group">
          <img 
            src={film.sampleImageUrl} 
            alt={`Ảnh mẫu ${film.fullName}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
            <span className="text-xs font-mono-spec text-white/90 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
              🎞️ Ảnh demo nước màu thực tế
            </span>
          </div>
        </div>
      )}

      {/* Rationale Quote */}
      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans mb-3 flex items-start space-x-1.5">
        <span className="text-amber-500 font-serif text-base leading-none">“</span>
        <span className="flex-1 italic">{rationale}</span>
      </p>

      {/* Recommended Aperture & Shutter Speed Specs */}
      <div className="bg-white/80 dark:bg-neutral-800/80 rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-between text-sm font-mono-spec mb-3">
        <div className="flex items-center space-x-1.5 text-neutral-700 dark:text-neutral-300">
          <Aperture className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="font-semibold">{recommendedSettings}</span>
        </div>

        {/* Color Palette Swatches */}
        <div className="flex items-center space-x-1">
          {film.paletteHex.map((hex, idx) => (
            <span
              key={idx}
              className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-xs"
              style={{ backgroundColor: hex }}
              title={`Film Color Tone: ${hex}`}
            />
          ))}
        </div>
      </div>

      {/* Nearby Film Lab Shops Section */}
      {film.nearbyShops && film.nearbyShops.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-neutral-800/40 rounded-xl p-3 border border-amber-200/40 dark:border-neutral-700/50 text-sm mb-2">
          <div className="flex items-center space-x-1.5 font-bold text-amber-800 dark:text-amber-300 mb-1.5">
            <Store className="w-3.5 h-3.5" />
            <span>Địa điểm tráng & mua film gợi ý:</span>
          </div>
          <div className="space-y-1.5">
            {film.nearbyShops.map((shop, idx) => (
              <div key={idx} className="flex items-start justify-between bg-white/70 dark:bg-neutral-900/60 p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center space-x-1">
                    <span>{shop.name}</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono-spec font-normal">({shop.distance_to_core_spots})</span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 shrink-0 text-neutral-400" />
                    <span className="truncate max-w-[200px]">{shop.address}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end shrink-0">
                  {shop.services.map((svc: string, sIdx: number) => (
                    <span key={sIdx} className="text-[11px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 rounded font-mono-spec">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Filter Action Trigger */}
      {onSelectFilmFilter && (
        <button
          type="button"
          onClick={() => onSelectFilmFilter(film.id)}
          className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono-spec font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
        >
          <Sliders className="w-3 h-3" />
          <span>Lọc địa điểm phù hợp với cuộn {film.name}</span>
        </button>
      )}
    </div>
  );
};

