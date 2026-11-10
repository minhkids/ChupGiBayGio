// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { featuredMapAccessorySet, MAP_ACCESSORY_SHOPEE_URLS } from './mapAccessoryProducts';

describe('mapAccessoryProducts', () => {
  it('exposes four featured items with local images and Shopee product URLs', () => {
    expect(featuredMapAccessorySet).toHaveLength(4);
    for (const item of featuredMapAccessorySet) {
      expect(item.productImageUrl).toMatch(/^\/accessories\/.+\.webp$/);
      expect(item.shopeeUrl).toMatch(/^https:\/\/shopee\.vn\/product\//);
    }
    expect(MAP_ACCESSORY_SHOPEE_URLS.tuiDeoCheoGon).toContain('40531859824');
  });
});
