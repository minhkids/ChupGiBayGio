import type { DecorationBuiltin, DecorationLayer } from '../types';

function withTransform(
  ctx: CanvasRenderingContext2D,
  layer: DecorationLayer,
  draw: () => void,
): void {
  ctx.save();
  ctx.globalAlpha = layer.opacity ?? 1;
  const w = layer.width ?? 120;
  const h = layer.height ?? 120;
  ctx.translate(layer.x + w / 2, layer.y + h / 2);
  if (layer.rotationDeg) ctx.rotate((layer.rotationDeg * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  draw();
  ctx.restore();
}

function drawPeachBlossom(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#E8A0B8';
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.ellipse(50 + Math.cos(a) * 18, 40 + Math.sin(a) * 18, 12, 18, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#6B4A3A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, 100);
  ctx.quadraticCurveTo(40, 60, 90, 30);
  ctx.stroke();
}

function drawRainCloud(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#9AA3AD';
  ctx.beginPath();
  ctx.arc(40, 45, 28, 0, Math.PI * 2);
  ctx.arc(70, 40, 34, 0, Math.PI * 2);
  ctx.arc(98, 48, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6B9FD4';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(35 + i * 18, 95 + (i % 2) * 10, 3, 9, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRedScarf(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#C23B3B';
  ctx.beginPath();
  ctx.moveTo(10, 30);
  ctx.bezierCurveTo(60, 5, 110, 40, 130, 80);
  ctx.bezierCurveTo(90, 95, 40, 85, 15, 110);
  ctx.bezierCurveTo(5, 70, 0, 50, 10, 30);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 20, 40 + i * 12);
    ctx.lineTo(35 + i * 22, 55 + i * 12);
    ctx.stroke();
  }
}

function drawBeanie(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#E8DCC8';
  ctx.beginPath();
  ctx.ellipse(60, 55, 48, 40, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#F4EFE6';
  ctx.beginPath();
  ctx.ellipse(60, 55, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E8DCC8';
  ctx.beginPath();
  ctx.arc(60, 8, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawStreetLamp(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = '#2C2621';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(35, 140);
  ctx.lineTo(35, 20);
  ctx.lineTo(90, 20);
  ctx.stroke();
  ctx.fillStyle = '#3D352E';
  ctx.fillRect(20, 135, 30, 8);
  ctx.fillStyle = '#F5D56B';
  ctx.beginPath();
  ctx.arc(90, 28, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(245,213,107,0.35)';
  ctx.beginPath();
  ctx.arc(90, 28, 28, 0, Math.PI * 2);
  ctx.fill();
}

function drawFoodCart(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = '#4A4038';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 50, 80, 45);
  ctx.beginPath();
  ctx.arc(45, 115, 14, 0, Math.PI * 2);
  ctx.arc(95, 115, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#E74B3C';
  ctx.fillRect(70, 98, 22, 14);
}

function drawStripSidebar(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = 'rgba(250,248,244,0.55)';
  ctx.fillRect(0, 0, w, h);
  ctx.font = 'italic 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#2F4A73';
  ctx.fillText('Hanoi Winter', 28, h / 2 - 20);
  ctx.fillText('♡', 120, h / 2 + 30);
}

function drawCoffeeDoodle(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = '#2C2621';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(60, 70, 40, 28, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(95, 55, 18, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(80,70,60,0.5)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(45 + i * 10, 35 - i * 8);
    ctx.quadraticCurveTo(55 + i * 8, 15 - i * 12, 70 + i * 6, 30 - i * 10);
    ctx.stroke();
  }
}

function drawTurtleTowerStamp(ctx: CanvasRenderingContext2D): void {
  const size = 140;
  ctx.fillStyle = '#FAF8F4';
  ctx.strokeStyle = '#C9BFAF';
  ctx.lineWidth = 2;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeRect(0, 0, size, size);
  ctx.strokeStyle = '#4A4038';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 110);
  ctx.lineTo(110, 110);
  ctx.stroke();
  ctx.fillStyle = '#7A6A58';
  ctx.fillRect(62, 45, 16, 65);
  ctx.beginPath();
  ctx.moveTo(55, 45);
  ctx.lineTo(85, 45);
  ctx.lineTo(70, 28);
  ctx.closePath();
  ctx.fill();
  ctx.font = 'bold 11px IBM Plex Mono, monospace';
  ctx.fillStyle = '#554D43';
  ctx.fillText('HANOI WINTER', 14, 128);
}

function drawYellowBuildingStamp(ctx: CanvasRenderingContext2D): void {
  const size = 120;
  ctx.fillStyle = '#FAF8F4';
  ctx.strokeStyle = '#C9BFAF';
  ctx.lineWidth = 2;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeRect(0, 0, size, size);
  ctx.fillStyle = '#E5C45A';
  ctx.fillRect(20, 50, 80, 55);
  ctx.fillStyle = '#E8A0B8';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(30 + i * 22, 42, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPostmark(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(30,25,20,0.55)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    const y = 10 + i * 14;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(40, y + 8, 80, y - 8, 120, y + 4);
    ctx.stroke();
  }
}

function drawBabyBreath(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#F5F0E6';
  for (let i = 0; i < 80; i++) {
    const px = (i * 37) % 180;
    const py = (i * 23) % 90;
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#8B9A6B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 100);
  ctx.quadraticCurveTo(90, 40, 140, 80);
  ctx.stroke();
}

function drawTornPaper(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = 'rgba(252,248,240,0.88)';
  ctx.beginPath();
  ctx.moveTo(0, 20);
  for (let i = 0; i < 8; i++) {
    ctx.lineTo((w / 8) * (i + 1), 8 + (i % 2) * 18);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h - 12);
  ctx.closePath();
  ctx.fill();
}

function drawWashiTape(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(180,150,110,0.45)';
  ctx.fillRect(0, 0, 48, 110);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 22);
    ctx.lineTo(48, i * 22 + 8);
    ctx.stroke();
  }
}

function drawAirmailCorner(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#D94A4A';
  ctx.fillRect(0, 0, 70, 14);
  ctx.fillStyle = '#4A6FA5';
  ctx.fillRect(0, 14, 70, 14);
  ctx.fillStyle = '#E8E0D4';
  ctx.fillRect(0, 28, 70, 14);
}

const DRAWERS: Record<DecorationBuiltin, (ctx: CanvasRenderingContext2D, w: number, h: number) => void> = {
  'peach-blossom': (ctx) => drawPeachBlossom(ctx),
  'rain-cloud': (ctx) => drawRainCloud(ctx),
  'red-scarf': (ctx) => drawRedScarf(ctx),
  beanie: (ctx) => drawBeanie(ctx),
  'street-lamp': (ctx) => drawStreetLamp(ctx),
  'food-cart': (ctx) => drawFoodCart(ctx),
  'strip-sidebar': (ctx, w, h) => drawStripSidebar(ctx, w, h),
  'coffee-doodle': (ctx) => drawCoffeeDoodle(ctx),
  'turtle-tower-stamp': (ctx) => drawTurtleTowerStamp(ctx),
  'yellow-building-stamp': (ctx) => drawYellowBuildingStamp(ctx),
  postmark: (ctx) => drawPostmark(ctx),
  'baby-breath': (ctx) => drawBabyBreath(ctx),
  'torn-paper': (ctx, w, h) => drawTornPaper(ctx, w, h),
  'washi-tape': (ctx) => drawWashiTape(ctx),
  'airmail-corner': (ctx) => drawAirmailCorner(ctx),
};

export function paintDecoration(ctx: CanvasRenderingContext2D, layer: DecorationLayer): void {
  const w = layer.width ?? 140;
  const h = layer.height ?? 140;
  withTransform(ctx, { ...layer, width: w, height: h }, () => {
    DRAWERS[layer.builtin](ctx, w, h);
  });
}
