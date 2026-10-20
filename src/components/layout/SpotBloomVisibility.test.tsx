// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MOCK_SPOTS } from '../../data/mockSpots';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { SpotDetailContent } from './SpotDetailContent';
import { MobileSheet } from './MobileSheet';
import type { LayoutCallbacks } from './shared-types';

afterEach(cleanup);

it('retains the description without an unverified bloom claim in alternate spot details', () => {
  const spot = { ...MOCK_SPOTS[0], seasonalTrend: { ...MOCK_SPOTS[0].seasonalTrend, bloomPercentage: 85 } };
  const callbacks = {
    onToggleSave: vi.fn(), handleOpenDirections: vi.fn(), handleShareSpot: vi.fn(), onOpenReportModal: vi.fn(), onOpenAddPostModal: vi.fn(),
  } as unknown as LayoutCallbacks;
  render(<ShootPlanProvider><SpotDetailContent spot={spot} activePhotoIdx={0} setActivePhotoIdx={vi.fn()} detailTab="info" setDetailTab={vi.fn()} savedSpotIds={[]} callbacks={callbacks} /></ShootPlanProvider>);
  expect(screen.getByText(spot.description)).toBeTruthy();
  expect(screen.queryByText(/85% ĐANG NỞ/i)).toBeNull();
  expect(screen.queryByText('Báo nở')).toBeNull();
  cleanup();
  render(<ShootPlanProvider><MobileSheet spot={spot} savedSpotIds={[]} callbacks={callbacks} uiState={{ detailTab:'info',setDetailTab:vi.fn(),activePhotoIdx:0,setActivePhotoIdx:vi.fn() }} onClose={vi.fn()} /></ShootPlanProvider>);
  expect(screen.getByText(spot.description)).toBeTruthy();
  expect(screen.queryByText(/85% ĐANG NỞ/i)).toBeNull();
  expect(screen.queryByText('Báo nở')).toBeNull();
});
