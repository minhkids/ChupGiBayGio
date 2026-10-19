import { Camera, Clock3, Film, MapPin, Phone } from 'lucide-react';
import type { FilmShopLocation } from '../../services/serviceHubApi';
import { ExpressDeliveryBadge } from '../layout/ExpressDeliveryBadge';

export interface PartnerPreview {
  kind: 'lab' | 'photographer';
  name: string;
  slogan?: string;
  image?: string;
  productImage?: string;
  cheapestRollName?: string;
  minRollPrice?: string;
  maxRollPrice?: string;
  address?: string;
  district?: string;
  ward?: string;
  locations?: FilmShopLocation[];
  phone?: string;
  openingHours?: string;
  filmStocks?: string[];
  expressDelivery2h?: boolean;
  styles?: string[];
  shootSpots?: string[];
  packageName?: string;
  packagePrice?: string;
  packageDuration?: string;
  packageDeliverables?: string;
  portfolio?: string[];
}

export function LivePreviewCard({ data }: { data: PartnerPreview }) {
  const lab = data.kind === 'lab';
  const thumbnail = data.image;
  const branches = lab ? data.locations?.filter((item) => item.ward.trim() || item.district.trim()) || [] : [];
  const location = lab ? [data.ward, data.district, 'Hà Nội'].filter(Boolean).join(', ') : '';
  const startingPrice = Number(data.packagePrice);
  const highlights = lab ? data.filmStocks : data.styles;
  return <article data-testid="partner-preview" className="mx-auto w-full max-w-sm rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 text-[#2C2621] shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EAE1D1] sm:h-24 sm:w-24">
        {thumbnail ? <img src={thumbnail} alt={lab ? `Ảnh shop ${data.name || ''}` : `Ảnh đại diện ${data.name || 'nhiếp ảnh gia'}`} className="h-full w-full object-cover" /> : (lab ? <Film aria-hidden="true" className="h-7 w-7 text-[#B28B72]" /> : <Camera aria-hidden="true" className="h-7 w-7 text-[#B28B72]" />)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#9A4F29]">{lab ? 'Shop bán film' : 'Nhiếp ảnh gia'}</p>
        <h3 className="mt-1 break-words text-base font-bold leading-snug">{data.name || (lab ? 'Tên tiệm film của bạn' : 'Nghệ danh của bạn')}</h3>
        {lab && data.slogan && <p className="mt-1 break-words text-xs leading-snug text-[#675D52]">{data.slogan}</p>}
        {lab && data.minRollPrice && <p className="mt-2 text-sm font-bold leading-snug text-[#8B4828]">{data.maxRollPrice ? `${Number(data.minRollPrice).toLocaleString('vi-VN')}–${Number(data.maxRollPrice).toLocaleString('vi-VN')}đ/cuộn` : `Từ ${Number(data.minRollPrice).toLocaleString('vi-VN')}đ/cuộn`}</p>}
        {lab && data.cheapestRollName && data.minRollPrice && <p className="mt-1 text-xs font-semibold leading-snug text-[#8B4828]">Rẻ nhất: {data.cheapestRollName} · {Number(data.minRollPrice).toLocaleString('vi-VN')}đ/cuộn</p>}
        {!lab && <p className="mt-2 rounded-xl border border-[#C76B3C] bg-[#F3E6D6] px-3 py-2 text-sm font-bold text-[#8B4828]">Giá từ {startingPrice > 0 ? `${startingPrice.toLocaleString('vi-VN')}đ` : 'chưa nhập'}</p>}
      </div>
    </div>
    {lab && data.expressDelivery2h && <ExpressDeliveryBadge className="mt-3" />}
    <div className="mt-3 space-y-2.5 border-t border-[#E2DAD0] pt-3 text-xs text-[#554D43]">
      {branches.length > 0 ? <ul aria-label="Các cơ sở trong bản xem trước" className="space-y-1.5">{branches.map((branch, index) => <li key={`${branch.ward}-${branch.district}-${index}`} className="flex items-start gap-2"><MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#C76B3C]" /><span><span className="font-semibold">Cơ sở {index + 1}: </span>{[branch.ward, branch.district, 'Hà Nội'].filter(Boolean).join(', ')}{branch.openingHours && <span className="block pl-0 text-[11px] text-[#6E655B]">Giờ mở cửa: {branch.openingHours}</span>}</span></li>)}</ul> : location && <p className="flex items-start gap-2"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-[#C76B3C]" /><span>{location}</span></p>}
      {lab && !branches.length && data.openingHours && <p className="flex items-start gap-2"><Clock3 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#C76B3C]" /><span>{data.openingHours}</span></p>}
      {!!highlights?.length && <p className="leading-relaxed"><span className="font-semibold">{lab ? 'Film: ' : 'Phong cách: '}</span>{highlights.slice(0, 3).join(' · ')}{highlights.length > 3 && ` · +${highlights.length - 3} loại khác`}</p>}
      {!lab && data.packageName && <p className="leading-relaxed"><span className="font-semibold">{data.packageName}</span>{[data.packageDuration, data.packageDeliverables].filter(Boolean).length ? ` · ${[data.packageDuration, data.packageDeliverables].filter(Boolean).join(' · ')}` : ''}</p>}
      {!lab && !!data.shootSpots?.length && <p className="leading-relaxed">Khu vực chụp: {data.shootSpots.join(' · ')}</p>}
    </div>
    {lab && data.productImage && <figure className="mt-3 overflow-hidden rounded-xl border border-[#D8CFBD] bg-white p-2"><figcaption className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#8B4828]">Bảng giá</figcaption><img src={data.productImage} alt={`Bảng giá của ${data.name || 'shop'}`} className="max-h-36 w-full rounded-lg object-contain" /></figure>}
    {data.phone && <a href={`tel:${data.phone.replace(/[^\d+]/g, '')}`} className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 py-2 text-sm font-semibold text-white"><Phone aria-hidden="true" className="h-4 w-4" />Gọi {data.phone}</a>}
  </article>;
}
