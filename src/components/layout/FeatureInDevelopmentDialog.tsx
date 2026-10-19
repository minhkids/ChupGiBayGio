import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import pleadingFace from '../../assets/pleading-face.svg';

interface FeatureInDevelopmentDialogProps {
  onClose: () => void;
}

export function FeatureInDevelopmentDialog({ onClose }: FeatureInDevelopmentDialogProps) {
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);

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
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)');
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
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[#161310]/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.section
        ref={dialogRef}
        initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 30 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-in-development-title"
        aria-describedby="feature-in-development-description"
        className="relative w-full max-w-md rounded-2xl border border-editorial-border bg-editorial-surface p-6 text-editorial-text shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-neutral-300 hover:bg-editorial-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kodak-amber"
        >
          <X size={18} strokeWidth={1.7} />
        </button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-kodak-amber/25 bg-kodak-amber/10">
          <img src={pleadingFace} alt="Mặt buồn dễ thương" className="h-12 w-12 object-contain" />
        </div>
        <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-kodak-amber">Thông báo</p>
        <h2 id="feature-in-development-title" className="mt-2 text-center text-xl font-semibold">
          Admin đang phát triển tính năng này.
        </h2>
        <p id="feature-in-development-description" className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-neutral-300">
          Bạn vui lòng đợi thêm một chút nhé.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-12 w-full rounded-xl bg-kodak-amber px-4 text-sm font-semibold text-editorial-bg transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kodak-amber focus-visible:ring-offset-2 focus-visible:ring-offset-editorial-surface"
        >
          Đã hiểu
        </button>
      </motion.section>
    </motion.div>,
    document.body,
  );
}
