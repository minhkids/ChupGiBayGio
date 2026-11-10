import type { LayoutDefinition } from '../types';
import { LAYOUT_EXPORT_HEIGHT, LAYOUT_EXPORT_WIDTH } from '../types';

export const vintagePostcardLayout: LayoutDefinition = {
  id: 'vintage-postcard',
  name: 'Bưu thiếp Phố cổ',
  description: 'Một ảnh chính lớn + ảnh phụ góc — nền kraft rách giấy.',
  themes: ['VINTAGE', 'KIEN_TRUC', 'AO_DAI', 'CAFE', 'RED_RIVER'],
  canvas: {
    width: LAYOUT_EXPORT_WIDTH,
    height: LAYOUT_EXPORT_HEIGHT,
    background: 'kraft',
    backgroundColor: '#B89B72',
  },
  slots: [
    { id: 'main', x: 140, y: 120, width: 620, height: 920, rotationDeg: 3, zIndex: 6, stampPadding: 18 },
    { id: 'accent', x: 720, y: 880, width: 280, height: 280, rotationDeg: -4, zIndex: 10, stampPadding: 12 },
  ],
  decorations: [
    { id: 'vp1', builtin: 'torn-paper', x: 100, y: 720, width: 500, height: 220, rotationDeg: -2, zIndex: 3 },
    { id: 'vp2', builtin: 'turtle-tower-stamp', x: 48, y: 48, rotationDeg: -6, zIndex: 12 },
    { id: 'vp3', builtin: 'postmark', x: 620, y: 80, zIndex: 13 },
    { id: 'vp4', builtin: 'airmail-corner', x: 0, y: 0, zIndex: 4 },
    { id: 'vp5', builtin: 'baby-breath', x: 40, y: 900, zIndex: 25 },
    { id: 'vp6', builtin: 'washi-tape', x: 780, y: 840, rotationDeg: -15, zIndex: 26 },
  ],
};
