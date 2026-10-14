import type { PlaceCategory, PlaceCategoryFilter, SeasonalTrend } from '../types';

export const DEFAULT_PLACE_CATEGORIES: PlaceCategory[] = [
  { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 },
  { id: 'VINTAGE', label: 'Vintage', sortOrder: 2 },
  { id: 'SHOPPING_MALL', label: 'Trung tâm thương mại', sortOrder: 3 },
  { id: 'RED_RIVER', label: 'Gần sông Hồng', sortOrder: 4 },
  { id: 'SUNSET', label: 'Chụp hoàng hôn', sortOrder: 5 },
];

export function matchesPlaceCategory(trend: Pick<SeasonalTrend, 'placeCategories'>, category: PlaceCategoryFilter): boolean {
  return category === 'ALL' || trend.placeCategories?.includes(category) === true;
}

export function getPlaceCategoryLabel(id: string, categories: PlaceCategory[] = DEFAULT_PLACE_CATEGORIES): string {
  return categories.find(category => category.id === id)?.label ?? id;
}
