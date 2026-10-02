import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Spot, FilterState } from '../../types';
import { REGIONS } from '../../data/regions';
import { SpotFilters } from './SpotFilters';
import { SpotList } from './SpotList';
import { PostFeed } from './PostFeed';
import type { LayoutCallbacks, SharedUIState, SidebarTab, InspirationPost } from './shared-types';

interface MobileDrawerProps {
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
  className?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  filteredSpots,
  selectedSpot,
  savedSpotIds,
  filteredPosts,
  callbacks,
  filters,
  activeRegionId,
  uiState,
  className = '',
}) => {
  const { sidebarTab, setSidebarTab, mobileSnap, setMobileSnap, postTagFilter, setPostTagFilter } = uiState;

  const handleGrabClick = () => {
    if (mobileSnap === 'peek') setMobileSnap('half');
    else if (mobileSnap === 'half') setMobileSnap('full');
    else setMobileSnap('peek');
  };

  const handleTabClick = (tab: SidebarTab) => {
    setSidebarTab(tab);
    if (mobileSnap === 'peek') setMobileSnap('half');
  };

  return (
    <motion.div
      animate={{
        height: mobileSnap === 'peek' ? 'var(--drawer-peek-height)' :
                mobileSnap === 'half' ? 'var(--drawer-half-height)' :
                'var(--drawer-full-height)'
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className={`
        lg:hidden fixed bottom-0 inset-x-0 z-[var(--z-drawer)]
        bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md
        border-t border-neutral-200/80 dark:border-neutral-800
        rounded-t-3xl shadow-2xl flex flex-col will-change-transform
        pb-safe ${className}
      `}
    >
      {/* Grab Handle Header */}
      <div
        onClick={handleGrabClick}
        className="cursor-pointer py-3 px-4 flex flex-col items-center border-b border-neutral-100 dark:border-neutral-800 shrink-0 select-none"
      >
        <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mb-3" />

        <div className="w-full flex items-center justify-between font-mono-spec">
          {/* Mobile Tab Pill Switcher */}
          <div className="flex flex-1 items-center space-x-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mr-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleTabClick('spots'); }}
              className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${sidebarTab === 'spots'
                  ? 'bg-white dark:bg-neutral-900 text-terracotta shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              📍 Điểm chụp ({filteredSpots.length})
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleTabClick('posts'); }}
              className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${sidebarTab === 'posts'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              📸 Bài viết FB ({filteredPosts.length})
            </button>
          </div>

          {/* Snap Toggle Indicator */}
          <div className="flex items-center space-x-1 text-neutral-400 pl-2 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
              {mobileSnap === 'peek' ? 'Kéo lên' : mobileSnap === 'half' ? 'Nửa màn' : 'Thu gọn'}
            </span>
            {mobileSnap !== 'full' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Filters conditional on Tab (visible in half / full snaps) */}
      {mobileSnap !== 'peek' && (
        <SpotFilters
          filters={filters}
          activeRegionId={activeRegionId}
          regions={REGIONS}
          callbacks={callbacks}
          savedSpotIds={savedSpotIds}
          filteredSpotsCount={filteredSpots.length}
          filteredPostsCount={filteredPosts.length}
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          postTagFilter={postTagFilter}
          setPostTagFilter={setPostTagFilter}
          isMobile={true}
          mobileSnap={mobileSnap}
        />
      )}

      {/* Mobile Feed Spots or Posts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sidebarTab === 'spots' ? (
          <SpotList
            spots={filteredSpots}
            selectedSpot={selectedSpot}
            savedSpotIds={savedSpotIds}
            callbacks={{
              onSelectSpot: callbacks.onSelectSpot,
              onToggleSave: callbacks.onToggleSave,
              handleOpenDirections: callbacks.handleOpenDirections,
              onResetFilters: callbacks.onResetFilters,
            }}
          />
        ) : (
          <PostFeed
            posts={filteredPosts}
            callbacks={{
              onSelectSpot: callbacks.onSelectSpot,
            }}
            postTagFilter={postTagFilter}
            setPostTagFilter={setPostTagFilter}
            isMobile={true}
            mobileSnap={mobileSnap}
          />
        )}
      </div>
    </motion.div>
  );
};