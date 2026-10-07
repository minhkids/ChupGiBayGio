import type { Spot, FilterState, InspirationPost, ConceptTag, BestTimeOfDay, SpotStatus, Photographer } from '../../types';

/**
 * Shared types for layout primitives
 */
export type SidebarTab = 'spots' | 'posts';
export type DetailTab = 'info' | 'posts';
export type DrawerSnap = 'peek' | 'half' | 'full';
export type ViewMode = 'map' | 'grid' | 'moodboard' | 'film';

// Re-export commonly used types
export type { Spot, FilterState, InspirationPost, ConceptTag, BestTimeOfDay, SpotStatus };

export interface LayoutCallbacks {
  onSelectSpot: (spot: Spot) => void;
  onToggleSave: (spotId: string) => void;
  onOpenReportModal: (spot: Spot) => void;
  onOpenAddPostModal: (spotId?: string) => void;
  onChangeFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  onSelectRegion: (regionId: string) => void;
  onChangeView: (view: ViewMode) => void;
  onOpenSavedModal: () => void;
  onOpenSubmitSpotModal: () => void;
  handleOpenDirections: (spot: Spot) => void;
  handleShareSpot: (spot: Spot) => void;
  onSelectPhotographer?: (photographer: Photographer) => void;
  onOpenPhotographerDirectory?: () => void;
}

export interface SharedUIState {
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  mobileSnap: DrawerSnap;
  setMobileSnap: (snap: DrawerSnap) => void;
  activePhotoIdx: number;
  setActivePhotoIdx: (idx: number) => void;
  postTagFilter: string;
  setPostTagFilter: (tag: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export interface SpotListProps {
  spots: Spot[];
  selectedSpot: Spot | null;
  savedSpotIds: string[];
  callbacks: Pick<LayoutCallbacks, 'onSelectSpot' | 'onToggleSave' | 'handleOpenDirections' | 'onResetFilters'>;
  className?: string;
  renderItem?: (spot: Spot, idx: number, isSelected: boolean) => React.ReactNode;
}

export interface SpotFiltersProps {
  filters: FilterState;
  activeRegionId: string;
  regions: { id: string; name: string }[];
  callbacks: Pick<LayoutCallbacks, 'onChangeFilters' | 'onResetFilters' | 'onSelectRegion' | 'onChangeView' | 'onOpenSavedModal' | 'onOpenSubmitSpotModal' | 'onOpenAddPostModal'>;
  savedSpotIds: string[];
  filteredSpotsCount: number;
  filteredPostsCount: number;
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
  postTagFilter: string;
  setPostTagFilter: (tag: string) => void;
  isMobile?: boolean;
  mobileSnap?: DrawerSnap;
  className?: string;
}

export interface SpotDetailContentProps {
  spot: Spot;
  activePhotoIdx: number;
  setActivePhotoIdx: (idx: number) => void;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  savedSpotIds: string[];
  callbacks: Pick<LayoutCallbacks, 'onToggleSave' | 'handleOpenDirections' | 'handleShareSpot' | 'onOpenReportModal' | 'onOpenAddPostModal' | 'onSelectPhotographer' | 'onOpenPhotographerDirectory'>;
  className?: string;
}

export interface PostFeedProps {
  posts: (InspirationPost & { spot: Spot })[];
  callbacks: Pick<LayoutCallbacks, 'onSelectSpot'>;
  postTagFilter: string;
  setPostTagFilter: (tag: string) => void;
  isMobile?: boolean;
  mobileSnap?: DrawerSnap;
  className?: string;
}