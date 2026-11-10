import type { LayoutDefinition, SlotPhotoState } from '../types';
import { paintBackground } from './backgrounds';
import { paintDecoration } from './decorations';
import { drawImageCover } from './slotCover';
import { drawStampSlotFrame, drawVerticalStripFrame } from './stampBorder';

export type SlotPhotoMap = Record<string, SlotPhotoState | undefined>;

function sortedLayers<T extends { zIndex: number; id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.zIndex - b.zIndex || a.id.localeCompare(b.id));
}

function drawStripSlots(
  layout: LayoutDefinition,
  ctx: CanvasRenderingContext2D,
  photos: SlotPhotoMap,
): void {
  const slots = layout.slots;
  if (slots.length === 0) return;
  const x = slots[0].x - 20;
  const y = slots[0].y - 28;
  const w = slots[0].width + 40;
  const last = slots[slots.length - 1];
  const h = last.y + last.height - slots[0].y + 56;
  const gap = 28;
  drawVerticalStripFrame(ctx, x, y, w, h, gap, slots.length);

  const slotH = (h - gap * (slots.length + 1)) / slots.length;
  slots.forEach((slot, index) => {
    const inner = {
      x: x + 26,
      y: y + gap + (slotH + gap) * index,
      width: w - 52,
      height: slotH,
    };
    const photo = photos[slot.id];
    ctx.save();
    ctx.beginPath();
    ctx.rect(inner.x, inner.y, inner.width, inner.height);
    ctx.clip();
    if (photo?.image) {
      drawImageCover(ctx, photo.image, inner, photo.transform);
    } else {
      ctx.fillStyle = '#E6E0D6';
      ctx.fillRect(inner.x, inner.y, inner.width, inner.height);
      ctx.fillStyle = '#9A9084';
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', inner.x + inner.width / 2, inner.y + inner.height / 2 + 8);
    }
    ctx.restore();
  });
}

function drawWaterMark(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  ctx.font = '500 22px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(44,38,33,0.35)';
  ctx.textAlign = 'right';
  ctx.fillText('chupgibaygio.com', width - 24, height - 20);
  ctx.restore();
}

export function renderLayoutToCanvas(
  canvas: HTMLCanvasElement,
  layout: LayoutDefinition,
  photos: SlotPhotoMap,
  options?: { watermark?: boolean },
): void {
  const { width, height } = layout.canvas;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  paintBackground(ctx, width, height, layout.canvas.background, layout.canvas.backgroundColor);

  const decorations = sortedLayers(layout.decorations);
  const slots = sortedLayers(layout.slots);

  const isStrip = layout.id === 'hanoi-winter-strip';

  // Decorations below photos (zIndex < 5)
  decorations.filter((d) => d.zIndex < 5).forEach((d) => paintDecoration(ctx, d));

  if (isStrip) {
    drawStripSlots(layout, ctx, photos);
  } else {
    for (const slot of slots) {
      const pad = slot.stampPadding ?? 14;
      const frame = { x: slot.x, y: slot.y, w: slot.width, h: slot.height };
      ctx.save();
      ctx.translate(frame.x + frame.w / 2, frame.y + frame.h / 2);
      ctx.rotate((slot.rotationDeg * Math.PI) / 180);
      ctx.translate(-frame.w / 2, -frame.h / 2);

      const inner = drawStampSlotFrame(ctx, 0, 0, frame.w, frame.h, pad);
      ctx.save();
      ctx.beginPath();
      ctx.rect(inner.innerX, inner.innerY, inner.innerW, inner.innerH);
      ctx.clip();
      const photo = photos[slot.id];
      if (photo?.image) {
        drawImageCover(
          ctx,
          photo.image,
          { x: inner.innerX, y: inner.innerY, width: inner.innerW, height: inner.innerH },
          photo.transform,
        );
      } else {
        ctx.fillStyle = '#E6E0D6';
        ctx.fillRect(inner.innerX, inner.innerY, inner.innerW, inner.innerH);
        ctx.fillStyle = '#8C8377';
        ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', inner.innerX + inner.innerW / 2, inner.innerY + inner.innerH / 2 + 9);
      }
      ctx.restore();
      ctx.restore();
    }
  }

  decorations.filter((d) => d.zIndex >= 5).forEach((d) => paintDecoration(ctx, d));

  if (options?.watermark !== false) {
    drawWaterMark(ctx, width, height);
  }
}
