import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './services/db';
import { createCommunitySpot } from './services/communitySpots';
import type { Spot, FilterState, InspirationPost, PlaceCategory } from './types';
import { serviceHubApi } from './services/serviceHubApi';
import {
  FilterBar,
  SpotCard,
  ModernSpotCard,
  Footer,
  LeftNavRail
} from './components';
import { useWeather } from './hooks/useWeather';
import { useMapLocationPicker } from './hooks/useMapLocationPicker';
import { useCatalogRevision } from './hooks/useCatalogRevision';
import { getCurrentMonthInVietnam, matchesSeasonalStatusFilter } from './utils/season';
import { matchesSpotMonth } from './utils/upcomingSpots';
import { matchesPlaceCategory } from './utils/placeCategories';
import { DEFAULT_PLACE_CATEGORIES } from './utils/placeCategories';
import { calculateDistanceKm } from './utils/geo';
import { recommendFilmForSpot } from './utils/filmAdvisor';
import { readSavedSpotIds } from './utils/savedSpots';
import { AlertCircle } from 'lucide-react';
import { containerVariants, itemVariants } from './utils/motion-tokens';
import type { ViewId } from './components/navigation/viewItems';

// Lazy-loaded heavy components
const GoogleMapsLayout = lazy(() => import('./components/GoogleMapsLayout').then(m => ({ default: m.GoogleMapsLayout })));

const AddSpotModal = lazy(() => import('./components/modals/AddSpotModal').then(m => ({ default: m.AddSpotModal })));
const SavedSpotsModal = lazy(() => import('./components/modals/SavedSpotsModal').then(m => ({ default: m.SavedSpotsModal })));
const AddFacebookPostModal = lazy(() => import('./components/modals/AddFacebookPostModal').then(m => ({ default: m.AddFacebookPostModal })));

const ServicesHubView = lazy(() => import('./components/layout/ServicesHubView').then(m => ({ default: m.ServicesHubView })));
const SpotDetailModal = lazy(() => import('./components/modals/SpotDetailModal').then(m => ({ default: m.SpotDetailModal })));

export function App() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [placeCategories, setPlaceCategories] = useState<PlaceCategory[]>(DEFAULT_PLACE_CATEGORIES);
  const catalogRevision = useCatalogRevision();
  const [activeRegionId, setActiveRegionId] = useState<string>('hanoi');
  const [activeView, setActiveView] = useState<ViewId>(() => {
    const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
    return isAdminRoute || new URLSearchParams(window.location.search).has('services') ? 'services' : 'map';
  });
  const [uiTheme, setUiTheme] = useState<'modern' | 'editorial'>('modern');
  const currentMonth = useMemo(() => getCurrentMonthInVietnam(), []); // eslint-disable-line react/purity — runs once at mount

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    month: currentMonth,
    season: 'autumn',
    regionId: 'hanoi',
    status: 'ALL',
    timeOfDay: 'ALL',
    concept: 'ALL',
    placeCategory: 'ALL',
    cost: 'ALL',
    filmId: 'ALL',
    searchQuery: '',
    onlyNearby: false,
    userCoords: null,
    radiusKm: 25
  });

  // Saved / Bookmark spots
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>(() => {
    try {
      return readSavedSpotIds(localStorage.getItem('chupgibaygio_saved'));
    } catch {
      return [];
    }
  });

  // Modals state
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [addPostTargetSpotId, setAddPostTargetSpotId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    db.spots.getAll().then(data => {
      if (mounted) {
        setSpots(data);
        setSelectedSpot(current => current ? data.find(spot => spot.id === current.id) ?? null : null);
      }
    });
    return () => { mounted = false; };
  }, [catalogRevision]);

  useEffect(() => {
    let mounted = true;
    serviceHubApi.listPlaceCategories().then((categories) => {
      if (!mounted) return;
      setPlaceCategories(categories);
      setFilters(current => current.placeCategory !== 'ALL' && !categories.some(category => category.id === current.placeCategory)
        ? { ...current, placeCategory: 'ALL' }
        : current);
    }).catch(() => { /* Keep bundled categories while the public category API is unavailable. */ });
    return () => { mounted = false; };
  }, [catalogRevision]);

  // Map Click-to-Pin location picker
  const mapLocationPicker = useMapLocationPicker({
    onLocationSelected: () => {
      setIsSubmitModalOpen(true);
    }
  });

  // Sync saved to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chupgibaygio_saved', JSON.stringify(savedSpotIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedSpotIds]);

  // Toggle Save
  const handleToggleSave = (spotId: string) => {
    setSavedSpotIds(prev => 
      prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]
    );
  };

  // Region change
  const handleSelectRegion = (regionId: string) => {
    setActiveRegionId(regionId);
    setFilters(prev => ({ ...prev, regionId }));
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      month: null,
      season: 'all',
      regionId: activeRegionId,
      status: 'ALL',
      timeOfDay: 'ALL',
      concept: 'ALL',
      placeCategory: 'ALL',
      cost: 'ALL',
      filmId: 'ALL',
      searchQuery: '',
      onlyNearby: false,
      userCoords: null,
      radiusKm: 25
    });
  };

  // Handle new community report submission

  // Keep public contributions hidden until an admin approves them.
  const handleAddNewSpot = async (draft: Spot) => {
    await createCommunitySpot(draft);
  };

  // Handle adding Facebook community post
  const handleAddFacebookPost = (spotId: string, newPost: InspirationPost) => {
    setSpots(prev => prev.map(s => s.id === spotId ? { ...s, inspirationPosts: [newPost, ...(s.inspirationPosts || [])] } : s));
    if (selectedSpot?.id === spotId) {
      setSelectedSpot(prev => prev ? { ...prev, inspirationPosts: [newPost, ...(prev.inspirationPosts || [])] } : null);
    }
  };

  // Filter and Rank Spots
  const filteredSpots = useMemo(() => {
    return spots
      .map(spot => {
        // Calculate distance if user coords are present
        let distanceKm: number | undefined = undefined;
        if (filters.userCoords) {
          distanceKm = calculateDistanceKm(
            filters.userCoords.lat,
            filters.userCoords.lng,
            spot.lat,
            spot.lng
          );
        }
        return { ...spot, distanceKm };
      })
      .filter(spot => {
        // Region
        if (filters.regionId !== 'all' && spot.regionId !== filters.regionId) {
          return false;
        }

        // Month
        if (!matchesSpotMonth(spot.seasonalTrend, filters.month)) return false;

        // Status
        if (!matchesSeasonalStatusFilter(spot.seasonalTrend, filters.status)) return false;

        // Time of Day
        if (filters.timeOfDay !== 'ALL' && spot.bestTimeOfDay !== filters.timeOfDay) {
          return false;
        }

        // Concept
        if (filters.concept !== 'ALL' && !spot.seasonalTrend.conceptTags.includes(filters.concept)) {
          return false;
        }

        // Venue category
        if (!matchesPlaceCategory(spot.seasonalTrend, filters.placeCategory)) return false;

        // Cost
        if (filters.cost !== 'ALL' && spot.costType !== filters.cost) {
          return false;
        }

        // Film Stock Filter
        if (filters.filmId && filters.filmId !== 'ALL') {
          const rec = recommendFilmForSpot(spot, filters.month || currentMonth);
          if (rec.film.id !== filters.filmId) {
            return false;
          }
        }

        // Nearby Radius filter
        if (filters.onlyNearby && spot.distanceKm !== undefined) {
          if (spot.distanceKm > filters.radiusKm) {
            return false;
          }
        }

        // Search Query
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase();
          const matchName = spot.name.toLowerCase().includes(q);
          const matchAddr = spot.address.toLowerCase().includes(q);
          const matchTrend = spot.seasonalTrend.trendTitle.toLowerCase().includes(q);
          const matchLens = spot.recommendedLenses.some(l => l.toLowerCase().includes(q));
          const matchDesc = spot.description.toLowerCase().includes(q);
          if (!matchName && !matchAddr && !matchTrend && !matchLens && !matchDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // If sorting nearby
        if (filters.onlyNearby && a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        // Otherwise sort by PEAK priority first, then trend score
        if (a.seasonalTrend.status === 'PEAK' && b.seasonalTrend.status !== 'PEAK') return -1;
        if (b.seasonalTrend.status === 'PEAK' && a.seasonalTrend.status !== 'PEAK') return 1;
        return (b.seasonalTrend.trendScore || 0) - (a.seasonalTrend.trendScore || 0);
      });
  }, [spots, filters, currentMonth]);

  const savedSpots = useMemo(() => {
    return spots.filter(s => savedSpotIds.includes(s.id));
  }, [spots, savedSpotIds]);

  const weather = useWeather();

  // GOOGLE MAPS UI PARADIGM: Full Viewport Canvas & Floating Overlays
  if (activeView === 'map') {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-neutral-100 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full" /></div>}>
        <GoogleMapsLayout
          placeCategories={placeCategories}
          filteredSpots={filteredSpots}
          allSpots={spots}
          selectedSpot={selectedSpot}
          onSelectSpot={setSelectedSpot}
          savedSpotIds={savedSpotIds}
          onToggleSave={handleToggleSave}
          filters={filters}
          onChangeFilters={setFilters}
          activeRegionId={activeRegionId}
          onSelectRegion={handleSelectRegion}
          activeView={activeView}
          onChangeView={(view) => {
            setActiveView(view);
            if (view === 'map') setFilters((current) => current.searchQuery ? { ...current, searchQuery: '' } : current);
          }}
          onOpenSubmitSpotModal={() => setIsSubmitModalOpen(true)}
          onOpenSavedModal={() => setIsSavedModalOpen(true)}
          onOpenAddPostModal={(spotId) => {
            setAddPostTargetSpotId(spotId);
            setIsAddPostModalOpen(true);
          }}
          uiTheme={uiTheme}
          onToggleUiTheme={() => setUiTheme(prev => prev === 'modern' ? 'editorial' : 'modern')}
          isPickingLocation={mapLocationPicker.isPicking}
          pickedLocation={mapLocationPicker.selectedLocation}
          onPickLocation={mapLocationPicker.onSelectMapCoords}
        />
        </Suspense>

        {/* Add Spot Modal (Zero manual coordinate input, Click-to-Pin & AI Extraction) */}
        <Suspense fallback={null}>
        <AddSpotModal
          isOpen={isSubmitModalOpen || mapLocationPicker.isPicking}
          onClose={() => {
            setIsSubmitModalOpen(false);
            mapLocationPicker.cancelPicking();
          }}
          onSubmitNewSpot={async (newSpot) => {
            await handleAddNewSpot(newSpot);
            mapLocationPicker.clearLocation();
          }}
          isPickingLocation={mapLocationPicker.isPicking}
          selectedLocation={mapLocationPicker.selectedLocation}
          onStartMapPick={mapLocationPicker.startPicking}
          onCancelMapPick={mapLocationPicker.cancelPicking}
          onClearLocation={mapLocationPicker.clearLocation}
          isGeocoding={mapLocationPicker.isGeocoding}
        placeCategories={placeCategories}
        />
        </Suspense>

        {/* Saved Bookmarks Modal */}
        <Suspense fallback={null}>
        <SavedSpotsModal
          isOpen={isSavedModalOpen}
          onClose={() => setIsSavedModalOpen(false)}
          savedSpots={savedSpots}
          onRemoveSave={handleToggleSave}
          onSelectSpot={setSelectedSpot}
        />
        </Suspense>

        {/* Add Facebook Post Modal */}
        <Suspense fallback={null}>
        <AddFacebookPostModal
          isOpen={isAddPostModalOpen}
          onClose={() => setIsAddPostModalOpen(false)}
          spots={spots}
          selectedSpotId={addPostTargetSpotId}
          onAddPost={handleAddFacebookPost}
        />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F7F5F0] font-sans text-[#2C2621] transition-colors">
      
      {/* 1. Left Vertical Navigation Rail (Fixed 76px on far left edge) */}
      <LeftNavRail
        activeView={activeView}
        onChangeView={setActiveView}
        savedCount={savedSpotIds.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenSubmitSpotModal={() => setIsSubmitModalOpen(true)}
        weather={weather}
        isAtmosphericActive={false}
        onToggleAtmospheric={() => {}}
        activeRegionId={activeRegionId}
        onSelectRegion={handleSelectRegion}
        uiTheme={uiTheme}
        onToggleUiTheme={() => setUiTheme(prev => prev === 'modern' ? 'editorial' : 'modern')}
      />

      {/* 2. Main Body Container (Offset by pl-[76px] on desktop, pb-20 for mobile bottom tab bar) */}
      <div className="flex-1 lg:pl-[76px] flex flex-col min-w-0 pb-20 lg:pb-0 bg-[#F7F5F0]">
        
        {/* Sticky Filter & Search Bar — chỉ thuộc view Tạp chí (grid). */}
        {activeView === 'grid' && (
          <FilterBar
            filters={filters}
            placeCategories={placeCategories}
            onChangeFilters={setFilters}
            onResetFilters={handleResetFilters}
            totalFilteredCount={filteredSpots.length}
          />
        )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 bg-[#F7F5F0]">

        {/* VIEW 2: Editorial Masonry / Grid Directory */}
        {activeView === 'grid' && (
          <div className="space-y-6">
            
            {/* View headline & summary */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E2DAD0] pb-4 gap-2">
              <div>
                <span className="font-mono-spec text-xs font-bold text-[#C76B3C] uppercase tracking-wider block">
                  BỘ SƯU TẬP TẠP CHÍ ẢNH THEO MÙA
                </span>
                <h2 className="font-bold text-2xl md:text-3xl tracking-tight text-[#2C2621] mt-0.5">
                  {filters.month ? `Tiêu Điểm Tháng ${filters.month} — Mùa Hoa Nở & Xu Hướng` : 'Tất Cả Điểm Chụp Đẹp Trong Năm'}
                </h2>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono-spec text-[#8C8377]">
                <span>LƯỚI TỶ LỆ 3:2</span>
                <span>•</span>
                <span>{filteredSpots.length} ĐỊA ĐIỂM</span>
              </div>
            </div>

            {/* Grid of Spots with Staggered Item Transition */}
            {filteredSpots.length === 0 ? (
              <div className="p-12 text-center bg-[#FAF8F4] border border-[#E2DAD0] rounded-2xl space-y-3 my-6">
                <AlertCircle className="w-10 h-10 text-terracotta mx-auto" />
                <h3 className="font-editorial text-2xl font-bold text-[#2C2621]">Không có địa điểm nào khớp với bộ lọc</h3>
                <p className="text-xs text-[#6E655B] font-sans max-w-sm mx-auto">
                  Hãy thử mở rộng tháng chụp, tắt bộ lọc cự ly hoặc xóa từ khóa tìm kiếm.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-terracotta text-white font-mono-spec text-xs font-bold shadow-hard hover:bg-terracotta-dark"
                >
                  Xóa bộ lọc để xem tất cả
                </button>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredSpots.map(spot => (
                  <motion.div key={spot.id} variants={itemVariants}>
                    {uiTheme === 'modern' ? (
                      <ModernSpotCard
                        spot={spot}
                        isSaved={savedSpotIds.includes(spot.id)}
                        onToggleSave={handleToggleSave}
                        onSelectSpot={setSelectedSpot}
                      />
                    ) : (
                      <SpotCard
                        spot={spot}
                        isSaved={savedSpotIds.includes(spot.id)}
                        onToggleSave={handleToggleSave}
                        onSelectSpot={setSelectedSpot}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {activeView === 'services' && (
          <Suspense fallback={<div className="p-8 text-center">Đang tải dịch vụ...</div>}>
            <ServicesHubView onClose={() => {
              setActiveView('map');
              if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
                window.history.replaceState(null, '', '/');
              }
            }} />
          </Suspense>
        )}

      </main>

      {/* Spot Detail Profile Modal (Shared Element Transition with AnimatePresence) */}
      <AnimatePresence>
        {selectedSpot && (
          <Suspense fallback={null}>
          <SpotDetailModal
            spot={selectedSpot}
            placeCategories={placeCategories}
            onClose={() => setSelectedSpot(null)}
            isSaved={savedSpotIds.includes(selectedSpot.id)}
            onToggleSave={handleToggleSave}
            onOpenAddPostModal={(spotId) => {
              setAddPostTargetSpotId(spotId);
              setIsAddPostModalOpen(true);
            }}
          />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Add Spot Modal (Zero manual coordinate input, Click-to-Pin & AI Extraction) */}
      <Suspense fallback={null}>
      <AddSpotModal
        isOpen={isSubmitModalOpen || mapLocationPicker.isPicking}
        onClose={() => {
          setIsSubmitModalOpen(false);
          mapLocationPicker.cancelPicking();
        }}
        onSubmitNewSpot={async (newSpot) => {
          await handleAddNewSpot(newSpot);
          mapLocationPicker.clearLocation();
        }}
        isPickingLocation={mapLocationPicker.isPicking}
        selectedLocation={mapLocationPicker.selectedLocation}
        onStartMapPick={mapLocationPicker.startPicking}
        onCancelMapPick={mapLocationPicker.cancelPicking}
        onClearLocation={mapLocationPicker.clearLocation}
        isGeocoding={mapLocationPicker.isGeocoding}
        placeCategories={placeCategories}
      />
      </Suspense>

      {/* Saved Bookmarks Modal */}
      <Suspense fallback={null}>
      <SavedSpotsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedSpots={savedSpots}
        onRemoveSave={handleToggleSave}
        onSelectSpot={setSelectedSpot}
      />
      </Suspense>

      {/* Add Facebook Post Modal */}
      <Suspense fallback={null}>
      <AddFacebookPostModal
        isOpen={isAddPostModalOpen}
        onClose={() => setIsAddPostModalOpen(false)}
        spots={spots}
        selectedSpotId={addPostTargetSpotId}
        onAddPost={handleAddFacebookPost}
      />
      </Suspense>

      {/* Editorial Colophon Footer */}
      <Footer />

      </div>
    </div>
  );
}

export default App;
