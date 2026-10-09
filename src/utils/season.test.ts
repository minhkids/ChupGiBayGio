import { describe, expect, it } from 'vitest';
import { getEffectiveSeasonalStatus } from './season';

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
