import { PinReferenceButton } from '../planner/PinReferenceButton';
import React, { useState } from 'react';
import { Star, Camera, MessageCircle, ExternalLink, Sparkles, ClipboardList, Check } from 'lucide-react';
import type { Photographer } from '../../types';
import { useShootPlan } from '../../context/ShootPlanContext';

interface PhotographerCardProps {
  photographer: Photographer;
  onSelectPortfolio: (photographer: Photographer) => void;
}

export const PhotographerCard: React.FC<PhotographerCardProps> = ({
  photographer,
  onSelectPortfolio,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const shootPlan = useShootPlan();
  const isChosen = shootPlan?.photographer?.id === photographer.id;

  const previewPhoto = photographer.featuredPhotos[activePhotoIdx] || photographer.featuredPhotos[0];

  return (
    <div className="group rounded-2xl bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/50 p-4 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/40 flex flex-col gap-3.5 text-neutral-200">
      {/* 1. Header: Avatar + Info + Starting Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={photographer.avatarUrl}
              alt={photographer.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-neutral-700 group-hover:border-amber-400 transition-colors"
              loading="lazy"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-neutral-900 rounded-full" title="Sẵn sàng nhận lịch chụp" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                {photographer.name}
              </h4>
              {photographer.badge && (
                <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {photographer.badge}
                </span>
              )}
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-2 text-[11px] text-neutral-400 mt-0.5">
              <div className="flex items-center text-amber-400 font-bold space-x-0.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="ml-1">{photographer.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span className="text-neutral-400">({photographer.reviewCount} đánh giá)</span>
            </div>
          </div>
        </div>

        {/* Amber Starting Price Badge */}
        <div className="shrink-0 text-right">
          <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-400 text-neutral-950 font-bold text-xs tracking-tight shadow-sm shadow-amber-500/20">
            {photographer.startingPriceFormatted}
          </span>
        </div>
      </div>

      {/* 2. Camera Gear Info */}
      <div className="flex items-center space-x-2 text-[11px] text-neutral-400 bg-neutral-900/90 rounded-lg px-2.5 py-1.5 border border-neutral-800/80">
        <Camera className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="truncate font-mono-spec text-[10px] text-neutral-300">
          {photographer.gear}
        </span>
      </div>

      {/* 3. Featured Photos Preview Frame (Hover to switch photo fast) */}
      <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 aspect-16/9 group/img select-none">
        <img
          src={previewPhoto}
          alt={`Tác phẩm của ${photographer.name}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img:scale-105"
          loading="lazy"
        />
          <PinReferenceButton imageUrl={previewPhoto} label={`Tác phẩm của ${photographer.name}`} />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Thumbnail Selector Pills in Bottom Left */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
          {photographer.featuredPhotos.map((photoUrl, idx) => (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setActivePhotoIdx(idx)}
              onClick={() => setActivePhotoIdx(idx)}
              aria-label={`Xem ảnh ${idx + 1}`}
              className={`w-5 h-5 rounded-md overflow-hidden border transition-all ${
                activePhotoIdx === idx
                  ? 'border-amber-400 scale-110 shadow-xs ring-1 ring-amber-400'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Photo position in the photographer's gallery */}
        <div className="absolute bottom-2 right-2 z-10 text-[10px] font-semibold text-neutral-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{activePhotoIdx + 1}/{photographer.featuredPhotos.length}</span>
        </div>
      </div>

      {/* 4. Vibe Tags */}
      <div className="flex flex-wrap gap-1.5">
        {photographer.vibes.map((vibe) => (
          <span
            key={vibe}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800"
          >
            #{vibe}
          </span>
        ))}
      </div>

      {/* 5. Action Buttons: 1. Chọn thợ này (Kế hoạch) | 2. Xem Portfolio | 3. Zalo */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Nút [+ Chọn thợ này] vào Kế Hoạch & Dự Toán */}
        <button
          type="button"
          onClick={() => {
            if (isChosen) {
              shootPlan?.removePhotographer();
            } else {
              shootPlan?.setPhotographer(photographer);
            }
          }}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all border cursor-pointer ${
            isChosen
              ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700 hover:border-amber-400/50'
          }`}
          title={isChosen ? 'Bỏ chọn thợ này khỏi kế hoạch' : 'Chọn thợ này vào Kế hoạch & Dự toán chi phí'}
        >
          {isChosen ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Đã chọn thợ này trong Kế hoạch</span>
            </>
          ) : (
            <>
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span>+ Chọn thợ này ({photographer.startingPriceFormatted})</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectPortfolio(photographer)}
            className="py-2.5 px-3 rounded-xl bg-neutral-850 hover:bg-neutral-750 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all border border-neutral-700/80 cursor-pointer"
          >
            <span>Xem Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <a
            href={photographer.contact.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-kodak-amber hover:bg-amber-400 active:scale-[0.98] text-editorial-bg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Nhắn Zalo</span>
          </a>
        </div>
      </div>
    </div>
  );
};
