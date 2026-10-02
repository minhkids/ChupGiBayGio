import React from 'react';
import { Camera, Database, Film } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t-2 border-slateInk bg-paper-warm text-slateInk pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Colophon Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border border-slateInk bg-terracotta text-white flex items-center justify-center font-bold">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight">
                CHỤP GÌ BÂY GIỜ
              </span>
            </div>

            <p className="text-xs text-slateInk-muted font-sans leading-relaxed max-w-md">
              Nền tảng tra cứu, bản đồ hóa địa điểm check-in & chụp ảnh theo mùa, thời gian thực và xu hướng tại Việt Nam. Xây dựng dựa trên nguyên tắc thiết kế <strong>Anti-AI Editorial Aesthetic</strong> mang hơi thở của một tạp chí ảnh in độc lập (Photo Zine).
            </p>

            <div className="flex items-center space-x-3 text-xs font-mono-spec text-slateInk-muted">
              <span className="flex items-center">
                <Database className="w-3.5 h-3.5 mr-1 text-terracotta" />
                PostGIS Spatial Engine
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Film className="w-3.5 h-3.5 mr-1 text-amberFilm" />
                Kodak & Fuji Presets
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs font-sans">
            <h4 className="font-mono-spec font-bold text-slateInk uppercase tracking-wider text-[11px]">
              TIÊU ĐIỂM THEO MÙA
            </h4>
            <ul className="space-y-1.5 text-slateInk-muted">
              <li><span className="text-terracotta font-semibold">T.11:</span> Cúc họa mi Bãi Đá Sông Hồng</li>
              <li><span className="text-amberFilm font-semibold">T.11:</span> Đồi cỏ hồng & Dã quỳ Đà Lạt</li>
              <li><span className="text-terracotta font-semibold">T.12:</span> Giáng Sinh phố Hàng Mã Hà Nội</li>
              <li><span className="text-slateInk font-semibold">T.12:</span> Mai anh đào Đồi Chè Ô Long Sa Pa</li>
              <li><span className="text-slateInk font-semibold">T.05:</span> Sen bách diệp Hồ Tây Hà Nội</li>
            </ul>
          </div>

          {/* Anti-AI Design Principle box */}
          <div className="border border-slateInk bg-paper-light p-3 space-y-2 shadow-hard">
            <span className="editorial-stamp text-terracotta border-terracotta block w-fit">
              ANTI-AI DIRECTIVE
            </span>
            <p className="text-[11px] font-sans text-slateInk leading-snug">
              Kiên quyết tránh các khuôn mẫu AI thông thường: bo tròn viên thuốc, đổ bóng mờ mịt và màu gradient tím neon. Áp dụng viền mảnh sắc nét, màu giấy in ngà ấm và typography serif kinh điển.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-spec text-slateInk-muted">
          <div>
            &copy; 2026 CHUPGIBAYGIO.COM • PHÁT TRIỂN VÌ CỘNG ĐỒNG NHIẾP ẢNH VIỆT NAM
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>LAT/LNG WGS84: 16.0544°N, 108.2022°E</span>
            <span>•</span>
            <span>PHOTO ZINE EDITION</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
