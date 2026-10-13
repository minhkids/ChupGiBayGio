import { createPortal } from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock3, Film, MapPin, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react';
import { filmShopLocations, type ServiceListing } from '../../services/serviceHubApi';

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
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);
  const imageViewerRef = useRef<HTMLElement>(null);
  const zoomButtonRef = useRef<HTMLButtonElement>(null);
  const wasExpandedRef = useRef(false);
  const images = [...new Set([shop.productImageUrl, shop.imageUrl].filter((value): value is string => Boolean(value)))];
  const [activeImage, setActiveImage] = useState(images[0] || '');
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [unavailableImages, setUnavailableImages] = useState<string[]>([]);
  const expandedRef = useRef(isImageExpanded);
  const locations = filmShopLocations(shop);
  const priceLabel = getPriceLabel(shop);
  const availableImages = images.filter((image) => !unavailableImages.includes(image));
  const imageIndex = availableImages.indexOf(activeImage);
  const changeImage = (direction: number) => {
    if (availableImages.length > 1) setActiveImage(availableImages[(imageIndex + direction + availableImages.length) % availableImages.length]);
  };
  const markImageUnavailable = (failedImage: string) => {
    setUnavailableImages((current) => current.includes(failedImage) ? current : [...current, failedImage]);
    if (activeImage === failedImage) {
      setActiveImage(images.find((image) => image !== failedImage && !unavailableImages.includes(image)) || '');
    }
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (expandedRef.current) setIsImageExpanded(false);
        else onClose();
      }
      if (event.key === 'Tab') {
        const scope = expandedRef.current ? imageViewerRef.current : dialogRef.current;
        const controls = scope?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    expandedRef.current = isImageExpanded;
    if (isImageExpanded) imageViewerRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    else if (wasExpandedRef.current) zoomButtonRef.current?.focus({ preventScroll: true });
    wasExpandedRef.current = isImageExpanded;
  }, [isImageExpanded]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[#241E18]/65 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.section
        ref={dialogRef}
        initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 30 }}
        onKeyDown={(event) => {
          if (expandedRef.current) return;
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            changeImage(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
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
          <motion.button type="button" whileHover={reducedMotion ? undefined : { rotate: 90 }} whileTap={reducedMotion ? undefined : { scale: 0.92 }} onClick={onClose} aria-label="Đóng chi tiết shop" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECE4D0] text-[#554D43] hover:bg-[#E0D5BE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C]">
            <X className="h-5 w-5" />
          </motion.button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <section className="min-w-0 p-4 sm:p-7 lg:border-r lg:border-[#E2DAD0]" aria-label="Ảnh cửa hàng và sản phẩm">
              <div className="overflow-hidden rounded-2xl bg-[#241E18] p-3 shadow-sm">
                <div aria-hidden="true" className="mb-3 flex justify-between gap-2">{Array.from({ length: 10 }, (_, index) => <span key={index} className="h-2 w-4 rounded-sm bg-[#F3EBDD]/70" />)}</div>
                <div className="relative overflow-hidden rounded-lg bg-[#EFE9DF]">
                  {activeImage ? (
                    <button ref={zoomButtonRef} type="button" aria-label="Phóng to ảnh" onClick={() => setIsImageExpanded(true)} className="group block w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#C76B3C]">
                      <motion.img key={activeImage} initial={reducedMotion ? false : { opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reducedMotion ? 0 : 0.3 }} src={activeImage} onError={() => markImageUnavailable(activeImage)} alt={activeImage === shop.productImageUrl ? `Film đang bán tại ${shop.name}` : `Ảnh cửa hàng ${shop.name}`} className="aspect-[4/3] w-full object-cover transition-[filter] group-hover:brightness-95" />
                      <span className="sr-only">Nhấn để xem ảnh toàn màn hình</span>
                    </button>
                  ) : (
                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 text-[#8B4828]">
                      <ShoppingBag className="h-8 w-8" />
                      <span className="text-sm font-medium text-[#6E655B]">{unavailableImages.length ? 'Không tải được ảnh shop' : 'Shop chưa có ảnh'}</span>
                    </div>
                  )}
                  {availableImages.length > 1 && <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2">
                    <motion.button type="button" aria-label="Ảnh trước" whileTap={reducedMotion ? undefined : { scale: 0.9 }} onClick={() => changeImage(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF8F4]/95 text-[#2C2621] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C76B3C]"><ChevronLeft className="h-5 w-5" /></motion.button>
                    <motion.button type="button" aria-label="Ảnh tiếp theo" whileTap={reducedMotion ? undefined : { scale: 0.9 }} onClick={() => changeImage(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF8F4]/95 text-[#2C2621] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C76B3C]"><ChevronRight className="h-5 w-5" /></motion.button>
                  </div>}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[10px] tracking-wider text-[#F3EBDD]">
                  <span className="flex items-center gap-2"><Film className="h-3.5 w-3.5" />{activeImage === shop.productImageUrl ? 'ẢNH SẢN PHẨM' : 'GÓC CỬA HÀNG'}</span>
                  {activeImage && <span aria-live="polite">{String(imageIndex + 1).padStart(2, '0')} / {String(availableImages.length).padStart(2, '0')}</span>}
                </div>
              </div>
              {availableImages.length > 1 && <div className="mt-4 flex gap-3" aria-label="Ảnh khác của shop">{availableImages.map((image, index) => <motion.button key={image} type="button" aria-label={`Xem ảnh ${index + 1}`} aria-pressed={activeImage === image} onClick={() => setActiveImage(image)} whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.96 }} className={`h-20 w-24 overflow-hidden rounded-xl border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C76B3C] ${activeImage === image ? 'border-[#C76B3C]' : 'border-[#D8CFBD]'}`}><img src={image} onError={() => markImageUnavailable(image)} alt="" className="h-full w-full object-cover" /></motion.button>)}</div>}
            </section>

            <motion.section initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : 0.08 }} className="min-w-0 px-5 pb-6 sm:px-7 sm:pb-7 lg:pt-7">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A4F29]"><span className="h-px w-6 bg-[#C76B3C]" />Shop bán film</p>
              <h1 id="film-shop-detail-title" className="mt-2 break-words text-2xl font-bold leading-tight sm:text-3xl">{shop.name}</h1>
              {shop.slogan && <p className="mt-3 border-l-2 border-[#C76B3C] pl-3 text-sm italic leading-relaxed text-[#6E655B]">{shop.slogan}</p>}
              {shop.expressDelivery2h && <p className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950"><Clock3 aria-hidden="true" className="h-6 w-6 shrink-0" /><span><span className="block">Giao hỏa tốc trong 2 giờ</span><span className="mt-0.5 block text-xs font-medium">Liên hệ shop để xác nhận khu vực và phí giao hàng.</span></span></p>}

              {priceLabel && <section className="relative mt-5 overflow-hidden rounded-2xl border border-[#E2D3BD] bg-[#F3EBDD] p-4" aria-label="Khoảng giá">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B4828]">Giá film</p>
                <p className="mt-2 font-mono text-xl font-semibold tracking-tight text-[#9A4F29]">{priceLabel}</p>
                <span aria-hidden="true" className="absolute inset-y-3 right-3 border-r border-dashed border-[#C9B99F]" />
              </section>}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {!!locations.length && <div className="rounded-xl border border-[#E2DAD0] bg-[#FAF8F4] p-3.5 sm:col-span-2"><p className="flex items-center gap-2 text-xs font-semibold text-[#554D43]"><MapPin className="h-4 w-4 text-[#C76B3C]" />{locations.length === 1 ? 'Địa chỉ shop' : `${locations.length} địa chỉ shop`}</p><ul className="mt-2 space-y-3">{locations.map((branch, index) => <li key={`${branch.ward}-${branch.district}-${index}`} className="border-t border-[#E2DAD0] pt-2 first:border-0 first:pt-0"><p className="text-sm leading-relaxed">{[branch.ward, branch.district, 'Hà Nội'].filter(Boolean).join(', ')}</p>{branch.openingHours && <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6E655B]"><Clock3 className="h-3.5 w-3.5" />{branch.openingHours}</p>}</li>)}</ul></div>}
                {!locations.length && shop.openingHours && <div className="rounded-xl border border-[#E2DAD0] bg-[#FAF8F4] p-3.5"><p className="flex items-center gap-2 text-xs font-semibold text-[#554D43]"><Clock3 className="h-4 w-4 text-[#C76B3C]" />Giờ mở cửa</p><p className="mt-2 text-sm leading-relaxed">{shop.openingHours}</p></div>}
              </div>

              {shop.description && <section className="mt-5"><h2 className="text-sm font-bold">Thông tin shop</h2><p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-[#554D43]">{shop.description}</p></section>}

              {!!shop.filmStocks?.length && <section className="mt-6">
                <div className="flex items-end justify-between gap-3 border-b border-[#E2DAD0] pb-2"><h2 className="text-sm font-bold">Các dòng film đang bán</h2><span className="text-xs text-[#6E655B]">{shop.filmStocks.length} loại</span></div>
                <motion.ul initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.045 } } }} className="mt-3 grid gap-2 sm:grid-cols-2">{shop.filmStocks.map((film) => <motion.li key={film} variants={{ hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 6 }, visible: { opacity: 1, y: 0 } }} className="flex min-w-0 items-center gap-2 rounded-xl border border-[#D8CFBD] bg-[#FAF8F4] px-3 py-3 text-xs font-medium"><Film className="h-4 w-4 shrink-0 text-[#C76B3C]" /><span className="min-w-0 break-words">{film}</span></motion.li>)}</motion.ul>
              </section>}
            </motion.section>
          </div>
        </main>

        {(shop.link || shop.phone) && <footer className={`grid shrink-0 gap-2 border-t border-[#E2DAD0] bg-[#FAF8F4] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 ${shop.link && shop.phone ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {shop.link && <motion.a href={shop.link} target="_blank" rel="noreferrer" whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-3 text-sm font-bold text-white hover:bg-[#B35D30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C76B3C]"><MessageCircle className="h-4 w-4 shrink-0" />Liên hệ shop<ArrowUpRight className="hidden h-4 w-4 sm:block" /></motion.a>}
          {shop.phone && <motion.a href={`tel:${shop.phone.replace(/\D/g, '')}`} whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#ECE4D0] px-3 text-sm font-bold text-[#2C2621] hover:bg-[#E0D5BE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C76B3C]"><Phone className="h-4 w-4 shrink-0" /><span className="flex flex-col items-start leading-tight"><span className="text-xs">Gọi shop</span><span className="font-mono text-sm">{shop.phone}</span></span></motion.a>}
        </footer>}
        {isImageExpanded && activeImage && createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[var(--z-camera)] flex flex-col bg-[#161310]/95 text-[#FAF8F4] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsImageExpanded(false); }}>
            <section ref={imageViewerRef} role="dialog" aria-modal="true" aria-label="Ảnh phóng to" className="flex min-h-0 flex-1 flex-col" onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); changeImage(event.key === 'ArrowRight' ? 1 : -1); } }}>
              <header className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-7"><p className="truncate text-sm font-medium">{shop.name}</p><button type="button" onClick={() => setIsImageExpanded(false)} aria-label="Đóng ảnh phóng to" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FAF8F4]/15 hover:bg-[#FAF8F4]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F3C08E]"><X className="h-5 w-5" /></button></header>
              <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 pb-2 sm:gap-5 sm:px-6">
                {availableImages.length > 1 && <button type="button" aria-label="Ảnh phóng to trước" onClick={() => changeImage(-1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FAF8F4]/15 hover:bg-[#FAF8F4]/25"><ChevronLeft className="h-5 w-5" /></button>}
                <img src={activeImage} alt={activeImage === shop.productImageUrl ? `Film đang bán tại ${shop.name}` : `Ảnh cửa hàng ${shop.name}`} className="max-h-[calc(100dvh-7rem)] max-w-[calc(100vw-8rem)] object-contain sm:max-w-[calc(100vw-12rem)]" />
                {availableImages.length > 1 && <button type="button" aria-label="Ảnh phóng to tiếp theo" onClick={() => changeImage(1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FAF8F4]/15 hover:bg-[#FAF8F4]/25"><ChevronRight className="h-5 w-5" /></button>}
              </div>
              <p className="shrink-0 pb-4 text-center font-mono text-xs text-[#F3EBDD]/80" aria-live="polite">{String(imageIndex + 1).padStart(2, '0')} / {String(availableImages.length).padStart(2, '0')}</p>
            </section>
          </motion.div>, document.body
        )}
      </motion.section>
    </motion.div>,
    document.body
  );
};
