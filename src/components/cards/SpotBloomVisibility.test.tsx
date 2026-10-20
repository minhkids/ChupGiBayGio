// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { MOCK_SPOTS } from '../../data/mockSpots';
import { ModernSpotCard } from './ModernSpotCard';
import { SpotCard } from './SpotCard';

afterEach(cleanup);

it('shows spot status without an unverified bloom percentage on either public card', () => {
  const spot = { ...MOCK_SPOTS[0], seasonalTrend: { ...MOCK_SPOTS[0].seasonalTrend, bloomPercentage: 85 } };
  render(<ShootPlanProvider><ModernSpotCard spot={spot} onSelectSpot={vi.fn()} /></ShootPlanProvider>);
  expect(screen.queryByText('85%')).toBeNull();
  expect(screen.getByText(spot.name)).toBeTruthy();
  cleanup();
  render(<ShootPlanProvider><SpotCard spot={spot} isSaved={false} onToggleSave={vi.fn()} onSelectSpot={vi.fn()} /></ShootPlanProvider>);
  expect(screen.queryByText(/85%/)).toBeNull();
  expect(screen.getByText(spot.name)).toBeTruthy();
});
