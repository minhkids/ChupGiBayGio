import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ExternalLink, 
  Search, 
  MessageSquare,
  Sparkles,
  MapPin
} from 'lucide-react';
import type { Spot, InspirationPost } from '../../types';
import { FacebookPostCard } from '../cards/FacebookPostCard';

interface FacebookFeedViewProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  onOpenAddPostModal: () => void;
}

export const FacebookFeedView: React.FC<FacebookFeedViewProps> = ({
  spots,
  onSelectSpot,
  onOpenAddPostModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Collect all Facebook posts from all spots
  const allFacebookPosts = useMemo(() => {
    const list: Array<{ post: InspirationPost; spot: Spot }> = [];
    spots.forEach(spot => {
      (spot.inspirationPosts || []).forEach(post => {
        if (post.platform === 'FACEBOOK') {
          list.push({ post, spot });
        }
      });
    });
    return list;
  }, [spots]);

  // Filter posts
  const filteredList = useMemo(() => {
    return allFacebookPosts.filter(({ post, spot }) => {
      if (selectedRegion !== 'all' && spot.regionId !== selectedRegion) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchCaption = (post.fullContent || post.caption).toLowerCase().includes(q);
        const matchAuthor = post.authorName.toLowerCase().includes(q);
        const matchSpot = spot.name.toLowerCase().includes(q);
        const matchCamera = (post.cameraSettings || '').toLowerCase().includes(q);
        if (!matchCaption && !matchAuthor && !matchSpot && !matchCamera) {
          return false;
        }
      }
      return true;
    });
  }, [allFacebookPosts, selectedRegion, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Facebook Group Header Banner */}
      <div className="border-2 border-slateInk bg-paper-card shadow-hard overflow-hidden">
        {/* Group Cover */}
        <div className="relative h-44 sm:h-56 bg-gradient-to-r from-slateInk to-slateInk-soft overflow-hidden">
          <img
            src="/facebook_media/post_11_0.jpg"
            alt="Aphoto Community Banner"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slateInk via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 bg-[#1877F2] text-white font-mono-spec font-bold text-xs px-2.5 py-1 border border-white flex items-center shadow-hard">
            <span className="w-2 h-2 rounded-full bg-white mr-1.5 animate-pulse" />
            FACEBOOK COMMUNITY GROUP
          </div>
        </div>

        {/* Group Info Bar */}
        <div className="p-4 sm:p-6 bg-paper-light border-t border-slateInk flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-[#1877F2] text-white rounded-full flex items-center justify-center font-bold text-sm">
                f
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slateInk">
                Hội Đam Mê Nhiếp Ảnh - Aphoto
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slateInk-muted font-sans">
              Nhóm chia sẻ ảnh, góc chụp thực tế, giờ vàng và kinh nghiệm tác nghiệp của cộng đồng nhiếp ảnh Việt Nam.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono-spec text-slateInk-muted">
              <span className="flex items-center text-slateInk font-semibold">
                <Users className="w-3.5 h-3.5 mr-1 text-[#1877F2]" />
                Nhóm Công Khai • 520.000+ thành viên
              </span>
              <span>•</span>
              <span className="text-terracotta font-semibold">
                ID: 528320614043286
              </span>
            </div>
          </div>

          {/* Group Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddPostModal}
              className="px-4 py-2 border-2 border-slateInk bg-terracotta text-white font-mono-spec text-xs font-bold shadow-hard hover:bg-terracotta-dark flex items-center transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Bóc tách nội dung bài đăng
            </button>

            <a
              href="https://www.facebook.com/groups/528320614043286"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-slateInk bg-[#1877F2] text-white font-mono-spec text-xs font-bold shadow-hard hover:bg-[#166fe5] flex items-center transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Truy Cập Nhóm Facebook
            </a>
          </div>
        </div>

        {/* Pipeline Architecture Indicator Bar */}
        <div className="bg-paper-warm border-t border-slateInk px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-spec">
          <div className="flex items-center space-x-2 text-slateInk">
            <span className="w-2 h-2 rounded-full bg-olive animate-pulse" />
            <span className="font-bold">CẬP NHẬT ĐỊA ĐIỂM THEO KHU VỰC</span>
            <span className="text-slateInk-muted">•</span>
            <span className="text-slateInk-muted">Thông tin do cộng đồng đóng góp</span>
          </div>

          <div className="flex items-center space-x-2 text-slateInk-muted">
            <span className="flex items-center text-slateInk font-semibold">
              <MapPin className="w-3 h-3 mr-0.5 text-terracotta" />
              BBox: [105.7, 20.9, 106.0, 21.1]
            </span>
            <span>•</span>
            <span className="text-olive font-bold">Chuẩn hóa tên gọi địa phương</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Facebook Posts */}
      <div className="bg-paper-warm border border-slateInk p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-hard">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slateInk-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung bài viết, tác giả, máy ảnh, loài hoa..."
            className="w-full pl-9 pr-3 py-1.5 bg-paper-light border border-slateInk text-xs font-sans focus:outline-none"
          />
        </div>

        {/* Region filter */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 font-mono-spec text-xs">
          <span className="text-slateInk-muted mr-1.5">LỌC KHU VỰC:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'hanoi', label: 'Hà Nội' },
            { id: 'hcm', label: 'TP.HCM' },
            { id: 'dalat', label: 'Đà Lạt' },
            { id: 'sapa', label: 'Sa Pa' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={`px-2.5 py-1 border transition-all ${
                selectedRegion === r.id
                  ? 'border-slateInk bg-slateInk text-white font-bold'
                  : 'border-paper-border bg-paper-light text-slateInk hover:border-slateInk'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facebook Feed Posts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slateInk pb-2 font-mono-spec text-xs">
          <span className="font-bold text-slateInk uppercase">
            BÀI VIẾT NỔI BẬT ({filteredList.length} BÀI ĐĂNG TỪ GROUP)
          </span>
          <span className="text-slateInk-muted">
            Tự động đồng bộ và liên kết theo từng tọa độ check-in
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center bg-paper-warm border border-slateInk space-y-2">
            <MessageSquare className="w-8 h-8 text-terracotta mx-auto" />
            <p className="font-editorial text-xl font-bold text-slateInk">Chưa có bài viết nào khớp với từ khóa</p>
            <p className="text-xs text-slateInk-muted font-sans">
              Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút "Gắn Link Bài Post Mới" để thêm bài viết vào hệ thống.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredList.map(({ post, spot }) => (
              <FacebookPostCard
                key={post.id}
                post={post}
                spot={spot}
                onSelectSpot={onSelectSpot}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
