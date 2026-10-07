import type { ComponentProps } from 'react';
import { SpotMap } from '../map/SpotMap';

// Layout boundary, intentionally backed by the existing Leaflet engine.
// No Mapbox SDK or access token is required by this application.
export function MapboxCanvas(props: ComponentProps<typeof SpotMap>) {
  return <div className="editorial-map fixed inset-0 z-[var(--z-base)]" aria-label="Bản đồ điểm chụp"><SpotMap {...props} editorial /></div>;
}
