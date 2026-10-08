// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { MOCK_SPOTS } from '../../data/mockSpots';
import { SpotDossierDrawer } from './SpotDossierDrawer';

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
afterEach(() => { cleanup(); localStorage.clear(); });
it('opens a named dossier and persists the header plan pin', () => {
  const spot = MOCK_SPOTS[0];
  render(<ShootPlanProvider><SpotDossierDrawer spot={spot} month={10} onClose={() => {}} /></ShootPlanProvider>);
  expect(screen.getByRole('dialog', { name: spot.name })).toBeTruthy();
  expect(screen.getAllByRole('tab')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Ghim vào kế hoạch' }));
  expect(screen.getByRole('button', { name: 'Đã ghim vào kế hoạch' }).getAttribute('aria-pressed')).toBe('true');
  expect(localStorage.getItem('chupgibaygio_shoot_plan')).toContain(spot.id);
});
