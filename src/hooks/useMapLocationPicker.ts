import { useState, useCallback, useEffect } from 'react';
import { HANOI_LANDMARK_ALIASES } from '../utils/openrouter';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  placeName?: string;
  district?: string;
  city?: string;
}

export interface UseMapLocationPickerOptions {
  defaultLocation?: LocationData | null;
  onLocationSelected?: (location: LocationData) => void;
}

const DEFAULT_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

/**
 * Calculates haversine distance between two coordinates in km
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find closest landmark from predefined Hanoi aliases
 */
function findClosestHanoiLandmark(lat: number, lng: number): { name: string; address: string } | null {
  let closest: { name: string; address: string; dist: number } | null = null;
  
  for (const item of Object.values(HANOI_LANDMARK_ALIASES)) {
    const dist = getDistanceKm(lat, lng, item.lat, item.lng);
    if (dist < 0.8 && (!closest || dist < closest.dist)) {
      closest = { name: item.canonical_name, address: item.address, dist };
    }
  }
  return closest ? { name: closest.name, address: closest.address } : null;
}

/**
 * Hook to manage Mapbox / Leaflet Click-to-Pin location picking
 */
export function useMapLocationPicker(options: UseMapLocationPickerOptions = {}) {
  const [isPicking, setIsPicking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    options.defaultLocation || null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Toggle cursor style on body when picking mode changes
  useEffect(() => {
    if (isPicking) {
      document.body.classList.add('cursor-crosshair');
    } else {
      document.body.classList.remove('cursor-crosshair');
    }
    return () => {
      document.body.classList.remove('cursor-crosshair');
    };
  }, [isPicking]);

  /**
   * Reverse Geocoding with Mapbox API & robust fallback
   */
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationData> => {
    setIsGeocoding(true);
    setGeocodingError(null);

    // 1. Check if matches closely to a known Hanoi landmark
    const closestLandmark = findClosestHanoiLandmark(lat, lng);

    try {
      const mapboxToken = localStorage.getItem('mapbox_token') || DEFAULT_MAPBOX_TOKEN;
      if (mapboxToken) {
        const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&country=vn&language=vi&types=address,poi,neighborhood,locality,place`;
        
        const response = await fetch(mapboxUrl);
        if (response.ok) {
          const data = (await response.json()) as any;
          if (data.features && data.features.length > 0) {
            const feat = data.features[0];
            const fullAddress = feat.place_name || feat.text || '';
            
            // Format Vietnamese address (Đường, Phường, Quận, Hà Nội)
            const street = feat.text || '';
            let district = '';
            let city = 'Hà Nội';

            if (feat.context) {
              for (const ctx of feat.context) {
                if (ctx.id?.startsWith('district') || ctx.id?.startsWith('locality')) {
                  district = ctx.text;
                }
                if (ctx.id?.startsWith('place') || ctx.id?.startsWith('region')) {
                  city = ctx.text;
                }
              }
            }

            const cleanAddress = fullAddress.replace(/,\s*Việt Nam$/i, '');
            const result: LocationData = {
              lat,
              lng,
              address: closestLandmark?.address || cleanAddress,
              placeName: closestLandmark?.name || street || 'Vị trí đã chọn',
              district,
              city
            };

            return result;
          }
        }
      }
    } catch (err) {
      console.warn('Mapbox reverse geocode error, trying OSM fallback:', err);
    }

    // 3. Fallback to OpenStreetMap Nominatim
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const osmRes = await fetch(osmUrl, {
        headers: { 'Accept-Language': 'vi' }
      });
      if (osmRes.ok) {
        const osmData = (await osmRes.json()) as any;
        const addr = osmData.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || '';
        const quarter = addr.quarter || addr.neighbourhood || '';
        const district = addr.city_district || addr.district || addr.suburb || '';
        const city = addr.city || 'Hà Nội';

        const parts = [road, quarter, district, city].filter(Boolean);
        const resolvedAddress = parts.join(', ') || osmData.display_name?.replace(/,\s*Việt Nam$/i, '') || '';

        return {
          lat,
          lng,
          address: closestLandmark?.address || resolvedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          placeName: closestLandmark?.name || road || 'Điểm chụp ảnh Hà Nội',
          district,
          city
        };
      }
    } catch (osmErr) {
      console.warn('OSM reverse geocoding fallback failed:', osmErr);
    }

    // 4. Default fallback with coordinates and closest landmark
    const fallbackLocation: LocationData = {
      lat,
      lng,
      address: closestLandmark?.address || `Khu vực Hà Nội (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      placeName: closestLandmark?.name || 'Tọa độ đã ghim',
      city: 'Hà Nội'
    };

    return fallbackLocation;
  }, []);

  /**
   * Start Picking on Map
   */
  const startPicking = useCallback(() => {
    setIsPicking(true);
    setIsMinimized(true);
    setGeocodingError(null);
  }, []);

  /**
   * Cancel Picking
   */
  const cancelPicking = useCallback(() => {
    setIsPicking(false);
    setIsMinimized(false);
  }, []);

  /**
   * Handle Click or Drag on Map
   */
  const onSelectMapCoords = useCallback(
    async (coords: { lat: number; lng: number }) => {
      setIsPicking(false);
      setIsMinimized(false); // Restore modal view immediately

      try {
        const resolved = await reverseGeocode(coords.lat, coords.lng);
        setSelectedLocation(resolved);
        options.onLocationSelected?.(resolved);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Lỗi lấy địa chỉ';
        setGeocodingError(message);
        const basicLocation: LocationData = {
          lat: coords.lat,
          lng: coords.lng,
          address: `Hà Nội (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`,
          placeName: 'Vị trí đã chọn'
        };
        setSelectedLocation(basicLocation);
        options.onLocationSelected?.(basicLocation);
      } finally {
        setIsGeocoding(false);
      }
    },
    [reverseGeocode, options]
  );

  /**
   * Clear Selected Location
   */
  const clearLocation = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  return {
    isPicking,
    isMinimized,
    setIsMinimized,
    selectedLocation,
    setSelectedLocation,
    isGeocoding,
    geocodingError,
    startPicking,
    cancelPicking,
    onSelectMapCoords,
    clearLocation,
    reverseGeocode
  };
}
