import { useState, useEffect, useMemo, useCallback } from 'react';
import { FILM_LABS, HANOI_DEFAULT_COORDS, type FilmLab } from '../data/filmLabsData';

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

export function useNearestLabs(optionsOrFilter?: string | { filmStockQuery?: string }) {
  const initialFilmFilter = typeof optionsOrFilter === 'string' ? optionsOrFilter : optionsOrFilter?.filmStockQuery;
  const [userCoords, setUserCoords] = useState<UserCoordinates>({
    lat: HANOI_DEFAULT_COORDS.lat,
    lng: HANOI_DEFAULT_COORDS.lng
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filmFilter, setFilmFilter] = useState<string>(initialFilmFilter || '');

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
    const list = FILM_LABS.map((lab) => {
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
  }, [userCoords, filmFilter]);

  return {
    labs: sortedLabs,
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
