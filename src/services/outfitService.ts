import type { PostOutfit } from '../types';
import { getOutfitsForPost, getOutfitsForSpot, MOCK_POST_OUTFITS } from '../data/mockOutfits';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface OutfitApiResponse {
  outfits?: PostOutfit[];
}

/**
 * Lấy danh sách Hotspots và link mua sắm theo bài viết
 */
export async function fetchPostOutfits(postId: string): Promise<PostOutfit[]> {
  try {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/outfit`);
      if (res.ok) {
        const data = (await res.json()) as OutfitApiResponse;
        return (data.outfits || []).filter(outfit => outfit.postId === postId);
      }
    }
  } catch (err) {
    console.warn(`[OutfitService] Không thể tải outfit cho bài viết ${postId}:`, err);
  }

  return getOutfitsForPost(postId);
}

/**
 * Lấy danh sách outfits của một địa điểm
 */
export async function fetchSpotOutfits(spotId: string): Promise<PostOutfit[]> {
  try {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/api/spots/${spotId}/outfits`);
      if (res.ok) {
        const data = (await res.json()) as OutfitApiResponse;
        return (data.outfits || []).filter(outfit => outfit.spotId === spotId);
      }
    }
  } catch (err) {
    console.warn(`[OutfitService] Không thể tải outfit cho địa điểm ${spotId}:`, err);
  }

  return getOutfitsForSpot(spotId);
}

export function getAllMockOutfits(): PostOutfit[] {
  return MOCK_POST_OUTFITS;
}
