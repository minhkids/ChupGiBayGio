import L from 'leaflet';
import { lineString } from '@turf/turf';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { Spot } from '../../types';
import type { CyclingWaypoint } from '../../types/planner';
import { fetchCyclingRoute, type CyclingRoute } from '../../services/cyclingRouteService';
import { getCyclingStoryFrame } from '../../utils/cyclingStoryMotion';
import { exportCyclingStoryVideo } from '../../utils/cyclingVideoExport';
import { ArrivalSpotPopup } from './ArrivalSpotPopup';
import { StoryPlayerControls } from './StoryPlayerControls';
import { cyclingBikeArtwork } from './cyclingBikeArtwork';

export type CyclingStoryMode = 'spot' | 'plan';
type StoryStatus = 'loading' | 'intro' | 'playing' | 'paused' | 'arrived' | 'error';

interface CyclingStoryControllerProps {
  map: LeafletMap | null;
  isOpen: boolean;
  mode: CyclingStoryMode;
  targetSpot: Spot | null;
  waypoints: CyclingWaypoint[];
  userCoordinates?: { lat: number; lng: number } | null;
  isVertical: boolean;
  onVerticalModeChange: (vertical: boolean) => void;
  onClose: () => void;
}

function asWaypoint(spot: Spot): CyclingWaypoint {
  return {
    id: spot.id, name: spot.name, lat: Number(spot.lat), lng: Number(spot.lng), kind: 'spot',
    address: spot.address, imageUrl: spot.coverImageUrl, bestTime: spot.bestTimeDescription,
    photoTip: spot.photographyTips?.[0], seasonalLabel: spot.seasonalTrend?.trendTitle,
  };
}

function validWaypoint(point: CyclingWaypoint): boolean {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng) && point.lat >= 8 && point.lat <= 24 && point.lng >= 102 && point.lng <= 110;
}

function locateCurrentPosition(): Promise<CyclingWaypoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt không hỗ trợ GPS. Hãy thêm ít nhất hai điểm có tọa độ vào Kế hoạch chụp.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ id: 'current-location', name: 'Vị trí hiện tại', lat: coords.latitude, lng: coords.longitude, kind: 'origin' }),
      () => reject(new Error('Không lấy được vị trí GPS. Hãy cấp quyền vị trí hoặc thêm đủ hai điểm vào Kế hoạch chụp.')),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );
  });
}

function bikeIcon() {
  return L.divIcon({ className: 'cycling-story-bike-icon', iconSize: [112, 100], iconAnchor: [56, 86], html: cyclingBikeArtwork() });
}

function stopIcon(index: number, arrival = false) {
  const html = arrival
    ? '<span class="cycling-story-ripple"></span><span class="cycling-story-ripple"></span><span class="cycling-story-arrival-dot"></span>'
    : `<span class="cycling-story-number" style="animation-delay:${index * 100}ms">${index + 1}</span>`;
  return L.divIcon({ className: arrival ? 'cycling-story-arrival-icon' : 'cycling-story-stop-icon', html, iconSize: arrival ? [48, 48] : [26, 26], iconAnchor: arrival ? [24, 24] : [13, 13] });
}

const STORY_MOTION_CSS = `
@keyframes cyclingStoryBob{0%,100%{transform:translateY(0)}35%{transform:translateY(-3px)}65%{transform:translateY(.6px)}}
@keyframes cyclingStoryLaunch{0%,100%{transform:translateY(0) rotate(0)}45%{transform:translateY(2px) rotate(-3deg)}78%{transform:translateY(-2px) rotate(2deg)}}
@keyframes cyclingStoryBasketLaunch{0%,100%{transform:rotate(0)}45%{transform:rotate(5deg)}75%{transform:rotate(-3deg)}}
@keyframes cyclingStoryBasket{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(4deg)}}
@keyframes cyclingStoryFlower{0%,100%{transform:rotate(5deg)}50%{transform:rotate(-7deg)}}
@keyframes cyclingStoryFrameBrake{0%{transform:translateY(-2px)}55%{transform:translateY(1px)}100%{transform:translateY(0)}}
@keyframes cyclingStoryBasketBrake{0%{transform:rotate(-3deg)}55%{transform:rotate(-9deg)}100%{transform:rotate(4deg)}}
@keyframes cyclingStoryBasketSettle{0%{transform:rotate(4deg)}35%{transform:rotate(-3deg)}70%{transform:rotate(1deg)}100%{transform:rotate(0)}}
@keyframes cyclingStoryFlowerSettle{0%{transform:rotate(-6deg)}40%{transform:rotate(5deg)}75%{transform:rotate(-2deg)}100%{transform:rotate(0)}}
@keyframes cyclingStoryFrameSettle{0%{transform:translateY(1px)}35%{transform:translateY(-1.5px)}70%{transform:translateY(.5px)}100%{transform:translateY(0)}}
@keyframes cyclingStoryPark{0%{transform:translate(0,0) scale(1)}70%{transform:translate(-30px,-12px) scale(.86)}100%{transform:translate(-28px,-10px) scale(.88)}}
@keyframes cyclingStoryShadow{0%,100%{transform:scale(1)}50%{transform:scale(.94)}}
@keyframes cyclingStoryDust{0%{opacity:.8;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(-18px,-8px) scale(.3)}}
@keyframes cyclingStoryRipple{0%{transform:scale(.35);opacity:.75}100%{transform:scale(1.55);opacity:0}}
.cycling-story-bike{position:relative;width:112px;height:100px;pointer-events:none;transform-origin:56px 86px}
.cycling-story-bike[data-motion="parked"]{animation:cyclingStoryPark 520ms cubic-bezier(.22,1,.36,1) both}
.cycling-story-bike-shadow{position:absolute;left:16px;top:79px;width:80px;height:14px;border-radius:50%;background:rgba(44,38,33,.22);filter:blur(3px)}
.cycling-story-bike-tilt{position:relative;width:112px;height:100px;transform-origin:56px 86px;filter:drop-shadow(0 2px 0 #FFF5DF);transition:transform 220ms ease-in-out}
.cycling-story-bike .bike-frame{transform-box:view-box;transform-origin:54px 65px}
.cycling-story-bike [data-part="basket-sway"]{transform-box:view-box;transform-origin:80px 43px}
.cycling-story-bike .cycling-story-flower{transform-box:view-box;transform-origin:85px 29px}
.cycling-story-bike[data-motion="launch"] .bike-frame{animation:cyclingStoryLaunch 500ms 650ms ease-in-out both}
.cycling-story-bike[data-motion="launch"] [data-part="basket-sway"]{animation:cyclingStoryBasketLaunch 520ms 720ms ease-in-out both}
.cycling-story-bike[data-motion="ride"][data-riding="true"] .bike-frame{animation:cyclingStoryBob 360ms ease-in-out infinite}
.cycling-story-bike[data-motion="ride"][data-riding="true"] [data-part="basket-sway"]{animation:cyclingStoryBasket 480ms -120ms ease-in-out infinite}
.cycling-story-bike[data-motion="ride"][data-riding="true"] .cycling-story-flower{animation:cyclingStoryFlower 600ms -220ms ease-in-out infinite}
.cycling-story-bike[data-motion="brake"] .bike-frame{animation:cyclingStoryFrameBrake 300ms ease-out both}
.cycling-story-bike[data-motion="brake"] [data-part="basket-sway"]{animation:cyclingStoryBasketBrake 320ms ease-out both}
.cycling-story-bike[data-motion="parked"] .bike-frame{animation:cyclingStoryFrameSettle 550ms ease-out both}
.cycling-story-bike[data-motion="parked"] [data-part="basket-sway"]{animation:cyclingStoryBasketSettle 700ms ease-out both}
.cycling-story-bike[data-motion="parked"] .cycling-story-flower{animation:cyclingStoryFlowerSettle 820ms ease-out both}
.cycling-story-bike[data-riding="true"] .cycling-story-bike-shadow{animation:cyclingStoryShadow .3s ease-in-out infinite}
.cycling-story-dust{position:absolute;left:12px;top:78px;width:5px;height:3px;border-radius:70% 0;background:#8C8377;opacity:0;pointer-events:none}
.cycling-story-bike[data-riding="true"] .cycling-story-dust{animation:cyclingStoryDust 600ms linear infinite}
.cycling-story-dust:nth-child(2){animation-delay:-200ms!important;top:75px}.cycling-story-dust:nth-child(3){animation-delay:-400ms!important;top:81px}
.cycling-story-number{display:grid;place-items:center;width:26px;height:26px;border:2px solid #C76B3C;border-radius:50%;background:#FAF8F4;color:#2C2621;font:700 11px sans-serif;box-shadow:0 2px 8px rgba(44,38,33,.2)}
.cycling-story-arrival-icon{position:relative}.cycling-story-ripple{position:absolute;inset:0;border:2px solid #C76B3C;border-radius:50%;animation:cyclingStoryRipple 1.6s ease-out infinite}.cycling-story-ripple:nth-child(2){animation-delay:-.8s}
.cycling-story-arrival-dot{position:absolute;inset:13px;border:3px solid #FAF8F4;border-radius:50%;background:#C76B3C;box-shadow:0 2px 8px rgba(44,38,33,.35)}
.cycling-story-start-popup .leaflet-popup-content-wrapper,.cycling-story-start-popup .leaflet-popup-tip{border:1px solid #D8CFBD;background:#FAF8F4;color:#2C2621;box-shadow:0 4px 18px rgba(44,38,33,.18)}.cycling-story-start-popup .leaflet-popup-content{margin:10px 13px;font:600 12px/1.4 sans-serif}
@media(prefers-reduced-motion:reduce){.cycling-story-bike *,.cycling-story-ripple{animation:none!important;transition:none!important}.cycling-story-bike[data-motion="parked"]{animation:none!important;transform:translate(-28px,-10px) scale(.88)}}
`;

export function CyclingStoryController({ map, isOpen, mode, targetSpot, waypoints, userCoordinates, isVertical, onVerticalModeChange, onClose }: CyclingStoryControllerProps) {
  const [status, setStatus] = useState<StoryStatus>('loading');
  const [route, setRoute] = useState<CyclingRoute | null>(null);
  const [routeStops, setRouteStops] = useState<CyclingWaypoint[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const layersRef = useRef<L.Layer[]>([]);
  const frameRoute = useMemo(() => route ? lineString(route.geometry.coordinates) : null, [route]);
  const target = useMemo(() => mode === 'spot' && targetSpot ? asWaypoint(targetSpot) : null, [mode, targetSpot]);

  const clearLayers = useCallback(() => {
    if (map) {
      map.closePopup();
      layersRef.current.forEach(layer => { try { map.removeLayer(layer); } catch { /* map may already be disposed */ } });
    }
    layersRef.current = [];
  }, [map]);

  useEffect(() => {
    if (!isOpen || !map) return;
    const abortController = new AbortController();
    let introTimer = 0;
    clearLayers();
    setStatus('loading'); setRoute(null); setProgress(0); setError(null); setRouteStops([]);

    const loadRoute = async () => {
      try {
        let stops = mode === 'spot' && target ? [target] : waypoints.filter(validWaypoint);
        if (mode === 'spot' && target && !validWaypoint(target)) throw new Error('Địa điểm này chưa có tọa độ hợp lệ để tạo hành trình.');
        if (stops.length === 1) {
          const origin = userCoordinates && Number.isFinite(userCoordinates.lat) && Number.isFinite(userCoordinates.lng)
            ? { id: 'current-location', name: 'Vị trí hiện tại', lat: userCoordinates.lat, lng: userCoordinates.lng, kind: 'origin' as const }
            : await locateCurrentPosition();
          stops = [origin, ...stops];
        }
        if (stops.length < 2) throw new Error('Thêm ít nhất hai điểm có tọa độ vào Kế hoạch buổi chụp, hoặc bật GPS để đi đến một điểm chụp.');
        if (stops.length > 7) throw new Error('Mỗi hành trình tối đa 7 điểm dừng.');
        const result = await fetchCyclingRoute(stops, abortController.signal);
        if (abortController.signal.aborted) return;
        const latLngs = result.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        const future = L.polyline(latLngs, { color: '#8C8377', opacity: .45, weight: 4, dashArray: '2 3', lineCap: 'round', lineJoin: 'round', interactive: false, className: 'cycling-story-future-route' }).addTo(map);
        const halo = L.polyline([], { color: '#FAF8F4', opacity: .98, weight: 7, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(map);
        const traveled = L.polyline([], { color: '#C76B3C', opacity: 1, weight: 4, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(map);
        const bike = L.marker(latLngs[0], { icon: bikeIcon(), keyboard: false, interactive: false, zIndexOffset: 1000 }).addTo(map);
        const markers = stops.map((stop, index) => L.marker([stop.lat, stop.lng], { icon: stopIcon(index), keyboard: false, interactive: false, zIndexOffset: 700 + index }).addTo(map));
        layersRef.current = [future, halo, traveled, bike, ...markers];
        setRouteStops(stops); setRoute(result); setStatus('intro');
        const start = stops[0];
        const intro = document.createElement('div');
        intro.className = 'cycling-story-start-label';
        intro.textContent = `Bắt đầu đạp xe · ${result.distanceKm.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km (~${Math.round(result.durationMinutes)} phút)`;
        map.openPopup(L.popup({ closeButton: false, autoClose: false, closeOnClick: false, className: 'cycling-story-start-popup', offset: [0, -18] }).setLatLng([start.lat, start.lng]).setContent(intro));
        map.flyTo([start.lat, start.lng], 15.5, { animate: true, duration: 1.5, easeLinearity: .18 });
        introTimer = window.setTimeout(() => { if (!abortController.signal.aborted) setStatus('playing'); }, 1500);
      } catch (reason) {
        if (abortController.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : 'Không thể tạo tuyến xe đạp.'); setStatus('error');
      }
    };
    void loadRoute();
    return () => { abortController.abort(); window.clearTimeout(introTimer); clearLayers(); };
  }, [clearLayers, isOpen, map, mode, replayToken, target, userCoordinates, waypoints]);

  useEffect(() => {
    if (!isOpen || !map || status !== 'playing' || !route || !frameRoute || layersRef.current.length < 4) return;
    let animationFrame = 0;
    let startedAt: number | null = null;
    let smoothBearing: number | undefined;
    let lastProgressUpdate = 0;
    const duration = Math.max(4000, Math.min(8000, route.distanceKm * 1500));
    const totalKm = getCyclingStoryFrame(frameRoute, 1).distanceKm;
    const halo = layersRef.current[1] as L.Polyline;
    const traveled = layersRef.current[2] as L.Polyline;
    const bikeMarker = layersRef.current[3] as L.Marker;
    const bikeRoot = bikeMarker.getElement()?.querySelector<HTMLElement>('[data-cycling-bike]');
    if (bikeRoot) bikeRoot.dataset.riding = 'true';
    let tilt = 0; let facing = 1; let wheelPhase = 0; let lastTime: number | null = null; let previousDistance = 0;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    const animate = (now: number) => {
      if (startedAt === null) startedAt = now;
      const raw = Math.min(1, (now - startedAt) / duration);
      const frame = getCyclingStoryFrame(frameRoute, raw, smoothBearing);
      smoothBearing = frame.bearing;
      const bikeLatLng: L.LatLngExpression = [frame.position[1], frame.position[0]];
      bikeMarker.setLatLng(bikeLatLng);
      const bikeElement = bikeMarker.getElement()?.querySelector<HTMLElement>('[data-cycling-bike-rotate]');
      const dt = lastTime === null ? 0 : now - lastTime;
      const east = Math.sin(frame.bearing * Math.PI / 180);
      if (Math.abs(east) > .2) facing = east > 0 ? 1 : -1;
      const targetTilt = Math.max(-6, Math.min(6, (Math.abs(frame.bearing) - 90) * .12));
      tilt += (targetTilt - tilt) * (1 - Math.exp(-Math.min(dt, 100) / 180));
      if (bikeElement) bikeElement.style.transform = `scaleX(${facing})`;
      const remainingKm = Math.max(0, totalKm - frame.distanceKm);
      const braking = Math.max(frame.progress > .92 ? (frame.progress - .92) / .08 : 0, remainingKm < .02 ? 1 - remainingKm / .02 : 0);
      const cruiseKmPerMs = totalKm * 2 / duration;
      const speed = dt > 0 ? Math.min(1, Math.max(0, (frame.distanceKm - previousDistance) / dt / cruiseKmPerMs)) : 0;
      if (!reducedMotion?.matches && raw < 1) wheelPhase += dt / 450 * 360 * speed;
      bikeRoot?.querySelectorAll('[data-part="wheel-front"], [data-part="wheel-back"]').forEach(wheel => wheel.setAttribute('transform', `rotate(${wheelPhase % 360})`));
      bikeRoot?.querySelector('[data-part="pedal-crank"]')?.setAttribute('transform', `rotate(${wheelPhase / 2 % 360} 54 65)`);
      if (bikeRoot) {
        bikeRoot.dataset.motion = raw >= 1 ? 'parked' : braking > 0 ? 'brake' : 'ride';
        bikeRoot.querySelector('[data-part="frame-pose"]')?.setAttribute('transform', `rotate(${reducedMotion?.matches || raw >= 1 ? 0 : tilt * (1 - braking) + 4 * braking} 54 65)`);
        bikeRoot.dataset.riding = String(raw < 1 && speed > 0 && !reducedMotion?.matches);
        bikeRoot.style.transform = '';
      }
      lastTime = now; previousDistance = frame.distanceKm;
      if (frame.traveled) {
        const traveledLatLngs = (frame.traveled.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number]);
        halo.setLatLngs(traveledLatLngs); traveled.setLatLngs(traveledLatLngs);
      }
      map.panTo(bikeLatLng, { animate: false });
      if (now - lastProgressUpdate > 80 || raw >= 1) { setProgress(frame.progress); lastProgressUpdate = now; }
      if (raw >= 1) {
        map.closePopup();
        const finalStop = routeStops.at(-1);
        if (finalStop) layersRef.current.push(L.marker([finalStop.lat, finalStop.lng], { icon: stopIcon(0, true), interactive: false, keyboard: false, zIndexOffset: 1300 }).addTo(map));
        setProgress(1); setStatus('arrived'); return;
      }
      animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
    return () => { window.cancelAnimationFrame(animationFrame); if (bikeRoot) bikeRoot.dataset.riding = 'false'; };
  }, [frameRoute, isOpen, map, route, routeStops, status]);

  const handleReplay = () => { setReplayToken(token => token + 1); setStatus('loading'); };
  const handleClose = () => {
    clearLayers(); setRoute(null); setRouteStops([]); setProgress(0); setError(null); setStatus('loading'); onVerticalModeChange(false); onClose();
  };
  const handleExport = async () => {
    if (!route) return;
    setExporting(true); setError(null);
    try { await exportCyclingStoryVideo(route, routeStops); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể xuất video.'); }
    finally { setExporting(false); }
  };

  if (!isOpen) return null;
  const finalStop = routeStops.at(-1);
  return <>
    <style>{STORY_MOTION_CSS}</style>
    {route && finalStop && <ArrivalSpotPopup map={map} stop={finalStop} distanceKm={route.distanceKm} durationMinutes={route.durationMinutes} visible={status === 'arrived'} />}
    <StoryPlayerControls status={status} progress={progress} isVertical={isVertical} onReplay={handleReplay} onToggleVertical={() => onVerticalModeChange(!isVertical)} onExport={handleExport} onClose={handleClose} exporting={exporting} error={error} />
    <div className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-full border border-[#D8CFBD] bg-[#FAF8F4]/95 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E655B] shadow-lg backdrop-blur-md">
      <div>{route ? `${route.distanceKm.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km · ~${Math.round(route.durationMinutes)} phút · ${route.attribution}` : status === 'loading' ? 'Đang tìm đường xe đạp…' : 'Hành trình đạp xe'}</div>
      {route && <div className="mt-1 flex flex-wrap justify-center gap-x-2 text-[9px] font-medium normal-case tracking-normal">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">© OpenStreetMap contributors</a>
        <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer" className="underline">Sửa bản đồ</a>
        <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer" className="underline">FOSSGIS routing</a>
      </div>}
    </div>
  </>;
}