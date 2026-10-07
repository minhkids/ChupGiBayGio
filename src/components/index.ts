// Barrel export for all components

// Main Layout (lazy-loaded in App.tsx)
// GoogleMapsLayout — imported via React.lazy in App.tsx

// Modals (lazy-loaded in App.tsx)
// AddFacebookPostModal — imported via React.lazy in App.tsx
// AddSpotModal — imported via React.lazy in App.tsx
// CommunityReportModal — imported via React.lazy in App.tsx
// SavedSpotsModal — imported via React.lazy in App.tsx
// SpotDetailModal — imported via React.lazy in App.tsx
export { PoseLibraryModal } from './modals/PoseLibraryModal';
export { SubmitSpotModal } from './modals/SubmitSpotModal';

// Cards
export { CameraGearAdvisorCard } from './cards/CameraGearAdvisorCard';
export { FacebookPostCard } from './cards/FacebookPostCard';
export { FilmSpecsCard } from './cards/FilmSpecsCard';
export { ModernSpotCard } from './cards/ModernSpotCard';
export { OutfitAdvisorCard } from './cards/OutfitAdvisorCard';
export { SpotCard } from './cards/SpotCard';

// Views & Feeds (lazy-loaded in App.tsx)
// MoodboardView — imported via React.lazy in App.tsx
// FilmGalleryView — imported via React.lazy in App.tsx
export { FacebookFeedView } from './views/FacebookFeedView';
export { LocalInsightFeed } from './views/LocalInsightFeed';

// Features & Tools
export { AtmosphericFX } from './features/AtmosphericFX';
export { FilterBar } from './features/FilterBar';
export { PaletteSwatch } from './features/PaletteSwatch';
export { PoseCamera } from './features/PoseCamera';

// Navigation & Layout chrome
export { LeftNavRail } from './navigation/LeftNavRail';
export { ModernMonthDock } from './navigation/ModernMonthDock';
export { MonthTimeline } from './navigation/MonthTimeline';
export { Footer } from './navigation/Footer';

// Map components
export { SpotMap } from './map/SpotMap';
export { MobileMapDrawer } from './map/MobileMapDrawer';

// Animations
export { AnimatedBookmark } from './animations/AnimatedBookmark';
export { ApertureSpinner } from './animations/ApertureSpinner';
export { AutofocusLoader } from './animations/AutofocusLoader';

// Outfit Tap to Shop
export { OutfitTapToShopModal } from './outfit/OutfitTapToShopModal';
export { TapToShopImage } from './outfit/TapToShopImage';
export { VisualOutfitHotspot } from './outfit/VisualOutfitHotspot';

// Photographers Directory & Booking
export { PhotographerCard } from './photographers/PhotographerCard';
export { PhotographerDock } from './photographers/PhotographerDock';
export { PhotographerModal } from './photographers/PhotographerModal';
export { SpotPhotographersSection } from './photographers/SpotPhotographersSection';

// Shoot Planner & Budget Estimator
export { ShootPlannerDrawer } from './planner/ShootPlannerDrawer';

// Navigation & Services Hub
export { ModernLeftRail } from './layout/ModernLeftRail';

export { NearestFilmShopsDrawer } from './layout/NearestFilmShopsDrawer';