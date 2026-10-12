import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import { Clock3, MapPin, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react';
import type { ServiceListing } from '../../services/serviceHubApi';

interface FilmShopDetailDialogProps {
  shop: ServiceListing;
  onClose: () => void;
}

const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

function getPriceLabel(shop: ServiceListing): string {
  if (shop.price?.trim()) return shop.price;
  const minimum = Number(shop.minRollPrice) || 0;
  const maximum = Number(shop.maxRollPrice) || 0;
  if (minimum && maximum) return `${formatPrice(minimum)} – ${formatPrice(maximum)}/cuộn`;
  if (minimum) return `Từ ${formatPrice(minimum)}/cuộn`;
  if (maximum) return `Đến ${formatPrice(maximum)}/cuộn`;
  return '';
}

export const FilmShopDetailDialog: React.FC<FilmShopDetailDialogProps> = ({ shop, onClose }) => {
  const images = [...new Set([shop.productImageUrl, shop.imageUrl].filter((value): value is string => Boolean(value)))];
  const [activeImage, setActiveImage] = useState(images[0] || '');
  const [unavailableImages, setUnavailableImages] = useState<string[]>([]);
  const location = [shop.ward, shop.district, 'Hà Nội'].filter(Boolean).join(', ');
  const priceLabel = getPriceLabel(shop);
  const markImageUnavailable = (failedImage: string) => {
    setUnavailableImages((current) => current.includes(failedImage) ? current : [...current, failedImage]);
    if (activeImage === failedImage) {
      setActiveImage(images.find((image) => image !== failedImage && !unavailableImages.includes(image)) || '');
    }
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[#241E18]/55 sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="film-shop-detail-title"
        className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#F7F5F0] text-[#2C2621] shadow-2xl sm:h-auto sm:max-h-[min(920px,calc(100dvh-40px))] sm:max-w-5xl sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E2DAD0] bg-[#FAF8F4] px-4 py-3 sm:px-7">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A4F29]">Mua film <span className="px-1 text-[#B7AA96]">/</span> Chi tiết shop</p>
            <p className="mt-0.5 truncate text-xs text-[#6E655B]">{shop.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết shop" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECE4D0] text-[#554D43] hover:bg-[#E0D5BE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C]">
            <X className="h-5 w-5" />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <section className="p-4 sm:p-7 lg:border-r lg:border-[#E2DAD0]" aria-label="Ảnh cửa hàng và sản phẩm">
              {activeImage ? (
                <img src={activeImage} onError={() => markImageUnavailable(activeImage)} alt={activeImage === shop.productImageUrl ? `Film đang bán tại ${shop.name}` : `Ảnh cửa hàng ${shop.name}`} className="aspect-[4/3] w-full rounded-2xl border border-[#D8CFBD] bg-[#EFE9DF] object-cover" />
              ) : (
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-[#D8CFBD] bg-[#EFE9DF] text-[#8B4828]">
                  <ShoppingBag className="h-8 w-8" />
                  <span className="text-sm font-medium text-[#6E655B]">{unavailableImages.length ? 'Không tải được ảnh shop' : 'Shop chưa có ảnh'}</span>
                </div>
              )}
              {images.filter((image) => !unavailableImages.includes(image)).length > 1 && <div className="mt-3 flex gap-2" aria-label="Ảnh khác của shop">{images.filter((image) => !unavailableImages.includes(image)).map((image, index) => <button key={image} type="button" aria-label={`Xem ảnh ${index + 1}`} aria-pressed={activeImage === image} onClick={() => setActiveImage(image)} className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${activeImage === image ? 'border-[#C76B3C]' : 'border-[#D8CFBD]'}`}><img src={image} onError={() => markImageUnavailable(image)} alt="" className="h-full w-full object-cover" /></button>)}</div>}
            </section>

            <section className="px-5 pb-6 sm:px-7 sm:pb-7 lg:pt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A4F29]">Shop bán film</p>
              <h1 id="film-shop-detail-title" className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{shop.name}</h1>
              {shop.slogan && <p className="mt-2 text-sm leading-relaxed text-[#6E655B]">{shop.slogan}</p>}

              {priceLabel && <section className="mt-5 rounded-2xl border border-[#E2D3BD] bg-[#F3EBDD] p-4" aria-label="Khoảng giá">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B4828]">Giá film</p>
                <p className="mt-1 text-xl font-bold text-[#9A4F29]">{priceLabel}</p>
              </section>}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {location && <div className="rounded-xl border border-[#E2DAD0] bg-[#FAF8F4] p-3.5"><p className="flex items-center gap-2 text-xs font-semibold text-[#554D43]"><MapPin className="h-4 w-4 text-[#C76B3C]" />Khu vực</p><p className="mt-2 text-sm leading-relaxed">{location}</p></div>}
                {shop.openingHours && <div className="rounded-xl border border-[#E2DAD0] bg-[#FAF8F4] p-3.5"><p className="flex items-center gap-2 text-xs font-semibold text-[#554D43]"><Clock3 className="h-4 w-4 text-[#C76B3C]" />Giờ mở cửa</p><p className="mt-2 text-sm leading-relaxed">{shop.openingHours}</p></div>}
              </div>

              {shop.description && <section className="mt-5"><h2 className="text-sm font-bold">Thông tin shop</h2><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#554D43]">{shop.description}</p></section>}

              {!!shop.filmStocks?.length && <section className="mt-6">
                <div className="flex items-end justify-between gap-3 border-b border-[#E2DAD0] pb-2"><h2 className="text-sm font-bold">Các dòng film đang bán</h2><span className="text-xs text-[#6E655B]">{shop.filmStocks.length} loại</span></div>
                <ul className="mt-3 flex flex-wrap gap-2">{shop.filmStocks.map((film) => <li key={film} className="rounded-full border border-[#D8CFBD] bg-[#FAF8F4] px-3 py-1.5 text-xs font-medium">{film}</li>)}</ul>
              </section>}
            </section>
          </div>
        </main>

        {(shop.link || shop.phone) && <footer className="grid shrink-0 grid-cols-1 gap-2 border-t border-[#E2DAD0] bg-[#FAF8F4] p-4 sm:grid-cols-2 sm:px-7">
          {shop.link && <a href={shop.link} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 text-sm font-bold text-white hover:bg-[#B35D30]"><MessageCircle className="h-4 w-4" />Liên hệ shop</a>}
          {shop.phone && <a href={`tel:${shop.phone.replace(/\D/g, '')}`} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#ECE4D0] px-4 text-sm font-bold text-[#2C2621] hover:bg-[#E0D5BE]"><Phone className="h-4 w-4" /><span className="flex flex-col items-start leading-tight"><span className="text-xs">Gọi shop</span><span className="font-mono text-sm">{shop.phone}</span></span></a>}
        </footer>}
      </section>
    </div>,
    document.body
  );
};
