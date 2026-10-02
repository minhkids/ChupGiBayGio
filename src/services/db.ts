import { MOCK_SPOTS } from '../data/mockSpots';
import FILMS_DATA from '../data/films_seed.json';
import { POSES } from '../data/poses';
import { RENTAL_SHOPS } from '../data/rentalShops';
import type { Spot, Film, PoseItem, RentalShop } from '../types';

/**
 * Sync Local Database Service
 * Centralizes all data access to make future migration to Firebase/API seamless.
 * 
 * TODO (When moving to Firebase):
 * - Refactor these methods to return Promises: `async getSpots(): Promise<Spot[]>`
 * - Add loading states in UI components that consume this.
 */
export const db = {
  spots: {
    getAll: (): Spot[] => MOCK_SPOTS as Spot[],
    getById: (id: string): Spot | undefined => (MOCK_SPOTS as Spot[]).find(s => s.id === id),
  },
  films: {
    getAll: (): Film[] => FILMS_DATA as unknown as Film[],
    getById: (id: string): Film | undefined => {
      const all = FILMS_DATA as unknown as Film[];
      return all.find(f => f.id === id || f.id.replace('film_', '').replace(/_/g, '-') === id.replace(/_/g, '-'));
    },
    getForSpot: (spotName: string): Film[] => {
      const spotLower = spotName.toLowerCase();
      const all = FILMS_DATA as unknown as Film[];
      return all.filter((film) =>
        film.best_spots.some((s) => spotLower.includes(s.toLowerCase()) || s.toLowerCase().includes(spotLower)) ||
        film.matched_spots.some((m) => spotLower.includes(m.spot_name.toLowerCase()) || m.spot_name.toLowerCase().includes(spotLower))
      );
    }
  },
  poses: {
    getAll: (): PoseItem[] => POSES,
  },
  rentalShops: {
    getAll: (): RentalShop[] => RENTAL_SHOPS,
  }
};
