import type { BackgroundStyle } from '../types';

export function paintBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: BackgroundStyle,
  baseColor: string,
): void {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  const grain = (alpha: number, step: number) => {
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const n = ((x * 13 + y * 7) % 17) / 17;
        ctx.fillStyle = `rgba(60,40,20,${alpha * n})`;
        ctx.fillRect(x, y, step, step);
      }
    }
  };

  if (style === 'burlap') {
    ctx.strokeStyle = 'rgba(90,70,40,0.12)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 0; x < width; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    grain(0.04, 10);
  } else if (style === 'kraft') {
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, 'rgba(255,255,255,0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    grain(0.05, 12);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 6; i++) {
      const rx = (i * 137) % width;
      const ry = (i * 89) % height;
      ctx.beginPath();
      ctx.ellipse(rx, ry, 180 + i * 20, 120 + i * 15, i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    grain(0.03, 14);
  }
}
