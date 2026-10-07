import { describe, it, expect } from 'vitest';
import { haversineDistanceKm, formatDistanceDisplay } from './useNearestLabs';
import { FILM_LABS, HANOI_DEFAULT_COORDS } from '../data/filmLabsData';

describe('useNearestLabs utilities', () => {
  it('calculates 0km for identical coordinates', () => {
    const dist = haversineDistanceKm(21.0285, 105.8542, 21.0285, 105.8542);
    expect(dist).toBeCloseTo(0, 4);
  });

  it('calculates reasonable distance between Hoàn Kiếm and Zone 5 Lab (Hàng Bông)', () => {
    const dist = haversineDistanceKm(
      HANOI_DEFAULT_COORDS.lat,
      HANOI_DEFAULT_COORDS.lng,
      FILM_LABS[4].lat, // Zone 5 Lab (21.0305, 105.8447)
      FILM_LABS[4].lng
    );
    expect(dist).toBeGreaterThan(0.5);
    expect(dist).toBeLessThan(5.0);
  });

  it('formats distance correctly in meters and kilometers', () => {
    expect(formatDistanceDisplay(0.45)).toBe('450m');
    expect(formatDistanceDisplay(0.08)).toBe('80m');
    expect(formatDistanceDisplay(1.25)).toBe('1.3 km');
    expect(formatDistanceDisplay(5.62)).toBe('5.6 km');
  });

  it('contains properly configured film labs data with valid coordinates and stock', () => {
    expect(FILM_LABS.length).toBeGreaterThanOrEqual(5);
    for (const lab of FILM_LABS) {
      expect(lab.name).toBeTruthy();
      expect(lab.lat).toBeGreaterThan(20.9);
      expect(lab.lat).toBeLessThan(21.2);
      expect(lab.lng).toBeGreaterThan(105.7);
      expect(lab.lng).toBeLessThan(106.0);
      expect(lab.availableFilms.length).toBeGreaterThan(0);
      expect(lab.address).toBeTruthy();
    }
  });
});
