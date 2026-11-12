import { describe, expect, it } from 'vitest';
import { DEFAULT_PLACE_CATEGORIES, ensureChristmasPlaceCategory, getPlaceCategoryLabel, matchesPlaceCategory } from './placeCategories';
import type { SeasonalTrend } from '../types';

const trend: SeasonalTrend = {
  id: 'spot-1', trendTitle: '', startMonth: 1, endMonth: 12, status: 'ACTIVE',
  conceptTags: [], isTrending: false, trendScore: 0,
  placeCategories: ['CAFE', 'RED_RIVER'],
};

describe('place category filters', () => {
  it('keeps the live áo dài category available when the category API is unavailable', () => {
    expect(DEFAULT_PLACE_CATEGORIES).toContainEqual({ id: 'AO_DAI', label: 'Áo dài', sortOrder: 8 });
    expect(getPlaceCategoryLabel('AO_DAI')).toBe('Áo dài');
  });

  it('keeps Giáng Sinh on the map even when the category API has not migrated yet', () => {
    expect(DEFAULT_PLACE_CATEGORIES).toContainEqual({ id: 'CHRISTMAS', label: 'Giáng Sinh', sortOrder: 9 });
    expect(getPlaceCategoryLabel('CHRISTMAS')).toBe('Giáng Sinh');
    const live = [{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }, { id: 'AO_DAI', label: 'Áo dài', sortOrder: 8 }];
    expect(ensureChristmasPlaceCategory(live)).toEqual([...live, { id: 'CHRISTMAS', label: 'Giáng Sinh', sortOrder: 9 }]);
    expect(ensureChristmasPlaceCategory([...live, { id: 'CHRISTMAS', label: 'Giáng Sinh', sortOrder: 12 }])).toEqual([...live, { id: 'CHRISTMAS', label: 'Giáng Sinh', sortOrder: 12 }]);
  });

  it('filters Giáng Sinh from the existing CHRISTMAS concept tag without widening other chips', () => {
    expect(matchesPlaceCategory({ ...trend, placeCategories: ['CAFE'], conceptTags: ['CHRISTMAS'] }, 'CHRISTMAS')).toBe(true);
    expect(matchesPlaceCategory({ ...trend, placeCategories: ['CHRISTMAS'], conceptTags: [] }, 'CHRISTMAS')).toBe(true);
    expect(matchesPlaceCategory({ ...trend, placeCategories: ['CAFE'], conceptTags: ['VINTAGE'] }, 'VINTAGE')).toBe(false);
    expect(matchesPlaceCategory({ ...trend, placeCategories: [], conceptTags: ['CHRISTMAS'] }, 'CAFE')).toBe(false);
  });

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
