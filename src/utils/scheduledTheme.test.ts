// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { applyScheduledTheme, toggleColorScheme } from './scheduledTheme';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.removeItem('chupgi:theme-override');
  delete document.documentElement.dataset.themeOverride;
  delete document.documentElement.dataset.colorScheme;
  document.documentElement.classList.remove('dark');
});

it('lets the sun button override night mode without the scheduler undoing it', () => {
  const now = new Date('2026-10-14T20:00:00+07:00');
  applyScheduledTheme(now);
  toggleColorScheme(now);
  expect(document.documentElement.dataset.colorScheme).toBe('light');
  applyScheduledTheme(new Date('2026-10-14T20:01:00+07:00'));
  expect(document.documentElement.dataset.colorScheme).toBe('light');
});

it('restores a manual choice after reload and expires it at the morning boundary', () => {
  toggleColorScheme(new Date('2026-10-14T20:00:00+07:00'));
  delete document.documentElement.dataset.themeOverride;
  applyScheduledTheme(new Date('2026-10-15T05:59:59+07:00'));
  expect(document.documentElement.dataset.colorScheme).toBe('light');
  applyScheduledTheme(new Date('2026-10-15T06:00:00+07:00'));
  expect(localStorage.getItem('chupgi:theme-override')).toBeNull();
  expect(document.documentElement.dataset.themeOverride).toBeUndefined();
  applyScheduledTheme(new Date('2026-10-15T19:00:00+07:00'));
  expect(document.documentElement.dataset.colorScheme).toBe('dark');
});

it('expires daytime choices at 19:00, including Vietnam year boundaries', () => {
  toggleColorScheme(new Date('2026-12-31T18:59:59+07:00'));
  expect(document.documentElement.dataset.colorScheme).toBe('dark');
  applyScheduledTheme(new Date('2026-12-31T19:00:00+07:00'));
  expect(localStorage.getItem('chupgi:theme-override')).toBeNull();
  toggleColorScheme(new Date('2026-12-31T23:59:59+07:00'));
  const saved = JSON.parse(localStorage.getItem('chupgi:theme-override')!);
  expect(saved.expiresAt).toBe(new Date('2027-01-01T06:00:00+07:00').getTime());
});

it.each(['invalid json', '{"scheme":"unknown","expiresAt":9999999999999}', '{"scheme":"light","expiresAt":9999999999999}'])('ignores malformed or unbounded saved settings: %s', raw => {
  localStorage.setItem('chupgi:theme-override', raw);
  expect(() => applyScheduledTheme(new Date('2026-10-14T20:00:00+07:00'))).not.toThrow();
  expect(document.documentElement.dataset.colorScheme).toBe('dark');
});

it('still toggles when storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
  toggleColorScheme(new Date('2026-10-14T20:00:00+07:00'));
  applyScheduledTheme(new Date('2026-10-14T20:01:00+07:00'));
  expect(document.documentElement.dataset.colorScheme).toBe('light');
});
