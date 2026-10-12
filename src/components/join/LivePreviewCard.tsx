import { Camera, Clock3, Film, MapPin, Phone } from 'lucide-react';

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
  phone?: string;
  openingHours?: string;
  filmStocks?: string[];
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
  const thumbnail = (lab ? data.image || data.productImage : data.portfolio?.[0] || data.image);
  const location = lab
    ? [data.ward, data.district, 'Hà Nội'].filter(Boolean).join(', ')
    : data.address
    ? `${data.address}${data.district && !data.address.toLocaleLowerCase('vi').includes(data.district.toLocaleLowerCase('vi')) ? `, ${data.district}` : ''}`
    : data.district;
  const highlights = lab ? data.filmStocks : data.styles;
  return <article data-testid="partner-preview" className="mx-auto w-full max-w-sm rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 text-[#2C2621] shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EAE1D1] sm:h-24 sm:w-24">
        {thumbnail ? <img src={thumbnail} alt={lab ? `Ảnh film của ${data.name || 'shop'}` : `Ảnh của ${data.name || 'nhiếp ảnh gia'}`} className="h-full w-full object-cover" /> : (lab ? <Film aria-hidden="true" className="h-7 w-7 text-[#B28B72]" /> : <Camera aria-hidden="true" className="h-7 w-7 text-[#B28B72]" />)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#9A4F29]">{lab ? 'Shop bán film' : 'Nhiếp ảnh gia'}</p>
        <h3 className="mt-1 break-words text-base font-bold leading-snug">{data.name || (lab ? 'Tên tiệm film của bạn' : 'Nghệ danh của bạn')}</h3>
        {lab && data.slogan && <p className="mt-1 break-words text-xs leading-snug text-[#675D52]">{data.slogan}</p>}
        {lab && data.minRollPrice && <p className="mt-2 text-sm font-bold leading-snug text-[#8B4828]">{data.maxRollPrice ? `${Number(data.minRollPrice).toLocaleString('vi-VN')}–${Number(data.maxRollPrice).toLocaleString('vi-VN')}đ/cuộn` : `Từ ${Number(data.minRollPrice).toLocaleString('vi-VN')}đ/cuộn`}</p>}
        {lab && data.cheapestRollName && data.minRollPrice && <p className="mt-1 text-xs font-semibold leading-snug text-[#8B4828]">Rẻ nhất: {data.cheapestRollName} · {Number(data.minRollPrice).toLocaleString('vi-VN')}đ/cuộn</p>}
        {!lab && data.packagePrice && <p className="mt-2 text-sm font-bold text-[#8B4828]">Từ {Number(data.packagePrice).toLocaleString('vi-VN')}đ/gói</p>}
      </div>
    </div>
    <div className="mt-3 space-y-2.5 border-t border-[#E2DAD0] pt-3 text-xs text-[#554D43]">
      {location && <p className="flex items-start gap-2"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-[#C76B3C]" /><span>{location}</span></p>}
      {lab && data.openingHours && <p className="flex items-start gap-2"><Clock3 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#C76B3C]" /><span>{data.openingHours}</span></p>}
      {!!highlights?.length && <p className="leading-relaxed"><span className="font-semibold">{lab ? 'Film: ' : 'Phong cách: '}</span>{highlights.slice(0, 3).join(' · ')}{highlights.length > 3 && ` · +${highlights.length - 3} loại khác`}</p>}
      {!lab && data.packageName && <p className="leading-relaxed"><span className="font-semibold">{data.packageName}</span>{[data.packageDuration, data.packageDeliverables].filter(Boolean).length ? ` · ${[data.packageDuration, data.packageDeliverables].filter(Boolean).join(' · ')}` : ''}</p>}
      {!lab && !!data.shootSpots?.length && <p className="leading-relaxed">Khu vực chụp: {data.shootSpots.join(' · ')}</p>}
    </div>
    {data.phone && <a href={`tel:${data.phone.replace(/[^\d+]/g, '')}`} className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 py-2 text-sm font-semibold text-white"><Phone aria-hidden="true" className="h-4 w-4" />Gọi {data.phone}</a>}
  </article>;
}
