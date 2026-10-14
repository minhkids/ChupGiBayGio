const vietnamHour = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  hourCycle: 'h23',
});

export const THEME_CHANGED_EVENT = 'chupgi:theme-changed';
export const THEME_OVERRIDE_KEY = 'chupgi:theme-override';
export type ColorScheme = 'light' | 'dark';

function nextBoundary(now: Date) {
  const offset = 7 * 60 * 60 * 1000;
  const vietnam = new Date(now.getTime() + offset);
  const hour = vietnam.getUTCHours();
  if (hour >= 19) vietnam.setUTCDate(vietnam.getUTCDate() + 1);
  vietnam.setUTCHours(hour >= 6 && hour < 19 ? 19 : 6, 0, 0, 0);
  return vietnam.getTime() - offset;
}

function readOverride(now: Date): ColorScheme | null {
  let raw = document.documentElement.dataset.themeOverride;
  if (!raw) {
    try { raw = localStorage.getItem(THEME_OVERRIDE_KEY) ?? undefined; } catch { /* Storage can be disabled. */ }
  }
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === 'object' && 'scheme' in value && 'expiresAt' in value
      && (value.scheme === 'light' || value.scheme === 'dark')
      && typeof value.expiresAt === 'number' && Number.isFinite(value.expiresAt)
      && value.expiresAt > now.getTime() && value.expiresAt <= nextBoundary(now)) {
      return value.scheme;
    }
  } catch { /* Ignore malformed/expired preferences, never break rendering. */ }
  delete document.documentElement.dataset.themeOverride;
  try { localStorage.removeItem(THEME_OVERRIDE_KEY); } catch { /* Optional persistence. */ }
  return null;
}

/** Manual choices survive reloads until the next 06:00/19:00 Vietnam boundary. */
export function toggleColorScheme(now = new Date()) {
  const current = applyScheduledTheme(now);
  const preference = JSON.stringify({ scheme: current === 'dark' ? 'light' : 'dark', expiresAt: nextBoundary(now) });
  // Keep an in-page fallback when localStorage is blocked or full.
  document.documentElement.dataset.themeOverride = preference;
  try { localStorage.setItem(THEME_OVERRIDE_KEY, preference); } catch { /* Optional persistence. */ }
  applyScheduledTheme(now);
}

/** Vietnam nights run from 19:00 (inclusive) to 06:00 (exclusive). */
export function applyScheduledTheme(now = new Date()) {
  const hour = Number(vietnamHour.format(now));
  const scheme = readOverride(now) ?? (hour >= 19 || hour < 6 ? 'dark' : 'light');
  const root = document.documentElement;
  const changed = root.dataset.colorScheme !== scheme;
  root.classList.toggle('dark', scheme === 'dark');
  root.dataset.colorScheme = scheme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', scheme === 'dark' ? '#141312' : '#FAF8F4');
  if (changed) window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
  return scheme;
}
