export type PhotographerBudgetCategory = 'all' | 'student' | 'standard' | 'premium';

export type PhotographerVibe = 'MàuFilm' | 'NàngThơ' | 'ÁoDài' | 'ĐườngPhố' | 'ChụpĐêm';

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  duration: string;
  deliverables: {
    totalOriginalPhotos: string;
    retouchedPhotos: string;
    turnaroundTime: string;
    supportProps?: string;
  };
  highlight?: boolean;
}

export interface PortfolioAlbum {
  id: string;
  title: string;
  spotId?: string;
  spotName: string;
  coverUrl: string;
  photoUrls: string[];
  vibe: PhotographerVibe;
}

export interface Photographer {
  id: string;
  name: string;
  avatarUrl: string;
  badge?: string;
  bio: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  startingPriceFormatted: string;
  budgetCategory: 'student' | 'standard' | 'premium';
  vibes: PhotographerVibe[];
  specialtySpots: string[];
  gear: string;
  contact: {
    zaloPhone: string;
    zaloUrl: string;
    phone: string;
    instagram?: string;
    facebook?: string;
  };
  featuredPhotos: string[];
  packages: PricingPackage[];
  albums: PortfolioAlbum[];
}
