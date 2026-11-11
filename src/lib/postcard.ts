export type PostcardLayout = 'zine' | 'wash';

export function sampleSwatches(data: Uint8ClampedArray): [string, string, string] {
  let dark = { l: 1, r: 40, g: 40, b: 40 };
  let mid = { l: 0, r: 180, g: 120, b: 80, score: -1 };
  let pale = { l: 0, r: 230, g: 220, b: 200 };
  const step = Math.max(1, Math.floor(data.length / 4 / 4000)) * 4;
  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (l < dark.l) dark = { l, r, g, b };
    if (l > pale.l) pale = { l, r, g, b };
    if (chroma > mid.score && l > 0.15 && l < 0.85) mid = { l, r, g, b, score: chroma };
  }
  const hex = (c: { r: number; g: number; b: number }) =>
    `#${[c.r, c.g, c.b].map(n => n.toString(16).padStart(2, '0')).join('')}`;
  return [hex(mid), hex(dark), hex(pale)];
}

const PAPER = '#F6F1E6';

export function drawPostcard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    photo: CanvasImageSource;
    artwork: CanvasImageSource;
    photoWidth: number;
    photoHeight: number;
    location: string;
    date: string;
    layout: PostcardLayout;
    swatches: string[];
    side: 'front' | 'back';
  },
) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
  if (options.side === 'back') {
    ctx.strokeStyle = '#C9C0B0';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, width - 56, height - 56);
    ctx.beginPath();
    ctx.moveTo(width * 0.55, 48);
    ctx.lineTo(width * 0.55, height - 48);
    ctx.stroke();
    ctx.strokeRect(width * 0.72, 64, width * 0.18, height * 0.16);
    ctx.fillStyle = '#6E655B';
    ctx.font = '600 22px sans-serif';
    ctx.fillText('POST CARD', 56, 88);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(width * 0.62, 280 + i * 56);
      ctx.lineTo(width - 72, 280 + i * 56);
      ctx.stroke();
    }
    ctx.font = '500 18px sans-serif';
    ctx.fillText(options.location || '', 56, height - 80);
    return;
  }
  const pad = 48;
  const maxW = width - pad * 2;
  const maxH = height * 0.42;
  const scale = Math.min(maxW / options.photoWidth, maxH / options.photoHeight);
  const pw = options.photoWidth * scale;
  const ph = options.photoHeight * scale;
  const px = (width - pw) / 2;
  const py = 56;
  ctx.strokeStyle = '#D8CFBD';
  ctx.strokeRect(px - 8, py - 8, pw + 16, ph + 16);
  ctx.drawImage(options.photo, px, py, pw, ph);

  const motifTop = py + ph + 90;
  if (options.layout === 'wash') {
    ctx.drawImage(options.artwork, pad, motifTop, width - pad * 2, height - motifTop - 48);
  } else {
    const mw = width * 0.42;
    const mh = height * 0.28;
    ctx.drawImage(options.artwork, width - pad - mw, motifTop, mw, mh);
  }
  ctx.fillStyle = '#6E655B';
  ctx.font = '600 16px sans-serif';
  ctx.fillText('LOCATION', pad, motifTop + 8);
  ctx.strokeStyle = '#C9C0B0';
  ctx.beginPath();
  ctx.moveTo(pad, motifTop + 28);
  ctx.lineTo(pad + 180, motifTop + 28);
  ctx.stroke();
  ctx.fillStyle = '#2C2621';
  ctx.font = '500 20px sans-serif';
  ctx.fillText(options.location.slice(0, 28), pad, motifTop + 58);
  ctx.fillStyle = '#6E655B';
  ctx.font = '600 16px sans-serif';
  ctx.fillText('DATE', pad, motifTop + 110);
  ctx.beginPath();
  ctx.moveTo(pad, motifTop + 130);
  ctx.lineTo(pad + 180, motifTop + 130);
  ctx.stroke();
  ctx.fillStyle = '#2C2621';
  ctx.font = '500 20px sans-serif';
  ctx.fillText(options.date.slice(0, 28), pad, motifTop + 160);
  options.swatches.slice(0, 3).forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(pad + index * 36, motifTop + 190, 26, 26);
  });
}
