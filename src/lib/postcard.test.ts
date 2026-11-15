import { describe, expect, it } from 'vitest';
import { sampleSwatches } from './postcard';

describe('sampleSwatches', () => {
  it('returns three hex colors from image bytes', () => {
    const data = new Uint8ClampedArray([
      20, 40, 30, 255,
      220, 80, 40, 255,
      240, 230, 210, 255,
    ]);
    const [accent, dark, pale] = sampleSwatches(data);
    expect(accent).toMatch(/^#[0-9a-f]{6}$/);
    expect(dark).toBe('#14281e');
    expect(pale).toBe('#f0e6d2');
  });
});
