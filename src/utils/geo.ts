// Haversine formula for calculating distance between two coordinates in km
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function formatDistance(km: number | undefined): string {
  if (km === undefined) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km} km`;
}

// Convert coordinates to photography format: 21°01'44"N 105°51'08"E
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  const latDeg = Math.floor(Math.abs(lat));
  const latMin = Math.floor((Math.abs(lat) - latDeg) * 60);
  const latSec = Math.round(((Math.abs(lat) - latDeg) * 60 - latMin) * 60);

  const lngDeg = Math.floor(Math.abs(lng));
  const lngMin = Math.floor((Math.abs(lng) - lngDeg) * 60);
  const lngSec = Math.round(((Math.abs(lng) - lngDeg) * 60 - lngMin) * 60);

  return `${latDeg}°${latMin}'${latSec}"${latDir}  ${lngDeg}°${lngMin}'${lngSec}"${lngDir}`;
}
