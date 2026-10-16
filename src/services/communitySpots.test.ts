import { afterEach, expect, it, vi } from 'vitest';
import { createCommunitySpot } from './communitySpots';
import type { Spot } from '../types';
afterEach(() => vi.unstubAllGlobals());
const draft = { id: 'temporary', name: 'Vườn hoa', address: 'Hà Nội', regionId: 'hanoi', lat: 21, lng: 105, description: '', coverImageUrl: '/spot-image-pending.svg', seasonalTrend: { status: 'ACTIVE', conceptTags: ['HOA_CO'], placeCategories: ['CAFE'] } } as Spot;
it('posts assigned categories and returns the pending-review acknowledgement without exposing the spot publicly', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'saved', status: 'pending_review' }) });
  vi.stubGlobal('fetch', fetcher);
  expect(await createCommunitySpot(draft)).toEqual({ id: 'saved', status: 'pending_review' });
  expect(fetcher.mock.calls[0][0]).toBe('/api/community/spots');
  const options = fetcher.mock.calls[0][1];
  expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
  expect(JSON.parse(options.body)).not.toHaveProperty('id');
  expect(JSON.parse(options.body)).toMatchObject({ placeCategories: ['CAFE'] });
  expect(fetcher).toHaveBeenCalledOnce();
});
it('surfaces persistence failures instead of reporting a local-only success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Thử lại sau' }) }));
  await expect(createCommunitySpot(draft)).rejects.toThrow('Thử lại sau');
});
