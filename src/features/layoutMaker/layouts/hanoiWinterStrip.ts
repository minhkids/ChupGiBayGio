import type { LayoutDefinition } from '../types';
import { LAYOUT_EXPORT_HEIGHT, LAYOUT_EXPORT_WIDTH } from '../types';

/** Four stacked slots inside one scalloped strip (right side). */
export const hanoiWinterStripLayout: LayoutDefinition = {
  id: 'hanoi-winter-strip',
  name: 'Photobooth 4 ảnh',
  description: 'Dải photobooth dọc kiểu tem bưu điện — 4 ô ảnh.',
  themes: ['MUA_DONG_HANOI', 'FILM', 'CAFE', 'VINTAGE', 'AO_DAI'],
  canvas: {
    width: LAYOUT_EXPORT_WIDTH,
    height: LAYOUT_EXPORT_HEIGHT,
    background: 'parchment',
    backgroundColor: '#E8E0D4',
  },
  slots: [
    { id: 'strip-1', x: 420, y: 100, width: 600, height: 260, rotationDeg: 0, zIndex: 5, stampPadding: 0 },
    { id: 'strip-2', x: 420, y: 380, width: 600, height: 260, rotationDeg: 0, zIndex: 5, stampPadding: 0 },
    { id: 'strip-3', x: 420, y: 660, width: 600, height: 260, rotationDeg: 0, zIndex: 5, stampPadding: 0 },
    { id: 'strip-4', x: 420, y: 940, width: 600, height: 260, rotationDeg: 0, zIndex: 5, stampPadding: 0 },
  ],
  decorations: [
    { id: 'sb1', builtin: 'strip-sidebar', x: 0, y: 0, width: 400, height: LAYOUT_EXPORT_HEIGHT, zIndex: 2 },
    { id: 'sb2', builtin: 'turtle-tower-stamp', x: 36, y: 80, zIndex: 8 },
    { id: 'sb3', builtin: 'postmark', x: 120, y: 200, zIndex: 9 },
    { id: 'sb4', builtin: 'coffee-doodle', x: 80, y: 620, zIndex: 8 },
    { id: 'sb5', builtin: 'yellow-building-stamp', x: 48, y: 1080, zIndex: 8 },
    { id: 'sb6', builtin: 'washi-tape', x: 960, y: 1280, zIndex: 30, rotationDeg: 8 },
  ],
};
