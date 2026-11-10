import type { LayoutDefinition } from '../types';
import { LAYOUT_EXPORT_HEIGHT, LAYOUT_EXPORT_WIDTH } from '../types';

export const hanoiWinterCollageLayout: LayoutDefinition = {
  id: 'hanoi-winter-collage',
  name: 'Collage Mùa Đông',
  description: '6 khung tem nghiêng trên nền burlap — điển hình Threads/IG.',
  themes: ['MUA_DONG_HANOI', 'CHRISTMAS', 'VINTAGE', 'STREET', 'CAFE'],
  canvas: {
    width: LAYOUT_EXPORT_WIDTH,
    height: LAYOUT_EXPORT_HEIGHT,
    background: 'burlap',
    backgroundColor: '#C4A574',
  },
  slots: [
    { id: 's1', x: 48, y: 72, width: 300, height: 280, rotationDeg: 6, zIndex: 2, stampPadding: 14 },
    { id: 's2', x: 380, y: 56, width: 320, height: 270, rotationDeg: -5, zIndex: 3, stampPadding: 14 },
    { id: 's3', x: 72, y: 380, width: 290, height: 300, rotationDeg: -7, zIndex: 4, stampPadding: 14 },
    { id: 's4', x: 340, y: 360, width: 380, height: 320, rotationDeg: 4, zIndex: 5, stampPadding: 14 },
    { id: 's5', x: 56, y: 720, width: 310, height: 290, rotationDeg: 5, zIndex: 6, stampPadding: 14 },
    { id: 's6', x: 400, y: 720, width: 300, height: 280, rotationDeg: -6, zIndex: 7, stampPadding: 14 },
  ],
  decorations: [
    { id: 'd1', builtin: 'peach-blossom', x: 24, y: 28, zIndex: 20 },
    { id: 'd2', builtin: 'rain-cloud', x: 820, y: 40, zIndex: 21 },
    { id: 'd3', builtin: 'red-scarf', x: 480, y: 300, rotationDeg: -12, zIndex: 22 },
    { id: 'd4', builtin: 'beanie', x: 920, y: 420, zIndex: 23 },
    { id: 'd5', builtin: 'street-lamp', x: 880, y: 980, zIndex: 24 },
    { id: 'd6', builtin: 'food-cart', x: 40, y: 1040, zIndex: 25 },
  ],
};
