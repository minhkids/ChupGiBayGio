import type { PlaceCategory, PlaceCategoryFilter, SeasonalTrend } from '../types';

export const DEFAULT_PLACE_CATEGORIES: PlaceCategory[] = [
  { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 },
  { id: 'VINTAGE', label: 'Vintage', sortOrder: 2 },
  { id: 'SHOPPING_MALL', label: 'Trung tâm thương mại', sortOrder: 3 },
  { id: 'RED_RIVER', label: 'Gần sông Hồng', sortOrder: 4 },
  { id: 'SUNSET', label: 'Chụp hoàng hôn', sortOrder: 5 },
  { id: 'AO_DAI', label: 'Áo dài', sortOrder: 8 },
  { id: 'CHRISTMAS', label: 'Giáng Sinh', sortOrder: 9 },
];

export function ensureChristmasPlaceCategory(categories: PlaceCategory[]): PlaceCategory[] {
  if (categories.some(category => category.id === 'CHRISTMAS')) return categories;
  const christmas = DEFAULT_PLACE_CATEGORIES.find(category => category.id === 'CHRISTMAS');
  return christmas ? [...categories, christmas] : categories;
}

export function matchesPlaceCategory(trend: Pick<SeasonalTrend, 'placeCategories' | 'conceptTags'>, category: PlaceCategoryFilter): boolean {
  if (category === 'ALL' || trend.placeCategories?.includes(category) === true) return true;
  // Christmas spots were already stored as a concept tag, so the map chip reuses that id.
  return category === 'CHRISTMAS' && trend.conceptTags?.includes('CHRISTMAS') === true;
}

export function getPlaceCategoryLabel(id: string, categories: PlaceCategory[] = DEFAULT_PLACE_CATEGORIES): string {
  return categories.find(category => category.id === id)?.label ?? id;
}
