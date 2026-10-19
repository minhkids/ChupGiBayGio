import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import type { ServiceListing } from '../../services/serviceHubApi';

interface PhotographerDetailDialogProps {
  photographer: ServiceListing;
  onClose: () => void;
}

const formatMoney = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`;

export function PhotographerDetailDialog({ photographer, onClose }: PhotographerDetailDialogProps) {
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);
  const portfolio = [...new Set((photographer.portfolioPhotos || []).filter(Boolean))];
  const startingPrice = Number((photographer.price || '').replace(/[^\d]/g, ''));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[#241E18]/70 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.section
        ref={dialogRef}
        initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 30 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="photographer-detail-title"
        className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#F7F5F0] text-[#2C2621] shadow-2xl sm:h-auto sm:max-h-[min(900px,calc(100dvh-40px))] sm:max-w-5xl sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E2DAD0] bg-[#FAF8F4] px-4 py-3 sm:px-7">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A4F29]">Nhiếp ảnh gia / Chi tiết hồ sơ</p>
            <h2 id="photographer-detail-title" className="mt-0.5 truncate text-base font-bold">{photographer.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết nhiếp ảnh gia" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECE4D0] text-[#554D43] hover:bg-[#E0D5BE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C76B3C]">
            <X className="h-5 w-5" />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <section className="min-w-0 p-4 sm:p-7 lg:border-r lg:border-[#E2DAD0]" aria-label={`Ảnh hồ sơ của ${photographer.name}`}>
              <div className="flex items-center gap-4 rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4">
                {photographer.imageUrl
                  ? <img src={photographer.imageUrl} alt={`Ảnh đại diện ${photographer.name}`} className="h-20 w-20 shrink-0 rounded-2xl border border-[#D8CFBD] object-cover sm:h-24 sm:w-24" />
                  : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#EAE1D1] sm:h-24 sm:w-24"><Camera aria-hidden="true" className="h-8 w-8 text-[#B28B72]" /></div>}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9A4F29]">Ảnh đại diện</p>
                  <h3 className="mt-1 break-words text-lg font-bold">{photographer.name}</h3>
                  {startingPrice > 0 && <p className="mt-2 inline-flex rounded-lg border border-[#C76B3C] bg-[#F3E6D6] px-3 py-1.5 text-sm font-bold text-[#8B4828]">Giá từ {formatMoney(startingPrice)}</p>}
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-end justify-between gap-3 border-b border-[#E2DAD0] pb-2">
                  <h3 className="text-sm font-bold">Portfolio</h3>
                  <span className="text-xs text-[#6E655B]">{portfolio.length} ảnh</span>
                </div>
                {portfolio.length
                  ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{portfolio.map((url, index) => <figure key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-[#D8CFBD] bg-[#FAF8F4]"><img src={url} alt={`Ảnh portfolio ${photographer.name} ${index + 1}`} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" /><figcaption className="px-2 py-1.5 text-[10px] text-[#6E655B]">Ảnh {index + 1}</figcaption></figure>)}</div>
                  : <p className="mt-3 rounded-xl border border-dashed border-[#D8CFBD] p-5 text-sm text-[#6E655B]">Chưa có ảnh portfolio.</p>}
              </div>
            </section>

            <section className="min-w-0 px-5 pb-6 sm:px-7 sm:pb-7 lg:pt-7">
              {photographer.description && <section><h3 className="text-sm font-bold">Giới thiệu</h3><p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-[#554D43]">{photographer.description}</p></section>}
              {!!photographer.tags?.length && <section className="mt-5"><h3 className="text-sm font-bold">Phong cách</h3><div className="mt-2 flex flex-wrap gap-2">{photographer.tags.map((tag) => <span key={tag} className="rounded-full bg-[#ECE4D0] px-3 py-1.5 text-xs text-[#554D43]">#{tag.replace(/^#/, '')}</span>)}</div></section>}
              {!!photographer.shootSpots?.length && <section className="mt-5"><h3 className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4 text-[#C76B3C]" />Địa bàn hay chụp</h3><div className="mt-2 flex flex-wrap gap-2">{photographer.shootSpots.map((spot) => <span key={spot} className="rounded-lg border border-[#D8CFBD] bg-[#FAF8F4] px-3 py-2 text-xs">{spot}</span>)}</div></section>}
              {(photographer.gearBody || photographer.gearLens) && <p className="mt-5 text-sm text-[#554D43]"><span className="font-semibold">Thiết bị: </span>{[photographer.gearBody, photographer.gearLens].filter(Boolean).join(' · ')}</p>}
              {!!photographer.packages?.length && <section className="mt-6"><h3 className="border-b border-[#E2DAD0] pb-2 text-sm font-bold">Gói chụp</h3><ul className="mt-3 space-y-2">{photographer.packages.map((pkg, index) => <li key={`${pkg.name}-${index}`} className="rounded-xl border border-[#D8CFBD] bg-[#FAF8F4] p-3"><div className="flex items-start justify-between gap-3"><span className="font-semibold">{pkg.name || 'Gói chụp'}</span><span className="shrink-0 font-bold text-[#8B4828]">{formatMoney(pkg.price)}</span></div>{(pkg.duration || pkg.deliveredPhotos) && <p className="mt-1 text-xs text-[#6E655B]">{[pkg.duration, pkg.deliveredPhotos ? `${pkg.deliveredPhotos} ảnh` : ''].filter(Boolean).join(' · ')}</p>}</li>)}</ul></section>}
            </section>
          </div>
        </main>

        {(photographer.phone || photographer.link) && <footer className="grid shrink-0 gap-2 border-t border-[#E2DAD0] bg-[#FAF8F4] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:grid-cols-2">
          {photographer.phone && <a href={`tel:${photographer.phone.replace(/\D/g, '')}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ECE4D0] px-3 text-sm font-bold text-[#2C2621]"><Phone className="h-4 w-4" />Gọi {photographer.phone}</a>}
          {photographer.link && <a href={photographer.link} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-3 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" />Liên hệ / Portfolio</a>}
        </footer>}
      </motion.section>
    </motion.div>, document.body,
  );
}
