import type { PostOutfit } from '../types';


const API_BASE = import.meta.env.VITE_API_URL || '';

interface OutfitApiResponse {
  outfits?: PostOutfit[];
}

/**
 * Lấy danh sách Hotspots và link mua sắm theo bài viết
 */
export async function fetchPostOutfits(postId: string): Promise<PostOutfit[]> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(postId)}/outfit`);
    if (res.ok) return ((await res.json()) as OutfitApiResponse).outfits || [];
  } catch (err) {
    console.warn(`[OutfitService] Lỗi gọi API /api/posts/${postId}/outfit:`, err);
  }
  return [];
}

/**
 * Lấy danh sách outfits của một địa điểm
 */
export async function fetchSpotOutfits(spotId: string): Promise<PostOutfit[]> {
  try {
    const res = await fetch(`${API_BASE}/api/spots/${encodeURIComponent(spotId)}/outfits`);
    if (res.ok) return ((await res.json()) as OutfitApiResponse).outfits || [];
  } catch (err) {
    console.warn(`[OutfitService] Lỗi gọi API /api/spots/${spotId}/outfits:`, err);
  }
  return [];
}
