import { useEffect, useState } from 'react';

export const CATALOG_UPDATED_EVENT = 'chupgi:catalog-updated';

/** Revalidate mounted public views after local admin writes or returning to the tab. */
export function useCatalogRevision() {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener(CATALOG_UPDATED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(CATALOG_UPDATED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return revision;
}
