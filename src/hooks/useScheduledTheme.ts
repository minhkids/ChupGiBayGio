import { useEffect } from 'react';
import { applyScheduledTheme, THEME_OVERRIDE_KEY } from '../utils/scheduledTheme';

/** Check minute boundaries and resync immediately when a sleeping tab returns. */
export function useScheduledTheme() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      applyScheduledTheme();
      timer = setTimeout(refresh, 60_000 - Date.now() % 60_000);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_OVERRIDE_KEY || event.key === null) {
        delete document.documentElement.dataset.themeOverride;
        refresh();
      }
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
