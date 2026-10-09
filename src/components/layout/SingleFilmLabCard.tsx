import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, MapPin, MessageCircle, Navigation, Plus, X } from 'lucide-react';
import type { FilmLab } from '../../data/filmLabsData';
import { useShootPlan } from '../../context/ShootPlanContext';

interface SingleFilmLabCardProps {
  lab: FilmLab;
  userCoords?: { lat: number; lng: number } | null;
  onClose: () => void;
}

function distanceInKm(from: { lat: number; lng: number }, to: FilmLab): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(to.lat - from.lat);
  const dLng = radians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const SingleFilmLabCard: React.FC<SingleFilmLabCardProps> = ({ lab, userCoords, onClose }) => {
  const plan = useShootPlan();
  const [selectedFilm, setSelectedFilm] = useState(lab.availableFilms[0] ?? '');
  const distance = userCoords ? distanceInKm(userCoords, lab) : null;
  const distanceLabel = distance === null ? null : distance < 1
    ? `${Math.round(distance * 1000)} m`
    : `${distance.toFixed(1)} km`;

  const addFilmToPlan = () => {
    if (!selectedFilm) return;
    plan?.addItem({
      id: `film-${lab.id}-${selectedFilm.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: selectedFilm,
      category: 'other',
      categoryLabel: 'Film',
      priceText: lab.priceRange,
      shopName: lab.name,
      link: lab.googleMapsUrl,
      type: 'purchase'
    });
  };

  return (
    <motion.aside
      role="dialog"
      aria-label={`Thông tin cửa hàng film ${lab.name}`}
      initial={{ opacity: 0, x: 20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20, y: 8 }}
      transition={{ duration: 0.18 }}
      className="fixed right-4 top-20 z-[var(--z-panel)] w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border border-[#D8CFBD] bg-[#FAF8F4] p-5 text-[#2C2621] shadow-2xl"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-mono-spec font-bold uppercase tracking-wider text-[#C76B3C]">Film Lab</span>
          <h2 className="mt-1 truncate text-base font-bold">{lab.name}</h2>
          {distanceLabel && <p className="mt-1 text-xs font-mono font-bold text-[#C76B3C]">{distanceLabel} từ vị trí của bạn</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng thông tin cửa hàng" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ECE4D0] text-[#554D43] hover:bg-[#E0D5BE]">
          <X size={17} />
        </button>
      </header>

      <div className="mt-4 space-y-2 text-xs text-[#6E655B]">
        <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-[#C76B3C]" />{lab.address}</p>
        <p className="flex items-center gap-2"><Clock3 size={15} className="shrink-0 text-[#8C8377]" />{lab.openingHours}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">

        {lab.priceRange && <span className="text-[11px] font-mono text-[#8C8377]">{lab.priceRange}</span>}
      </div>

      <section className="mt-4">
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6E655B]">Film có sẵn</h3>
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
          {lab.availableFilms.map((film) => (
            <button key={film} type="button" onClick={() => setSelectedFilm(film)} aria-pressed={selectedFilm === film}
              className={`rounded-lg border px-2 py-1 text-left text-[11px] transition-colors ${selectedFilm === film ? 'border-[#C76B3C] bg-[#F3EAD7] text-[#8C4A1F]' : 'border-[#D8CFBD] bg-[#ECE4D0] text-[#2C2621]'}`}>
              {film}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={lab.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#D0C4AA] bg-[#ECE4D0] px-2 text-xs font-semibold text-[#554D43] hover:bg-[#E0D5BE]">
          <Navigation size={14} />Chỉ đường
        </a>
        <a href={lab.zaloUrl || `tel:${lab.phone}`} target={lab.zaloUrl ? '_blank' : undefined} rel={lab.zaloUrl ? 'noopener noreferrer' : undefined} className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#C76B3C] px-2 text-xs font-bold text-white hover:bg-[#A9552E]">
          <MessageCircle size={14} />{lab.zaloUrl ? 'Nhắn Zalo' : 'Gọi điện'}
        </a>
        <button type="button" onClick={addFilmToPlan} disabled={!selectedFilm} className="col-span-2 flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#D8CFBD] bg-white px-3 text-xs font-semibold text-[#2C2621] hover:border-[#C76B3C] disabled:opacity-50">
          <Plus size={14} />Thêm cuộn film vào Kế hoạch chụp
        </button>
      </div>
    </motion.aside>
  );
};
