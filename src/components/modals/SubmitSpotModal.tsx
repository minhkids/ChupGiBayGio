import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { REGIONS } from '../../data/regions';
import type { Spot, ConceptTag } from '../../types';
import { CONCEPT_METADATA } from '../../utils/season';

interface SubmitSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNewSpot: (newSpot: Spot) => void;
}

export const SubmitSpotModal: React.FC<SubmitSpotModalProps> = ({
  isOpen,
  onClose,
  onSubmitNewSpot
}) => {
  const [name, setName] = useState('');
  const [regionId, setRegionId] = useState('hanoi');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('21.0285');
  const [lng, setLng] = useState('105.8542');
  const [trendTitle, setTrendTitle] = useState('');
  const [startMonth, setStartMonth] = useState(10);
  const [endMonth, setEndMonth] = useState(12);
  const [bestTime, setBestTime] = useState<'GOLDEN_HOUR_MORNING' | 'SUNSET' | 'DAYLIGHT' | 'NIGHT'>('SUNSET');
  const [bestTimeDesc, setBestTimeDesc] = useState('');
  const [ticketPrice, setTicketPrice] = useState('Miễn phí');
  const [cameraPolicy, setCameraPolicy] = useState('Chụp tự do không phụ thu máy ảnh cơ');
  const [lenses, setLenses] = useState('35mm, 85mm');
  const [coverUrl, setCoverUrl] = useState('/facebook_media/post_0_0.jpg');
  const [description, setDescription] = useState('');
  const [selectedConcepts, setSelectedConcepts] = useState<ConceptTag[]>(['HOA_CO', 'VINTAGE']);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const newSpot: Spot = {
      id: `spot-community-${Date.now()}`,
      regionId,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      address: address.trim(),
      lat: parseFloat(lat) || 21.0285,
      lng: parseFloat(lng) || 105.8542,
      bestTimeOfDay: bestTime,
      bestTimeDescription: bestTimeDesc || 'Khung giờ hoàng hôn (16:30 - 17:45)',
      lightingNotes: 'Ánh sáng tự nhiên thuận lợi cho chân dung.',
      sunOrientation: 'Mặt trời lặn hướng Tây Nam.',
      costType: ticketPrice.toLowerCase().includes('miễn') ? 'FREE' : 'TICKET',
      ticketPriceRange: ticketPrice,
      cameraFeePolicy: cameraPolicy,
      recommendedLenses: lenses.split(',').map(s => s.trim()),
      recommendedOutfits: ['Trắng kem', 'Vintage nâu đất', 'Áo dài'],
      colorPalette: ['#C85A32', '#F4EFE6', '#1C1D1F', '#E09F3E'],
      crowdLevelByHour: { morning: 'Vắng', noon: 'Vắng', afternoon: 'Trung bình', evening: 'Đông' },
      coverImageUrl: coverUrl || '/facebook_media/post_0_0.jpg',
      galleryUrls: [coverUrl],
      description: description.trim() || 'Địa điểm chụp ảnh check-in mới được cộng đồng đóng góp.',
      photographyTips: ['Nên đến sớm đón giờ vàng để có ánh sáng tốt nhất.'],
      seasonalTrend: {
        id: `trend-${Date.now()}`,
        trendTitle: trendTitle.trim() || 'Điểm Chụp Theo Mùa Mới',
        startMonth: Number(startMonth),
        endMonth: Number(endMonth),
        status: 'PEAK',
        bloomPercentage: 90,
        conceptTags: selectedConcepts,
        isTrending: true,
        trendScore: 85
      },
      inspirationPosts: [],
      recentReports: [],
      savesCount: 1
    };

    onSubmitNewSpot(newSpot);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  const toggleConcept = (c: ConceptTag) => {
    setSelectedConcepts(prev => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] overflow-y-auto bg-slateInk/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-paper-light border-2 border-slateInk w-full max-w-2xl shadow-hard-lg overflow-hidden reticle-corner reticle-tl reticle-br flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slateInk bg-paper-warm px-4 py-2.5 flex items-center justify-between font-mono-spec text-xs">
          <span className="font-bold text-terracotta">ĐỀ XUẤT ĐỊA ĐIỂM CHỤP MỚI (CROWDSOURCING)</span>
          <button onClick={onClose} className="w-6 h-6 border border-slateInk bg-paper-light flex items-center justify-center hover:bg-slateInk hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-terracotta mx-auto" />
            <h3 className="font-editorial text-2xl font-bold text-slateInk">Đề xuất thành công!</h3>
            <p className="text-xs text-slateInk-muted font-sans">
              Địa điểm của bạn đã được thêm vào bản đồ Chụp Gì Bây Giờ để mọi người cùng tra cứu.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-sans">
            
            {/* Row 1: Name & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  TÊN ĐỊA ĐIỂM / TỌA ĐỘ CHECK-IN: *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Cánh Đồng Hoa Tam Giác Mạch Hà Giang"
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 focus:border-slateInk text-sm font-sans focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  KHU VỰC: *
                </label>
                <select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 focus:border-slateInk text-xs font-mono-spec focus:outline-none"
                >
                  {REGIONS.filter(r => r.id !== 'all').map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                  <option value="khac">Tỉnh thành khác</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                ĐỊA CHỈ CHI TIẾT (HOẶC HƯỚNG DẪN ĐƯỜNG ĐI): *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Bản Lũng Cú, Đồng Văn, Hà Giang"
                className="w-full p-2 bg-paper-warm border border-slateInk/40 focus:border-slateInk text-sm font-sans focus:outline-none"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  VĨ ĐỘ (LATITUDE):
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="21.0285"
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-mono-spec"
                />
              </div>
              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  KINH ĐỘ (LONGITUDE):
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="105.8542"
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-mono-spec"
                />
              </div>
            </div>

            {/* Seasonality: Start Month & End Month */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  TIÊU ĐỀ MÙA ĐẸP NHẤT:
                </label>
                <input
                  type="text"
                  value={trendTitle}
                  onChange={(e) => setTrendTitle(e.target.value)}
                  placeholder="VD: Mùa Hoa Nở Hồng Rực"
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-sans"
                />
              </div>

              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  THÁNG BẮT ĐẦU:
                </label>
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(Number(e.target.value))}
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-mono-spec"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  THÁNG KẾT THÚC:
                </label>
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(Number(e.target.value))}
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-mono-spec"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photography specs: Time & Lenses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  KHUNG GIỜ ĐẸP NHẤT (GOLDEN HOUR):
                </label>
                <select
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value as any)}
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-mono-spec"
                >
                  <option value="GOLDEN_HOUR_MORNING">Bình minh (5:30 - 7:30)</option>
                  <option value="SUNSET">Hoàng hôn (16:30 - 18:00)</option>
                  <option value="DAYLIGHT">Ban ngày (9:00 - 15:30)</option>
                  <option value="NIGHT">Chập tối / Đêm Flash</option>
                </select>
              </div>

              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  CHI TIẾT GIỜ NẮNG ĐẸP:
                </label>
                <input
                  type="text"
                  value={bestTimeDesc}
                  onChange={(e) => setBestTimeDesc(e.target.value)}
                  placeholder="VD: Chiều 16h - 17h30 đón nắng xiên ấm áp"
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-sans"
                />
              </div>
            </div>

            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                ỐNG KÍNH KHUYÊN DÙNG:
              </label>
              <input
                type="text"
                value={lenses}
                onChange={(e) => setLenses(e.target.value)}
                placeholder="35mm, 50mm, 85mm"
                className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-mono-spec"
              />
            </div>

            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                MÔ TẢ BỐI CẢNH & KINH NGHIỆM CHỤP:
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Không gian thoáng đãng, hoa nở rực rỡ, rất thích hợp cho phong cách vintage..."
                className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-sans"
              />
            </div>

            {/* Ticket & Camera Policy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  GIÁ VÉ / CHI PHÍ:
                </label>
                <input
                  type="text"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="VD: 50.000đ hoặc Miễn phí"
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-sans"
                />
              </div>

              <div>
                <label className="font-mono-spec font-bold text-slateInk block mb-1">
                  QUY ĐỊNH MÁY ẢNH CƠ:
                </label>
                <input
                  type="text"
                  value={cameraPolicy}
                  onChange={(e) => setCameraPolicy(e.target.value)}
                  placeholder="VD: Chụp tự do / Phụ thu 100k máy cơ"
                  className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-sans"
                />
              </div>
            </div>

            {/* Concept tags */}
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                CONCEPT & PHONG CÁCH:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(CONCEPT_METADATA) as ConceptTag[]).map((tagKey) => {
                  const isSelected = selectedConcepts.includes(tagKey);
                  return (
                    <button
                      key={tagKey}
                      type="button"
                      onClick={() => toggleConcept(tagKey)}
                      className={`px-2 py-1 text-xs border font-mono-spec transition-all ${
                        isSelected
                          ? 'border-terracotta bg-terracotta text-white font-bold'
                          : 'border-paper-border bg-paper-warm text-slateInk hover:border-slateInk'
                      }`}
                    >
                      {CONCEPT_METADATA[tagKey].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cover image URL */}
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                LINK ẢNH COVER MINH HỌA:
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 bg-paper-warm border border-slateInk/40 text-xs font-mono-spec"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-paper-border flex justify-end space-x-2 font-mono-spec">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border border-slateInk bg-paper-warm text-slateInk hover:bg-paper-light"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 border border-slateInk bg-terracotta text-white font-bold shadow-hard hover:bg-terracotta-dark flex items-center"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Hoàn Tất Đề Xuất
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
