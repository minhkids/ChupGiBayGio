import { Camera, Clock3, Film, MapPin, Phone } from 'lucide-react';

export interface PartnerPreview {
  kind: 'lab' | 'photographer';
  name: string;
  image?: string;
  address?: string;
  district?: string;
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
  return <article data-testid="partner-preview" className="overflow-hidden rounded-[28px] border border-[#D8CFBD] bg-[#FAF8F4] text-[#2C2621] shadow-[0_18px_50px_-30px_rgba(44,38,33,.3)]">
    <div className="relative flex aspect-[16/9] items-center justify-center bg-[#EAE1D1]">
      {data.image ? <img src={data.image} alt={data.name || 'Ảnh đại diện'} className="h-full w-full object-cover" /> : (lab ? <Film aria-hidden="true" className="h-12 w-12 text-[#B28B72]" /> : <Camera aria-hidden="true" className="h-12 w-12 text-[#B28B72]" />)}
      <span className="absolute bottom-3 left-3 rounded-full bg-[#FAF8F4]/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9A4F29]">{lab ? 'Shop bán film' : 'Nhiếp ảnh gia'}</span>
    </div>
    <div className="space-y-4 p-5 sm:p-6">
      <div><h3 className="text-xl font-bold leading-tight">{data.name || (lab ? 'Tên tiệm film của bạn' : 'Nghệ danh của bạn')}</h3><p className="mt-1 text-xs text-[#675D52]">Thẻ thông tin khách hàng sẽ thấy trên website</p></div>
      {lab ? <>
        <p className="flex items-start gap-2 text-sm"><MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#C76B3C]" />{[data.address, data.district].filter(Boolean).join(', ') || 'Địa chỉ tiệm tại Hà Nội'}</p>
        {data.openingHours && <p className="flex items-center gap-2 text-sm"><Clock3 aria-hidden="true" className="h-4 w-4 text-[#C76B3C]" />{data.openingHours}</p>}
        {!!data.filmStocks?.length && <div className="flex flex-wrap gap-1.5">{data.filmStocks.map((film) => <span key={film} className="rounded-full border border-[#D8CFBD] bg-white px-2.5 py-1 text-xs">{film}</span>)}</div>}
      </> : <>
        {!!data.portfolio?.length && <div className="grid grid-cols-3 gap-1.5">{data.portfolio.slice(0, 3).map((url, index) => <img key={index} src={url} alt={`Ảnh portfolio ${index + 1}`} className="aspect-square w-full rounded-lg object-cover" />)}</div>}
        {!!data.styles?.length && <div className="flex flex-wrap gap-1.5">{data.styles.map((style) => <span key={style} className="rounded-full bg-[#EDE3D2] px-2.5 py-1 text-xs">#{style.replace(/^#/, '')}</span>)}</div>}
        {!!data.shootSpots?.length && <p className="flex items-start gap-2 text-sm"><MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#C76B3C]" />{data.shootSpots.join(' · ')}</p>}
        {data.packageName && <div className="rounded-xl bg-[#F3EBDD] p-3 text-sm"><p><strong>{data.packageName}</strong>{data.packagePrice ? ` · ${Number(data.packagePrice).toLocaleString('vi-VN')}đ` : ''}</p>{data.packageDuration && <p className="mt-1 text-[#554D43]">{data.packageDuration}</p>}{data.packageDeliverables && <p className="mt-1 text-[#554D43]">{data.packageDeliverables}</p>}</div>}
      </>}
      <div className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 py-2 text-sm font-semibold text-white"><Phone aria-hidden="true" className="h-4 w-4" />{data.phone ? `Liên hệ ${data.phone}` : 'Liên hệ trực tiếp'}</div>
    </div>
  </article>;
}
