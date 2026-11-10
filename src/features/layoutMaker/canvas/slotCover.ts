import type { SlotPhotoTransform } from '../types';

export interface CoverRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Scale factor so the image fully covers the target rect at transform.scale === 1. */
export function baseCoverScale(imgW: number, imgH: number, rectW: number, rectH: number): number {
  const scaleX = rectW / imgW;
  const scaleY = rectH / imgH;
  return Math.max(scaleX, scaleY);
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  rect: CoverRect,
  transform: SlotPhotoTransform,
): void {
  const base = baseCoverScale(image.naturalWidth, image.naturalHeight, rect.width, rect.height);
  const scale = base * transform.scale;
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  const cx = rect.x + rect.width / 2 + transform.offsetX;
  const cy = rect.y + rect.height / 2 + transform.offsetY;
  const dx = cx - drawW / 2;
  const dy = cy - drawH / 2;
  ctx.drawImage(image, dx, dy, drawW, drawH);
}
