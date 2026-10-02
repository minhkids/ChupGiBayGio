import React from 'react';
import { MobileDrawer } from './MobileDrawer';
import { MobileSheet } from './MobileSheet';
import type { LayoutCallbacks, SharedUIState, Spot, FilterState, InspirationPost } from './shared-types';

interface MobileLayoutProps {
  spots: Spot[];
  filteredSpots: Spot[];
  selectedSpot: Spot | null;
  savedSpotIds: string[];
  allPostsWithSpot: (InspirationPost & { spot: Spot })[];
  filteredPosts: (InspirationPost & { spot: Spot })[];
  callbacks: LayoutCallbacks;
  filters: FilterState;
  activeRegionId: string;
  uiState: SharedUIState;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  spots,
  filteredSpots,
  selectedSpot,
  savedSpotIds,
  allPostsWithSpot,
  filteredPosts,
  callbacks,
  filters,
  activeRegionId,
  uiState,
}) => {
  return (
    <div className="lg:hidden">
      {/* Mobile Drawer */}
      <MobileDrawer
        spots={spots}
        filteredSpots={filteredSpots}
        selectedSpot={selectedSpot}
        savedSpotIds={savedSpotIds}
        allPostsWithSpot={allPostsWithSpot}
        filteredPosts={filteredPosts}
        callbacks={callbacks}
        filters={filters}
        activeRegionId={activeRegionId}
        uiState={uiState}
      />

      {/* Mobile Sheet */}
      <MobileSheet
        spot={selectedSpot}
        savedSpotIds={savedSpotIds}
        callbacks={callbacks}
        uiState={uiState}
        onClose={() => callbacks.onSelectSpot(null as unknown as Spot)}
      />
    </div>
  );
};