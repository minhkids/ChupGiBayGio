import React from 'react';
import { ArrowUpRight, Compass, MapPin, ShoppingBag } from 'lucide-react';
import type { ServiceListing } from '../../services/serviceHubApi';

interface FilmShopCardProps {
  shop: ServiceListing;
  isFeatured?: boolean;
  onOpen: (shop: ServiceListing) => void;
}

export const FilmShopCard: React.FC<FilmShopCardProps> = ({ shop, isFeatured = false, onOpen }) => {
  const area = [shop.ward, shop.district, 'Hà Nội'].filter(Boolean).join(', ');

  return (
    <article
      id={isFeatured ? `partner-${shop.id}` : undefined}
      data-testid="film-shop-card"
      className="rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-3 transition-colors hover:border-[#C9B99F]"
    >
      <button
        type="button"
        onClick={() => onOpen(shop)}
        aria-label={`Xem chi tiết ${shop.name}`}
        className="group block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C] focus-visible:ring-offset-2"
      >
        <span className="flex items-start gap-3">
          {shop.imageUrl ? (
            <img src={shop.imageUrl} alt={`Ảnh shop ${shop.name}`} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          ) : shop.productImageUrl ? (
            <img src={shop.productImageUrl} alt={`Ảnh film đang bán tại ${shop.name}`} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EFE9DF] text-[#8B4828]" aria-hidden="true">
              <ShoppingBag className="h-5 w-5" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-[#2C2621]">{shop.name}</span>
            {area && <span className="mt-1 flex min-w-0 items-center gap-1 text-xs text-[#6E655B]"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{area}</span></span>}
          </span>
        </span>
        {shop.price && <span className="mt-2 block text-xs font-semibold text-[#C76B3C]">{shop.price}</span>}
        {shop.cheapestRollName && Number(shop.minRollPrice) > 0 && <span className="mt-1 block text-xs font-semibold text-[#8B4828]">Cuộn rẻ nhất: {shop.cheapestRollName} · {Number(shop.minRollPrice).toLocaleString('vi-VN')}đ/cuộn</span>}
        {!!shop.filmStocks?.length && <span className="mt-2 block line-clamp-2 text-xs leading-relaxed text-[#554D43]"><span className="font-semibold">Film: </span>{shop.filmStocks.slice(0, 3).join(' · ')}{shop.filmStocks.length > 3 && ` · +${shop.filmStocks.length - 3} loại`}</span>}
        {shop.slogan && <span data-testid="film-shop-slogan" className="mt-3 block border-t border-[#E2DAD0] pt-3 text-xs leading-relaxed text-[#6E655B]">{shop.slogan}</span>}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#8B4828] group-hover:text-[#C76B3C]">Xem chi tiết <ArrowUpRight className="h-3.5 w-3.5" /></span>
      </button>
      {shop.secondaryLink && <div className="mt-3 flex justify-end border-t border-[#E2DAD0] pt-3"><a href={shop.secondaryLink} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#ECE4D0] px-3 text-sm font-semibold text-[#2C2621]"><Compass className="h-4 w-4" />Chỉ đường</a></div>}
    </article>
  );
};
