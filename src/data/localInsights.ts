import type { InsightCategory, LocalInsight, Spot } from '../types';

/**
 * Ưu đãi & xu hướng thuần chuyên môn NHIẾP ẢNH quanh các điểm chụp:
 * - FILM: Cuộn film chụp ảnh đang sale/giảm giá (Kodak, Fuji, CineStill, Ilford...)
 * - LAB: Lab tráng & scan film ưu đãi (combo tráng scan, trả file nhanh)
 * - OUTFIT: Trang phục concept đang hot ở địa điểm này (Áo dài trắng, len vintage, nàng thơ...)
 * - RENTAL: Thuê máy ảnh & lens chân dung gần điểm chụp
 * - PROP: Đạo cụ chụp ảnh đang hot (cúc họa mi cầm tay, giỏ cói, nón lá, dù trong suốt...)
 */
export const LOCAL_INSIGHTS: LocalInsight[] = [
  // ═════════════════ HÀ NỘI ═════════════════
  {
    id: 'ins-hn-film-1',
    regionId: 'hanoi',
    kind: 'DEAL',
    category: 'FILM',
    title: 'Kodak Gold 200 (36 kiểu) — Giảm giá đón mùa hoa',
    detail: 'Dòng film tone ấm nịnh da, hạt mịn, bắt nắng vàng thu Hà Nội cực đẹp. Mua từ 2 cuộn được trợ giá.',
    placeName: 'NexShop Hàng Bài',
    areaLabel: 'Hoàn Kiếm · Cách Hồ Gươm 300m',
    nearKeywords: ['hoàn kiếm', 'phan đình phùng', 'hồ gươm', 'hàng bài'],
    priceNow: '210.000đ / cuộn',
    priceOld: '260.000đ',
    discountLabel: '-19%',
    hotScore: 95,
    validUntil: '2026-11-30',
    validNote: 'Đang có sẵn hàng date xa',
    sourceLabel: 'NexShop Film Store',
  },
  {
    id: 'ins-hn-film-2',
    regionId: 'hanoi',
    kind: 'DEAL',
    category: 'FILM',
    title: 'Combo 3 cuộn Kodak ColorPlus 200 + Tặng túi bảo quản',
    detail: 'Cuộn film phổ thông kinh điển cho người mới chơi film chụp ngoại cảnh mùa thu đông.',
    placeName: 'Tiệm Film Cũ Hà Nội',
    areaLabel: 'Đống Đa · Thái Hà',
    nearKeywords: ['đống đa', 'ba đình', 'phan đình phùng', 'âu cơ'],
    priceNow: '540.000đ / pack 3',
    priceOld: '630.000đ',
    discountLabel: '-15%',
    hotScore: 88,
    validUntil: '2026-12-31',
    sourceLabel: 'Cộng đồng Film Hà Nội',
  },
  {
    id: 'ins-hn-lab-1',
    regionId: 'hanoi',
    kind: 'DEAL',
    category: 'LAB',
    title: 'Lab tráng + scan C41 giảm giá cho bộ ảnh Thu/Cúc họa mi',
    detail: 'Scan máy Noritsu HS-1800 chuẩn màu trong trẻo, trả file link Drive trong vòng 6 tiếng.',
    placeName: 'Zone 5 Film Lab',
    areaLabel: 'Ba Đình · Gần Phan Đình Phùng & Hoàng Diệu',
    nearKeywords: ['phan đình phùng', 'ba đình', 'hoàng diệu', 'hồ tây'],
    priceNow: '45.000đ / cuộn',
    priceOld: '65.000đ',
    discountLabel: '-30%',
    hotScore: 92,
    validUntil: '2026-12-15',
    validNote: 'Áp dụng cuộn C41 135',
    sourceLabel: 'Zone 5 Lab',
  },
  {
    id: 'ins-hn-outfit-1',
    regionId: 'hanoi',
    kind: 'HOT',
    category: 'OUTFIT',
    title: 'Áo dài trắng nữ sinh + nón lá — Đang hot nhất Phan Đình Phùng',
    detail: 'Mẫu áo dài lụa trắng tơ tằm thướt tha kết hợp hoa sen/cúc họa mi bên xe hoa rong. Đang kín lịch đặt cuối tuần.',
    placeName: 'Tiệm Áo Dài Thơ',
    areaLabel: 'Hoàn Kiếm · Có hỗ trợ giao tận điểm chụp',
    nearKeywords: ['phan đình phùng', 'hoàng diệu', 'ba đình', 'xe hoa', 'hoàn kiếm'],
    priceNow: '150.000đ – 220.000đ / ngày',
    priceOld: '260.000đ',
    discountLabel: 'Tặng kèm nón lá',
    hotScore: 98,
    validNote: 'Cao điểm mùa lá vàng',
    sourceLabel: 'Xu hướng thời trang ảnh ngoại cảnh',
  },
  {
    id: 'ins-hn-outfit-2',
    regionId: 'hanoi',
    kind: 'HOT',
    category: 'OUTFIT',
    title: 'Set áo len be Hàn Quốc + chân váy vintage cho Bãi Đá Sông Hồng',
    detail: 'Tone màu beige ấm áp tôn da tương phản nổi bật giữa cánh đồng hoa cúc họa mi trắng muốt.',
    placeName: 'Nàng Vintage Wardrobe',
    areaLabel: 'Tây Hồ · Ngay ngõ vào Bãi Đá Sông Hồng',
    nearKeywords: ['cúc họa mi', 'bãi đá sông hồng', 'sông hồng', 'nhật tân', 'âu cơ', 'tây hồ'],
    priceNow: '120.000đ – 180.000đ / ngày',
    hotScore: 94,
    validNote: 'Hot rộ mùa cúc họa mi',
    sourceLabel: 'Lookbook Bãi Đá',
  },
  {
    id: 'ins-hn-rental-1',
    regionId: 'hanoi',
    kind: 'DEAL',
    category: 'RENTAL',
    title: 'Thuê Lens Chân Dung Sony FE 85mm f/1.8 — Giảm sâu ngày trong tuần',
    detail: 'Ống kính xóa phông tách mẫu hoàn hảo khỏi đám đông ở vườn hoa. Miễn cọc CCCD gắn chip chính chủ.',
    placeName: 'Camera Rental Hanoi',
    areaLabel: 'Hai Bà Trưng · Gần trung tâm',
    nearKeywords: ['cúc họa mi', 'bãi đá sông hồng', 'phan đình phùng'],
    priceNow: '130.000đ / ngày',
    priceOld: '180.000đ',
    discountLabel: '-28%',
    hotScore: 89,
    validUntil: '2026-11-30',
    validNote: 'Thứ 2 đến Thứ 6',
    sourceLabel: 'Dịch vụ thuê máy ảnh',
  },
  {
    id: 'ins-hn-rental-2',
    regionId: 'hanoi',
    kind: 'HOT',
    category: 'RENTAL',
    title: 'Thuê Fujifilm X-T4 + lens 35mm f/1.4 (Màu film chụp ăn liền)',
    detail: 'Giả lập màu Classic Chrome và Astia chụp ra ảnh ăn ngay không cần hậu kỳ, được các bạn trẻ săn thuê nhiều nhất.',
    placeName: 'VJCamera Hà Nội',
    areaLabel: 'Cầu Giấy · Hỗ trợ ship lens nội thành',
    nearKeywords: ['cầu giấy', 'ba đình', 'tây hồ', 'phan đình phùng'],
    priceNow: '320.000đ / ngày',
    priceOld: '400.000đ',
    discountLabel: '-20%',
    hotScore: 87,
    sourceLabel: 'VJCamera Rental',
  },
  {
    id: 'ins-hn-prop-1',
    regionId: 'hanoi',
    kind: 'HOT',
    category: 'PROP',
    title: 'Bó cúc họa mi tươi mini + giỏ mây đạo cụ',
    detail: 'Bó hoa tươi mới hái sáng sớm tại vườn Nhật Tân, bó gọn tay kèm nơ ruy băng ren phục vụ chụp ảnh.',
    placeName: 'Cổng chợ hoa Nhật Tân',
    areaLabel: 'Âu Cơ · Tây Hồ',
    nearKeywords: ['cúc họa mi', 'bãi đá sông hồng', 'nhật tân', 'âu cơ'],
    priceNow: '40.000đ – 60.000đ / bó',
    hotScore: 96,
    validNote: 'Bán từ 6:00 sáng mỗi ngày',
    sourceLabel: 'Chợ hoa Nhật Tân',
  },

  // ═════════════════ TP. HỒ CHÍ MINH ═════════════════
  {
    id: 'ins-hcm-film-1',
    regionId: 'hcm',
    kind: 'HOT',
    category: 'FILM',
    title: 'CineStill 800T (135/36) — Đang hot chụp ánh đèn Bến Bạch Đằng & Bưu Điện',
    detail: 'Hiệu ứng quầng đỏ (halation) quanh ánh đèn đêm Sài Gòn mang lại chất điện ảnh cyberpunk độc đáo.',
    placeName: 'Lạ Film Lab Sài Gòn',
    areaLabel: 'Quận 3 · Cách trung tâm Q1 1km',
    nearKeywords: ['bạch đằng', 'quận 1', 'quận 3', 'sài gòn', 'bưu điện'],
    priceNow: '340.000đ / cuộn',
    priceOld: '390.000đ',
    discountLabel: '-13%',
    hotScore: 93,
    validNote: 'Vừa về lô mới date 2027',
    sourceLabel: 'Lạ Lab Store',
  },
  {
    id: 'ins-hcm-outfit-1',
    regionId: 'hcm',
    kind: 'HOT',
    category: 'OUTFIT',
    title: 'Sơ mi linen trắng oversize + nón cói phong cách Film Nhật',
    detail: 'Style tối giản tôn ánh hoàng hôn vàng rực Bến Bạch Đằng và các góc quán cà phê cổ Q1.',
    placeName: 'Retro Studio Wardrobe',
    areaLabel: 'Quận 1 · Nguyễn Du',
    nearKeywords: ['quận 1', 'bạch đằng', 'nguyễn huệ', 'sài gòn'],
    priceNow: '90.000đ – 150.000đ / ngày',
    hotScore: 90,
    validNote: 'Hot mùa nắng hanh Sài Gòn',
    sourceLabel: 'Lookbook Sài Gòn',
  },
  {
    id: 'ins-hcm-rental-1',
    regionId: 'hcm',
    kind: 'DEAL',
    category: 'RENTAL',
    title: 'Combo Sony A7III + Tamron 28-75mm f/2.8 — Giảm 25% gói thuê chiều hoàng hôn',
    detail: 'Gói thuê nhanh 4 tiếng khung giờ vàng (15:00 - 19:00) dành riêng cho các bạn chụp sunset sông Sài Gòn.',
    placeName: 'Gió Rental Saigon',
    areaLabel: 'Bến Vân Đồn · Cách Bến Bạch Đằng 5 phút',
    nearKeywords: ['bạch đằng', 'quận 1', 'quận 4', 'sài gòn'],
    priceNow: '250.000đ / 4h',
    priceOld: '350.000đ',
    discountLabel: '-25%',
    hotScore: 85,
    validUntil: '2026-12-31',
    sourceLabel: 'Gió Rental',
  },
  {
    id: 'ins-hcm-lab-1',
    regionId: 'hcm',
    kind: 'DEAL',
    category: 'LAB',
    title: 'Tráng film B&W (đen trắng) thủ công — Giảm giá hội chụp phố',
    detail: 'Xóc tay bằng thuốc Kodak D-76 hạt mịn, tương phản sâu, phù hợp chụp kiến trúc đường phố Sài Gòn.',
    placeName: 'Cropping Film Lab',
    areaLabel: 'Quận 1 · Lê Lợi',
    nearKeywords: ['quận 1', 'chợ bến thành', 'sài gòn'],
    priceNow: '50.000đ / cuộn',
    priceOld: '75.000đ',
    discountLabel: '-33%',
    hotScore: 80,
    sourceLabel: 'Cropping Lab',
  },

  // ═════════════════ ĐÀ LẠT ═════════════════
  {
    id: 'ins-dl-film-1',
    regionId: 'dalat',
    kind: 'HOT',
    category: 'FILM',
    title: 'Fujifilm 400 Japan — Tông xanh lá & vàng đồi thông Đà Lạt',
    detail: 'Độ nhạy sáng ISO 400 lý tưởng cho thời tiết sương mù sáng sớm và rừng thông se lạnh.',
    placeName: 'Tiệm Film Dốc Nhà Bò',
    areaLabel: 'Phường 3 · Trung tâm Đà Lạt',
    nearKeywords: ['đà lạt', 'dã quỳ', 'hồ tuyền lâm', 'đồi thông'],
    priceNow: '235.000đ / cuộn',
    hotScore: 91,
    validNote: 'Đang sẵn hàng tại Đà Lạt',
    sourceLabel: 'Film Đà Lạt Community',
  },
  {
    id: 'ins-dl-outfit-1',
    regionId: 'dalat',
    kind: 'HOT',
    category: 'OUTFIT',
    title: 'Khăn choàng len thổ cẩm + áo khoác măng tô nâu ấm cho hoa Dã Quỳ',
    detail: 'Màu nâu caramen và cam đất đồng điệu hoàn mỹ với sắc vàng hoa dã quỳ ven cung đường Tuyền Lâm.',
    placeName: 'Tiệm Đồ Vintage Đà Lạt',
    areaLabel: 'Đường Ba Tháng Hai · TP. Đà Lạt',
    nearKeywords: ['dã quỳ', 'đà lạt', 'tuyền lâm', 'trại mát'],
    priceNow: '120.000đ – 220.000đ / ngày',
    hotScore: 95,
    validNote: 'Cao điểm mùa Dã Quỳ rực rỡ',
    sourceLabel: 'Tiệm thuê đồ du lịch',
  },
  {
    id: 'ins-dl-prop-1',
    regionId: 'dalat',
    kind: 'HOT',
    category: 'PROP',
    title: 'Máy ảnh Film Cơ cổ Olympus OM-1 / Canon AE-1 làm đạo cụ chụp',
    detail: 'Cho thuê thân máy cơ vintage kèm dây đeo thổ cẩm làm phụ kiện sống ảo khi chụp đồi hoa, view quán cà phê.',
    placeName: 'Dalat Film Prop Shop',
    areaLabel: 'Khu Hoà Bình · TP. Đà Lạt',
    nearKeywords: ['đà lạt', 'dã quỳ', 'cà phê'],
    priceNow: '60.000đ / buổi',
    hotScore: 84,
    sourceLabel: 'Phụ kiện sống ảo Đà Lạt',
  },

  // ═════════════════ SA PA & TÂY BẮC ═════════════════
  {
    id: 'ins-sp-outfit-1',
    regionId: 'sapa',
    kind: 'HOT',
    category: 'OUTFIT',
    title: 'Trang phục Dân tộc H\'Mông / Dao đỏ cách tân chụp ruộng bậc thang',
    detail: 'Bộ váy đính họa tiết hoa văn thổ cẩm thêu tay sặc sỡ, lên hình cực kỳ tương phản giữa nền lúa vàng thung lũng Mường Hoa.',
    placeName: 'Tiệm Thổ Cẩm Bản Cát Cát',
    areaLabel: 'Bản Cát Cát · Sa Pa',
    nearKeywords: ['sa pa', 'săn mây', 'ruộng bậc thang', 'mường hoa', 'tả van'],
    priceNow: '70.000đ – 150.000đ / bộ',
    hotScore: 97,
    validNote: 'Kèm đầy đủ trang sức bạc & ô che',
    sourceLabel: 'Thuê đồ dân tộc Sa Pa',
  },
  {
    id: 'ins-sp-prop-1',
    regionId: 'sapa',
    kind: 'HOT',
    category: 'PROP',
    title: 'Gùi hoa cải vàng & dù thổ cẩm đạo cụ săn mây',
    detail: 'Gùi tre đeo lưng đựng hoa tươi bản địa giúp bạn có những dáng chụp tự nhiên nhất khi đi dạo triền đồi.',
    placeName: 'Quầy lưu niệm Đỉnh đèo Ô Quy Hồ',
    areaLabel: 'Ô Quy Hồ · Sa Pa',
    nearKeywords: ['sa pa', 'ô quy hồ', 'săn mây'],
    priceNow: '40.000đ / lần thuê',
    hotScore: 89,
    sourceLabel: 'Điểm săn mây Ô Quy Hồ',
  },
];

export const INSIGHT_CATEGORIES: { id: 'ALL' | InsightCategory; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'FILM', label: '🎞️ Cuộn Film' },
  { id: 'LAB', label: '🧪 Tráng Scan Lab' },
  { id: 'OUTFIT', label: '👗 Trang phục Hot' },
  { id: 'RENTAL', label: '📷 Thuê Máy & Lens' },
  { id: 'PROP', label: '🌼 Đạo cụ chụp' },
];

export interface InsightQuery {
  regionId: string;
  category: 'ALL' | InsightCategory | InsightCategory[];
  searchQuery: string;
  selectedSpot?: Spot | null;
  /** Mặc định: hôm nay. Cho phép truyền vào để test. */
  today?: Date;
}

export interface RankedInsight extends LocalInsight {
  isNearSelected: boolean;
}

const normalize = (s: string) => s.toLowerCase().trim();

function isExpired(insight: LocalInsight, today: Date): boolean {
  if (!insight.validUntil) return false;
  const end = new Date(`${insight.validUntil}T23:59:59`);
  return end.getTime() < today.getTime();
}

/**
 * Lọc theo khu vực / danh mục / từ khóa, bỏ ưu đãi hết hạn,
 * ưu tiên mục gần spot đang chọn rồi tới độ hot.
 */
export function getLocalInsights(query: InsightQuery): RankedInsight[] {
  const { regionId, category, searchQuery, selectedSpot } = query;
  const today = query.today ?? new Date();
  const q = normalize(searchQuery);
  const spotText = selectedSpot
    ? normalize(`${selectedSpot.name} ${selectedSpot.address}`)
    : '';
  const effectiveRegion = selectedSpot?.regionId ?? regionId;

  return LOCAL_INSIGHTS
    .filter(i => effectiveRegion === 'all' || i.regionId === effectiveRegion)
    .filter(i => !isExpired(i, today))
    .filter(i => {
      if (category === 'ALL') return true;
      if (Array.isArray(category)) return category.includes(i.category);
      return i.category === category;
    })
    .filter(i =>
      !q ||
      normalize(`${i.title} ${i.detail} ${i.placeName} ${i.areaLabel}`).includes(q)
    )
    .map<RankedInsight>(i => ({
      ...i,
      isNearSelected: !!spotText && (i.nearKeywords || []).some(k => spotText.includes(normalize(k))),
    }))
    .sort((a, b) => {
      if (a.isNearSelected !== b.isNearSelected) return a.isNearSelected ? -1 : 1;
      return b.hotScore - a.hotScore;
    });
}
