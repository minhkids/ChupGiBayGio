import React from 'react';
import { Camera, Database, Film } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E2DAD0] bg-[#ECE4D0] text-[#2C2621] pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Colophon Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border border-[#D0C4AA] bg-[#C76B3C] text-white flex items-center justify-center font-bold">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight">
                CHỤP GÌ BÂY GIỜ
              </span>
            </div>

            <p className="text-xs text-slateInk-muted font-sans leading-relaxed max-w-md">
              Bản đồ những góc chụp đẹp theo mùa, ghi lại giờ nắng, màu film và kinh nghiệm từ người chụp tại chỗ.
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

          {/* Field notes */}
          <div className="border border-[#D8CFBD] bg-[#FAF8F4] p-3 space-y-2">
            <span className="editorial-stamp text-[#C76B3C] border-[#C76B3C] block w-fit">
              GHI CHÉP THỰC ĐỊA
            </span>
            <p className="text-[11px] font-sans text-[#6E655B] leading-snug">
              Mùa hoa và ánh sáng thay đổi theo ngày. Hãy kiểm tra thông tin mới nhất trước khi lên đường.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#D8CFBD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-spec text-[#8C8377]">
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
