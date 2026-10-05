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
        if (data.outfits && data.outfits.length > 0) {
          return data.outfits;
        }
      }
    }
  } catch (err) {
    console.warn(`[OutfitService] Lỗi gọi API /api/posts/${postId}/outfit, dùng mock data:`, err);
  }

  // Fallback về mock data
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
        if (data.outfits && data.outfits.length > 0) {
          return data.outfits;
        }
      }
    }
  } catch (err) {
    console.warn(`[OutfitService] Lỗi gọi API /api/spots/${spotId}/outfits, dùng mock data:`, err);
  }

  return getOutfitsForSpot(spotId);
}

export function getAllMockOutfits(): PostOutfit[] {
  return MOCK_POST_OUTFITS;
}
