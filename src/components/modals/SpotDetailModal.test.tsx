// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { MOCK_SPOTS } from '../../data/mockSpots';
import { SpotDetailModal } from './SpotDetailModal';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('does not present a stored bloom percentage as a current observation in the spot dossier', () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  const spot = { ...MOCK_SPOTS[0], seasonalTrend: { ...MOCK_SPOTS[0].seasonalTrend, status: 'ACTIVE' as const, upcoming: false, bloomPercentage: 85 } };
  render(<ShootPlanProvider><SpotDetailModal spot={spot} onClose={vi.fn()} isSaved={false} onToggleSave={vi.fn()} /></ShootPlanProvider>);
  expect(screen.queryByText('Tình trạng hoa nở: 85%')).toBeNull();
  expect(screen.getByRole('heading', { name: spot.name })).toBeTruthy();
  expect(screen.queryByText('Gửi Báo Cáo Mới')).toBeNull();
  expect(screen.queryByText(/BÁO CÁO TÌNH TRẠNG THỰC TẾ HÔM NAY/)).toBeNull();
});

it('labels a candidate as a forecast rather than showing an unverified bloom percentage', () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  const spot = { ...MOCK_SPOTS[0], seasonalTrend: { ...MOCK_SPOTS[0].seasonalTrend, status: 'ACTIVE' as const, upcoming: true, expectedMonths: [11], bloomPercentage: 85 } };
  render(<ShootPlanProvider><SpotDetailModal spot={spot} onClose={vi.fn()} isSaved={false} onToggleSave={vi.fn()} /></ShootPlanProvider>);
  expect(screen.getByText('? Có thể hot — dự kiến tháng 11')).toBeTruthy();
  expect(screen.queryByText('Tình trạng hoa nở: 85%')).toBeNull();
});

it('omits the film recommendation from spot detail', () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })));
  render(<ShootPlanProvider><SpotDetailModal
    spot={MOCK_SPOTS[0]}
    onClose={vi.fn()}
    isSaved={false}
    onToggleSave={vi.fn()}
  /></ShootPlanProvider>);

  expect(screen.queryByText('Film gợi ý')).toBeNull();
});
