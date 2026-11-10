import { CONCEPT_METADATA } from '../../utils/season';
import { getPlaceCategoryLabel } from '../../utils/placeCategories';
import type { LayoutThemeId } from './types';

export interface LayoutThemeMeta {
  id: LayoutThemeId;
  label: string;
  description: string;
}

const conceptThemes = (Object.keys(CONCEPT_METADATA) as LayoutThemeId[]).map((id) => ({
  id,
  label: CONCEPT_METADATA[id as keyof typeof CONCEPT_METADATA].label,
  description: CONCEPT_METADATA[id as keyof typeof CONCEPT_METADATA].description,
}));

const placeThemeIds: LayoutThemeId[] = ['CAFE', 'VINTAGE', 'AO_DAI', 'RED_RIVER'];

const placeThemes: LayoutThemeMeta[] = placeThemeIds.map((id) => ({
  id,
  label: getPlaceCategoryLabel(id),
  description: 'Khung ảnh gợi ý theo loại địa điểm trên bản đồ.',
}));

export const SEASONAL_WINTER_THEME: LayoutThemeMeta = {
  id: 'MUA_DONG_HANOI',
  label: 'Mùa đông Hà Nội',
  description: 'Ấm trà, mưa phố, áo len — mood đông Hà Nội.',
};

const deduped = new Map<LayoutThemeId, LayoutThemeMeta>();
for (const t of [SEASONAL_WINTER_THEME, ...placeThemes, ...conceptThemes]) {
  if (!deduped.has(t.id)) deduped.set(t.id, t);
}

export const LAYOUT_THEMES: LayoutThemeMeta[] = Array.from(deduped.values());

export function getLayoutsForTheme<T extends { themes: LayoutThemeId[] }>(
  layouts: T[],
  themeId: LayoutThemeId,
): T[] {
  return layouts.filter((layout) => layout.themes.includes(themeId));
}
