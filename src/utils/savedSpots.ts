const LEGACY_SAMPLE_SPOT_IDS = new Set(['spot-hn-01', 'spot-dl-01']);

export function readSavedSpotIds(stored: string | null): string[] {
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return [...new Set(parsed.filter(
      (id): id is string => typeof id === 'string' && !LEGACY_SAMPLE_SPOT_IDS.has(id),
    ))];
  } catch {
    return [];
  }
}
