// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { featuredMapAccessorySet, MAP_ACCESSORY_SHOPEE_URLS } from './mapAccessoryProducts';

describe('mapAccessoryProducts', () => {
  it('puts the seasonal workshop first, then Shopee products with local images', () => {
    expect(featuredMapAccessorySet).toHaveLength(5);
    const [workshop, ...products] = featuredMapAccessorySet;
    expect(workshop).toMatchObject({
      title: 'Cây thông Noel mini (workshop 98k)',
      productImageUrl: '/accessories/doai-workshop-cay-thong.webp',
      linkUrl: 'https://www.threads.com/@quangkwang',
      linkLabel: 'Xem trên Threads',
    });
    expect(workshop.shopeeUrl).toBeUndefined();
    expect(products).toHaveLength(4);
    for (const item of products) {
      expect(item.productImageUrl).toMatch(/^\/accessories\/.+\.webp$/);
      expect(item.shopeeUrl).toMatch(/^https:\/\/shopee\.vn\/product\//);
      expect(item.linkUrl).toBeUndefined();
    }
    expect(MAP_ACCESSORY_SHOPEE_URLS.tuiDeoCheoGon).toContain('40531859824');
  });
});
