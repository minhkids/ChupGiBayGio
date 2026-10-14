import { describe, expect, it } from 'vitest';
import { getPlaceCategoryLabel, matchesPlaceCategory } from './placeCategories';
import type { SeasonalTrend } from '../types';

const trend: SeasonalTrend = {
  id: 'spot-1', trendTitle: '', startMonth: 1, endMonth: 12, status: 'ACTIVE',
  conceptTags: [], isTrending: false, trendScore: 0,
  placeCategories: ['CAFE', 'RED_RIVER'],
};

describe('place category filters', () => {
  it('includes a place in each assigned category but not unassigned groups', () => {
    expect(matchesPlaceCategory(trend, 'CAFE')).toBe(true);
    expect(matchesPlaceCategory(trend, 'RED_RIVER')).toBe(true);
    expect(matchesPlaceCategory(trend, 'SUNSET')).toBe(false);
    expect(matchesPlaceCategory(trend, 'ALL')).toBe(true);
  });

  it('keeps legacy spots without category tags visible in All only', () => {
    const legacy = { ...trend, placeCategories: undefined };
    expect(matchesPlaceCategory(legacy, 'ALL')).toBe(true);
    expect(matchesPlaceCategory(legacy, 'VINTAGE')).toBe(false);
  });

  it('uses configured labels for category badges and falls back to the id', () => {
    const categories = [{ id: 'TIEM_SACH', label: 'Tiệm sách', sortOrder: 6 }];
    expect(getPlaceCategoryLabel('TIEM_SACH', categories)).toBe('Tiệm sách');
    expect(getPlaceCategoryLabel('MISSING', categories)).toBe('MISSING');
  });
});
