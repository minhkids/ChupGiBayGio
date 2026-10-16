import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCatalogRevision } from './useCatalogRevision';
import { HANOI_DEFAULT_COORDS, type FilmLab } from '../data/filmLabsData';
import type { FilmShopLocation, ServiceListing } from '../services/serviceHubApi';

export interface NearestFilmLab extends FilmLab {
  distanceKm: number;
  distanceFormatted: string;
  distanceDisplay: string;
  isNearest: boolean;
}

export interface UserCoordinates {
  lat: number;
  lng: number;
}

// Global event trigger helper to open Nearest Film Labs drawer from anywhere
export function openNearestFilmShops(filmName?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('chupgi:open-nearest-labs', {
        detail: { filmName }
      })
    );
  }
}

// Haversine formula for calculating distance between two coordinates in km
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (val: number) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Format distance: < 1km -> "xxx m", >= 1km -> "x.x km"
export function formatDistanceDisplay(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)} km`;
}

export function useNearestLabs(optionsOrFilter?: string | { filmStockQuery?: string; source?: 'labs' | 'shops' | 'all' }) {
  const catalogRevision = useCatalogRevision();
  const source = typeof optionsOrFilter === 'object' ? optionsOrFilter.source ?? 'labs' : 'labs';
  const initialFilmFilter = typeof optionsOrFilter === 'string' ? optionsOrFilter : optionsOrFilter?.filmStockQuery;
  const [userCoords, setUserCoords] = useState<UserCoordinates>({
    lat: HANOI_DEFAULT_COORDS.lat,
    lng: HANOI_DEFAULT_COORDS.lng
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filmFilter, setFilmFilter] = useState<string>(initialFilmFilter || '');
  const [filmLabs, setFilmLabs] = useState<FilmLab[]>([]);
  const [areaOnlyShops, setAreaOnlyShops] = useState<ServiceListing[]>([]);

  useEffect(() => {
    let active = true;
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    const sources = source === 'all' ? ['labs', 'shops'] as const : [source];
    Promise.all(sources.map(async (catalog) => {
      const response = await fetch(`${apiBase}${catalog === 'shops' ? '/api/film-shops' : '/api/labs'}`);
      if (!response.ok) throw new Error(`Lỗi tải ${catalog} (${response.status})`);
      const rows: unknown = await response.json();
      return Array.isArray(rows) ? rows.map((row: Record<string, unknown>) => ({ ...row, category: catalog === 'shops' ? 'filmShop' : 'filmLab' })) : [];
    })).then((batches) => {
      const records: Record<string, unknown>[] = batches.flat();
      const hasMapCoordinates = (row: Record<string, unknown>) => {
        const lat = Number(row.lat);
        const lng = Number(row.lng);
        return row.lat !== null && row.lat !== undefined && row.lng !== null && row.lng !== undefined
          && Number.isFinite(lat) && Number.isFinite(lng) && lat >= 20.4 && lat <= 21.7 && lng >= 105.2 && lng <= 106.3;
      };
      const parseFilms = (value: unknown): string[] => {
        try { const parsed = typeof value === 'string' ? JSON.parse(value) : value; return Array.isArray(parsed) ? parsed.map(String) : []; }
        catch { return []; }
      };
      const areaOnlyShops = records.filter((row) => row.category === 'filmShop' && !hasMapCoordinates(row))
        .map((row): ServiceListing => {
          let locations = row.locations;
          if (typeof locations === 'string') {
            try { locations = JSON.parse(locations) as unknown; } catch { locations = []; }
          }
          return {
            id: String(row.id), category: 'filmShop', name: String(row.name || ''),
            slogan: String(row.slogan || ''), address: String(row.address || ''),
            ward: String(row.ward || ''), district: String(row.district || ''),
            locations: Array.isArray(locations) ? locations as FilmShopLocation[] : undefined,
            phone: String(row.hotline || row.phone || ''), link: String(row.fanpage_url || row.fanpageUrl || ''),
            imageUrl: String(row.image_url || row.imageUrl || ''),
            productImageUrl: String(row.product_image_url || row.productImageUrl || ''),
            cheapestRollName: String(row.cheapest_roll_name || row.cheapestRollName || ''),
            minRollPrice: Number(row.min_roll_price ?? row.minRollPrice) || 0,
            maxRollPrice: Number(row.max_roll_price ?? row.maxRollPrice) || 0,
            filmStocks: parseFilms(row.in_stock_films ?? row.inStockFilms),
            expressDelivery2h: Boolean(row.expressDelivery2h ?? row.express_delivery_2h),
          };
        });
      const labs = records.filter(hasMapCoordinates).map((row) => {
        const address = String(row.address || '');
        const filmsValue = row.in_stock_films ?? row.inStockFilms;
        const availableFilms = parseFilms(filmsValue);
        const lat = Number(row.lat);
        const lng = Number(row.lng);
        const phone = String(row.hotline || row.phone || '');
        const minRollPrice = Number(row.min_roll_price) || 0;
        const maxRollPrice = Number(row.max_roll_price) || 0;
        return {
          id: String(row.id), category: row.category === 'filmShop' ? 'filmShop' : 'filmLab', name: String(row.name || ''), slogan: String(row.slogan || ''), address, district: String(row.district || ''), ward: String(row.ward || ''), lat, lng,
          openingHours: String(row.opening_hours || row.openingHours || ''),

          availableFilms, phone, zaloUrl: phone ? `https://zalo.me/${phone.replace(/\D/g, '')}` : '',
          fanpageUrl: String(row.fanpage_url || row.fanpageUrl || ''),
          productImageUrl: String(row.product_image_url || row.productImageUrl || ''),
          minRollPrice, maxRollPrice,
          expressDelivery2h: Boolean(row.expressDelivery2h ?? row.express_delivery_2h),
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
          services: Array.isArray(row.services) ? row.services.map(String) : [],
          priceRange: maxRollPrice > 0 ? `${minRollPrice.toLocaleString('vi-VN')}đ – ${maxRollPrice.toLocaleString('vi-VN')}đ/cuộn` : String(row.price_range || ''),
          rating: Number(row.rating) || 0, reviewCount: Number(row.review_count) || 0, description: String(row.description || '')
        } satisfies FilmLab;
      });
      return { labs, areaOnlyShops };
    }).then(({ labs, areaOnlyShops: shops }) => { if (active) { setFilmLabs(labs); setAreaOnlyShops(shops); } })
      .catch((error: unknown) => { console.warn('Không tải được dữ liệu lab từ D1.', error); if (active) { setFilmLabs([]); setAreaOnlyShops([]); } });
    return () => { active = false; };
  }, [catalogRevision, source]);

  // Update filmFilter if prop changes
  useEffect(() => {
    if (initialFilmFilter !== undefined) {
      setFilmFilter(initialFilmFilter);
    }
  }, [initialFilmFilter]);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ Geolocation.');
      setIsUsingFallback(true);
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsUsingFallback(false);
        setIsLocating(false);
      },
      (error) => {
        // Fallback to Hoan Kiem Lake center if GPS denied or timeout
        console.warn('Geolocation failed or denied, using Hoan Kiem fallback:', error.message);
        setUserCoords({
          lat: HANOI_DEFAULT_COORDS.lat,
          lng: HANOI_DEFAULT_COORDS.lng
        });
        setIsUsingFallback(true);
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Quyền truy cập vị trí bị từ chối. Sử dụng tọa độ trung tâm Hồ Gươm.'
            : 'Không lấy được vị trí GPS. Sử dụng tọa độ trung tâm Hồ Gươm.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Attempt to get location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Compute distances, filter and sort nearest to farthest
  const sortedLabs = useMemo(() => {
    const list = filmLabs.map((lab) => {
      const distance = haversineDistanceKm(
        userCoords.lat,
        userCoords.lng,
        lab.lat,
        lab.lng
      );
      const formatted = formatDistanceDisplay(distance);
      return {
        ...lab,
        distanceKm: distance,
        distanceFormatted: formatted,
        distanceDisplay: formatted,
        isNearest: false
      };
    });

    // Filter by film availability if filmFilter is set
    const filtered = filmFilter.trim()
      ? list.filter((lab) =>
          lab.availableFilms.some((film) =>
            film.toLowerCase().includes(filmFilter.toLowerCase())
          )
        )
      : list;

    // Sort ascending by distance (nearest first)
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    // Mark the closest lab as nearest
    if (filtered.length > 0) {
      filtered[0].isNearest = true;
    }

    return filtered;
  }, [filmLabs, userCoords, filmFilter]);

  return {
    labs: sortedLabs,
    areaOnlyShops,
    userCoords,
    isLocating,
    isUsingFallback,
    isFallback: isUsingFallback,
    locationError,
    filmFilter,
    setFilmFilter,
    requestLocation,
    refreshLocation: requestLocation,
    totalCount: sortedLabs.length
  };
}
