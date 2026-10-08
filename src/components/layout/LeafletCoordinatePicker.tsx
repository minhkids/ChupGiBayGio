import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPoint { lat: number; lng: number }
interface Props { value?: MapPoint; onChange: (point: MapPoint) => void }

export const LeafletCoordinatePicker = ({ value, onChange }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const initialValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const lat = value?.lat;
  const lng = value?.lng;

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    const initial: [number, number] = initialValueRef.current ? [initialValueRef.current.lat, initialValueRef.current.lng] : [21.0285, 105.8542];
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(initial, initialValueRef.current ? 14 : 11);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
    }).addTo(map);
    const marker = L.circleMarker(initial, { radius: 8, color: '#9E4C29', weight: 2, fillColor: '#C76B3C', fillOpacity: 0.92 });
    if (initialValueRef.current) marker.addTo(map);
    markerRef.current = marker;
    map.on('click', (event: L.LeafletMouseEvent) => {
      const point = { lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.lng.toFixed(6)) };
      marker.setLatLng([point.lat, point.lng]).addTo(map);
      onChangeRef.current(point);
    });
    const resize = window.setTimeout(() => map.invalidateSize(), 50);
    return () => {
      window.clearTimeout(resize);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Map is constructed once; subsequent coordinate changes are handled by the second effect.
  }, []);

  useEffect(() => {
    if (lat === undefined || lng === undefined || !mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]).addTo(mapRef.current);
    mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 14));
  }, [lat, lng]);

  return <div ref={containerRef} className="h-64 w-full overflow-hidden rounded-xl border border-[#D8CFBD]" aria-label="Bản đồ chọn tọa độ" />;
};
