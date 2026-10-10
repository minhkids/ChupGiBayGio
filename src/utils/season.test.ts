import { describe, expect, it } from 'vitest';
import { CONCEPT_METADATA, getCurrentMonthInVietnam, getEffectiveSeasonalStatus, matchesSeasonalStatusFilter } from './season';

describe('sunrise and sunset concept', () => {
  it('has a user-facing Mặt Trời label and covers both golden-hour periods', () => {
    expect(CONCEPT_METADATA.MAT_TROI.label).toBe('Mặt Trời');
    expect(CONCEPT_METADATA.MAT_TROI.description).toContain('Bình minh');
    expect(CONCEPT_METADATA.MAT_TROI.description).toContain('Hoàng hôn');
  });
});

describe('getCurrentMonthInVietnam', () => {
  it('uses the month currently shown in Vietnam, including UTC month boundaries', () => {
    expect(getCurrentMonthInVietnam(new Date('2026-10-31T17:30:00Z'))).toBe(11);
  });
});

describe('getEffectiveSeasonalStatus', () => {
  it('keeps a verified label through its last day in Vietnam and retires it afterward', () => {
    const trend = { status: 'ENDING_SOON' as const, statusValidUntil: '2026-10-19' };
    expect(getEffectiveSeasonalStatus(trend, new Date('2026-10-19T16:59:59Z'))).toBe('ENDING_SOON');
    expect(getEffectiveSeasonalStatus(trend, new Date('2026-10-19T17:00:00Z'))).toBe('ACTIVE');
  });

  it('does not change perennial spots', () => {
    expect(getEffectiveSeasonalStatus({ status: 'ACTIVE' }, new Date('2027-01-01T00:00:00Z'))).toBe('ACTIVE');
  });
});

describe('matchesSeasonalStatusFilter', () => {
  it('uses the effective status so expired seasonal spots appear under Quanh Năm', () => {
    const expiredPeak = { status: 'PEAK' as const, statusValidUntil: '2026-10-09' };
    const now = new Date('2026-10-10T12:00:00Z');
    expect(matchesSeasonalStatusFilter(expiredPeak, 'ACTIVE', now)).toBe(true);
    expect(matchesSeasonalStatusFilter(expiredPeak, 'PEAK', now)).toBe(false);
    expect(matchesSeasonalStatusFilter(expiredPeak, 'ALL', now)).toBe(true);
  });
});
