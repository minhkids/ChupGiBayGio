import React from 'react';
import { Camera, MapPin, Phone, ExternalLink } from 'lucide-react';
import type { Spot } from '../types';
import { db } from '../services/db';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

interface CameraGearAdvisorCardProps {
  spot: Spot;
}

export const CameraGearAdvisorCard: React.FC<CameraGearAdvisorCardProps> = ({ spot }) => {
  // Find nearest camera shop
  const cameraShops = db.rentalShops.getAll().filter(s => s.type === 'CAMERA').map(shop => ({
    ...shop,
    distance: calculateDistanceKm(spot.lat, spot.lng, shop.lat, shop.lng)
  })).sort((a, b) => a.distance - b.distance);

  const nearestShop = cameraShops[0];

  return (
    <div className="rounded-2xl bg-neutral-50/80 p-4 border border-neutral-200/70 space-y-4">
      <div className="flex items-center space-x-2 text-xs font-mono-spec font-bold uppercase text-slateInk border-b border-paper-border pb-2">
        <Camera className="w-4 h-4 text-terracotta" />
        <span>GỢI Ý MÁY ẢNH & NƠI THUÊ (GEAR ADVISOR)</span>
      </div>

      <div className="space-y-3">
        {/* Recommended Gear & Tips */}
        <div>
          <span className="text-xs font-mono-spec font-bold text-slateInk block mb-1">
            Combo Máy & Ống kính khuyên dùng:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
            {spot.recommendedLenses.map((lens, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-white border border-paper-border rounded-lg text-xs font-semibold text-slateInk shadow-sm">
                {lens}
              </span>
            ))}
          </div>
          <span className="text-xs font-mono-spec font-bold text-slateInk block mb-1 mt-3">
            Quy định máy ảnh & Phí chụp:
          </span>
          <div className="text-xs text-slateInk font-sans bg-white p-2.5 rounded-xl border border-neutral-200">
            <span className="font-semibold block text-terracotta mb-0.5">{spot.ticketPriceRange}</span>
            {spot.cameraFeePolicy}
          </div>
        </div>

        {/* Rental Shop Recommendation */}
        {nearestShop && (
          <div className="mt-4 pt-3 border-t border-neutral-200/70">
            <span className="text-xs font-mono-spec font-bold text-slateInk block mb-2">
              Điểm thuê thiết bị uy tín gần nhất:
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
                  className="flex items-center px-3 py-1.5 rounded-xl bg-slateInk text-white hover:bg-slateInk-soft text-xs font-medium transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Mở bản đồ
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
