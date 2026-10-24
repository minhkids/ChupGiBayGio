// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { GoogleMapsLayout } from './GoogleMapsLayout';
import { MOCK_SPOTS } from '../data/mockSpots';
import type { FilterState, Spot } from '../types';
import { ShootPlanProvider } from '../context/ShootPlanContext';

vi.mock('./map/SpotMap', () => ({
  SpotMap: (props: { userCoords: { lat: number; lng: number } | null; focusedCoordinates: { lat: number; lng: number } | null }) => (
    <div data-testid="map" data-user-lat={props.userCoords?.lat} data-focused-lat={props.focusedCoordinates?.lat} />
  ),
}));
vi.mock('./features/AtmosphericFX', () => ({ AtmosphericFX: () => null }));
vi.mock('./features/ThemeToggle', () => ({ ThemeToggle: () => null }));
vi.mock('./navigation/LeftNavRail', () => ({ LeftNavRail: () => null }));
vi.mock('./navigation/MobileViewMenuItems', () => ({ MobileViewMenuItems: () => null }));
vi.mock('./views/MapStyleCategoryBrowser', () => ({ MapStyleCategoryBrowser: () => null }));
vi.mock('./features/PoseCamera', () => ({ PoseCamera: () => null }));
vi.mock('./outfit/TapToShopImage', () => ({ TapToShopImage: () => null }));
vi.mock('./layout/NearestFilmShopsDrawer', () => ({ NearestFilmShopsDrawer: () => null }));
vi.mock('./layout/SingleFilmLabCard', () => ({ SingleFilmLabCard: () => null }));
vi.mock('./layout/ShootServicesHubDrawer', () => ({ ShootServicesHubDrawer: () => null }));
vi.mock('../hooks/useWeather', () => ({
  useWeather: () => ({ effect: 'none', season: 'spring', timeOfDay: 'day', particleDensity: 0, overlayOpacity: 0, colorTemperature: 0, windSpeed: 0 }),
}));

const initialFilters: FilterState = {
  month: null,
  season: 'all',
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
  radiusKm: 25,
};

const userCoords = { lat: 21.0285, lng: 105.8542 };
const allSpots: Spot[] = Array.from({ length: 6 }, (_, index) => ({
  ...MOCK_SPOTS[0],
  id: `nearby-${index + 1}`,
  name: `Địa điểm gần ${index + 1}`,
  lat: userCoords.lat + (index + 1) * 0.01,
  lng: userCoords.lng,
}));

const onSelectSpot = vi.fn();
const props = {
  placeCategories: [],
  filteredSpots: [],
  selectedSpot: null,
  onSelectSpot,
  savedSpotIds: [],
  onToggleSave: vi.fn(),
  filters: initialFilters,
  onChangeFilters: vi.fn(),
  activeRegionId: 'hanoi',
  onSelectRegion: vi.fn(),
  activeView: 'map' as const,
  onChangeView: vi.fn(),
  onOpenSubmitSpotModal: vi.fn(),
  onOpenSavedModal: vi.fn(),
  onOpenAddPostModal: vi.fn(),
  allSpots,
} as ComponentProps<typeof GoogleMapsLayout>;

const TestMap = () => {
  const [filters, setFilters] = useState(initialFilters);
  return <GoogleMapsLayout {...props} filters={filters} onChangeFilters={setFilters} />;
};

let originalGeolocation: PropertyDescriptor | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation');
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((success: PositionCallback) => success({
        coords: { latitude: userCoords.lat, longitude: userCoords.lng },
      } as GeolocationPosition)),
    },
  });
});

afterEach(() => {
  cleanup();
  if (originalGeolocation) Object.defineProperty(navigator, 'geolocation', originalGeolocation);
  else Reflect.deleteProperty(navigator, 'geolocation');
});

describe('GoogleMapsLayout nearby locations', () => {
  it('opens the cycling-story controls from the selected spot detail', async () => {
    render(<ShootPlanProvider><GoogleMapsLayout {...props} selectedSpot={MOCK_SPOTS[0]} /></ShootPlanProvider>);
    fireEvent.click(screen.getAllByRole('button', { name: 'Chạy hành trình đạp xe (Story)' })[0]);
    expect(await screen.findByRole('toolbar', { name: 'Điều khiển hành trình đạp xe' })).toBeTruthy();
  });

  it('keeps the spot description without claiming an unverified bloom percentage in either detail layout', () => {
    const selectedSpot = { ...allSpots[0], description: 'Phố cổ và kiến trúc, không có số liệu hoa.', seasonalTrend: { ...allSpots[0].seasonalTrend, bloomPercentage: 85 } };
    render(<GoogleMapsLayout {...props} selectedSpot={selectedSpot} />);
    expect(screen.getAllByText(selectedSpot.description)).toHaveLength(2);
    expect(screen.queryByText(/85% ĐANG NỞ/i)).toBeNull();
    expect(screen.queryByText(/TÌNH TRẠNG HOA \/ PHONG CẢNH/i)).toBeNull();
    expect(screen.queryByText('Báo nở')).toBeNull();
    expect(screen.getAllByText('Chia sẻ')).toHaveLength(2);
  });

  it('shows the five closest spots in distance order after locating the user', async () => {
    render(<TestMap />);

    fireEvent.click(screen.getByRole('button', { name: 'Vị trí của tôi' }));

    const nearbyRegion = await screen.findByRole('region', { name: 'Địa điểm gần bạn' });
    const results = within(nearbyRegion).getByRole('list');
    const resultButtons = within(results).getAllByRole('button');
    expect(resultButtons).toHaveLength(5);
    expect(resultButtons.map((button) => button.textContent)).toEqual([
      expect.stringContaining('Địa điểm gần 1'),
      expect.stringContaining('Địa điểm gần 2'),
      expect.stringContaining('Địa điểm gần 3'),
      expect.stringContaining('Địa điểm gần 4'),
      expect.stringContaining('Địa điểm gần 5'),
    ]);
    expect(within(nearbyRegion).queryByText('Địa điểm gần 6')).toBeNull();
    expect(screen.getByTestId('map').getAttribute('data-user-lat')).toBe(String(userCoords.lat));
    expect(screen.getByTestId('map').getAttribute('data-focused-lat')).toBe(String(userCoords.lat));
  });

  it('selects a nearby result and focuses its location on the map', async () => {
    render(<TestMap />);
    fireEvent.click(screen.getByRole('button', { name: 'Vị trí của tôi' }));

    const nearbyRegion = await screen.findByRole('region', { name: 'Địa điểm gần bạn' });
    fireEvent.click(within(within(nearbyRegion).getByRole('list')).getAllByRole('button')[0]);

    expect(onSelectSpot).toHaveBeenCalledWith(expect.objectContaining({ id: 'nearby-1' }));
    expect(screen.getByTestId('map').getAttribute('data-focused-lat')).toBe(String(allSpots[0].lat));
  });

  it('does not substitute a fallback location when permission is denied', async () => {
    const geolocation = navigator.geolocation.getCurrentPosition as ReturnType<typeof vi.fn>;
    geolocation.mockImplementation((_success: PositionCallback, error?: PositionErrorCallback) => {
      error?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
    });
    render(<TestMap />);
    fireEvent.click(screen.getByRole('button', { name: 'Vị trí của tôi' }));

    expect(await screen.findByText('Hãy cho phép truy cập vị trí để tìm địa điểm gần bạn.')).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Địa điểm gần bạn' })).toBeNull();
    expect(screen.getByTestId('map').getAttribute('data-user-lat')).toBeNull();
  });
});
