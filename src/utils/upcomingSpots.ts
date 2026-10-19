import type { SeasonalTrend, Spot } from '../types';
import { getCurrentMonthInVietnam, getEffectiveSeasonalStatus, isSpotActiveInMonth } from './season';
import { matchesPlaceCategory } from './placeCategories';
import type { PlaceCategoryFilter } from '../types';

/** Candidates are forecasts, not evidence that a place is currently at peak. */
export function isUpcomingCandidate(trend: SeasonalTrend): boolean {
  return trend.upcoming === true && getEffectiveSeasonalStatus(trend) === 'ACTIVE'
    && Boolean(trend.expectedMonths?.some(month => Number.isInteger(month) && month >= 1 && month <= 12));
}

/** Rolling next-season window, relative to the chosen month (Vietnam now by default). */
export function getUpcomingMonths(anchorMonth = getCurrentMonthInVietnam()): number[] {
  return [1, 2, 3].map(offset => (anchorMonth - 1 + offset) % 12 + 1);
}

export function matchesSpotMonth(trend: SeasonalTrend, month: number | null): boolean {
  if (month === null) return true;
  if (isUpcomingCandidate(trend)) {
    return trend.expectedMonths!.some(expected => expected === month || getUpcomingMonths(month).includes(expected));
  }
  if (trend.bestMonths?.length) return trend.bestMonths.includes(month);
  return isSpotActiveInMonth(trend.startMonth, trend.endMonth, month);
}

export function selectUpcomingSpots(spots: Spot[], regionId: string, query = '', anchorMonth = getCurrentMonthInVietnam(), placeCategory: PlaceCategoryFilter = 'ALL'): Spot[] {
  const window = getUpcomingMonths(anchorMonth);
  const search = query.trim().toLowerCase();
  return spots.filter(spot => isUpcomingCandidate(spot.seasonalTrend)
    && spot.seasonalTrend.expectedMonths!.some(month => window.includes(month))
    && matchesPlaceCategory(spot.seasonalTrend, placeCategory)
    && (regionId === 'all' || spot.regionId === regionId)
    && (!search || `${spot.name} ${spot.address} ${spot.description} ${spot.seasonalTrend.trendTitle}`.toLowerCase().includes(search)));
}

export function getSpotMarkerSymbol(trend: SeasonalTrend): string {
  const status = getEffectiveSeasonalStatus(trend);
  return status === 'PEAK' ? '★' : status === 'ENDING_SOON' ? '!' : '+';
}