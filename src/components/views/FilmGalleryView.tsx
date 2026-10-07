import React, { useState } from 'react';
import { PinReferenceButton } from '../planner/PinReferenceButton';
import { Film, Store, Sparkles } from 'lucide-react';
import { FILM_STOCKS } from '../../utils/filmAdvisor';
import { openNearestFilmShops } from '../../hooks/useNearestLabs';

export const FilmGalleryView: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const films = Object.values(FILM_STOCKS);

  return (
    <div className="absolute inset-0 bg-[#F7F5F0] overflow-y-auto w-full custom-scrollbar text-[#2C2621]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-24">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2621] tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-amber-500" />
            Các Cuộn Film Nổi Tiếng
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#6E655B] max-w-2xl">
            Khám phá đặc trưng màu sắc, thông số và các địa điểm chụp phù hợp nhất cho từng loại film.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {films.map((film) => (
            <div 
              key={film.id}
              className="flex flex-col rounded-3xl border border-[#E2DAD0] bg-white overflow-hidden shadow-[0_4px_20px_rgba(44,38,33,0.04)] hover:shadow-[0_8px_30px_rgba(44,38,33,0.08)] transition-shadow duration-300"
            >
              {/* Header / Hero Image */}
              <div className="relative h-48 w-full bg-[#EFE9DF] shrink-0 border-b border-[#EFE9DF]">
                {film.sampleImageUrl && <PinReferenceButton imageUrl={film.sampleImageUrl} label={`Ảnh mẫu ${film.fullName}`} />}
                {film.sampleImageUrl ? (
                  <img src={film.sampleImageUrl} alt={`Sample ${film.fullName}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Film className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1 drop-shadow-md">{film.fullName}</h2>
                    <p className="text-xs font-mono font-medium text-neutral-200 drop-shadow-md flex gap-2">
                      <span>ISO {film.iso}</span>
                      <span>•</span>
                      <span>{film.format}</span>
                    </p>
                  </div>
                  {film.filmImageUrl && (
                    <img src={film.filmImageUrl} alt={film.brand} className="w-12 h-12 object-cover rounded-lg border-2 border-white/20 shadow-lg" />
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1 gap-5">
                <div>
                  <p className="text-sm text-[#6E655B] italic mb-4">
                    "{film.description}"
                  </p>
                  
                  {/* Color Palette */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C8377] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Tone Màu Đặc Trưng
                    </h3>
                    <div className="flex rounded-xl overflow-hidden shadow-inner h-8">
                      {film.paletteHex.map((hex) => (
                        <button
                          key={hex}
                          onClick={() => handleCopyHex(hex)}
                          className="flex-1 transition-transform hover:scale-110 focus:outline-none focus:z-10 relative group"
                          style={{ backgroundColor: hex }}
                          title={`Copy ${hex}`}
                        >
                          {copiedHex === hex && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm text-[10px] text-white font-mono font-bold">
                              COPIED
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info block */}
                <div className="mt-auto space-y-4 pt-4 border-t border-[#E2DAD0]">
                  {/* Time/Season */}
                  <div className="space-y-1.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8C8377]">
                      Thời điểm chụp lý tưởng
                    </h3>
                    <p className="text-sm text-[#2C2621]">
                      {film.recommendedTime || 'Linh hoạt mọi thời điểm'}
                    </p>
                  </div>

                  {/* Nearby Shops */}
                  {film.nearbyShops && film.nearbyShops.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" /> Nơi mua / Tráng film
                      </h3>
                      <ul className="space-y-2">
                        {film.nearbyShops.map((shop, i) => (
                          <li key={i} className="text-xs bg-[#FAF8F4] border border-[#D8CFBD] p-2 rounded-lg">
                            <strong className="block text-[#2C2621]">{shop.name}</strong>
                            <span className="text-[#6E655B] block truncate">{shop.address}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Button to open Nearest Film Labs drawer */}
                  <button
                    type="button"
                    onClick={() => openNearestFilmShops(film.fullName)}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 border border-amber-500/30 cursor-pointer"
                  >
                    <span>📍 Tìm Lab gần đây còn sẵn cuộn này</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
