import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, ImagePlus, Minus, Plus, RotateCcw } from 'lucide-react';
import { ApertureSpinner } from '../../components/animations/ApertureSpinner';
import { ALL_LAYOUTS } from './layouts';
import { getLayoutsForTheme, LAYOUT_THEMES, type LayoutThemeMeta } from './themes';
import type { LayoutDefinition, LayoutThemeId, SlotPhotoState } from './types';
import { DEFAULT_SLOT_TRANSFORM } from './types';
import { renderLayoutToCanvas, type SlotPhotoMap } from './canvas/renderLayout';
import { blobToObjectUrl, exportLayoutImage } from './exportImage';
import { createEmptySlotPhoto, loadImageFromFile, revokeSlotPhoto } from './loadSlotPhoto';

type Step = 'theme' | 'layout' | 'edit';

export function LayoutMakerPage() {
  const [step, setStep] = useState<Step>('theme');
  const [theme, setTheme] = useState<LayoutThemeMeta | null>(null);
  const [layout, setLayout] = useState<LayoutDefinition | null>(null);
  const [photos, setPhotos] = useState<SlotPhotoMap>({});
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null);
  const [exportHint, setExportHint] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);

  const layoutsForTheme = useMemo(
    () => (theme ? getLayoutsForTheme(ALL_LAYOUTS, theme.id as LayoutThemeId) : []),
    [theme],
  );

  const resetEditor = useCallback(() => {
    Object.values(photos).forEach(revokeSlotPhoto);
    setPhotos({});
    setActiveSlotId(null);
  }, [photos]);

  const pickTheme = (next: LayoutThemeMeta) => {
    setTheme(next);
    setLayout(null);
    resetEditor();
    setStep('layout');
  };

  const pickLayout = (next: LayoutDefinition) => {
    setLayout(next);
    resetEditor();
    setStep('edit');
  };

  const renderPreview = useCallback(() => {
    if (!layout || !previewCanvasRef.current) return;
    renderLayoutToCanvas(previewCanvasRef.current, layout, photos, { watermark: true });
  }, [layout, photos]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const triggerSlotFile = (slotId: string) => {
    setActiveSlotId(slotId);
    fileInputRef.current?.click();
  };

  const onFileSelected = async (file: File | undefined) => {
    if (!file || !activeSlotId) return;
    const previous = photos[activeSlotId];
    revokeSlotPhoto(previous);
    try {
      const { objectUrl, image } = await loadImageFromFile(file);
      setPhotos((current) => ({
        ...current,
        [activeSlotId]: { objectUrl, image, transform: { ...DEFAULT_SLOT_TRANSFORM } },
      }));
    } catch {
      setPhotos((current) => ({
        ...current,
        [activeSlotId]: createEmptySlotPhoto(URL.createObjectURL(file)),
      }));
    }
  };

  const updateTransform = (slotId: string, patch: Partial<SlotPhotoState['transform']>) => {
    setPhotos((current) => {
      const slot = current[slotId];
      if (!slot) return current;
      return {
        ...current,
        [slotId]: { ...slot, transform: { ...slot.transform, ...patch } },
      };
    });
  };

  const handleExport = async () => {
    if (!layout || !exportCanvasRef.current) return;
    setIsExporting(true);
    setExportHint(null);
    if (exportPreviewUrl) URL.revokeObjectURL(exportPreviewUrl);
    setExportPreviewUrl(null);
    try {
      renderLayoutToCanvas(exportCanvasRef.current, layout, photos, { watermark: true });
      const result = await exportLayoutImage(exportCanvasRef.current, `chupgibaygio-${layout.id}.jpg`);
      if (result.kind === 'preview') {
        setExportPreviewUrl(blobToObjectUrl(result.blob));
        setExportHint('Trên Safari iOS: nhấn giữ ảnh bên dưới để Lưu vào Ảnh hoặc Chia sẻ.');
      } else if (result.kind === 'share') {
        setExportHint('Đã mở hộp thoại chia sẻ.');
      } else {
        setExportHint('Đã tải ảnh về máy.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const activeSlot = activeSlotId ? photos[activeSlotId] : undefined;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!activeSlotId || !activeSlot?.image) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!activeSlotId || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    const slot = photos[activeSlotId];
    if (!slot) return;
    updateTransform(activeSlotId, {
      offsetX: slot.transform.offsetX + dx * 0.6,
      offsetY: slot.transform.offsetY + dy * 0.6,
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && activeSlotId) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const scale = photos[activeSlotId]?.transform.scale ?? 1;
      pinchRef.current = { dist, scale };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && activeSlotId && pinchRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const next = Math.min(3, Math.max(1, pinchRef.current.scale * (dist / pinchRef.current.dist)));
      updateTransform(activeSlotId, { scale: next });
    }
  };

  const onTouchEnd = () => {
    pinchRef.current = null;
  };

  const slotButtons = layout?.slots.map((slot) => (
    <button
      key={slot.id}
      type="button"
      onClick={() => {
        setActiveSlotId(slot.id);
        if (!photos[slot.id]?.image) triggerSlotFile(slot.id);
      }}
      className={[
        'rounded-xl border px-3 py-2 text-left text-xs transition-colors',
        activeSlotId === slot.id
          ? 'border-terracotta bg-terracotta/10 text-[#2C2621]'
          : 'border-[#D8CFBD] bg-white/80 text-[#554D43]',
      ].join(' ')}
    >
      <span className="font-semibold">Ô {slot.id.replace(/\D/g, '') || slot.id}</span>
      <span className="ml-2 text-[#8C8377]">{photos[slot.id]?.image ? 'Đã có ảnh' : 'Chạm để thêm'}</span>
    </button>
  ));

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2C2621] pb-28">
      <header className="sticky top-0 z-40 border-b border-[#E2DAD0] bg-[#F7F5F0]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            aria-label="Về trang chủ"
            onClick={() => {
              if (step === 'edit') setStep('layout');
              else if (step === 'layout') setStep('theme');
              else window.location.assign('/');
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8CFBD] bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-terracotta">Tạo khung ảnh</p>
            <h1 className="truncate text-lg font-bold">Chụp Gì Bây Giờ — Layout</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-5">
        {step === 'theme' && (
          <section className="space-y-3">
            <p className="text-sm text-[#6E655B]">Chọn chủ đề gần với phong cách bạn vừa chụp ở Hà Nội.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {LAYOUT_THEMES.filter((t) =>
                getLayoutsForTheme(ALL_LAYOUTS, t.id as LayoutThemeId).length > 0,
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pickTheme(item)}
                  className="rounded-2xl border border-[#E2DAD0] bg-[#FAF8F4] p-4 text-left shadow-sm transition hover:border-terracotta/50"
                >
                  <span className="block font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#8C8377]">{item.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 'layout' && theme && (
          <section className="space-y-3">
            <p className="text-sm text-[#6E655B]">
              Khung cho <span className="font-semibold text-[#2C2621]">{theme.label}</span>
            </p>
            {layoutsForTheme.length === 0 ? (
              <p className="text-sm text-[#8C8377]">Chưa có khung cho chủ đề này.</p>
            ) : (
              <div className="space-y-3">
                {layoutsForTheme.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pickLayout(item)}
                    className="w-full rounded-2xl border border-[#E2DAD0] bg-white p-4 text-left shadow-sm"
                  >
                    <span className="font-bold">{item.name}</span>
                    <p className="mt-1 text-xs text-[#8C8377]">{item.description}</p>
                    <p className="mt-2 font-mono text-[10px] text-terracotta">{item.slots.length} ô ảnh</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {step === 'edit' && layout && (
          <section className="space-y-4">
            <p className="text-sm text-[#6E655B]">{layout.description}</p>

            <div
              className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-[#D8CFBD] bg-[#E8E0D4] shadow-md"
              style={{ aspectRatio: `${layout.canvas.width} / ${layout.canvas.height}` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <canvas ref={previewCanvasRef} className="h-full w-full touch-none" />
              <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] text-[#6E655B]/80">
                Chạm ô trên canvas hoặc chọn ô bên dưới • Kéo để căn • Chụm 2 ngón để zoom
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {slotButtons}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!activeSlotId}
                onClick={() => activeSlotId && triggerSlotFile(activeSlotId)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold border border-[#D8CFBD] disabled:opacity-40"
              >
                <ImagePlus className="h-4 w-4" /> Thay ảnh ô đang chọn
              </button>
              {activeSlotId && (
                <button
                  type="button"
                  onClick={() => updateTransform(activeSlotId, { ...DEFAULT_SLOT_TRANSFORM })}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold border border-[#D8CFBD]"
                >
                  <RotateCcw className="h-4 w-4" /> Đặt lại căn chỉnh
                </button>
              )}
            </div>

            {activeSlotId && activeSlot?.image && (
              <div className="rounded-2xl border border-[#E2DAD0] bg-white p-4 space-y-3">
                <p className="text-xs font-semibold text-[#554D43]">Thu phóng ô {activeSlotId}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Thu nhỏ"
                    onClick={() =>
                      updateTransform(activeSlotId, {
                        scale: Math.max(1, (activeSlot.transform.scale ?? 1) - 0.08),
                      })
                    }
                    className="h-9 w-9 rounded-lg border border-[#D8CFBD] flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.02}
                    value={activeSlot.transform.scale}
                    onChange={(e) => updateTransform(activeSlotId, { scale: Number(e.target.value) })}
                    className="flex-1 accent-terracotta"
                  />
                  <button
                    type="button"
                    aria-label="Phóng to"
                    onClick={() =>
                      updateTransform(activeSlotId, {
                        scale: Math.min(3, (activeSlot.transform.scale ?? 1) + 0.08),
                      })
                    }
                    className="h-9 w-9 rounded-lg border border-[#D8CFBD] flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-white shadow-hard disabled:opacity-60"
            >
              {isExporting ? <ApertureSpinner size={28} label="" /> : <Download className="h-5 w-5" />}
              Tải ảnh 1080×1350
            </button>

            {exportHint && <p className="text-center text-xs text-[#6E655B]">{exportHint}</p>}
            {exportPreviewUrl && (
              <figure className="rounded-2xl border border-[#D8CFBD] bg-white p-3">
                <img src={exportPreviewUrl} alt="Ảnh xuất — nhấn giữ để lưu trên iOS" className="w-full rounded-xl" />
                <figcaption className="mt-2 text-center text-[10px] text-[#8C8377]">
                  Nhấn giữ ảnh → Lưu vào Ảnh / Chia sẻ
                </figcaption>
              </figure>
            )}
          </section>
        )}
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          void onFileSelected(file);
          e.target.value = '';
        }}
      />
      <canvas ref={exportCanvasRef} className="hidden" aria-hidden />
    </div>
  );
}
