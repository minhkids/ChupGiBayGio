export interface PlannedSpot {
  id: string;
  name: string;
  coverImageUrl: string;
  address: string;
  bestTime: string;
  costEstimated: number; // in VND
  costFormatted: string;
  costType: 'FREE' | 'TICKET' | 'COMMERCIAL_FEE';
  lat?: number;
  lng?: number;
  note?: string;
}

export interface CyclingWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: 'spot' | 'filmLab' | 'origin';
  address?: string;
  imageUrl?: string;
  bestTime?: string;
  photoTip?: string;
  seasonalLabel?: string;
}

export interface PlannedItem {
  id: string;
  name: string;
  category: 'outfit' | 'prop' | 'accessory';
  categoryLabel: string;
  imageUrl?: string;
  price: number; // in VND
  priceFormatted: string;
  sourceUrl?: string;
  shopName?: string;
}

export interface PlannedPhotographer {
  id: string;
  name: string;
  avatarUrl: string;
  gear: string;
  packageId: string;
  packageName: string;
  price: number; // in VND
  priceFormatted: string;
  duration: string;
  deliverablesSummary: string;
  zaloUrl: string;
  phone: string;
}

export interface ReferencePhoto {
  id: string;
  imageUrl: string;
  label: string;
  note: string;
}

export interface ShootPlanState {
  referencePhotos: ReferencePhoto[];
  spots: PlannedSpot[];
  cyclingStops?: CyclingWaypoint[];
  items: PlannedItem[];
  photographer: PlannedPhotographer | null;
}
