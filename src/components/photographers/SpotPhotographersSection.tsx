import React from 'react';
import { PinReferenceButton } from '../planner/PinReferenceButton';
import { Camera, Star, MessageCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { getPhotographersForSpot } from '../../data/mockPhotographers';
import { PartnerPhotographersForSpot } from './PartnerPhotographersForSpot';
import type { Photographer } from '../../types';

interface SpotPhotographersSectionProps {
  spotId: string;
  spotName: string;
  onSelectPhotographer: (photographer: Photographer) => void;
  onOpenDirectory?: () => void;
}

export const SpotPhotographersSection: React.FC<SpotPhotographersSectionProps> = ({
  spotId,
  spotName,
  onSelectPhotographer,
  onOpenDirectory,
}) => {
  const photographers = getPhotographersForSpot(spotId, spotName);

  if (!photographers || photographers.length === 0) return <PartnerPhotographersForSpot spotName={spotName} />;

  return (
    <div className="space-y-3 pt-4 border-t border-neutral-800/80">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Nhiếp Ảnh Gia Chuyên Góc Này</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {photographers.length} thợ
              </span>
            </h4>
          </div>
        </div>

        {onOpenDirectory && (
          <button
            type="button"
            onClick={onOpenDirectory}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Tất cả</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-neutral-400 leading-relaxed">
        Các nhiếp ảnh gia có kinh nghiệm căn góc, bắt ánh sáng và màu ảnh đẹp nhất tại <strong className="text-neutral-200">{spotName}</strong>:
      </p>

      {/* Mini Photographer Cards Carousel / List */}
      <div className="space-y-2.5">
        {photographers.slice(0, 3).map((photographer) => (
          <div
            key={photographer.id}
            className="group rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-amber-400/60 p-3 transition-all duration-200 text-neutral-200 flex flex-col gap-2.5 shadow-sm"
          >
            {/* Top Info */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <img
                  src={photographer.avatarUrl}
                  alt={photographer.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-700 group-hover:border-amber-400 shrink-0 transition-colors"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                      {photographer.name}
                    </span>
                    {photographer.badge && (
                      <span className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        {photographer.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                    <div className="flex items-center text-amber-400 font-bold gap-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{photographer.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span className="truncate">{photographer.gear.split('•')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Amber Price Badge */}
              <div className="shrink-0 text-right">
                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-bold text-[11px] shadow-sm">
                  {photographer.startingPriceFormatted}
                </span>
              </div>
            </div>

            {/* Quick 2-photo preview strip */}
            <div className="grid grid-cols-2 gap-1.5 rounded-lg overflow-hidden h-20 bg-neutral-900 border border-neutral-800/80">
              {photographer.featuredPhotos.slice(0, 2).map((imgUrl, i) => (
                <div key={i} className="relative h-full overflow-hidden">
                  <PinReferenceButton imageUrl={imgUrl} label={`Tác phẩm của ${photographer.name}`} />
                  <img
                    src={imgUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => onSelectPhotographer(photographer)}
                className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 border border-neutral-700 transition-all cursor-pointer"
              >
                <span>Xem Portfolio</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </button>

              <a
                href={photographer.contact.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2 rounded-lg bg-kodak-amber hover:bg-amber-400 text-editorial-bg font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
              >
                <MessageCircle className="w-3 h-3 fill-current" />
                <span>Nhắn Zalo</span>
              </a>
            </div>
          </div>
        ))}
      </div>
      <PartnerPhotographersForSpot spotName={spotName} />
    </div>
  );
};
