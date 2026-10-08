import { describe, expect, it } from 'vitest';
import { readSavedSpotIds } from './savedSpots';

describe('readSavedSpotIds', () => {
  it('starts with no saved locations when local storage is empty', () => {
    expect(readSavedSpotIds(null)).toEqual([]);
  });

  it('removes legacy sample locations but preserves user-saved IDs', () => {
    expect(readSavedSpotIds('["spot-hn-01","custom-spot","spot-dl-01"]')).toEqual(['custom-spot']);
  });

  it('returns an empty list for invalid or non-list storage data', () => {
    expect(readSavedSpotIds('{broken')).toEqual([]);
    expect(readSavedSpotIds('{"id":"spot-1"}')).toEqual([]);
  });
});
