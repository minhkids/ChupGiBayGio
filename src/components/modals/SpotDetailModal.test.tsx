// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { MOCK_SPOTS } from '../../data/mockSpots';
import { SpotDetailModal } from './SpotDetailModal';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

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
