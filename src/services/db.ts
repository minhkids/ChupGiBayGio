import FILMS_DATA from '../data/films_seed.json';
import { POSES } from '../data/poses';

import type { Spot, Film, PoseItem, RentalShop } from '../types';

/**
 * Sync Local Database Service
 * Centralizes all data access to make future migration to Firebase/API seamless.
 * 
 * TODO (When moving to Firebase):
 * - Refactor these methods to return Promises: `async getSpots(): Promise<Spot[]>`
 * - Add loading states in UI components that consume this.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

function parseJsonField<T>(field: any, defaultValue: T): T {
  if (!field) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return defaultValue;
    }
  }
  return field as T;
}

function mapSpotFromAPI(row: any): Spot {
  return {
    id: row.id,
    regionId: row.region_id,
    name: row.name,
    slug: row.slug,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    bestTimeOfDay: row.best_time_of_day,
    bestTimeDescription: row.best_time_description,
    lightingNotes: row.lighting_notes,
    sunOrientation: row.sun_orientation,
    costType: row.cost_type,
    ticketPriceRange: row.ticket_price_range || '',
    cameraFeePolicy: row.camera_fee_policy || '',
    recommendedLenses: parseJsonField<string[]>(row.recommended_lenses, []),
    recommendedOutfits: parseJsonField<string[]>(row.recommended_outfits, []),
    colorPalette: parseJsonField<string[]>(row.color_palette, []),
    crowdLevelByHour: parseJsonField(row.crowd_level_by_hour, {
      morning: 'Trung bình',
      noon: 'Vắng',
      afternoon: 'Đông',
      evening: 'Vắng'
    }),
    coverImageUrl: row.cover_image_url,
    galleryUrls: parseJsonField<string[]>(row.gallery_urls, []),
    description: row.description,
    photographyTips: parseJsonField<string[]>(row.photography_tips, []),
    poseTip: row.pose_tip,
    seasonalTrend: parseJsonField(row.seasonal_trend, {
      id: '',
      trendTitle: '',
      startMonth: 1,
      endMonth: 12,
      status: 'ACTIVE',
      conceptTags: [],
      isTrending: false,
      trendScore: 0
    }),
    inspirationPosts: parseJsonField(row.inspiration_posts, []),
    recentReports: [], // Typically fetched separately or not stored directly in spots table
    savesCount: row.saves_count || 0,
    isFeatured: row.is_featured === 1 || row.is_featured === true
  };
}

export const db = {
  spots: {
    getAll: async (): Promise<Spot[]> => {
      try {
        const res = await fetch(`${API_BASE}/api/spots`);
        if (res.ok) {
          const data: unknown = await res.json();
          return Array.isArray(data) ? data.map(mapSpotFromAPI) : [];
        }
      } catch (err) {
        console.warn('Failed to fetch spots from D1 API', err);
      }
      return [];
    },
    getById: async (id: string): Promise<Spot | undefined> => {
      try {
        const res = await fetch(`${API_BASE}/api/spots/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data: unknown = await res.json();
          return mapSpotFromAPI(data);
        }
      } catch (err) {
        console.warn('Failed to fetch spot from D1 API', err);
      }
      return undefined;
    },
  },
  films: {
    getAll: async (): Promise<Film[]> => {
      if (API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/films`);
          if (res.ok) {
            return await res.json();
          }
        } catch (err) {
          console.warn('Failed to fetch films from API, falling back to mock', err);
        }
      }
      return FILMS_DATA as unknown as Film[];
    },
    getById: async (id: string): Promise<Film | undefined> => {
      if (API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/films`);
          if (res.ok) {
            const data: Film[] = await res.json();
            return data.find(f => f.id === id || f.id.replace('film_', '').replace(/_/g, '-') === id.replace(/_/g, '-'));
          }
        } catch (err) {
          console.warn('Failed to fetch film from API, falling back to mock', err);
        }
      }
      const all = FILMS_DATA as unknown as Film[];
      return all.find(f => f.id === id || f.id.replace('film_', '').replace(/_/g, '-') === id.replace(/_/g, '-'));
    },
    getForSpot: async (spotName: string): Promise<Film[]> => {
      const spotLower = spotName.toLowerCase();
      if (API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/films`);
          if (res.ok) {
            const all: Film[] = await res.json();
            return all.filter((film) =>
              film.best_spots.some((s) => spotLower.includes(s.toLowerCase()) || s.toLowerCase().includes(spotLower)) ||
              film.matched_spots.some((m) => spotLower.includes(m.spot_name.toLowerCase()) || m.spot_name.toLowerCase().includes(spotLower))
            );
          }
        } catch (err) {
          console.warn('Failed to fetch films from API, falling back to mock', err);
        }
      }
      const all = FILMS_DATA as unknown as Film[];
      return all.filter((film) =>
        film.best_spots.some((s) => spotLower.includes(s.toLowerCase()) || s.toLowerCase().includes(spotLower)) ||
        film.matched_spots.some((m) => spotLower.includes(m.spot_name.toLowerCase()) || m.spot_name.toLowerCase().includes(spotLower))
      );
    }
  },
  poses: {
    getAll: async (): Promise<PoseItem[]> => {
      if (API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/poses`);
          if (res.ok) {
            return await res.json();
          }
        } catch (err) {
          console.warn('Failed to fetch poses from API, falling back to mock', err);
        }
      }
      return POSES;
    },
  },
  rentalShops: {
    getAll: async (): Promise<RentalShop[]> => {
      try {
        const res = await fetch(`${API_BASE}/api/rental-shops`);
        if (!res.ok) return [];
        const rows: unknown = await res.json();
        if (!Array.isArray(rows)) return [];
        return rows.map((value) => {
          const row = value as Record<string, unknown>;
          return { id: String(row.id), name: String(row.name || ''), type: 'OUTFIT' as const, address: String(row.address || ''), lat: 0, lng: 0,
            priceRange: String(row.daily_price || ''), phone: String(row.hotline || ''), link: String(row.fanpage_url || '') };
        });
      } catch (err) {
        console.warn('Failed to fetch rental shops from D1 API', err);
        return [];
      }
    },
  }
};
