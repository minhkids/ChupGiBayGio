export type PostcardLayout = 'zine' | 'wash';
export type PostcardRole = 'greeting' | 'message' | 'location' | 'date';

export type PostcardCaptionLine = {
  role: PostcardRole;
  text: string;
  /** Date set on the same line as a short location, when the pair fits. */
  aside?: string;
};

export const POSTCARD_WIDTH = 1536;
export const POSTCARD_HEIGHT = 1024;
export const POSTCARD_MESSAGE_MAX = 400;
export const POSTCARD_MESSAGE_SIZES = [30, 26, 22, 18] as const;
export const POSTCARD_RECIPIENT_MAX = 48;
export const POSTCARD_DATE_ASIDE_GAP = 32;

export const POSTCARD_FONT_FAMILIES = {
  serif: 'Cormorant Garamond',
  script: 'Patrick Hand',
} as const;

export const POSTCARD_SERIF = `"${POSTCARD_FONT_FAMILIES.serif}", "Noto Serif", "Liberation Serif", Georgia, serif`;
export const POSTCARD_SCRIPT = `"${POSTCARD_FONT_FAMILIES.script}", "${POSTCARD_FONT_FAMILIES.serif}", "Noto Serif", Georgia, serif`;

const PAPER = '#F6F1E6';
const INK = '#2C2621';
const RULE = '#C9C0B0';

type CaptionStyle = { font: string; size: number; line: number; color: string; gap: number };

const CAPTION_METRICS: Record<PostcardRole, CaptionStyle> = {
  greeting: { font: `italic 500 46px ${POSTCARD_SERIF}`, size: 46, line: 58, color: INK, gap: 16 },
  message: { font: `400 32px ${POSTCARD_SCRIPT}`, size: 32, line: 46, color: '#3A322C', gap: 22 },
  location: { font: `600 42px ${POSTCARD_SERIF}`, size: 42, line: 54, color: '#3A322C', gap: 8 },
  date: { font: `500 32px ${POSTCARD_SERIF}`, size: 32, line: 42, color: '#4E453D', gap: 0 },
};

export function formatGreeting(recipient: string): string {
  const name = Array.from(cleanSingleLine(recipient)).slice(0, POSTCARD_RECIPIENT_MAX).join('');
  return name ? `Thân gửi ${name}` : 'Thân gửi';
}

export function normalizePostcardMessage(text: string, max = POSTCARD_MESSAGE_MAX): string {
  const normalized = text.normalize('NFC').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return Array.from(normalized).slice(0, max).join('').replace(/^\s+|\s+$/g, '');
}

export function wrapPostcardText(
  text: string,
  maxWidth: number,
  measure: (line: string) => number,
): string[] {
  if (!text.trim() || maxWidth <= 0) return [];
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      for (const [index, piece] of breakWord(word, maxWidth, measure).entries()) {
        if (index > 0) {
          if (current) lines.push(current);
          current = piece;
          continue;
        }
        const candidate = current ? `${current} ${piece}` : piece;
        if (!current || measure(candidate) <= maxWidth) current = candidate;
        else {
          lines.push(current);
          current = piece;
        }
      }
    }
    if (current) lines.push(current);
  }
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export function postcardMessageLineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.45);
}

export function fitPostcardMessage(
  text: string,
  maxWidth: number,
  maxHeight: number,
  measureAt: (sample: string, fontSize: number) => number,
  sizes: readonly number[] = POSTCARD_MESSAGE_SIZES,
): { fontSize: number; lines: string[]; lineHeight: number } {
  const normalized = normalizePostcardMessage(text);
  const largest = sizes[0] ?? 30;
  if (!normalized || maxWidth <= 0 || sizes.length === 0) {
    return { fontSize: largest, lines: [], lineHeight: postcardMessageLineHeight(largest) };
  }
  for (const fontSize of sizes) {
    const lineHeight = postcardMessageLineHeight(fontSize);
    const lines = wrapPostcardText(normalized, maxWidth, sample => measureAt(sample, fontSize));
    if (lines.length * lineHeight <= maxHeight) return { fontSize, lines, lineHeight };
  }
  const fontSize = sizes[sizes.length - 1];
  const lineHeight = postcardMessageLineHeight(fontSize);
  const wrapped = wrapPostcardText(normalized, maxWidth, sample => measureAt(sample, fontSize));
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
  return {
    fontSize,
    lineHeight,
    lines: capLines(wrapped, maxLines, maxWidth, sample => measureAt(sample, fontSize)),
  };
}

export function layoutPostcardFooter(input: {
  location: string;
  date: string;
  maxWidth: number;
  measure: (text: string, role: 'location' | 'date') => number;
}): PostcardCaptionLine[] {
  const location = capLines(
    wrapPostcardText(cleanSingleLine(input.location), input.maxWidth, text => input.measure(text, 'location')),
    3,
    input.maxWidth,
    text => input.measure(text, 'location'),
  );
  const date = cleanSingleLine(input.date);
  const lines: PostcardCaptionLine[] = location.map(text => ({ role: 'location' as const, text }));
  if (!date) return lines;
  if (location.length === 1) {
    const alongside = input.measure(location[0], 'location') + POSTCARD_DATE_ASIDE_GAP + input.measure(date, 'date');
    if (alongside <= input.maxWidth) {
      lines[0].aside = date;
      return lines;
    }
  }
  lines.push({ role: 'date', text: date });
  return lines;
}

export function captionBlockHeight(
  lines: PostcardCaptionLine[],
  lineAdvance: (role: PostcardRole) => number,
  roleGap: (role: PostcardRole) => number,
): number {
  let height = 0;
  for (let index = 0; index < lines.length; index += 1) {
    height += lineAdvance(lines[index].role);
    const next = lines[index + 1];
    if (next && next.role !== lines[index].role) height += roleGap(lines[index].role);
  }
  return height;
}

export function buildPostcardCaption(input: {
  recipient: string;
  message: string;
  location: string;
  date: string;
  maxWidth: number;
  measure: (text: string, role: PostcardRole) => number;
  availableHeight: number;
  lineAdvance: (role: PostcardRole) => number;
  roleGap: (role: PostcardRole) => number;
  maxMessageLines?: number;
  maxLocationLines?: number;
  maxGreetingLines?: number;
}): PostcardCaptionLine[] {
  const greeting = capLines(
    wrapPostcardText(formatGreeting(input.recipient), input.maxWidth, text => input.measure(text, 'greeting')),
    input.maxGreetingLines ?? 3,
    input.maxWidth,
    text => input.measure(text, 'greeting'),
  );
  const message = capLines(
    wrapPostcardText(normalizePostcardMessage(input.message), input.maxWidth, text => input.measure(text, 'message')),
    input.maxMessageLines ?? 12,
    input.maxWidth,
    text => input.measure(text, 'message'),
  );
  const location = capLines(
    wrapPostcardText(cleanSingleLine(input.location), input.maxWidth, text => input.measure(text, 'location')),
    input.maxLocationLines ?? 4,
    input.maxWidth,
    text => input.measure(text, 'location'),
  );
  const date = cleanSingleLine(input.date);
  const lines: PostcardCaptionLine[] = [
    ...greeting.map(text => ({ role: 'greeting' as const, text })),
    ...message.map(text => ({ role: 'message' as const, text })),
    ...location.map(text => ({ role: 'location' as const, text })),
  ];
  if (!date) return lines;

  if (location.length === 1) {
    const alongside = input.measure(location[0], 'location') + POSTCARD_DATE_ASIDE_GAP + input.measure(date, 'date');
    if (alongside <= input.maxWidth) {
      const locationLine = lines.find(line => line.role === 'location');
      if (locationLine) locationLine.aside = date;
      return lines;
    }
  }

  const withDate: PostcardCaptionLine[] = [...lines, { role: 'date', text: date }];
  if (captionBlockHeight(withDate, input.lineAdvance, input.roleGap) <= input.availableHeight) return withDate;
  return lines;
}

export function drawPostcard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    artwork: CanvasImageSource | null;
    artworkWidth: number;
    artworkHeight: number;
    recipient: string;
    message: string;
    location: string;
    date: string;
    layout: PostcardLayout;
  },
) {
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const column = writingColumn(width, height, options.layout);
  paintArtwork(ctx, options.artwork, options.artworkWidth, options.artworkHeight, column.art);
  if (options.layout === 'zine') {
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(column.split, column.textTop);
    ctx.lineTo(column.split, column.textBottom);
    ctx.stroke();
  }
  drawWriting(ctx, options, column);
  ctx.restore();
}

function writingColumn(width: number, height: number, layout: PostcardLayout) {
  const wash = layout === 'wash';
  const split = Math.round(width * (wash ? 0.6 : 0.56));
  const padY = wash ? 22 : 40;
  return {
    split,
    art: {
      x: wash ? 14 : 36,
      y: padY,
      w: split - (wash ? 8 : 52),
      h: height - padY * 2,
      fade: wash ? 92 : 44,
    },
    textX: split + (wash ? 20 : 36),
    textWidth: width - (split + (wash ? 20 : 36)) - (wash ? 36 : 48),
    textTop: padY + 6,
    textBottom: height - padY,
    wash,
  };
}

function drawWriting(
  ctx: CanvasRenderingContext2D,
  options: {
    recipient: string;
    message: string;
    location: string;
    date: string;
    layout: PostcardLayout;
  },
  column: ReturnType<typeof writingColumn>,
) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const measureRole = (text: string, role: PostcardRole) => {
    ctx.font = CAPTION_METRICS[role].font;
    return ctx.measureText(text).width;
  };
  const greeting = capLines(
    wrapPostcardText(formatGreeting(options.recipient), column.textWidth, text => measureRole(text, 'greeting')),
    2,
    column.textWidth,
    text => measureRole(text, 'greeting'),
  );
  const footer = layoutPostcardFooter({
    location: options.location,
    date: options.date,
    maxWidth: column.textWidth,
    measure: (text, role) => measureRole(text, role),
  });
  const greetingHeight = greeting.length * CAPTION_METRICS.greeting.line + (greeting.length ? 16 : 0);
  const footerHeight = captionBlockHeight(footer, role => CAPTION_METRICS[role].line, role => CAPTION_METRICS[role].gap);
  const gapBeforeFooter = footer.length ? 24 : 0;
  const messageTop = column.textTop + greetingHeight;
  const messageHeight = Math.max(28, column.textBottom - messageTop - footerHeight - gapBeforeFooter);
  const fitted = fitPostcardMessage(
    options.message,
    column.textWidth,
    messageHeight,
    (sample, fontSize) => {
      ctx.font = `400 ${fontSize}px ${POSTCARD_SCRIPT}`;
      return ctx.measureText(sample).width;
    },
  );

  ctx.font = CAPTION_METRICS.greeting.font;
  ctx.fillStyle = CAPTION_METRICS.greeting.color;
  let y = column.textTop;
  for (const line of greeting) {
    ctx.fillText(line, column.textX, y);
    y += CAPTION_METRICS.greeting.line;
  }
  if (!column.wash && greeting.length) {
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(column.textX, y + 4);
    ctx.lineTo(column.textX + 96, y + 4);
    ctx.stroke();
  }

  ctx.font = `400 ${fitted.fontSize}px ${POSTCARD_SCRIPT}`;
  ctx.fillStyle = '#3A322C';
  y = messageTop;
  for (const line of fitted.lines) {
    ctx.fillText(line, column.textX, y);
    y += fitted.lineHeight;
  }
  if (footer.length) {
    drawCaption(ctx, footer, column.textX, column.textBottom - footerHeight, column.textWidth);
  }
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  lines: PostcardCaptionLine[],
  x: number,
  y: number,
  maxWidth: number,
) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const style = CAPTION_METRICS[line.role];
    ctx.font = style.font;
    ctx.fillStyle = style.color;
    ctx.fillText(line.text, x, y);
    if (line.aside) {
      const dateStyle = CAPTION_METRICS.date;
      ctx.font = dateStyle.font;
      ctx.fillStyle = dateStyle.color;
      const dateWidth = ctx.measureText(line.aside).width;
      const dateY = y + Math.round((style.size - dateStyle.size) * 0.8);
      ctx.fillText(line.aside, x + maxWidth - dateWidth, dateY);
    }
    const next = lines[index + 1];
    y += style.line + (next && next.role !== line.role ? style.gap : 0);
  }
}

function paintArtwork(
  ctx: CanvasRenderingContext2D,
  artwork: CanvasImageSource | null,
  artworkWidth: number,
  artworkHeight: number,
  frame: { x: number; y: number; w: number; h: number; fade: number },
) {
  const x = Math.round(frame.x);
  const y = Math.round(frame.y);
  const w = Math.round(frame.w);
  const h = Math.round(frame.h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = PAPER;
  ctx.fillRect(x, y, w, h);
  if (artwork && artworkWidth > 0 && artworkHeight > 0) {
    const scale = Math.max(w / artworkWidth, h / artworkHeight);
    const cropW = w / scale;
    const cropH = h / scale;
    ctx.drawImage(
      artwork,
      (artworkWidth - cropW) / 2,
      (artworkHeight - cropH) / 2,
      cropW,
      cropH,
      x,
      y,
      w,
      h,
    );
  } else {
    paintSampleWash(ctx, x, y, w, h);
  }
  ctx.restore();
  featherEdges(ctx, x, y, w, h, frame.fade);
}

function featherEdges(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fade: number) {
  const edge = Math.min(fade, w / 2, h / 2);
  const solid = 'rgba(246, 241, 230, 1)';
  const clear = 'rgba(246, 241, 230, 0)';
  const band = (gradient: CanvasGradient, rx: number, ry: number, rw: number, rh: number) => {
    ctx.fillStyle = gradient;
    ctx.fillRect(rx, ry, rw, rh);
  };
  const top = ctx.createLinearGradient(0, y, 0, y + edge);
  top.addColorStop(0, solid);
  top.addColorStop(1, clear);
  band(top, x, y, w, edge);
  const bottom = ctx.createLinearGradient(0, y + h, 0, y + h - edge);
  bottom.addColorStop(0, solid);
  bottom.addColorStop(1, clear);
  band(bottom, x, y + h - edge, w, edge);
  const left = ctx.createLinearGradient(x, 0, x + edge, 0);
  left.addColorStop(0, solid);
  left.addColorStop(1, clear);
  band(left, x, y, edge, h);
  const right = ctx.createLinearGradient(x + w, 0, x + w - edge, 0);
  right.addColorStop(0, solid);
  right.addColorStop(1, clear);
  band(right, x + w - edge, y, edge, h);
}

/** Neutral wash used before a watercolor exists, so the sample layout is never blank. */
function paintSampleWash(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#E4EEF0');
  sky.addColorStop(0.45, '#F4EADF');
  sky.addColorStop(1, '#E7D5C3');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  softBloom(ctx, x + w * 0.74, y + h * 0.16, w * 0.16, h * 0.11, 'rgba(236, 214, 176, 0.9)');
  softBloom(ctx, x + w * 0.24, y + h * 0.22, w * 0.3, h * 0.16, 'rgba(176, 198, 204, 0.5)');
  softBloom(ctx, x + w * 0.52, y + h * 0.36, w * 0.4, h * 0.14, 'rgba(244, 232, 214, 0.45)');

  ctx.fillStyle = 'rgba(154, 170, 176, 0.42)';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.58);
  ctx.quadraticCurveTo(x + w * 0.22, y + h * 0.46, x + w * 0.42, y + h * 0.56);
  ctx.quadraticCurveTo(x + w * 0.64, y + h * 0.66, x + w * 0.84, y + h * 0.5);
  ctx.quadraticCurveTo(x + w * 0.94, y + h * 0.44, x + w, y + h * 0.52);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.fill();

  ctx.fillStyle = 'rgba(118, 132, 112, 0.38)';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.7);
  ctx.quadraticCurveTo(x + w * 0.2, y + h * 0.6, x + w * 0.38, y + h * 0.68);
  ctx.quadraticCurveTo(x + w * 0.58, y + h * 0.78, x + w * 0.8, y + h * 0.64);
  ctx.quadraticCurveTo(x + w * 0.92, y + h * 0.58, x + w, y + h * 0.66);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.fill();

  ctx.fillStyle = 'rgba(176, 132, 104, 0.26)';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.8);
  ctx.quadraticCurveTo(x + w * 0.32, y + h * 0.72, x + w * 0.64, y + h * 0.82);
  ctx.quadraticCurveTo(x + w * 0.84, y + h * 0.88, x + w, y + h * 0.76);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.fill();

  softBloom(ctx, x + w * 0.46, y + h * 0.86, w * 0.34, h * 0.07, 'rgba(214, 198, 178, 0.4)');

  ctx.strokeStyle = 'rgba(54, 48, 42, 0.5)';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, w * 0.0022);
  for (const [place, lean] of [[0.18, -1], [0.25, 1], [0.33, -1], [0.64, 1], [0.72, -1], [0.8, 1]] as const) {
    ctx.beginPath();
    const baseX = x + place * w;
    ctx.moveTo(baseX, y + h * 0.84);
    ctx.quadraticCurveTo(baseX + lean * w * 0.03, y + h * 0.72, baseX + lean * w * 0.01, y + h * 0.6);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(54, 48, 42, 0.32)';
  ctx.lineWidth = Math.max(1.25, w * 0.0016);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, y + h * 0.1);
  ctx.quadraticCurveTo(x + w * 0.18, y + h * 0.2, x + w * 0.14, y + h * 0.34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.15, y + h * 0.22);
  ctx.quadraticCurveTo(x + w * 0.24, y + h * 0.18, x + w * 0.28, y + h * 0.25);
  ctx.stroke();
  ctx.restore();
}

function softBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
) {
  const radius = Math.max(rx, ry);
  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(246, 241, 230, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function cleanSingleLine(text: string): string {
  return text.normalize('NFC').replace(/\s+/g, ' ').trim();
}

function breakWord(word: string, maxWidth: number, measure: (line: string) => number): string[] {
  if (measure(word) <= maxWidth) return [word];
  const parts: string[] = [];
  let chunk = '';
  for (const char of Array.from(word)) {
    const next = chunk + char;
    if (chunk && measure(next) > maxWidth) {
      parts.push(chunk);
      chunk = char;
    } else {
      chunk = next;
    }
  }
  if (chunk) parts.push(chunk);
  return parts;
}

function capLines(
  lines: string[],
  max: number,
  maxWidth: number,
  measure: (text: string) => number,
): string[] {
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  kept[max - 1] = ellipsis(kept[max - 1], maxWidth, measure);
  return kept;
}

function ellipsis(line: string, maxWidth: number, measure: (text: string) => number): string {
  const base = line.replace(/[\s.,;:!?…]+$/g, '');
  const fits = (value: string) => measure(value) <= maxWidth;
  if (fits(`${base}…`)) return `${base}…`;
  const chars = Array.from(base);
  while (chars.length > 0 && !fits(`${chars.join('')}…`)) chars.pop();
  return chars.length > 0 ? `${chars.join('')}…` : '…';
}
