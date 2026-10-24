import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationData } from '../../hooks/useMapLocationPicker';
import { validVietnamCoordinates } from '../../utils/spotLocationSearch';

export function SpotLocationPreview({ location, onChange }: { location: LocationData; onChange: (location: LocationData) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const latest = useRef({ location, onChange });
  useEffect(() => { latest.current = { location, onChange }; }, [location, onChange]);
  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { scrollWheelZoom: false });
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' }).addTo(map);
    const move = (point: L.LatLng) => {
      if (validVietnamCoordinates(point.lat, point.lng)) latest.current.onChange({ ...latest.current.location, lat: point.lat, lng: point.lng, adjusted: true });
    };
    map.on('click', event => move(event.latlng));
    const marker = L.marker([21.0285, 105.8542], { draggable: true, title: 'Ghim địa điểm đã chọn', icon: L.divIcon({ className: 'spot-location-preview-pin', html: '<span style="display:block;width:24px;height:24px;background:#C76B3C;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px #0008"></span>', iconSize: [24, 24], iconAnchor: [12, 12] }) });
    marker.on('dragend', () => move(marker.getLatLng()));
    markerRef.current = marker;
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.invalidateSize()) : null;
    observer?.observe(container.current);
    return () => { observer?.disconnect(); map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !validVietnamCoordinates(location.lat, location.lng)) return;
    markerRef.current?.setLatLng([location.lat, location.lng]).addTo(map);
    map.setView([location.lat, location.lng], location.precision === 'area' ? 15 : 18, { animate: false });
  }, [location.lat, location.lng, location.precision]);
  return <div className="mt-3 space-y-2">
    <p className="text-slateInk">{location.precision === 'area' ? 'Ghim gần đúng cho đường / khu vực. ' : ''}Kiểm tra ghim; chạm bản đồ hoặc kéo ghim để chỉnh vị trí trước khi gửi.</p>
    <div ref={container} role="region" aria-label="Bản đồ kiểm tra ghim địa điểm" className="relative z-0 h-60 w-full border border-slateInk/30" />
    <p className="text-slateInk-muted">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}{location.adjusted ? ' · Đã chỉnh ghim; địa chỉ tham chiếu được giữ nguyên.' : ''}</p>
    <button type="button" className="min-h-11 border border-slateInk/40 px-3 text-slateInk" onClick={() => {
      const center = mapRef.current?.getCenter();
      if (center && validVietnamCoordinates(center.lat, center.lng)) onChange({ ...location, lat: center.lat, lng: center.lng, adjusted: true });
    }}>Đặt ghim ở giữa bản đồ</button>
    <p className="text-[11px] text-slateInk-muted">Có thể dùng phím mũi tên để dịch bản đồ, rồi đặt ghim ở giữa.</p>
  </div>;
}