import { describe, expect, it } from 'vitest';
import { getClickPercent } from './imageCoordinates';

describe('getClickPercent', () => {
  it('converts image clicks into clamped percentage coordinates', () => {
    const rect = { left: 100, top: 50, width: 200, height: 100 };
    expect(getClickPercent(150, 75, rect)).toEqual({ x: 25, y: 25 });
    expect(getClickPercent(400, 200, rect)).toEqual({ x: 100, y: 100 });
    expect(getClickPercent(50, 0, rect)).toEqual({ x: 0, y: 0 });
  });
});
