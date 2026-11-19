import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X } from 'lucide-react';

interface LocationHelpDialogProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function LocationHelpDialog({ title, message, onClose }: LocationHelpDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-[#2C2621]/45 p-3 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-help-title"
        aria-describedby="location-help-message"
        className="w-full max-w-md rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-5 text-[#2C2621] shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3E6DA] text-[#C76B3C]">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono-spec text-[10px] font-bold uppercase tracking-[0.16em] text-[#C76B3C]">Vị trí</p>
            <h2 id="location-help-title" className="mt-1 text-lg font-bold leading-snug">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hướng dẫn vị trí"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#6E655B] hover:bg-[#ECE4D0]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p id="location-help-message" className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#554D43]">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#C76B3C] text-sm font-bold text-white hover:bg-[#A9552E]"
        >
          Đã hiểu
        </button>
      </section>
    </div>,
    document.body,
  );
}
