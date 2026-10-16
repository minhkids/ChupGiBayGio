import { CATALOG_UPDATED_EVENT } from '../hooks/useCatalogRevision';
import type { ConceptTag, PlaceCategory, PlaceCategoryId } from '../types';

export type ServiceCategory = 'spot' | 'rental' | 'outfit' | 'photographer' | 'filmLab' | 'filmShop' | 'filmColor';

export interface FilmShopLocation {
  ward: string;
  district: string;
  openingHours?: string;
}

export function filmShopLocations(shop: Pick<ServiceListing, 'locations' | 'ward' | 'district' | 'openingHours'>): FilmShopLocation[] {
  return shop.locations?.length ? shop.locations : (shop.ward || shop.district ? [{ ward: shop.ward || '', district: shop.district || '', openingHours: shop.openingHours }] : []);
}

export interface ServiceListing {
  id: string;
  category: ServiceCategory;
  name: string;
  slogan?: string;
  cheapestRollName?: string;
  locations?: FilmShopLocation[];
  imageUrl?: string;
  productImageUrl?: string;
  minRollPrice?: number;
  maxRollPrice?: number;
  filmImageUrl?: string;
  iso?: string;
  format?: string;
  paletteHex?: string[];
  recommendedTime?: string;
  description?: string;
  address?: string;
  ward?: string;
  price?: string;
  rating?: string;
  reviewCount?: string;
  phone?: string;
  link?: string;
  secondaryLink?: string;
  tags?: string[];
  filmStocks?: string[];
  services?: string[];
  openingHours?: string;
  fastService?: boolean;
  expressDelivery2h?: boolean;
  material?: string;
  hotspots?: unknown[];
  gearBody?: string;
  gearLens?: string;
  portfolioPhotos?: string[];
  shootSpots?: string[];
  packages?: { name: string; price: number; duration: string; deliveredPhotos: number; deliveredPhotosText?: string }[];
  lat?: number;
  lng?: number;
  suitableSeasons?: string[];
  slug?: string;
  regionId?: string;
  district?: string;
  bestMonths?: number[];
  upcoming?: boolean;
  expectedMonths?: number[];
  bloomPercentage?: number;
  conceptTags?: ConceptTag[];
  placeCategories?: PlaceCategoryId[];
  recommendedLenses?: string[];
  spotStatus?: 'PEAK' | 'ACTIVE' | 'ENDING_SOON';
  statusValidUntil?: string;
  bestTimeOfDay?: string;
  bestTimeDescription?: string;
  goldenHour?: string;
  entryFee?: string;
  parkingFee?: string;
  sourceUrl?: string;
  coverImageUrl?: string;
  isActive?: boolean;
  spotId?: string;
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const ADMIN_TOKEN_KEY = 'service_admin_token';
async function readJsonResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  if (!body.trim()) return null as T;
  try {
    return JSON.parse(body) as T;
  } catch {
    const prefix = body.trimStart();
    if (/^(?:<!doctype\s+html|<html\b)/i.test(prefix)) {
      throw new Error('API trả về trang HTML thay vì JSON. Kiểm tra API Worker và VITE_API_URL; môi trường local cần Worker chạy tại http://127.0.0.1:8787.');
    }
    throw new Error(`API trả về dữ liệu không phải JSON (HTTP ${response.status}). Kiểm tra API Worker và VITE_API_URL.`);
  }
}
const parseList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string') return [];
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; }
  catch { return []; }
};
const parseJsonArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
};
const parseJsonObject = <T extends Record<string, unknown>>(value: unknown, fallback: T): T => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as T;
  if (typeof value !== 'string') return fallback;
  try { const parsed: unknown = JSON.parse(value); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as T : fallback; }
  catch { return fallback; }
};


const tableFor: Record<ServiceCategory, string> = {
  spot: 'spots', rental: 'rentalShops', outfit: 'outfits', photographer: 'photographers', filmLab: 'labs', filmShop: 'labs', filmColor: 'films'
};

function adminPayload(listing: ServiceListing) {
  if (listing.category === 'spot') return { name: listing.name, slug: listing.slug, regionId: listing.regionId, address: listing.address, district: listing.district, lat: listing.lat, lng: listing.lng, bestTimeOfDay: listing.bestTimeOfDay, bestTimeDescription: listing.bestTimeDescription, recommendedLenses: listing.recommendedLenses, conceptTags: listing.conceptTags, placeCategories: listing.placeCategories, bloomPercentage: listing.bloomPercentage, goldenHour: listing.goldenHour, bestMonths: listing.bestMonths, entryFee: listing.entryFee, parkingFee: listing.parkingFee, sourceUrl: listing.sourceUrl, coverImageUrl: listing.coverImageUrl, description: listing.description, spotStatus: listing.spotStatus, statusValidUntil: listing.statusValidUntil, upcoming: listing.upcoming, expectedMonths: listing.expectedMonths };
  if (listing.category === 'rental') return { name: listing.name, address: listing.address, hotline: listing.phone, fanpageUrl: listing.link, dailyPrice: listing.price };
  if (listing.category === 'outfit') return { spotId: listing.spotId, name: listing.name, description: listing.description, material: listing.material, estimatedPrice: listing.price, imageUrl: listing.imageUrl, hotspots: listing.hotspots, shopeeUrl: listing.link, tiktokUrl: listing.secondaryLink };
  if (listing.category === 'photographer') return { name: listing.name, avatarUrl: listing.imageUrl, bio: listing.description, phone: listing.phone, instagram: listing.link, gearBody: listing.gearBody, gearLens: listing.gearLens, styles: listing.tags, portfolioPhotos: listing.portfolioPhotos, packages: listing.packages };
  if (listing.category === 'filmLab' || listing.category === 'filmShop') return { adminCategory: listing.category, name: listing.name, slogan: listing.slogan, address: listing.address, ward: listing.ward, district: listing.district, locations: listing.locations, lat: listing.lat, lng: listing.lng, openingHours: listing.openingHours, hotline: listing.phone, fanpageUrl: listing.link, imageUrl: listing.imageUrl, productImageUrl: listing.productImageUrl, fast2h: listing.fastService, expressDelivery2h: listing.expressDelivery2h ?? false, inStockFilms: listing.filmStocks, services: listing.services, cheapestRollName: listing.cheapestRollName, minRollPrice: listing.minRollPrice, maxRollPrice: listing.maxRollPrice };
  return { name: listing.name, iso: listing.iso, tone: listing.recommendedTime, suitableSeasons: listing.suitableSeasons, packageImageUrl: listing.filmImageUrl, sampleImageUrl: listing.imageUrl };
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;
  const headers = new Headers(init?.headers);
  if (init?.body && !(typeof FormData !== 'undefined' && init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await readJsonResponse<unknown>(response);
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : '';
    throw new Error(message || `Yêu cầu thất bại (${response.status})`);
  }
  if (typeof window !== 'undefined' && path.startsWith('/api/admin/') && path !== '/api/admin/login' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init?.method?.toUpperCase() || 'GET')) {
    window.dispatchEvent(new Event(CATALOG_UPDATED_EVENT));
  }
  return data as T;
}

export const serviceHubApi = {
  list: () => request<ServiceListing[]>('/api/services'),
  adminList: async () => {
    const [legacy, spots, rental, outfits, photographers, films, labs] = await Promise.all([
      request<ServiceListing[]>('/api/admin/services'),
      request<Record<string, unknown>[]>('/api/admin/cms/spots'),
      request<Record<string, unknown>[]>('/api/admin/cms/rentalShops'),
      request<Record<string, unknown>[]>('/api/admin/cms/outfits'),
      request<Record<string, unknown>[]>('/api/admin/cms/photographers'),
      request<Record<string, unknown>[]>('/api/admin/cms/films'),
      request<Record<string, unknown>[]>('/api/admin/cms/labs')
    ]);
    return [
      ...spots.map((row) => {
        const trend = parseJsonObject(row.seasonal_trend, { status: 'ACTIVE' as const, statusValidUntil: undefined as string | undefined, conceptTags: [] as ConceptTag[], placeCategories: [] as PlaceCategoryId[], bloomPercentage: undefined as number | undefined, upcoming: false, expectedMonths: [] as number[] });
        return {
          ...row,
          id: String(row.id),
          category: 'spot' as const,
          isActive: Number(row.is_active) === 1,
          name: String(row.name || ''),
          slug: String(row.slug || ''),
          regionId: String(row.region_id || ''),
          address: String(row.address || ''),
          district: String(row.district || ''),
          lat: Number(row.lat),
          lng: Number(row.lng),
          bestTimeOfDay: String(row.best_time_of_day || ''),
          goldenHour: String(row.golden_hour || ''),
          bestTimeDescription: String(row.best_time_description || row.golden_hour || ''),
          recommendedLenses: parseList(row.recommended_lenses),
          conceptTags: parseList(trend.conceptTags) as ConceptTag[],
          placeCategories: parseList(trend.placeCategories) as PlaceCategoryId[],
          bloomPercentage: typeof trend.bloomPercentage === 'number' ? trend.bloomPercentage : 85,
          bestMonths: parseList(row.best_months).map(Number),
          upcoming: trend.upcoming === true,
          expectedMonths: parseList(trend.expectedMonths).map(Number),
          entryFee: String(row.entry_fee || ''),
          parkingFee: String(row.parking_fee || ''),
          sourceUrl: String(row.source_url || ''),
          coverImageUrl: String(row.cover_image_url || ''),
          description: String(row.description || ''),
          spotStatus: (trend.status || 'ACTIVE') as ServiceListing['spotStatus'],
          statusValidUntil: trend.statusValidUntil ? String(trend.statusValidUntil) : undefined
        };
      }),
      ...rental.map((row) => ({ ...row, id: String(row.id), category: 'rental' as const, name: String(row.name || ''), address: String(row.address || ''), phone: String(row.hotline || ''), link: String(row.fanpage_url || ''), price: String(row.daily_price || '') })),
      ...outfits.map((row) => ({ ...row, id: String(row.id), category: 'outfit' as const, spotId: String(row.spot_id || ''), name: String(row.name || ''), description: String(row.description || ''), price: String(row.estimated_price || ''), imageUrl: String(row.image_url || ''), link: String(row.shopee_url || ''), secondaryLink: String(row.tiktok_url || ''), material: String(row.material || ''), hotspots: parseJsonArray(row.hotspots) })),
      ...photographers.map((row) => ({ ...row, id: String(row.id), category: 'photographer' as const, name: String(row.name || ''), address: String(row.address || ''), district: String(row.district || ''), description: String(row.bio || ''), imageUrl: String(row.avatar_url || ''), phone: String(row.phone || ''), link: String(row.instagram || ''), tags: parseList(row.styles), shootSpots: parseList(row.preferred_spots), gearBody: String(row.gear_body || ''), gearLens: String(row.gear_lens || ''), portfolioPhotos: parseList(row.portfolio_photos), packages: Array.isArray(row.packages) ? row.packages as ServiceListing['packages'] : [] })),
      ...films.map((row) => ({ ...row, id: String(row.id), category: 'filmColor' as const, name: String(row.name || ''), iso: String(row.iso || ''), recommendedTime: String(row.tone || ''), filmImageUrl: String(row.package_image_url || ''), imageUrl: String(row.sample_image_url || ''), suitableSeasons: parseList(row.suitable_seasons) })),
      ...labs.map((row) => ({ ...row, id: String(row.id), category: Number(row.min_roll_price) > 0 || Number(row.max_roll_price) > 0 ? 'filmShop' as const : 'filmLab' as const, name: String(row.name || ''), slogan: String(row.slogan || ''), cheapestRollName: String(row.cheapest_roll_name || ''), address: [row.ward, row.district, 'Hà Nội'].filter(Boolean).join(', '), ward: String(row.ward || ''), district: String(row.district || ''), locations: parseJsonArray(row.locations) as FilmShopLocation[], imageUrl: String(row.image_url || ''), productImageUrl: String(row.product_image_url || ''), minRollPrice: Number(row.min_roll_price) || 0, maxRollPrice: Number(row.max_roll_price) || 0, link: String(row.fanpage_url || ''), phone: String(row.hotline || ''), openingHours: String(row.opening_hours || ''), fastService: Boolean(row.fast_2h), expressDelivery2h: Boolean(row.express_delivery_2h), filmStocks: parseList(row.in_stock_films), services: parseList(row.services) })),
      ...legacy
    ] as ServiceListing[];
  },
  listPlaceCategories: () => request<PlaceCategory[]>('/api/place-categories'),
  createPlaceCategory: (label: string) => request<PlaceCategory>('/api/admin/place-categories', {
    method: 'POST', body: JSON.stringify({ label }),
  }),
  updatePlaceCategory: (id: string, label: string) => request<PlaceCategory>(`/api/admin/place-categories/${encodeURIComponent(id)}`, {
    method: 'PUT', body: JSON.stringify({ label }),
  }),
  removePlaceCategory: (id: string) => request<{ success: boolean }>(`/api/admin/place-categories/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  approveCommunitySpot: (id: string) => request<{ success: boolean }>(`/api/admin/community-spots/${encodeURIComponent(id)}/approve`, { method: 'POST' }),
  rejectCommunitySpot: (id: string) => request<{ success: boolean }>(`/api/admin/community-spots/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  login: async (password: string) => {
    const result = await request<{ token: string }>('/api/admin/login', {
      method: 'POST', body: JSON.stringify({ password })
    });
    sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
  },
  logout: () => sessionStorage.removeItem(ADMIN_TOKEN_KEY),
  uploadImage: async (file: File, entity: 'spots' | 'outfits' | 'photographers' | 'films' | 'trendArticles') => {
    const form = new FormData();
    form.set('file', file);
    form.set('entity', entity);
    const headers = new Headers();
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API_BASE}/api/admin/upload`, { method: 'POST', headers, body: form });
    const data = await readJsonResponse<{ key: string; url: string; error?: string }>(response);
    if (!response.ok) throw new Error(data?.error || `Tải ảnh thất bại (${response.status})`);
    return data;
  },
  create: (listing: Omit<ServiceListing, 'id'>) => request<ServiceListing>(`/api/admin/${listing.category === 'spot' ? 'spots' : listing.category === 'rental' ? 'rental-shops' : listing.category === 'outfit' ? 'outfits' : listing.category === 'photographer' ? 'photographers' : listing.category === 'filmLab' || listing.category === 'filmShop' ? 'labs' : 'films'}`, {
    method: 'POST', body: JSON.stringify(adminPayload(listing as ServiceListing))
  }),
  update: (listing: ServiceListing) => request<ServiceListing>(`/api/admin/cms/${tableFor[listing.category]}/${encodeURIComponent(listing.id)}`, {
    method: 'PUT', body: JSON.stringify(adminPayload(listing))
  }),
  remove: (id: string, category?: ServiceCategory) => category
    ? request<{ success: boolean }>(`/api/admin/cms/${tableFor[category]}/${encodeURIComponent(id)}`, { method: 'DELETE' })
    : request<{ success: boolean }>(`/api/admin/services/${encodeURIComponent(id)}`, { method: 'DELETE' })
};
