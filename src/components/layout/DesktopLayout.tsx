import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Panel } from './Panel';
import type { LayoutCallbacks, SharedUIState, Spot, FilterState, InspirationPost } from './shared-types';

interface DesktopLayoutProps {
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
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
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
  isSidebarCollapsed,
  onToggleSidebarCollapse,
}) => {
  return (
    <div className="relative h-full w-full">
      {/* Sidebar */}
      <Sidebar
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
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleSidebarCollapse}
      />

      {/* Re-open button when sidebar collapsed */}
      {isSidebarCollapsed && (
        <div className="hidden lg:flex fixed top-1/2 left-[76px] -translate-y-1/2 z-[calc(var(--z-sidebar)+1)] items-center pointer-events-auto">
          <button
            type="button"
            onClick={onToggleSidebarCollapse}
            className="w-7 h-16 bg-white dark:bg-neutral-900 border-y border-r border-neutral-200 dark:border-neutral-800 rounded-r-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:w-8 text-neutral-600 dark:text-neutral-300 transition-all group"
            title="Mở lại danh sách địa điểm"
          >
            <ChevronRight className="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onToggleSidebarCollapse}
            className="ml-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rounded-full shadow-lg px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100 hover:scale-105 hover:border-terracotta transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <span>Danh sách điểm ({filteredSpots.length})</span>
          </button>
        </div>
      )}

      {/* Panel */}
      <Panel
        spot={selectedSpot}
        savedSpotIds={savedSpotIds}
        callbacks={callbacks}
        uiState={uiState}
        isSidebarCollapsed={isSidebarCollapsed}
        onClose={() => callbacks.onSelectSpot(null as unknown as Spot)}
      />
    </div>
  );
};