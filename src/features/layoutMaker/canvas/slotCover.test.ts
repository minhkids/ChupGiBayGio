import { describe, expect, it } from 'vitest';
import { baseCoverScale } from './slotCover';

describe('baseCoverScale', () => {
  it('uses the larger axis scale so the image covers the slot', () => {
    expect(baseCoverScale(4000, 3000, 200, 200)).toBeCloseTo(200 / 3000);
    expect(baseCoverScale(1000, 2000, 300, 150)).toBeCloseTo(300 / 1000);
  });
});
