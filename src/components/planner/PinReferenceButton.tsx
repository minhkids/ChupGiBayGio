import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Pin, X } from 'lucide-react';
import { useShootPlan } from '../../context/ShootPlanContext';

interface PinReferenceButtonProps {
  imageUrl: string;
  label: string;
  className?: string;
}

/** Standalone SVG: unlike the on-screen line art, this survives export/storage. */
// eslint-disable-next-line react/only-export-components -- Shared by the two pose image surfaces.
export function poseReferenceImage(pose: { viewBox?: string; svgPath: string }): string {
  const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escape(pose.viewBox || '0 0 200 400')}"><rect width="100%" height="100%" fill="#fffaf3"/><path d="${escape(pose.svgPath)}" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Place beside an image inside its relative container, never inside a button. */
export function PinReferenceButton({ imageUrl, label, className = 'absolute top-2 right-2' }: PinReferenceButtonProps) {
  const { referencePhotos, addReferencePhoto, removeReferencePhoto, updateReferencePhotoNote } = useShootPlan();
  const reference = referencePhotos.find(photo => photo.imageUrl === imageUrl);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const noteId = useId();
  const titleId = useId();

  const close = () => {
    setPosition(null);
    buttonRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!position) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!popoverRef.current?.contains(target) && !buttonRef.current?.contains(target)) setPosition(null);
    };
    const reposition = (event: Event) => {
      if (event.target instanceof Node && popoverRef.current?.contains(event.target)) return;
      setPosition(null);
    };
    document.addEventListener('pointerdown', dismiss, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('pointerdown', dismiss, true);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [position]);

  if (!imageUrl) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`${reference ? 'Sửa ghi chú ảnh đã ghim' : 'Ghim ảnh vào kế hoạch'}: ${label}`}
        title={reference ? 'Đã ghim · Sửa ghi chú' : 'Ghim ảnh tham khảo'}
        aria-pressed={!!reference}
        aria-haspopup="dialog"
        aria-expanded={!!position}
        aria-controls={position ? dialogId : undefined}
        className={`${className} z-40 inline-flex min-h-10 min-w-10 touch-manipulation items-center justify-center gap-1.5 rounded-full border shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer ${
          reference
            ? 'border-amber-400 bg-amber-400 text-neutral-950 font-bold shadow-amber-400/20 opacity-100 scale-100 px-3'
            : 'border-white/70 bg-white/90 text-neutral-800 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400 group-hover:opacity-100 opacity-0 group-hover:scale-100 scale-95 p-2'
        } focus-visible:opacity-100 focus-visible:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500`}
        onPointerDown={event => event.stopPropagation()}
        onKeyDown={event => event.stopPropagation()}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          if (position) { close(); return; }
          if (!reference) addReferencePhoto({ imageUrl, label });
          const rect = event.currentTarget.getBoundingClientRect();
          setPosition({
            left: Math.max(8, Math.min(rect.right - 288, window.innerWidth - 296)),
            top: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 252)),
          });
        }}
      >
        {reference ? (
          <>
            <Check className="h-4 w-4 text-neutral-950 stroke-[2.5]" aria-hidden="true" />
            <span className="text-[11px] font-bold">Đã ghim</span>
          </>
        ) : (
          <>
            <Pin className="h-4 w-4" aria-hidden="true" />
            <span className="text-[11px] font-semibold hidden sm:inline">Ghim</span>
          </>
        )}
      </button>
      {position && createPortal(
        <div
          ref={popoverRef}
          id={dialogId}
          role="dialog"
          aria-labelledby={titleId}
          style={{ position: 'fixed', ...position, zIndex: 10000, width: 296, maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100dvh - 16px)' }}
          className="overflow-auto rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 text-slate-800 dark:text-neutral-100 shadow-2xl animate-in fade-in zoom-in-95"
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          onKeyDown={event => {
            event.stopPropagation();
            if (event.key === 'Escape') { event.preventDefault(); close(); }
          }}
          onBlur={event => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node) && event.relatedTarget !== buttonRef.current) setPosition(null);
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-bold">📌</span>
              <p id={titleId} className="text-xs font-bold text-neutral-900 dark:text-white">
                Đã ghim vào Kế hoạch
              </p>
            </div>
            <button
              type="button"
              aria-label="Đóng ghi chú"
              onClick={close}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <label htmlFor={noteId} className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Ghi chú góc chụp (Shot List):
          </label>
          <textarea
            autoFocus
            id={noteId}
            rows={3}
            maxLength={240}
            value={reference?.note || ''}
            onChange={event => { if (reference) updateReferencePhotoNote(reference.id, event.target.value); }}
            placeholder="vd: Góc này lấy ngược sáng, Mẫu đứng cạnh xe hoa..."
            className="w-full resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-2 text-xs text-slate-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
          />
          <div className="mt-2.5 flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                if (reference) {
                  removeReferencePhoto(reference.id);
                }
                close();
              }}
              className="text-[11px] font-medium text-neutral-400 hover:text-red-500 transition-colors"
            >
              Bỏ ghim
            </button>
            <button
              type="button"
              onClick={close}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors"
            >
              Lưu ghi chú
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
