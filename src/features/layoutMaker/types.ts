import type { ConceptTag } from '../../types';
import type { PlaceCategoryId } from '../../types';

/** Themes align with concept tags, place categories, or seasonal specials. */
export type LayoutThemeId = ConceptTag | PlaceCategoryId | 'MUA_DONG_HANOI';

export type BackgroundStyle = 'burlap' | 'kraft' | 'parchment';

export interface LayoutCanvasConfig {
  width: number;
  height: number;
  background: BackgroundStyle;
  /** Base fill when texture is drawn on top */
  backgroundColor: string;
}

export interface PhotoSlotConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
  zIndex: number;
  /** Inner padding for stamp border (px in design space) */
  stampPadding?: number;
}

export type DecorationBuiltin =
  | 'peach-blossom'
  | 'rain-cloud'
  | 'red-scarf'
  | 'beanie'
  | 'street-lamp'
  | 'food-cart'
  | 'strip-sidebar'
  | 'coffee-doodle'
  | 'turtle-tower-stamp'
  | 'yellow-building-stamp'
  | 'postmark'
  | 'baby-breath'
  | 'torn-paper'
  | 'washi-tape'
  | 'airmail-corner';

export interface DecorationLayer {
  id: string;
  builtin: DecorationBuiltin;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotationDeg?: number;
  zIndex: number;
  opacity?: number;
}

export interface LayoutDefinition {
  id: string;
  name: string;
  description: string;
  themes: LayoutThemeId[];
  canvas: LayoutCanvasConfig;
  slots: PhotoSlotConfig[];
  decorations: DecorationLayer[];
}

export interface SlotPhotoTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface SlotPhotoState {
  objectUrl: string;
  image: HTMLImageElement | null;
  transform: SlotPhotoTransform;
}

export const DEFAULT_SLOT_TRANSFORM: SlotPhotoTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export const LAYOUT_EXPORT_WIDTH = 1080;
export const LAYOUT_EXPORT_HEIGHT = 1350;
