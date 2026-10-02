import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Spot } from '../types';
import { REGIONS } from '../data/regions';
import { getStatusBadgeInfo } from '../utils/season';
import { Compass, Layers, Key, Check, ExternalLink } from 'lucide-react';

interface SpotMapProps {
  spots: Spot[];
  activeRegionId: string;
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  userCoords: { lat: number; lng: number } | null;
  className?: string;
}

type TileProvider = 'osm' | 'esri' | 'carto';

export const SpotMap: React.FC<SpotMapProps> = ({
  spots,
  activeRegionId,
  selectedSpot,
  onSelectSpot,
  userCoords,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const CARTO_DEFAULT_KEY = 'cb1_469u_1_6a12a7c07d0c9adf82fe0c70';

  const [tileProvider, setTileProvider] = useState<TileProvider>('carto');
  const [cartoApiKey, setCartoApiKey] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('carto_api_key');
      if (!stored) {
        localStorage.setItem('carto_api_key', CARTO_DEFAULT_KEY);
        return CARTO_DEFAULT_KEY;
      }
      return stored;
    } catch {
      return CARTO_DEFAULT_KEY;
    }
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(cartoApiKey);
  const [keySaved, setKeySaved] = useState(false);

  // Helper to get tile configuration
  const getTileConfig = (provider: TileProvider, key: string) => {
    switch (provider) {
      case 'esri':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          options: {
            maxZoom: 16,
            attribution: '&copy; Esri &mdash; World Light Gray'
          }
        };
      case 'carto':
        return {
          url: key 
            ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${key}`
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          options: {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; CARTO'
          }
        };
      case 'osm':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 19,
            subdomains: 'abc',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          }
        };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center must default to Hanoi (lat: 21.0378, lng: 105.8396) as per Google Maps Layout Rules
    const hanoiRegion = REGIONS.find(r => r.id === 'hanoi') || { lat: 21.0378, lng: 105.8396, zoom: 13.5 };
    const initialRegion = (activeRegionId && activeRegionId !== 'all')
      ? (REGIONS.find(r => r.id === activeRegionId) || hanoiRegion)
      : hanoiRegion;

    const map = L.map(mapContainerRef.current, {
      center: [initialRegion.lat, initialRegion.lng],
      zoom: initialRegion.zoom || 13.5,
      zoomControl: false,
      attributionControl: false
    });

    // Default clean OpenStreetMap tile layer (100% free, no watermark)
    const { url, options } = getTileConfig('osm', cartoApiKey);
    const tileLayer = L.tileLayer(url, options).addTo(map);
    tileLayerRef.current = tileLayer;

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; Chụp Gì Bây Giờ')
      .addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Observe container resizing to automatically invalidateSize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Provider
  const handleSwitchProvider = (provider: TileProvider) => {
    setTileProvider(provider);
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const { url, options } = getTileConfig(provider, cartoApiKey);
    const newLayer = L.tileLayer(url, options).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  };

  // Save Carto API Key
  const handleSaveApiKey = () => {
    const cleanKey = tempKeyInput.trim();
    setCartoApiKey(cleanKey);
    try {
      localStorage.setItem('carto_api_key', cleanKey);
    } catch (e) {
      console.error(e);
    }
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 1200);

    // If currently on Carto or switching to Carto
    if (mapInstanceRef.current) {
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
      }
      const { url, options } = getTileConfig('carto', cleanKey);
      const newLayer = L.tileLayer(url, options).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
      setTileProvider('carto');
    }
  };

  // Update Region Center
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const region = REGIONS.find(r => r.id === activeRegionId);
    if (region) {
      mapInstanceRef.current.flyTo([region.lat, region.lng], region.zoom, {
        duration: 1.2
      });
    }
  }, [activeRegionId]);

  // Update Markers when spots or selection change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    spots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;
      const status = spot.seasonalTrend.status;
      const statusInfo = getStatusBadgeInfo(status, spot.seasonalTrend.daysLeftInPeak);

      let markerBg = '#1C1D1F';
      let pulseRing = '';

      if (status === 'PEAK') {
        markerBg = '#C85A32'; // Terracotta
        pulseRing = '<div class="absolute -inset-1.5 border-2 border-terracotta rounded-none animate-ping opacity-60 pointer-events-none"></div>';
      } else if (status === 'ENDING_SOON') {
        markerBg = '#E09F3E'; // Amber
      } else {
        markerBg = '#4A5844'; // Olive
      }

      const iconHtml = `
        <div class="relative cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : 'z-20'}">
          ${pulseRing}
          <div style="background-color: ${markerBg}; border: 1.5px solid #1C1D1F; box-shadow: 2px 2px 0px #1C1D1F;" 
               class="w-7 h-7 flex items-center justify-center text-white font-mono text-[11px] font-bold">
            ${status === 'PEAK' ? '★' : status === 'ENDING_SOON' ? '!' : '+'}
          </div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slateInk mx-auto"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: iconHtml,
        iconSize: [28, 33],
        iconAnchor: [14, 33],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon });

      // Editorial Viewfinder Popup
      const popupContent = `
        <div style="width: 250px; font-family: 'Manrope', system-ui, sans-serif;" class="overflow-hidden">
          <div style="position: relative; height: 120px; background-color: #1C1D1F;">
            <img src="${spot.coverImageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${spot.name}" />
            <span style="position: absolute; top: 6px; left: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; background: ${markerBg}; color: #fff; padding: 2px 5px; border: 1px solid #1C1D1F;">
              ${statusInfo.label}
            </span>
          </div>
          <div style="padding: 10px; background-color: #FBF9F5;">
            <div style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #C85A32; font-weight: 700; text-transform: uppercase;">
              ${spot.seasonalTrend.trendTitle}
            </div>
            <div style="font-family: 'Fraunces', Georgia, serif; font-weight: 700; font-size: 14px; color: #1C1D1F; margin: 3px 0; line-height: 1.2;">
              ${spot.name}
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
              ☀️ ${spot.bestTimeDescription}
            </div>
            <button id="view-spot-${spot.id}" style="width: 100%; background-color: #1C1D1F; color: #fff; border: 1px solid #1C1D1F; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; padding: 5px 0; cursor: pointer;">
              XEM HỒ SƠ ĐIỂM CHỤP →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        maxWidth: 260
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-spot-${spot.id}`);
        if (btn) {
          btn.onclick = () => onSelectSpot(spot);
        }
      });

      marker.addTo(markersLayerRef.current!);
    });

    // Handle user location marker
    if (userCoords && mapInstanceRef.current) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative w-5 h-5 flex items-center justify-center">
            <span class="absolute w-full h-full rounded-full bg-blue-500 animate-ping opacity-75"></span>
            <span class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-hard"></span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .bindPopup(`<strong style="font-family: 'IBM Plex Mono', monospace">Vị trí của bạn</strong>`)
        .addTo(mapInstanceRef.current);
    }
  }, [spots, selectedSpot, userCoords, onSelectSpot]);

  // Recenter to selected spot if changed
  useEffect(() => {
    if (selectedSpot && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedSpot.lat, selectedSpot.lng], 14, {
        duration: 0.8
      });
    }
  }, [selectedSpot]);

  return (
    <div className={`relative w-full h-full bg-neutral-100 overflow-hidden ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Layer & Provider Switcher - positioned at bottom right */}
      <div className="absolute bottom-4 right-14 z-20 hidden sm:flex items-center space-x-1 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-1 shadow-md font-mono-spec text-xs">
        <button
          type="button"
          onClick={() => handleSwitchProvider('osm')}
          className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
            tileProvider === 'osm'
              ? 'bg-neutral-900 text-white font-bold'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="OpenStreetMap (Miễn phí 100%, không cần Key)"
        >
          OSM
        </button>

        <button
          type="button"
          onClick={() => handleSwitchProvider('esri')}
          className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
            tileProvider === 'esri'
              ? 'bg-neutral-900 text-white font-bold'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Esri Light Gray Canvas (Tối giản phong cách báo in)"
        >
          Esri Gray
        </button>

        <button
          type="button"
          onClick={() => handleSwitchProvider('carto')}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center text-xs ${
            tileProvider === 'carto'
              ? 'bg-terracotta text-white font-bold'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="CARTO Voyager (Yêu cầu API Key miễn phí)"
        >
          CARTO
          {!cartoApiKey && <span className="ml-1 text-[9px] text-amberFilm font-bold">●</span>}
        </button>

        <button
          type="button"
          onClick={() => setShowKeyModal(true)}
          className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-terracotta transition-colors border-l border-neutral-200 dark:border-neutral-700 pl-1.5"
          title="Cài đặt CARTO API Key"
        >
          <Key className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Legend Overlay - bottom right expandable or compact */}
      <div className="absolute bottom-16 right-14 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 p-2.5 rounded-xl shadow-md font-mono-spec text-[11px] space-y-1.5 hidden md:block max-w-[200px]">
        <div className="font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-700 pb-1 uppercase tracking-wider flex items-center">
          <Layers className="w-3 h-3 mr-1 text-terracotta" />
          CHÚ THÍCH GHIM
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-terracotta rounded-none text-white text-[9px] flex items-center justify-center font-bold">★</span>
          <span className="text-neutral-600 dark:text-neutral-300">Đang Rộ (Peak)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-amberFilm rounded-none text-neutral-900 text-[9px] flex items-center justify-center font-bold">!</span>
          <span className="text-neutral-600 dark:text-neutral-300">Sắp Hết Mùa</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-olive rounded-none text-white text-[9px] flex items-center justify-center font-bold">+</span>
          <span className="text-neutral-600 dark:text-neutral-300">Quanh Năm</span>
        </div>
      </div>

      {/* Floating Center on Region / Location Indicator */}
      <div className="absolute bottom-3 left-3 z-30 bg-paper-light/95 border border-slateInk px-3 py-1.5 shadow-hard font-mono-spec text-xs flex items-center space-x-2">
        <Compass className="w-3.5 h-3.5 text-terracotta" />
        <span className="font-bold text-slateInk uppercase">POSTGIS LAYER ({tileProvider.toUpperCase()})</span>
        <span className="text-slateInk-muted">•</span>
        <span className="text-slateInk">{spots.length} ghim hiển thị</span>
      </div>

      {/* Modal: Setup CARTO API Key */}
      {showKeyModal && (
        <div 
          className="absolute inset-0 z-50 bg-slateInk/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowKeyModal(false)}
        >
          <div 
            className="bg-paper-light border-2 border-slateInk p-5 shadow-hard-lg max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slateInk pb-2">
              <span className="text-[10px] font-mono-spec font-bold text-terracotta uppercase">CARTO BASEMAP SERVICE</span>
              <h3 className="font-editorial text-xl font-bold text-slateInk">Cài Đặt CARTO API Key</h3>
            </div>

            <p className="text-xs text-slateInk-muted font-sans leading-relaxed">
              Từ cuối tháng 08/2026, CARTO yêu cầu API Key để truy cập các tile bản đồ Voyager. 
              Bạn có thể lấy <strong>API Key hoàn toàn miễn phí</strong> (hạn mức 5.000.000 lượt/tháng, không cần thẻ tín dụng).
            </p>

            <a
              href="https://carto.com/basemaps/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-mono-spec font-bold text-terracotta hover:underline"
            >
              <span>Lấy API Key miễn phí tại: carto.com/basemaps/apikey</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>

            <div>
              <label className="text-xs font-mono-spec font-bold text-slateInk block mb-1">
                NHẬP CARTO API KEY CỦA BẠN:
              </label>
              <input
                type="text"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="Dán mã API Key vào đây..."
                className="w-full p-2 bg-paper-warm border border-slateInk text-xs font-mono-spec focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-paper-border font-mono-spec text-xs">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 border border-slateInk bg-paper-warm text-slateInk hover:bg-paper-light"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 border border-slateInk bg-terracotta text-white font-bold shadow-hard hover:bg-terracotta-dark flex items-center"
              >
                {keySaved ? <Check className="w-3.5 h-3.5 mr-1 text-white" /> : null}
                {keySaved ? 'Đã Lưu!' : 'Lưu & Kích Hoạt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
