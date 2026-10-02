import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './services/db';
import type { Spot, FilterState, CommunityReport, InspirationPost } from './types';
import { FilterBar } from './components/FilterBar';
import { SpotCard } from './components/SpotCard';
import { SpotDetailModal } from './components/SpotDetailModal';
import { MoodboardView } from './components/MoodboardView';
import { FilmGalleryView } from './components/FilmGalleryView';
import { AddFacebookPostModal } from './components/AddFacebookPostModal';
import { CommunityReportModal } from './components/CommunityReportModal';
import { AddSpotModal } from './components/AddSpotModal';
import { SavedSpotsModal } from './components/SavedSpotsModal';
import { ModernSpotCard } from './components/ModernSpotCard';
import { Footer } from './components/Footer';
import { GoogleMapsLayout } from './components/GoogleMapsLayout';
import { LeftNavRail } from './components/LeftNavRail';
import { useWeather } from './hooks/useWeather';
import { useMapLocationPicker } from './hooks/useMapLocationPicker';
import { isSpotActiveInMonth } from './utils/season';
import { calculateDistanceKm } from './utils/geo';
import { recommendFilmForSpot } from './utils/filmAdvisor';
import { AlertCircle } from 'lucide-react';
import { containerVariants, itemVariants } from './utils/motion-tokens';

export function App() {
  const [spots, setSpots] = useState<Spot[]>(db.spots.getAll());
  const [activeRegionId, setActiveRegionId] = useState<string>('hanoi');
  const [activeView, setActiveView] = useState<'map' | 'grid' | 'moodboard' | 'film'>('map');
  const [uiTheme, setUiTheme] = useState<'modern' | 'editorial'>('modern');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    month: 11,
    season: 'autumn',
    regionId: 'hanoi',
    status: 'ALL',
    timeOfDay: 'ALL',
    concept: 'ALL',
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
      const stored = localStorage.getItem('chupgibaygio_saved');
      return stored ? JSON.parse(stored) : ['spot-hn-01', 'spot-dl-01'];
    } catch {
      return ['spot-hn-01', 'spot-dl-01'];
    }
  });

  // Modals state
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [reportSpot, setReportSpot] = useState<Spot | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [addPostTargetSpotId, setAddPostTargetSpotId] = useState<string | undefined>(undefined);

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
      cost: 'ALL',
      filmId: 'ALL',
      searchQuery: '',
      onlyNearby: false,
      userCoords: null,
      radiusKm: 25
    });
  };

  // Handle new community report submission
  const handleSubmitReport = (spotId: string, newReportData: Omit<CommunityReport, 'id' | 'reportedAt'>) => {
    const report: CommunityReport = {
      ...newReportData,
      id: `rep-${Date.now()}`,
      reportedAt: 'Vừa xong'
    };

    setSpots(prevSpots =>
      prevSpots.map(s => {
        if (s.id === spotId) {
          return {
            ...s,
            seasonalTrend: {
              ...s.seasonalTrend,
              bloomPercentage: report.bloomPercentage
            },
            recentReports: [report, ...(s.recentReports || [])]
          };
        }
        return s;
      })
    );

    // Update selectedSpot if currently viewing
    if (selectedSpot?.id === spotId) {
      setSelectedSpot(prev => prev ? {
        ...prev,
        seasonalTrend: {
          ...prev.seasonalTrend,
          bloomPercentage: report.bloomPercentage
        },
        recentReports: [report, ...(prev.recentReports || [])]
      } : null);
    }
  };

  // Handle new spot submission from crowdsourcing modal
  const handleAddNewSpot = (newSpot: Spot) => {
    setSpots(prev => [newSpot, ...prev]);
    setSelectedSpot(newSpot);
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
        if (filters.month !== null) {
          const isActive = isSpotActiveInMonth(
            spot.seasonalTrend.startMonth,
            spot.seasonalTrend.endMonth,
            filters.month
          );
          if (!isActive) return false;
        }

        // Status
        if (filters.status !== 'ALL' && spot.seasonalTrend.status !== filters.status) {
          return false;
        }

        // Time of Day
        if (filters.timeOfDay !== 'ALL' && spot.bestTimeOfDay !== filters.timeOfDay) {
          return false;
        }

        // Concept
        if (filters.concept !== 'ALL' && !spot.seasonalTrend.conceptTags.includes(filters.concept)) {
          return false;
        }

        // Cost
        if (filters.cost !== 'ALL' && spot.costType !== filters.cost) {
          return false;
        }

        // Film Stock Filter
        if (filters.filmId && filters.filmId !== 'ALL') {
          const rec = recommendFilmForSpot(spot, filters.month || new Date().getMonth() + 1);
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
  }, [spots, filters]);

  const savedSpots = useMemo(() => {
    return spots.filter(s => savedSpotIds.includes(s.id));
  }, [spots, savedSpotIds]);

  const weather = useWeather();

  // GOOGLE MAPS UI PARADIGM: Full Viewport Canvas & Floating Overlays
  if (activeView === 'map') {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <GoogleMapsLayout
          spots={spots}
          filteredSpots={filteredSpots}
          selectedSpot={selectedSpot}
          onSelectSpot={setSelectedSpot}
          savedSpotIds={savedSpotIds}
          onToggleSave={handleToggleSave}
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
          activeRegionId={activeRegionId}
          onSelectRegion={handleSelectRegion}
          activeView={activeView}
          onChangeView={setActiveView}
          onOpenSubmitSpotModal={() => setIsSubmitModalOpen(true)}
          onOpenSavedModal={() => setIsSavedModalOpen(true)}
          onOpenReportModal={(spot) => setReportSpot(spot)}
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

        {/* Community Report Modal */}
        <CommunityReportModal
          spot={reportSpot}
          onClose={() => setReportSpot(null)}
          onSubmitReport={handleSubmitReport}
        />

        {/* Add Spot Modal (Zero manual coordinate input, Click-to-Pin & AI Extraction) */}
        <AddSpotModal
          isOpen={isSubmitModalOpen || mapLocationPicker.isPicking}
          onClose={() => {
            setIsSubmitModalOpen(false);
            mapLocationPicker.cancelPicking();
          }}
          onSubmitNewSpot={(newSpot) => {
            handleAddNewSpot(newSpot);
            mapLocationPicker.clearLocation();
          }}
          isPickingLocation={mapLocationPicker.isPicking}
          selectedLocation={mapLocationPicker.selectedLocation}
          onStartMapPick={mapLocationPicker.startPicking}
          onCancelMapPick={mapLocationPicker.cancelPicking}
          onClearLocation={mapLocationPicker.clearLocation}
          isGeocoding={mapLocationPicker.isGeocoding}
        />

        {/* Saved Bookmarks Modal */}
        <SavedSpotsModal
          isOpen={isSavedModalOpen}
          onClose={() => setIsSavedModalOpen(false)}
          savedSpots={savedSpots}
          onRemoveSave={handleToggleSave}
          onSelectSpot={setSelectedSpot}
        />

        {/* Add Facebook Post Modal */}
        <AddFacebookPostModal
          isOpen={isAddPostModalOpen}
          onClose={() => setIsAddPostModalOpen(false)}
          spots={spots}
          selectedSpotId={addPostTargetSpotId}
          onAddPost={handleAddFacebookPost}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 font-sans transition-colors">
      
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
      <div className="flex-1 lg:pl-[76px] flex flex-col min-w-0 pb-20 lg:pb-0">
        
        {/* Sticky Filter & Search Bar — chỉ thuộc view Tạp chí (grid).
            Các view khác (Cảm hứng, Màu Film) không render bộ lọc. */}
        {activeView === 'grid' && (
          <FilterBar
            filters={filters}
            onChangeFilters={setFilters}
            onResetFilters={handleResetFilters}
            totalFilteredCount={filteredSpots.length}
          />
        )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

        {/* VIEW 2: Editorial Masonry / Grid Directory */}
        {activeView === 'grid' && (
          <div className="space-y-6">
            
            {/* View headline & summary */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-slateInk pb-4 gap-2">
              <div>
                <span className="font-mono-spec text-xs font-bold text-terracotta uppercase tracking-wider block">
                  BỘ SƯU TẬP TẠP CHÍ ẢNH THEO MÙA
                </span>
                <h2 className="font-editorial text-2xl sm:text-4xl font-extrabold text-slateInk mt-0.5">
                  {filters.month ? `Tiêu Điểm Tháng ${filters.month} — Mùa Hoa Nở & Xu Hướng` : 'Tất Cả Điểm Chụp Đẹp Trong Năm'}
                </h2>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono-spec text-slateInk-muted">
                <span>LƯỚI TỶ LỆ 3:2</span>
                <span>•</span>
                <span>{filteredSpots.length} ĐỊA ĐIỂM</span>
              </div>
            </div>

            {/* Grid of Spots with Staggered Item Transition */}
            {filteredSpots.length === 0 ? (
              <div className="p-12 text-center bg-paper-warm border-2 border-slateInk space-y-3 my-6">
                <AlertCircle className="w-10 h-10 text-terracotta mx-auto" />
                <h3 className="font-editorial text-2xl font-bold text-slateInk">Không có địa điểm nào khớp với bộ lọc</h3>
                <p className="text-xs text-slateInk-muted font-sans max-w-sm mx-auto">
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

        {/* VIEW 3: Moodboard & Film Color Recipes */}
        {activeView === 'moodboard' && (
          <MoodboardView
            spots={spots}
            onSelectSpot={setSelectedSpot}
          />
        )}

        {/* VIEW 4: Film Rolls Gallery */}
        {activeView === 'film' && (
          <FilmGalleryView />
        )}

      </main>

      {/* Spot Detail Profile Modal (Shared Element Transition with AnimatePresence) */}
      <AnimatePresence>
        {selectedSpot && (
          <SpotDetailModal
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
            isSaved={savedSpotIds.includes(selectedSpot.id)}
            onToggleSave={handleToggleSave}
            onOpenReportModal={(spot) => setReportSpot(spot)}
            onOpenAddPostModal={(spotId) => {
              setAddPostTargetSpotId(spotId);
              setIsAddPostModalOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Community Report Modal */}
      <CommunityReportModal
        spot={reportSpot}
        onClose={() => setReportSpot(null)}
        onSubmitReport={handleSubmitReport}
      />

      {/* Add Spot Modal (Zero manual coordinate input, Click-to-Pin & AI Extraction) */}
      <AddSpotModal
        isOpen={isSubmitModalOpen || mapLocationPicker.isPicking}
        onClose={() => {
          setIsSubmitModalOpen(false);
          mapLocationPicker.cancelPicking();
        }}
        onSubmitNewSpot={(newSpot) => {
          handleAddNewSpot(newSpot);
          mapLocationPicker.clearLocation();
        }}
        isPickingLocation={mapLocationPicker.isPicking}
        selectedLocation={mapLocationPicker.selectedLocation}
        onStartMapPick={mapLocationPicker.startPicking}
        onCancelMapPick={mapLocationPicker.cancelPicking}
        onClearLocation={mapLocationPicker.clearLocation}
        isGeocoding={mapLocationPicker.isGeocoding}
      />

      {/* Saved Bookmarks Modal */}
      <SavedSpotsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedSpots={savedSpots}
        onRemoveSave={handleToggleSave}
        onSelectSpot={setSelectedSpot}
      />

      {/* Add Facebook Post Modal */}
      <AddFacebookPostModal
        isOpen={isAddPostModalOpen}
        onClose={() => setIsAddPostModalOpen(false)}
        spots={spots}
        selectedSpotId={addPostTargetSpotId}
        onAddPost={handleAddFacebookPost}
      />

      {/* Editorial Colophon Footer */}
      <Footer />

      </div>
    </div>
  );
}

export default App;
