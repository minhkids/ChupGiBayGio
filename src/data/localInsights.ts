import type { InsightCategory, LocalInsight, Spot } from '../types';

export const LOCAL_INSIGHTS: LocalInsight[] = [];

export const INSIGHT_CATEGORIES: { id: 'ALL' | InsightCategory; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'FILM', label: '🎞️ Cuộn Film' },
  { id: 'LAB', label: '🧪 Tráng Scan Lab' },
  { id: 'OUTFIT', label: '👗 Trang phục Hot' },
  { id: 'RENTAL', label: '📷 Thuê Máy & Lens' },
  { id: 'PROP', label: '🌼 Đạo cụ chụp' },
];

export interface InsightQuery {
  regionId: string;
  category: 'ALL' | InsightCategory | InsightCategory[];
  searchQuery: string;
  selectedSpot?: Spot | null;
  /** Mặc định: hôm nay. Cho phép truyền vào để test. */
  today?: Date;
}

export interface RankedInsight extends LocalInsight {
  isNearSelected: boolean;
}

const normalize = (s: string) => s.toLowerCase().trim();

function isExpired(insight: LocalInsight, today: Date): boolean {
  if (!insight.validUntil) return false;
  const end = new Date(`${insight.validUntil}T23:59:59`);
  return end.getTime() < today.getTime();
}

/**
 * Lọc theo khu vực / danh mục / từ khóa, bỏ ưu đãi hết hạn,
 * ưu tiên mục gần spot đang chọn rồi tới độ hot.
 */
export function getLocalInsights(query: InsightQuery, source: LocalInsight[] = LOCAL_INSIGHTS): RankedInsight[] {
  const { regionId, category, searchQuery, selectedSpot } = query;
  const today = query.today ?? new Date();
  const q = normalize(searchQuery);
  const spotText = selectedSpot
    ? normalize(`${selectedSpot.name} ${selectedSpot.address}`)
    : '';
  const effectiveRegion = selectedSpot?.regionId ?? regionId;

  return source
    .filter(i => effectiveRegion === 'all' || !i.regionId || i.regionId === 'all' || i.regionId === effectiveRegion)
    .filter(i => !isExpired(i, today))
    .filter(i => {
      if (category === 'ALL') return true;
      if (Array.isArray(category)) return category.includes(i.category);
      return i.category === category;
    })
    .filter(i =>
      !q ||
      normalize(`${i.title} ${i.detail} ${i.placeName} ${i.areaLabel}`).includes(q)
    )
    .map<RankedInsight>(i => ({
      ...i,
      isNearSelected: !!spotText && (i.nearKeywords || []).some(k => spotText.includes(normalize(k))),
    }))
    .sort((a, b) => {
      if (a.isNearSelected !== b.isNearSelected) return a.isNearSelected ? -1 : 1;
      return b.hotScore - a.hotScore;
    });
}
