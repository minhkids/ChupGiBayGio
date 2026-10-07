export interface PlannedSpot {
  id: string;
  name: string;
  coverImageUrl: string;
  address: string;
  bestTime: string;
  costEstimated: number; // in VND
  costFormatted: string;
  costType: 'FREE' | 'TICKET' | 'COMMERCIAL_FEE';
  note?: string;
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
  items: PlannedItem[];
  photographer: PlannedPhotographer | null;
}
