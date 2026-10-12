import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Compass, Film, MapPin, ShoppingBag } from 'lucide-react';
import type { ServiceListing } from '../../services/serviceHubApi';

interface FilmShopCardProps {
  shop: ServiceListing;
  isFeatured?: boolean;
  onOpen: (shop: ServiceListing) => void;
}

export const FilmShopCard: React.FC<FilmShopCardProps> = ({ shop, isFeatured = false, onOpen }) => {
  const reducedMotion = useReducedMotion();
  const [unavailableImages, setUnavailableImages] = useState<string[]>([]);
  const thumbnail = [shop.imageUrl, shop.productImageUrl].find((image) => image && !unavailableImages.includes(image));
  const area = [shop.ward, shop.district, 'Hà Nội'].filter(Boolean).join(', ');
  const hasCheapestRoll = Boolean(shop.cheapestRollName && Number(shop.minRollPrice) > 0);

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { y: -3 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
      id={isFeatured ? `partner-${shop.id}` : undefined}
      data-testid="film-shop-card"
      className="flex h-full flex-col rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-3 shadow-sm transition-shadow hover:border-[#C9B99F] hover:shadow-md motion-reduce:transition-none"
    >
      <button
        type="button"
        onClick={() => onOpen(shop)}
        aria-label={`Xem chi tiết ${shop.name}`}
        className="group flex w-full flex-1 flex-col rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C] focus-visible:ring-offset-2"
      >
        <span className="flex w-full items-center gap-3">
          <span className="relative flex h-24 w-20 shrink-0 items-center overflow-hidden rounded-xl bg-[#241E18] p-1.5">
            <span aria-hidden="true" className="mr-1.5 flex h-full flex-col justify-between py-1">{Array.from({ length: 5 }, (_, index) => <span key={index} className="h-2 w-1.5 rounded-sm bg-[#F3EBDD]/70" />)}</span>
            {thumbnail ? <img key={thumbnail} src={thumbnail} loading="lazy" onError={() => setUnavailableImages((current) => [...current, thumbnail])} alt={thumbnail === shop.imageUrl ? `Ảnh shop ${shop.name}` : `Ảnh film đang bán tại ${shop.name}`} className="h-full min-w-0 flex-1 rounded-sm object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" /> : <span className="flex h-full flex-1 items-center justify-center text-[#F3EBDD]" aria-hidden="true"><ShoppingBag className="h-6 w-6" /></span>}
          </span>
          <span className="min-w-0 flex-1">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#9A4F29]">Shop bán film</span>
            <span className="block break-words text-base font-bold leading-snug text-[#2C2621]">{shop.name}</span>
            {area && <span className="mt-2 flex min-w-0 items-start gap-1 text-xs leading-relaxed text-[#6E655B]"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{area}</span></span>}
          </span>
        </span>
        {(hasCheapestRoll || shop.price || Number(shop.minRollPrice) > 0) && <span role="group" aria-label={hasCheapestRoll ? `Cuộn rẻ nhất: ${shop.cheapestRollName} · ${Number(shop.minRollPrice).toLocaleString('vi-VN')}đ/cuộn` : 'Giá film'} className="relative mt-4 block w-full rounded-xl border border-[#E2D3BD] bg-[#F3EBDD] p-3">
          {hasCheapestRoll ? <>
            <span className="block"><span className="block text-[10px] font-semibold uppercase tracking-wider text-[#8B4828]">Cuộn rẻ nhất</span><span className="mt-1 block text-xs font-medium text-[#554D43]">{shop.cheapestRollName}</span><span className="mt-2 block font-mono text-xl font-semibold tracking-tight text-[#9A4F29]">{Number(shop.minRollPrice).toLocaleString('vi-VN')}đ<span className="ml-1 font-sans text-[10px] font-normal text-[#6E655B]">/cuộn</span></span></span>
          </> : <span className="block font-mono text-sm font-semibold text-[#9A4F29]">{shop.price || `Từ ${Number(shop.minRollPrice).toLocaleString('vi-VN')}đ/cuộn`}</span>}
          <span aria-hidden="true" className="absolute inset-y-3 right-3 border-r border-dashed border-[#C9B99F]" />
        </span>}
        {!!shop.filmStocks?.length && <span className="mt-3 flex w-full flex-wrap gap-1.5 text-[11px] leading-relaxed text-[#554D43]">{shop.filmStocks.slice(0, 3).map((film) => <span key={film} className="inline-flex max-w-full items-center gap-1 rounded-md border border-[#E2DAD0] px-2 py-1"><Film className="h-3 w-3 shrink-0 text-[#9A4F29]" /><span className="min-w-0 break-words">{film}</span></span>)}{shop.filmStocks.length > 3 && <span className="px-1 py-1 text-[#6E655B]">+{shop.filmStocks.length - 3} loại</span>}</span>}
        {shop.slogan && <span data-testid="film-shop-slogan" className="mt-3 block w-full border-t border-[#E2DAD0] pt-3 text-xs italic leading-relaxed text-[#6E655B]">{shop.slogan}</span>}
        <span className="mt-auto block w-full pt-4"><span className="flex min-h-11 items-center justify-between rounded-lg bg-[#ECE4D0] px-3 text-xs font-semibold text-[#8B4828] transition-colors group-hover:bg-[#E0D5BE] motion-reduce:transition-none">Xem chi tiết<ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" /></span></span>
      </button>
      {shop.secondaryLink && <div className="mt-3 flex justify-end border-t border-[#E2DAD0] pt-3"><a href={shop.secondaryLink} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#ECE4D0] px-3 text-sm font-semibold text-[#2C2621]"><Compass className="h-4 w-4" />Chỉ đường</a></div>}
    </motion.article>
  );
};
