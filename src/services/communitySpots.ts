import type { Spot } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function createCommunitySpot(draft: Spot): Promise<{ id: string; status: 'pending_review' }> {
  const response = await fetch(`${API_BASE}/api/community/spots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: draft.name, address: draft.address, regionId: draft.regionId,
      lat: draft.lat, lng: draft.lng, description: draft.description,
      coverImageUrl: draft.coverImageUrl, conceptTags: draft.seasonalTrend.conceptTags,
      placeCategories: draft.seasonalTrend.placeCategories,
      spotStatus: draft.seasonalTrend.status, statusValidUntil: draft.seasonalTrend.statusValidUntil,
    }),
  });
  const result = await response.json().catch(() => null) as { id?: string; status?: string; error?: string } | null;
  if (!response.ok || !result?.id || result.status !== 'pending_review') throw new Error(result?.error || 'Không gửi được địa điểm. Vui lòng thử lại.');
  return { id: result.id, status: 'pending_review' };
}
