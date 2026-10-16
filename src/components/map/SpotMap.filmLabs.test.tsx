// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { SpotMap } from './SpotMap';
import type { FilmLab } from '../../data/filmLabsData';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('renders a selected shop pin independently of the lab overlay and matching lab IDs', async () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([{ id: 'shared', name: 'Lab riêng', lat: 21.0285, lng: 105.8542 }])));
  const shop = { id: 'shared', category: 'filmShop', name: 'Shop đã chọn', lat: 21.03, lng: 105.85, address: '', district: '', openingHours: '', availableFilms: [], phone: '', googleMapsUrl: '', services: [] } as FilmLab;
  const props = { spots: [], activeRegionId: 'hanoi', selectedSpot: null, onSelectSpot: vi.fn(), userCoords: null };
  const { container, rerender } = render(<SpotMap {...props} selectedFilmLab={shop} />);
  await waitFor(() => expect(container.querySelector('[title="Lab riêng"]')).toBeTruthy());
  expect(container.querySelector('[title="Shop đã chọn"]')).toBeTruthy();
  expect(container.querySelectorAll('.selected-film-location-marker')).toHaveLength(1);
  rerender(<SpotMap {...props} selectedFilmLab={shop} showFilmLabs={false} />);
  expect(container.querySelectorAll('.film-lab-marker')).toHaveLength(0);
  expect(container.querySelector('[title="Shop đã chọn"]')).toBeTruthy();
  rerender(<SpotMap {...props} selectedFilmLab={null} showFilmLabs={false} />);
  expect(container.querySelectorAll('.selected-film-location-marker')).toHaveLength(0);
});

it('keeps the independent lab overlay with real coordinates and never turns missing coordinates into pins', async () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  const fetcher = vi.fn(async (url: string) => Response.json(url === '/api/labs' ? [
    { id: 'priced-lab', name: 'Lab có giá', address: 'Hà Nội', lat: 21.0285, lng: 105.8542, min_roll_price: 80000 },
    { id: 'no-pin-lab', name: 'Lab chưa ghim', lat: null, lng: null },
    { id: 'empty-pin-lab', name: 'Lab tọa độ trống', lat: '', lng: '' },
  ] : [{ id: 'shop', name: 'Shop riêng', lat: 21.03, lng: 105.85 }]));
  vi.stubGlobal('fetch', fetcher);
  const props = { spots: [], activeRegionId: 'hanoi', selectedSpot: null, onSelectSpot: vi.fn(), userCoords: null };
  const { container, rerender } = render(<SpotMap {...props} />);
  await waitFor(() => expect(container.querySelector('[title="Lab có giá"]')).toBeTruthy());
  expect(container.querySelectorAll('.film-lab-marker')).toHaveLength(1);
  expect(container.querySelector('[title="Lab chưa ghim"]')).toBeNull();
  expect(container.querySelector('[title="Shop riêng"]')).toBeNull();
  expect(fetcher.mock.calls.map(([url]) => url)).toEqual(['/api/labs']);
  rerender(<SpotMap {...props} showFilmLabs={false} />);
  expect(container.querySelectorAll('.film-lab-marker')).toHaveLength(0);
  rerender(<SpotMap {...props} showFilmLabs />);
  expect(container.querySelectorAll('.film-lab-marker')).toHaveLength(1);
});
