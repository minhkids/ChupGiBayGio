import { useEffect, useState } from 'react';
import { Aperture, Bookmark, ImagePlus, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { Photographer, Spot, FilterState } from '../../types';
import { useWeather } from '../../hooks/useWeather';
import { readReferenceImage } from '../planner/referenceImage';
import { useShootPlan } from '../../context/ShootPlanContext';
import './editorial-layout.css';
import { FloatingOmnibar } from './FloatingOmnibar';
import { MapboxCanvas } from './MapboxCanvas';
import { ModernLeftRail } from './ModernLeftRail';
import { ShootPlannerTray } from './ShootPlannerTray';
import { SpotDossierDrawer } from './SpotDossierDrawer';
import { NearestFilmShopsDrawer } from './NearestFilmShopsDrawer';
import { ShootServicesHubDrawer, type ServicesTab } from './ShootServicesHubDrawer';
import type { FilmLab } from '../../data/filmLabsData';

interface AppLayoutProps {
  spots: Spot[];
  filteredSpots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot | null) => void;
  filters: FilterState;
  onChangeFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  activeRegionId: string;
  onSelectRegion: (id: string) => void;
  onAddSpot: () => void;
  onOpenSaved: () => void;
  onOpenPhotographers: () => void;
  onOpenFilm: () => void;
  onReportSpot: (spot: Spot) => void;
  onOpenAddPost: (spotId: string) => void;
  onSelectPhotographer: (photographer: Photographer) => void;
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number; address?: string } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
}

export function AppLayout(props: AppLayoutProps) {
  const weather = useWeather();
  const plan = useShootPlan();
  const [outfitUploadOpen, setOutfitUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Nearest Film Labs Drawer State
  const [nearestLabsOpen, setNearestLabsOpen] = useState(false);
  const [selectedFilmFilter, setSelectedFilmFilter] = useState('');
  const [selectedLabForMap, setSelectedLabForMap] = useState<FilmLab | null>(null);
  const [focusedCoordinates, setFocusedCoordinates] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Shoot Services Hub Drawer State (Trang phục + Thợ chụp + Mua film)
  const [servicesHubOpen, setServicesHubOpen] = useState(false);
  const [servicesHubTab, setServicesHubTab] = useState<ServicesTab>('outfit');

  // Global event listener to open Services Hub from anywhere
  useEffect(() => {
    const handleOpenHub = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: ServicesTab }>;
      if (customEvent.detail?.tab) {
        setServicesHubTab(customEvent.detail.tab);
      }
      setServicesHubOpen(true);
    };
    window.addEventListener('chupgi:open-services-hub', handleOpenHub);
    return () => window.removeEventListener('chupgi:open-services-hub', handleOpenHub);
  }, []);

  // Global event listener to open Nearest Film Labs drawer from anywhere
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ filmName?: string }>;
      if (customEvent.detail?.filmName) {
        setSelectedFilmFilter(customEvent.detail.filmName);
      }
      setNearestLabsOpen(true);
    };
    window.addEventListener('chupgi:open-nearest-labs', handleOpen);
    return () => window.removeEventListener('chupgi:open-nearest-labs', handleOpen);
  }, []);

  useEffect(() => {
    if (!outfitUploadOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOutfitUploadOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [outfitUploadOpen]);

  const uploadOutfitReference = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imageUrl = await readReferenceImage(file);
      plan.addReferencePhoto({ imageUrl, label: file.name, note: 'Ảnh tham khảo trang phục' });
      setUploadError('Đã thêm ảnh vào kế hoạch chụp.');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Không đọc được ảnh. Hãy thử JPG, PNG hoặc WebP.');
    }
  };

  return <main className="editorial-app min-h-[100dvh] bg-editorial-bg font-sans text-neutral-100">
    <MapboxCanvas
      spots={props.filteredSpots}
      activeRegionId={props.activeRegionId}
      selectedSpot={props.selectedSpot}
      onSelectSpot={spot => props.onSelectSpot(spot)}
      userCoords={props.filters.userCoords}
      isPickingLocation={props.isPickingLocation}
      pickedLocation={props.pickedLocation}
      onPickLocation={props.onPickLocation}
      selectedFilmLab={selectedLabForMap}
      onSelectFilmLab={lab => {
        setSelectedLabForMap(lab);
        setNearestLabsOpen(true);
      }}
      focusedCoordinates={focusedCoordinates}
      className="editorial-map-surface"
    />
    <ModernLeftRail
      activeSection={servicesHubOpen ? 'services' : 'map'}
      isServicesOpen={servicesHubOpen}
      onMap={() => {
        setServicesHubOpen(false);
        props.onSelectSpot(null);
      }}
      onServices={() => setServicesHubOpen(prev => !prev)}
      onPlanner={() => plan.openDrawer()}
      onAddSpot={props.onAddSpot}
      weather={weather}
      onFilm={() => {
        setServicesHubTab('film');
        setServicesHubOpen(true);
      }}
      onPhotographers={() => {
        setServicesHubTab('photographers');
        setServicesHubOpen(true);
      }}
      onOutfit={() => {
        setServicesHubTab('outfit');
        setServicesHubOpen(true);
      }}
      onOpenNearestLabs={() => {
        setServicesHubTab('film');
        setServicesHubOpen(true);
      }}
    />
    <FloatingOmnibar filters={props.filters} onChangeFilters={props.onChangeFilters} onSelectRegion={props.onSelectRegion} onResetFilters={props.onResetFilters} spots={props.filteredSpots} onSelectSpot={props.onSelectSpot} />
    <button type="button" onClick={props.onOpenSaved} aria-label="Điểm đã lưu" className="fixed right-3 top-3 z-[var(--z-panel)] flex h-11 items-center gap-2 rounded-full border border-editorial-border bg-editorial-bg px-3 text-xs text-neutral-200 hover:text-kodak-amber lg:right-5 lg:top-5"><Bookmark size={16} strokeWidth={1.5} /> <span className="hidden sm:inline">Đã lưu</span></button>
    <ShootPlannerTray dossierOpen={!!props.selectedSpot} />
    <SpotDossierDrawer spot={props.selectedSpot} month={props.filters.month ?? 11} onClose={() => props.onSelectSpot(null)} onSelectPhotographer={props.onSelectPhotographer} onOpenPhotographers={props.onOpenPhotographers} onReportSpot={props.onReportSpot} onOpenAddPost={props.onOpenAddPost} />

    {/* Shoot Services & Gear Hub Drawer (Trang phục + Thợ chụp + Tiệm film) */}
    <ShootServicesHubDrawer
      isOpen={servicesHubOpen}
      onClose={() => setServicesHubOpen(false)}
      initialTab={servicesHubTab}
      onSelectPhotographer={(photographer) => {
        props.onSelectPhotographer(photographer);
        setServicesHubOpen(false);
      }}
      onFlyToLab={(lab) => {
        setSelectedLabForMap(lab);
        setFocusedCoordinates({ lat: lab.lat, lng: lab.lng, zoom: 16 });
      }}
      selectedLabId={selectedLabForMap?.id}
    />

    {/* Nearest Film Labs Drawer (Standalone / Direct trigger) */}
    <NearestFilmShopsDrawer
      isOpen={nearestLabsOpen}
      onClose={() => setNearestLabsOpen(false)}
      filterFilm={selectedFilmFilter}
      selectedLabId={selectedLabForMap?.id}
      onFlyToLab={(lab) => {
        setSelectedLabForMap(lab);
        setFocusedCoordinates({ lat: lab.lat, lng: lab.lng, zoom: 16 });
      }}
    />

    {outfitUploadOpen && <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/65 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setOutfitUploadOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="outfit-upload-title" className="w-full max-w-md rounded-lg border border-editorial-border bg-editorial-surface p-5 shadow-2xl">
        <header className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.18em] text-kodak-amber">Ảnh tham khảo</p><h2 id="outfit-upload-title" className="mt-1 text-lg font-semibold">Bóc đồ từ ảnh</h2></div><button type="button" aria-label="Đóng" onClick={() => setOutfitUploadOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-md text-neutral-300 hover:bg-editorial-bg"><X size={18} strokeWidth={1.5} /></button></header>
        <p className="my-4 text-sm leading-6 text-neutral-300">Tải ảnh trang phục để lưu vào moodboard buổi chụp. Hiện tại ảnh được lưu làm tư liệu tham khảo; ứng dụng chưa tự nhận diện món đồ.</p>
        <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-editorial-border px-4 text-sm text-kodak-amber hover:bg-editorial-bg"><ImagePlus size={18} strokeWidth={1.5} />Chọn ảnh JPG, PNG hoặc WebP<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Tải ảnh trang phục" onChange={uploadOutfitReference} /></label>
        {uploadError && <p role="status" className="mt-4 text-sm text-neutral-300">{uploadError}</p>}
        <button type="button" onClick={() => setOutfitUploadOpen(false)} className="mt-4 min-h-11 w-full rounded-md bg-kodak-amber px-4 text-sm font-semibold text-editorial-bg">Đóng</button>
      </section>
    </div>}
    <div className="pointer-events-none fixed left-3 top-3 z-[var(--z-panel)] flex items-center gap-2 rounded-full border border-editorial-border bg-editorial-bg/90 px-3 py-2 text-xs text-neutral-300 lg:hidden"><Aperture size={16} className="text-kodak-amber" strokeWidth={1.5} /><span>{weather.isLoading || weather.error ? 'Bản đồ điểm chụp' : `${Math.round(weather.temperature)}° · Bản đồ`}</span></div>
  </main>;
}
