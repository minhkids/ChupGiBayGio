export interface SpotLocationResult {
  lat: number;
  lng: number;
  address: string;
  placeName?: string;
  district?: string;
  city?: string;
  id: string;
  precision: 'address' | 'area';
}

// Reject missing/string/null coordinates, rather than coercing them into a pin.
export function validVietnamCoordinates(lat: unknown, lng: unknown): boolean {
  return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= 8 && lat <= 24 && lng >= 102 && lng <= 110;
}

export function isSpotLocationResult(value: unknown): value is SpotLocationResult {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return validVietnamCoordinates(row.lat, row.lng) && typeof row.id === 'string'
    && typeof row.address === 'string' && row.address.length > 0 && row.address.length <= 500
    && (row.precision === 'address' || row.precision === 'area');
}

export function photonLocations(data: unknown): SpotLocationResult[] {
  if (!data || typeof data !== 'object' || !Array.isArray((data as { features?: unknown }).features)) throw new Error('Invalid provider response');
  const results: SpotLocationResult[] = [];
  for (const feature of (data as { features: unknown[] }).features.slice(0, 20)) {
    if (!feature || typeof feature !== 'object') continue;
    const { geometry, properties } = feature as { geometry?: { type?: string; coordinates?: unknown[] }; properties?: Record<string, unknown> };
    if (!geometry || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates) || !properties) continue;
    const [lng, lat] = geometry.coordinates;
    if (!validVietnamCoordinates(lat, lng) || String(properties.countrycode).toUpperCase() !== 'VN') continue;
    const text = (key: string) => typeof properties[key] === 'string' ? (properties[key] as string).slice(0, 160) : '';
    const street = [text('housenumber'), text('street')].filter(Boolean).join(' ');
    const address = [...new Set([street || text('name'), text('locality'), text('district'), text('city'), text('state')].filter(Boolean))].join(', ');
    if (!address || address.length > 500) continue;
    const id = `${lat},${lng}:${address}`;
    if (results.some(row => row.id === id)) continue;
    results.push({ id, lat: lat as number, lng: lng as number, address, placeName: text('name'), district: text('district'), city: text('city') || text('state'), precision: text('type') === 'house' || !!text('housenumber') ? 'address' : 'area' });
    if (results.length === 5) break;
  }
  return results;
}