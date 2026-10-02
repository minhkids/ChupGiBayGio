import React, { useState } from 'react';
import { Shirt, MapPin, Phone, ExternalLink, Camera } from 'lucide-react';
import type { Spot } from '../types';
import { db } from '../services/db';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { PoseLibraryModal } from './PoseLibraryModal';

interface OutfitAdvisorCardProps {
  spot: Spot;
}

export const OutfitAdvisorCard: React.FC<OutfitAdvisorCardProps> = ({ spot }) => {
  const [showLibrary, setShowLibrary] = useState(false);

  // Find nearest outfit shop
  const outfitShops = db.rentalShops.getAll().filter(s => s.type === 'OUTFIT').map(shop => ({
    ...shop,
    distance: calculateDistanceKm(spot.lat, spot.lng, shop.lat, shop.lng)
  })).sort((a, b) => a.distance - b.distance);

  const nearestShop = outfitShops[0];

  return (
    <div className="rounded-2xl bg-neutral-50/80 p-4 border border-neutral-200/70 space-y-4">
      <div className="flex items-center space-x-2 text-xs font-mono-spec font-bold uppercase text-slateInk border-b border-paper-border pb-2">
        <Shirt className="w-4 h-4 text-terracotta" />
        <span>GỢI Ý TRANG PHỤC & NƠI THUÊ (OUTFIT ADVISOR)</span>
      </div>

      <div className="space-y-3">
        {/* Concept & Outfit Recommendations */}
        <div>
          <span className="text-xs font-mono-spec font-bold text-slateInk block mb-1">
            Concept trang phục đề xuất:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {spot.recommendedOutfits.map((outfit, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-white border border-paper-border rounded-lg text-xs text-slateInk font-sans">
                {outfit}
              </span>
            ))}
          </div>
        </div>

        {/* Color Palette & Pose Camera Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono-spec font-bold text-slateInk">
              Bảng màu (Palette) trang phục nên mặc:
            </span>
            <button
              onClick={() => setShowLibrary(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-terracotta text-white rounded-xl hover:bg-terracotta-dark transition-colors text-xs font-bold"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Thư Viện Dáng Chụp</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {spot.colorPalette.map((hex, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-neutral-300"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        {/* Rental Shop Recommendation */}
        {nearestShop && (
          <div className="mt-4 pt-3 border-t border-neutral-200/70">
            <span className="text-xs font-mono-spec font-bold text-slateInk block mb-2">
              Điểm thuê trang phục uy tín gần nhất:
            </span>
            <div className="bg-white rounded-xl p-3 border border-neutral-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slateInk">{nearestShop.name}</h4>
                <div className="flex items-center text-xs text-slateInk-muted mt-0.5">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{nearestShop.address} • Cách {formatDistance(nearestShop.distance)}</span>
                </div>
                <div className="text-xs font-medium text-terracotta mt-1">
                  Giá dự kiến: {nearestShop.priceRange}
                </div>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <a
                  href={`tel:${nearestShop.phone}`}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-slateInk transition-colors"
                  title="Gọi điện"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={nearestShop.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-1.5 rounded-xl bg-terracotta text-white hover:bg-terracotta-dark text-xs font-medium transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Mở bản đồ
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLibrary && <PoseLibraryModal onClose={() => setShowLibrary(false)} />}
    </div>
  );
};
