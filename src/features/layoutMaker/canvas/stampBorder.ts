/** Scalloped postage-stamp path; semicircles bite inward along the perimeter. */
export function traceStampFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  teethX = 10,
  teethY = 14,
): void {
  const rx = w / teethX;
  const ry = h / teethY;
  const r = Math.min(rx, ry) * 0.42;

  ctx.beginPath();

  // Top edge, left → right
  ctx.moveTo(x, y);
  for (let i = 0; i < teethX; i++) {
    const x0 = x + i * rx;
    const x1 = x + (i + 1) * rx;
    ctx.lineTo(x1, y);
    if (i < teethX - 1) {
      const cx = (x0 + x1) / 2;
      ctx.arc(cx, y, r, 0, Math.PI, false);
    }
  }

  // Right edge, top → bottom
  for (let i = 0; i < teethY; i++) {
    const y0 = y + i * ry;
    const y1 = y + (i + 1) * ry;
    ctx.lineTo(x + w, y1);
    if (i < teethY - 1) {
      const cy = (y0 + y1) / 2;
      ctx.arc(x + w, cy, r, -Math.PI / 2, Math.PI / 2, false);
    }
  }

  // Bottom edge, right → left
  for (let i = teethX - 1; i >= 0; i--) {
    const x0 = x + i * rx;
    const x1 = x + (i + 1) * rx;
    ctx.lineTo(x0, y + h);
    if (i > 0) {
      const cx = (x0 + x1) / 2;
      ctx.arc(cx, y + h, r, Math.PI, 0, false);
    }
  }

  // Left edge, bottom → top
  for (let i = teethY - 1; i >= 0; i--) {
    const y0 = y + i * ry;
    const y1 = y + (i + 1) * ry;
    ctx.lineTo(x, y0);
    if (i > 0) {
      const cy = (y0 + y1) / 2;
      ctx.arc(x, cy, r, Math.PI / 2, -Math.PI / 2, false);
    }
  }

  ctx.closePath();
}

export function drawStampSlotFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  padding: number,
): { innerX: number; innerY: number; innerW: number; innerH: number } {
  ctx.save();
  traceStampFrame(ctx, x, y, w, h);
  ctx.fillStyle = '#FDFCFA';
  ctx.shadowColor = 'rgba(40,30,20,0.22)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(240,235,228,0.95)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const innerX = x + padding;
  const innerY = y + padding;
  const innerW = Math.max(0, w - padding * 2);
  const innerH = Math.max(0, h - padding * 2);
  return { innerX, innerY, innerW, innerH };
}

/** One outer stamp border for the 4-strip layout. */
export function drawVerticalStripFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
  slotCount: number,
): void {
  ctx.save();
  traceStampFrame(ctx, x, y, w, h, 8, 28);
  ctx.fillStyle = '#FDFCFA';
  ctx.shadowColor = 'rgba(40,30,20,0.18)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(220,215,205,0.95)';
  ctx.lineWidth = 3;
  const slotH = (h - gap * (slotCount + 1)) / slotCount;
  for (let i = 0; i < slotCount - 1; i++) {
    const ly = y + gap + (slotH + gap) * (i + 1) - gap / 2;
    ctx.beginPath();
    ctx.moveTo(x + 24, ly);
    ctx.lineTo(x + w - 24, ly);
    ctx.stroke();
  }
  ctx.restore();
}
