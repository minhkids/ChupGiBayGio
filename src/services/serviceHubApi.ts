export type ServiceCategory = 'spot' | 'rental' | 'outfit' | 'photographer' | 'filmLab' | 'filmColor';

export interface ServiceListing {
  id: string;
  category: ServiceCategory;
  name: string;
  imageUrl?: string;
  filmImageUrl?: string;
  iso?: string;
  format?: string;
  paletteHex?: string[];
  recommendedTime?: string;
  description?: string;
  address?: string;
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
  bestTimeOfDay?: string;
  goldenHour?: string;
  entryFee?: string;
  parkingFee?: string;
  sourceUrl?: string;
  coverImageUrl?: string;
  spotId?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '';
const ADMIN_TOKEN_KEY = 'service_admin_token';
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

const tableFor: Record<ServiceCategory, string> = {
  spot: 'spots', rental: 'rentalShops', outfit: 'outfits', photographer: 'photographers', filmLab: 'labs', filmColor: 'films'
};

function adminPayload(listing: ServiceListing) {
  if (listing.category === 'spot') return { name: listing.name, slug: listing.slug, regionId: listing.regionId, address: listing.address, district: listing.district, lat: listing.lat, lng: listing.lng, bestTimeOfDay: listing.bestTimeOfDay, goldenHour: listing.goldenHour, bestMonths: listing.bestMonths, entryFee: listing.entryFee, parkingFee: listing.parkingFee, sourceUrl: listing.sourceUrl, coverImageUrl: listing.coverImageUrl, description: listing.description };
  if (listing.category === 'rental') return { name: listing.name, address: listing.address, hotline: listing.phone, fanpageUrl: listing.link, dailyPrice: listing.price };
  if (listing.category === 'outfit') return { spotId: listing.spotId, name: listing.name, description: listing.description, material: listing.material, estimatedPrice: listing.price, imageUrl: listing.imageUrl, hotspots: listing.hotspots, shopeeUrl: listing.link, tiktokUrl: listing.secondaryLink };
  if (listing.category === 'photographer') return { name: listing.name, avatarUrl: listing.imageUrl, bio: listing.description, phone: listing.phone, instagram: listing.link, gearBody: listing.gearBody, gearLens: listing.gearLens, styles: listing.tags, portfolioPhotos: listing.portfolioPhotos, packages: listing.packages };
  if (listing.category === 'filmLab') return { name: listing.name, address: listing.address, lat: listing.lat, lng: listing.lng, openingHours: listing.openingHours, hotline: listing.phone, fast2h: listing.fastService, inStockFilms: listing.filmStocks };
  return { name: listing.name, iso: listing.iso, tone: listing.recommendedTime, suitableSeasons: listing.suitableSeasons, packageImageUrl: listing.filmImageUrl, sampleImageUrl: listing.imageUrl };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;
  const headers = new Headers(init?.headers);
  if (init?.body && !(typeof FormData !== 'undefined' && init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error || `Yêu cầu thất bại (${response.status})`);
  }
  return response.json() as Promise<T>;
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
      ...spots.map((row) => ({ ...row, id: String(row.id), category: 'spot' as const, name: String(row.name || ''), slug: String(row.slug || ''), regionId: String(row.region_id || ''), address: String(row.address || ''), district: String(row.district || ''), lat: Number(row.lat), lng: Number(row.lng), bestTimeOfDay: String(row.best_time_of_day || ''), goldenHour: String(row.golden_hour || ''), bestMonths: parseList(row.best_months).map(Number), entryFee: String(row.entry_fee || ''), parkingFee: String(row.parking_fee || ''), sourceUrl: String(row.source_url || ''), coverImageUrl: String(row.cover_image_url || ''), description: String(row.description || '') })),
      ...rental.map((row) => ({ ...row, id: String(row.id), category: 'rental' as const, name: String(row.name || ''), address: String(row.address || ''), phone: String(row.hotline || ''), link: String(row.fanpage_url || ''), price: String(row.daily_price || '') })),
      ...outfits.map((row) => ({ ...row, id: String(row.id), category: 'outfit' as const, spotId: String(row.spot_id || ''), name: String(row.name || ''), description: String(row.description || ''), price: String(row.estimated_price || ''), imageUrl: String(row.image_url || ''), link: String(row.shopee_url || ''), secondaryLink: String(row.tiktok_url || ''), material: String(row.material || ''), hotspots: parseJsonArray(row.hotspots) })),
      ...photographers.map((row) => ({ ...row, id: String(row.id), category: 'photographer' as const, name: String(row.name || ''), address: String(row.address || ''), district: String(row.district || ''), description: String(row.bio || ''), imageUrl: String(row.avatar_url || ''), phone: String(row.phone || ''), link: String(row.instagram || ''), tags: parseList(row.styles), shootSpots: parseList(row.preferred_spots), gearBody: String(row.gear_body || ''), gearLens: String(row.gear_lens || ''), portfolioPhotos: parseList(row.portfolio_photos), packages: Array.isArray(row.packages) ? row.packages as ServiceListing['packages'] : [] })),
      ...films.map((row) => ({ ...row, id: String(row.id), category: 'filmColor' as const, name: String(row.name || ''), iso: String(row.iso || ''), recommendedTime: String(row.tone || ''), filmImageUrl: String(row.package_image_url || ''), imageUrl: String(row.sample_image_url || ''), suitableSeasons: parseList(row.suitable_seasons) })),
      ...labs.map((row) => ({ ...row, id: String(row.id), category: 'filmLab' as const, name: String(row.name || ''), address: String(row.address || ''), district: String(row.district || ''), imageUrl: String(row.image_url || ''), link: String(row.fanpage_url || ''), phone: String(row.hotline || ''), openingHours: String(row.opening_hours || ''), fastService: Boolean(row.fast_2h), filmStocks: parseList(row.in_stock_films) })),
      ...legacy
    ] as ServiceListing[];
  },
  login: async (password: string) => {
    const result = await request<{ token: string }>('/api/admin/login', {
      method: 'POST', body: JSON.stringify({ password })
    });
    sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
  },
  logout: () => sessionStorage.removeItem(ADMIN_TOKEN_KEY),
  uploadImage: async (file: File, entity: 'spots' | 'outfits' | 'photographers' | 'films') => {
    const form = new FormData();
    form.set('file', file);
    form.set('entity', entity);
    const headers = new Headers();
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API_BASE}/api/admin/upload`, { method: 'POST', headers, body: form });
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(data?.error || `Tải ảnh thất bại (${response.status})`);
    }
    return response.json() as Promise<{ key: string; url: string }>;
  },
  create: (listing: Omit<ServiceListing, 'id'>) => request<ServiceListing>(`/api/admin/${listing.category === 'spot' ? 'spots' : listing.category === 'rental' ? 'rental-shops' : listing.category === 'outfit' ? 'outfits' : listing.category === 'photographer' ? 'photographers' : listing.category === 'filmLab' ? 'labs' : 'films'}`, {
    method: 'POST', body: JSON.stringify(adminPayload(listing as ServiceListing))
  }),
  update: (listing: ServiceListing) => request<ServiceListing>(`/api/admin/cms/${tableFor[listing.category]}/${encodeURIComponent(listing.id)}`, {
    method: 'PUT', body: JSON.stringify(adminPayload(listing))
  }),
  remove: (id: string, category?: ServiceCategory) => category
    ? request<{ success: boolean }>(`/api/admin/cms/${tableFor[category]}/${encodeURIComponent(id)}`, { method: 'DELETE' })
    : request<{ success: boolean }>(`/api/admin/services/${encodeURIComponent(id)}`, { method: 'DELETE' })
};
