export type SpotStatus = 'PEAK' | 'ACTIVE' | 'ENDING_SOON';

export type BestTimeOfDay = 'GOLDEN_HOUR_MORNING' | 'SUNSET' | 'NIGHT' | 'DAYLIGHT';

export type CostType = 'FREE' | 'TICKET' | 'COMMERCIAL_FEE';

export type CrowdLevel = 'Rất vắng' | 'Vắng' | 'Bình thường' | 'Trung bình' | 'Đông' | 'Quá tải';

export type ConceptTag = 
  | 'HOA_CO' 
  | 'VINTAGE' 
  | 'NANG_THO' 
  | 'AO_DAI' 
  | 'FILM' 
  | 'STREET' 
  | 'CYBERPUNK' 
  | 'MINIMAL' 
  | 'KIEN_TRUC'
  | 'MAT_TROI'
  | 'CHRISTMAS';

export interface SeasonalTrend {
  id: string;
  trendTitle: string;
  startMonth: number; // 1 - 12
  endMonth: number;   // 1 - 12
  peakStartWeek?: number; // 1 - 52
  peakEndWeek?: number;   // 1 - 52
  status: SpotStatus;
  statusValidUntil?: string;
  bloomPercentage?: number; // 0 - 100%
  daysLeftInPeak?: number;
  peakMonths?: number[];
  conceptTags: ConceptTag[];
  isTrending: boolean;
  trendScore: number;
}

export interface InspirationPost {
  id: string;
  platform: 'FACEBOOK' | 'TIKTOK' | 'INSTAGRAM' | 'COMMUNITY';
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  thumbnailUrl: string;
  galleryUrls?: string[];
  embedUrl?: string;
  postUrl?: string;
  groupName?: string;
  groupUrl?: string;
  postDate?: string;
  caption: string;
  fullContent?: string;
  paletteHex: string[];
  poseTip?: string;
  cameraSettings?: string;
  likesCount?: string;
  commentsCount?: string;
  sharesCount?: string;
}

export type InsightKind = 'DEAL' | 'HOT';

export type InsightCategory = 'FILM' | 'LAB' | 'OUTFIT' | 'RENTAL' | 'PROP';

/** Ưu đãi / xu hướng nhiếp ảnh đang diễn ra quanh khu vực điểm chụp. */
export interface LocalInsight {
  id: string;
  regionId: string;
  kind: InsightKind;
  category: InsightCategory;
  title: string;
  detail: string;
  /** Tên địa điểm cụ thể (rạp, tiệm, quán...) */
  placeName: string;
  /** Khu vực hiển thị, vd "Quanh Phan Đình Phùng" */
  areaLabel: string;
  /** Từ khóa khớp với tên/địa chỉ spot đang chọn để ưu tiên hiển thị */
  nearKeywords?: string[];
  priceNow?: string;
  priceOld?: string;
  discountLabel?: string;
  /** Mức độ hot 1-100 (dùng để sắp xếp) */
  hotScore: number;
  /** ISO date YYYY-MM-DD; quá hạn sẽ tự ẩn */
  validUntil?: string;
  validNote?: string;
  /** Nguồn tham khảo / liên kết */
  sourceLabel?: string;
  link?: string;
}

export interface CommunityReport {
  id: string;
  authorName: string;
  reportedAt: string;
  bloomPercentage: number;
  crowdLevel: CrowdLevel;
  notes: string;
  weather: 'Nắng đẹp' | 'Nắng gắt' | 'Nhiều mây' | 'Âm u' | 'Mưa bay';
  imageUrl?: string;
}

export interface Spot {
  id: string;
  regionId: string;
  name: string;
  slug: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  
  bestTimeOfDay: BestTimeOfDay;
  bestTimeDescription: string;
  lightingNotes: string;
  sunOrientation: string;
  costType: CostType;
  ticketPriceRange: string;
  cameraFeePolicy: string;
  recommendedLenses: string[];
  recommendedOutfits: string[];
  colorPalette: string[];
  crowdLevelByHour: {
    morning: CrowdLevel;
    noon: CrowdLevel;
    afternoon: CrowdLevel;
    evening: CrowdLevel;
  };
  
  coverImageUrl: string;
  galleryUrls: string[];
  description: string;
  photographyTips: string[];
  /** Photographer-written posture hint; drives the Ghost Pose Camera entry. */
  poseTip?: string;
  
  seasonalTrend: SeasonalTrend;
  inspirationPosts: InspirationPost[];
  recentReports: CommunityReport[];
  
  savesCount: number;
  isFeatured?: boolean;
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  zoom: number;
  currentSeasonalHighlight: string;
}

export interface FilterState {
  month: number | null;
  season: 'all' | 'spring' | 'summer' | 'autumn' | 'winter' | 'festive';
  regionId: string;
  status: 'ALL' | SpotStatus;
  timeOfDay: 'ALL' | BestTimeOfDay;
  concept: 'ALL' | ConceptTag;
  cost: 'ALL' | CostType;
  filmId: string;
  searchQuery: string;
  onlyNearby: boolean;
  userCoords: { lat: number; lng: number } | null;
  radiusKm: number;
}

export interface Film {
  id: string;
  name: string;
  brand: string;
  film_type: string;
  iso: number;
  tone_characteristics: string;
  best_seasons: number[];
  best_spots: string[];
  recommended_time: string;
  film_image_url: string;
  sample_image_url: string;
  matched_spots: {
    spot_name: string;
    season_months: number[];
    compatibility_score: number;
    evaluation_reason: string;
  }[];
  nearby_shops?: {
    name: string;
    address: string;
    distance_to_core_spots: string;
    services: string[];
  }[];
}

export interface RentalShop {
  id: string;
  name: string;
  type: 'OUTFIT' | 'CAMERA';
  address: string;
  lat: number;
  lng: number;
  priceRange: string;
  phone: string;
  link: string;
}

export interface PoseItem {
  id: string;
  category: 'female' | 'male' | 'couple' | 'props';
  name: string;
  tips: string;
  svgPath: string;
  viewBox: string;
  matchedSpots?: string[];
}

export type OutfitCategory = 'AO_DAI' | 'DRESS' | 'JACKET' | 'PROP' | 'SET' | 'ACCESSORY';

export interface SimilarProduct {
  id: string;
  name: string;
  priceEstimate: string;
  shopeeUrl: string;
  tiktokUrl: string;
  thumbnailUrl?: string;
  matchScore?: number;
}

export interface PostOutfit {
  id: string;
  postId: string;
  spotId?: string;
  imageUrl: string;
  itemName: string;
  category: OutfitCategory;
  color?: string;
  style?: string;
  xPercent: number; // 0.0 - 100.0%
  yPercent: number; // 0.0 - 100.0%
  searchQuery: string;
  priceEstimate?: string;
  shopeeUrl: string;
  tiktokUrl: string;
  similarItems: SimilarProduct[];
  aiNotes?: string;
}

export * from './photographer';
export * from './planner';

