// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ScheduledTheme } from './ScheduledTheme';
import { applyScheduledTheme, THEME_OVERRIDE_KEY } from '../../utils/scheduledTheme';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.removeItem(THEME_OVERRIDE_KEY);
  delete document.documentElement.dataset.themeOverride;
  delete document.documentElement.dataset.colorScheme;
  document.documentElement.classList.remove('dark');
});

it('switches night to light and keeps multiple button instances synchronized', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T20:00:00+07:00'));
  applyScheduledTheme();
  render(<><ScheduledTheme /><ThemeToggle /><ThemeToggle variant="nav" /></>);
  fireEvent.click(screen.getAllByRole('button', { name: 'Chuyển sang giao diện sáng' })[0]);
  expect(document.documentElement.dataset.colorScheme).toBe('light');
  expect(screen.getAllByRole('button', { name: 'Chuyển sang giao diện tối' })).toHaveLength(2);
  act(() => vi.advanceTimersByTime(60_000));
  expect(document.documentElement.dataset.colorScheme).toBe('light');
  fireEvent.click(screen.getAllByRole('button', { name: 'Chuyển sang giao diện tối' })[1]);
  expect(document.documentElement.dataset.colorScheme).toBe('dark');
});
