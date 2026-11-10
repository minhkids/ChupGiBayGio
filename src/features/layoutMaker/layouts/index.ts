import { hanoiWinterCollageLayout } from './hanoiWinterCollage';
import { hanoiWinterStripLayout } from './hanoiWinterStrip';
import { vintagePostcardLayout } from './vintagePostcard';
import type { LayoutDefinition } from '../types';

export const ALL_LAYOUTS: LayoutDefinition[] = [
  hanoiWinterCollageLayout,
  hanoiWinterStripLayout,
  vintagePostcardLayout,
];

export function getLayoutById(id: string): LayoutDefinition | undefined {
  return ALL_LAYOUTS.find((layout) => layout.id === id);
}
