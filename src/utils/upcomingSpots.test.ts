import { describe, expect, it } from 'vitest';
import { MOCK_SPOTS } from '../data/mockSpots';
import { getSpotMarkerSymbol, getUpcomingMonths, isUpcomingCandidate, matchesSpotMonth, selectUpcomingSpots } from './upcomingSpots';

const candidate = { ...MOCK_SPOTS[0], regionId: 'hanoi', name: 'Mùa hoa tương lai', seasonalTrend: { ...MOCK_SPOTS[0].seasonalTrend, status: 'ACTIVE' as const, upcoming: true, expectedMonths: [11, 12], placeCategories: ['CAFE', 'RED_RIVER'] as ['CAFE', 'RED_RIVER'] } };
describe('upcoming seasonal candidates', () => {
  it('uses a question mark for speculation, never for a verified peak', () => {
    expect(getSpotMarkerSymbol(candidate.seasonalTrend)).toBe('?');
    const peak = { ...candidate.seasonalTrend, status: 'PEAK' as const, statusValidUntil: '2099-12-31' };
    expect(isUpcomingCandidate(peak)).toBe(false);
    expect(getSpotMarkerSymbol(peak)).toBe('★');
  });
  it('looks three months ahead and wraps the year without dropping next-season spots', () => {
    expect(getUpcomingMonths(10)).toEqual([11, 12, 1]);
    expect(matchesSpotMonth(candidate.seasonalTrend, 10)).toBe(true);
    expect(selectUpcomingSpots([candidate], 'hanoi', 'hoa', 10)).toEqual([candidate]);
    expect(selectUpcomingSpots([candidate], 'dalat', '', 10)).toEqual([]);
    expect(selectUpcomingSpots([candidate], 'hanoi', 'không khớp', 10)).toEqual([]);
    expect(selectUpcomingSpots([candidate], 'hanoi', '', 3)).toEqual([]);
    expect(selectUpcomingSpots([candidate], 'hanoi', '', 10, 'CAFE')).toEqual([candidate]);
    expect(selectUpcomingSpots([candidate], 'hanoi', '', 10, 'SUNSET')).toEqual([]);
  });
});