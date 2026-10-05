import React, { useState } from 'react';
import { Film, Store, Sparkles } from 'lucide-react';
import { FILM_STOCKS } from '../../utils/filmAdvisor';

export const FilmGalleryView: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const films = Object.values(FILM_STOCKS);

  return (
    <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-950 overflow-y-auto w-full custom-scrollbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-24">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-amber-500" />
            Các Cuộn Film Nổi Tiếng
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Khám phá đặc trưng màu sắc, thông số và các địa điểm chụp phù hợp nhất cho từng loại film.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {films.map((film) => (
            <div 
              key={film.id}
              className={`flex flex-col rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300`}
            >
              {/* Header / Hero Image */}
              <div className="relative h-48 w-full bg-neutral-200 dark:bg-neutral-800 shrink-0">
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
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 italic mb-4">
                    "{film.description}"
                  </p>
                  
                  {/* Color Palette */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
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
                <div className="mt-auto space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  {/* Time/Season */}
                  <div className="space-y-1.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Thời điểm chụp lý tưởng
                    </h3>
                    <p className="text-sm text-neutral-800 dark:text-neutral-200">
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
                          <li key={i} className="text-xs bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg">
                            <strong className="block text-neutral-800 dark:text-neutral-200">{shop.name}</strong>
                            <span className="text-neutral-500 block truncate">{shop.address}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
