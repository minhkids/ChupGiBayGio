// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { MOCK_SPOTS } from '../../data/mockSpots';
import { SpotDetailModal } from './SpotDetailModal';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('labels a candidate as a forecast rather than showing an unverified bloom percentage', () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  const spot = { ...MOCK_SPOTS[0], seasonalTrend: { ...MOCK_SPOTS[0].seasonalTrend, status: 'ACTIVE' as const, upcoming: true, expectedMonths: [11], bloomPercentage: 85 } };
  render(<ShootPlanProvider><SpotDetailModal spot={spot} onClose={vi.fn()} isSaved={false} onToggleSave={vi.fn()} onOpenReportModal={vi.fn()} /></ShootPlanProvider>);
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
    onOpenReportModal={vi.fn()}
  /></ShootPlanProvider>);

  expect(screen.queryByText('Film gợi ý')).toBeNull();
});
