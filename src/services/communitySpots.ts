import type { Spot } from '../types';
import { db } from './db';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function createCommunitySpot(draft: Spot): Promise<Spot> {
  const response = await fetch(`${API_BASE}/api/community/spots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: draft.name, address: draft.address, regionId: draft.regionId,
      lat: draft.lat, lng: draft.lng, description: draft.description,
      coverImageUrl: draft.coverImageUrl, conceptTags: draft.seasonalTrend.conceptTags,
      spotStatus: draft.seasonalTrend.status, statusValidUntil: draft.seasonalTrend.statusValidUntil,
    }),
  });
  const result = await response.json().catch(() => null) as { id?: string; error?: string } | null;
  if (!response.ok || !result?.id) throw new Error(result?.error || 'Không lưu được địa điểm. Vui lòng thử lại.');
  const saved = await db.spots.getById(result.id);
  if (!saved) throw new Error('Địa điểm đã lưu nhưng chưa tải lại được. Hãy tải lại trang trước khi gửi lại.');
  return saved;
}
