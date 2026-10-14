// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import { useScheduledTheme } from './useScheduledTheme';
import { THEME_OVERRIDE_KEY, toggleColorScheme } from '../utils/scheduledTheme';

function ThemeHarness() {
  useScheduledTheme();
  return null;
}

afterEach(() => {
  cleanup();
  localStorage.removeItem(THEME_OVERRIDE_KEY);
  delete document.documentElement.dataset.themeOverride;
  vi.useRealTimers();
  document.documentElement.classList.remove('dark');
  delete document.documentElement.dataset.colorScheme;
  document.querySelector('meta[name="theme-color"]')?.remove();
});

it('changes an open tab to dark at 19:00 Vietnam time', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T18:59:59+07:00'));
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  document.head.appendChild(meta);
  render(<ThemeHarness />);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  act(() => vi.advanceTimersByTime(1000));
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(document.documentElement.dataset.colorScheme).toBe('dark');
  expect(meta.content).toBe('#141312');
});

it.each([
  ['2026-10-14T18:59:59+07:00', 'light'],
  ['2026-10-14T19:00:00+07:00', 'dark'],
  ['2026-10-15T00:00:00+07:00', 'dark'],
  ['2026-10-15T05:59:59+07:00', 'dark'],
  ['2026-10-15T06:00:00+07:00', 'light'],
  ['2026-10-14T12:00:00Z', 'dark'],
])('loads %s with the correct Vietnam palette (%s)', (time, scheme) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(time));
  render(<ThemeHarness />);
  expect(document.documentElement.dataset.colorScheme).toBe(scheme);
  expect(document.documentElement.classList.contains('dark')).toBe(scheme === 'dark');
});

it('returns to light at 06:00 without reloading', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-15T05:59:59+07:00'));
  render(<ThemeHarness />);
  expect(document.documentElement.dataset.colorScheme).toBe('dark');
  act(() => vi.advanceTimersByTime(1000));
  expect(document.documentElement.dataset.colorScheme).toBe('light');
});

it('resynchronizes after a suspended tab is focused or becomes visible', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T18:00:00+07:00'));
  render(<ThemeHarness />);
  vi.setSystemTime(new Date('2026-10-14T20:00:00+07:00'));
  act(() => window.dispatchEvent(new Event('focus')));
  expect(document.documentElement.dataset.colorScheme).toBe('dark');
  vi.setSystemTime(new Date('2026-10-15T07:00:00+07:00'));
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(document.documentElement.dataset.colorScheme).toBe('light');
});

it('cleans up timers and listeners, including StrictMode remounts', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T18:59:59+07:00'));
  const view = render(<StrictMode><ThemeHarness /></StrictMode>);
  expect(vi.getTimerCount()).toBe(1);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.setSystemTime(new Date('2026-10-14T20:00:00+07:00'));
  act(() => window.dispatchEvent(new Event('focus')));
  expect(document.documentElement.dataset.colorScheme).toBe('light');
});

it('synchronizes a manual setting changed in another browser tab', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T20:00:00+07:00'));
  render(<ThemeHarness />);
  act(() => toggleColorScheme());
  expect(document.documentElement.dataset.colorScheme).toBe('light');
  localStorage.removeItem(THEME_OVERRIDE_KEY);
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: THEME_OVERRIDE_KEY, newValue: null })));
  expect(document.documentElement.dataset.colorScheme).toBe('dark');
});
