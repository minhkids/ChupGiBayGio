import type { Spot } from '../types';


export interface FilmStockInfo {
  id: string;
  brand: string;
  name: string;
  fullName: string;
  iso: number;
  format: string;
  badgeBg: string;
  borderColor: string;
  paletteHex: string[];
  description: string;
  filmImageUrl?: string;
  sampleImageUrl?: string;
  sampleImageCredit?: {
    author: string;
    sourceUrl: string;
    licenseName: string;
    licenseUrl: string;
  };
  matchedSpots?: any[];
  nearbyShops?: any[];
  bestSeasons?: number[];
  recommendedTime?: string;
}

export const FILM_STOCKS: Record<string, FilmStockInfo> = {
  'kodak-gold-200': {
    id: 'kodak-gold-200',
    brand: 'Kodak',
    name: 'Gold 200',
    fullName: 'Kodak Gold 200',
    iso: 200,
    format: '35mm / 120',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-400/50',
    paletteHex: ['#E09F3E', '#9E2A2B', '#FFF3B0', '#335C67'],
    description: 'Tone vàng ấm hổ phách, tôn ánh nắng xiên, hạt mịn vừa phải.',
    filmImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/135film.jpg/500px-135film.jpg',
    sampleImageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Duliang_Pavilion_of_Xuyi_County.jpg/960px-Duliang_Pavilion_of_Xuyi_County.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    sampleImageCredit: {
      author: 'Willwongprd',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Duliang_Pavilion_of_Xuyi_County.jpg',
      licenseName: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    recommendedTime: '15:30 - 17:00 (Nắng xiên chiều thu)',
    bestSeasons: [9, 10, 11],
    nearbyShops: [
      { name: "36+ Film Lab", address: "1B Lê Phụng Hiểu, Hoàn Kiếm", distance_to_core_spots: "Cách Phan Đình Phùng ~2.2km", services: ["Bán film sẵn", "Tráng scan 2h"] },
      { name: "Nadar Photo Club", address: "Số 2 ngõ 40 Châu Long, Ba Đình", distance_to_core_spots: "Cách Phan Đình Phùng ~400m", services: ["Bán film bảo quản lạnh", "Tư vấn góc chụp"] }
    ]
  },
  'kodak-portra-400': {
    id: 'kodak-portra-400',
    brand: 'Kodak',
    name: 'Portra 400',
    fullName: 'Kodak Portra 400',
    iso: 400,
    format: '35mm / 120',
    badgeBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30',
    borderColor: 'border-orange-400/50',
    paletteHex: ['#F4A261', '#E76F51', '#2A9D8F', '#E9C46A'],
    description: 'Tone da mịn màng, dải sáng tương phản dịu nhẹ, chuyên chân dung ngoài trời.',
    filmImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Kodak_Portra_160.jpg/500px-Kodak_Portra_160.jpg',
    sampleImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: '08:00 - 10:00 & 15:00 - 16:30',
    bestSeasons: [1, 2, 3, 9, 10, 11],
    nearbyShops: [
      { name: "Zone 5 Film Lab", address: "258 Tôn Đức Thắng, Đống Đa", distance_to_core_spots: "Cách Văn Miếu ~600m", services: ["Scan chuẩn màu", "Bán máy & phụ kiện"] },
      { name: "AEG Film Lab", address: "318 Bà Triệu, Hai Bà Trưng", distance_to_core_spots: "Cách Hoàng Thành ~3km", services: ["Sẵn Kodak Portra", "Tráng scan nhanh"] }
    ]
  },
  'fujifilm-400': {
    id: 'fujifilm-400',
    brand: 'Fujifilm',
    name: 'Fujifilm 200 / Superia 400',
    fullName: 'Fujifilm 200',
    iso: 200,
    format: '35mm / 120',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-400/50',
    paletteHex: ['#2A9D8F', '#E76F51', '#264653', '#F4A261'],
    description: 'Nghiêng tone xanh lá và cyan nhẹ, làm nổi bật sắc trắng tinh khiết, hợp trời mù lạnh.',
    filmImageUrl: 'https://thedarkroom.com/app/uploads/2019/07/FujiColor-200-FujiFilm-35mm.jpg',
    sampleImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: '07:00 - 09:00 (Sáng se lạnh)',
    bestSeasons: [11, 12, 1],
    nearbyShops: [
      { name: "Nadar Photo Club", address: "Số 2 ngõ 40 Châu Long, Ba Đình", distance_to_core_spots: "Cách Hồ Tây ~1.5km", services: ["Bán film tươi", "Tư vấn kỹ thuật"] },
      { name: "Fox Lab Hanoi", address: "Ngõ 198 Thái Hà, Đống Đa", distance_to_core_spots: "Cách trung tâm ~4km", services: ["Giá sinh viên", "Tráng màu chuẩn Fuji"] }
    ]
  },
  'cinestill-800t': {
    id: 'cinestill-800t',
    brand: 'CineStill',
    name: '800T Tungsten',
    fullName: 'CineStill 800T',
    iso: 800,
    format: '35mm / 120',
    badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    borderColor: 'border-rose-400/50',
    paletteHex: ['#E63946', '#1D3557', '#457B9D', '#F1FAEE'],
    description: 'Quầng đỏ rực Halation quanh đèn lồng và neon, chất điện ảnh cinematic chụp đêm.',
    filmImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/CineStill_logo_badge.png/500px-CineStill_logo_badge.png',
    sampleImageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: '18:30 - 21:30 (Đêm rực rỡ ánh đèn)',
    bestSeasons: [8, 9, 12],
    nearbyShops: [
      { name: "AEG Film Lab", address: "318 Bà Triệu, Hai Bà Trưng", distance_to_core_spots: "Cách Nhà Thờ Lớn ~1.8km", services: ["Đầy đủ CineStill", "Tráng ECN-2 chuẩn"] },
      { name: "Croplab Hà Nội", address: "102A ngõ 72 Nguyễn Chí Thanh, Đống Đa", distance_to_core_spots: "Cách trung tâm ~4km", services: ["Kho film điện ảnh", "Tráng scan chuyên nghiệp"] }
    ]
  },
  'ilford-hp5': {
    id: 'ilford-hp5',
    brand: 'Ilford',
    name: 'HP5 Plus 400 (B&W)',
    fullName: 'Ilford HP5 Plus 400',
    iso: 400,
    format: '35mm / 120',
    badgeBg: 'bg-neutral-500/10 text-neutral-800 dark:text-neutral-200 border-neutral-500/30',
    borderColor: 'border-neutral-400/50',
    paletteHex: ['#171717', '#525252', '#A3A3A3', '#F5F5F5'],
    description: 'Đen trắng cổ điển, tương phản mạnh, tôn đường nét sắt thép và kiến trúc hoài cổ.',
    filmImageUrl: 'https://thedarkroom.com/app/uploads/2019/07/Ilford-HP5-Plus-400-120-35mm-film.jpg',
    sampleImageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: 'Sáng sớm có sương mù hoặc chiều muộn',
    bestSeasons: [11, 12, 1, 2],
    nearbyShops: [
      { name: "36+ Film Lab", address: "89 Đinh Tiên Hoàng, Hoàn Kiếm", distance_to_core_spots: "Cách Cầu Long Biên ~1.5km", services: ["Bán film đen trắng", "Tráng B&W chuyên biệt"] },
      { name: "Zone 5 Film Lab", address: "258 Tôn Đức Thắng, Đống Đa", distance_to_core_spots: "Cách Ga Hà Nội ~800m", services: ["Tráng scan B&W", "Bán phụ kiện lens"] }
    ]
  },
  'kodak-colorplus-200': {
    id: 'kodak-colorplus-200',
    brand: 'Kodak',
    name: 'ColorPlus 200',
    fullName: 'Kodak ColorPlus 200',
    iso: 200,
    format: '35mm / 120',
    badgeBg: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
    borderColor: 'border-yellow-400/50',
    paletteHex: ['#D4A373', '#FAEDCD', '#CCD5AE', '#E9EDC9'],
    description: 'Màu ảnh thập niên 90s, ấm áp nhẹ nhàng, giá thành dễ tiếp cận cho người mới.',
    filmImageUrl: 'https://thedarkroom.com/app/uploads/2019/07/Kodacolor-Colorplus-200-35mm-film.jpg',
    sampleImageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: '14:00 - 16:30',
    bestSeasons: [4, 5, 9, 10],
    nearbyShops: [
      { name: "Fox Lab Hanoi", address: "Ngõ 198 Thái Hà, Đống Đa", distance_to_core_spots: "Gần KTT Kim Liên ~1.2km", services: ["Giá film sinh viên", "Nhiều dòng film outdate test máy"] },
      { name: "AEG Film Lab", address: "318 Bà Triệu, Hai Bà Trưng", distance_to_core_spots: "Cách Đường Sách ~1.5km", services: ["Bán film sẵn", "Scan trả ảnh nhanh"] }
    ]
  },
  'kodak-ektar-100': {
    id: 'kodak-ektar-100',
    brand: 'Kodak',
    name: 'Ektar 100',
    fullName: 'Kodak Ektar 100',
    iso: 100,
    format: '35mm / 120',
    badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
    borderColor: 'border-blue-400/50',
    paletteHex: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'],
    description: 'Hạt siêu mịn, màu sắc rực rỡ tươi sáng, tương phản cao hoàn hảo cho phong cảnh.',
    filmImageUrl: 'https://thedarkroom.com/app/uploads/2019/06/Ektar-100-Kodak-film-120-and-35mm.jpg',
    sampleImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: '16:00 - 17:30 (Hoàng hôn hồ Tây)',
    bestSeasons: [5, 6, 7, 8],
    nearbyShops: [
      { name: "Nadar Photo Club", address: "Số 2 ngõ 40 Châu Long, Ba Đình", distance_to_core_spots: "Gần Hồ Tây ~2km", services: ["Film cao cấp bảo quản lạnh", "Tư vấn exposure"] },
      { name: "36+ Film Lab", address: "1B Lê Phụng Hiểu, Hoàn Kiếm", distance_to_core_spots: "Cách Hồ Tây ~3.5km", services: ["Scan độ phân giải cao", "Bán film chính hãng"] }
    ]
  },
  'lomo-800': {
    id: 'lomo-800',
    brand: 'Lomography',
    name: 'Color 800',
    fullName: 'Lomography Color 800',
    iso: 800,
    format: '35mm / 120',
    badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    borderColor: 'border-purple-400/50',
    paletteHex: ['#7209B7', '#4361EE', '#4895EF', '#4CC9F0'],
    description: 'Chất màu rực rỡ phá cách, độ nhạy sáng cao, tạo hạt lo-fi đậm chất đường phố.',
    filmImageUrl: 'https://thedarkroom.com/app/uploads/2019/07/Lomo-800-lomography-film-120-and-35mm.jpg',
    sampleImageUrl: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: '17:30 - 19:00 (Khung giờ chập tối Blue Hour)',
    bestSeasons: [10, 11, 12],
    nearbyShops: [
      { name: "Croplab Hà Nội", address: "102A ngõ 72 Nguyễn Chí Thanh, Đống Đa", distance_to_core_spots: "Gần Ga Cát Linh ~2km", services: ["Sẵn film Lomo 800", "Tráng scan tốc độ"] },
      { name: "AEG Film Lab", address: "318 Bà Triệu, Hai Bà Trưng", distance_to_core_spots: "Cách Tràng Tiền ~1.2km", services: ["Tráng film ISO cao", "Tư vấn push/pull"] }
    ]
  },
  'kodak-ultramax-400': {
    id: 'kodak-ultramax-400',
    brand: 'Kodak',
    name: 'UltraMax 400',
    fullName: 'Kodak UltraMax 400',
    iso: 400,
    format: '35mm',
    badgeBg: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
    borderColor: 'border-red-400/50',
    paletteHex: ['#FFC107', '#D32F2F', '#1976D2', '#FFFFFF'],
    description: 'Cuộn film đa dụng quốc dân, độ nhạy sáng 400 dễ chụp mọi lúc, màu rực rỡ vui tươi.',
    filmImageUrl: 'https://thedarkroom.com/app/uploads/2019/07/Kodak-Ultramax-400-35mm-film.jpg',
    sampleImageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: 'Sáng tới chiều muộn',
    bestSeasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    nearbyShops: [
      { name: "Nadar Photo Club", address: "Số 2 ngõ 40 Châu Long", distance_to_core_spots: "Ba Đình", services: ["Sẵn film"] }
    ]
  },
  'fujifilm-velvia-50': {
    id: 'fujifilm-velvia-50',
    brand: 'Fujifilm',
    name: 'Velvia 50',
    fullName: 'Fujifilm Velvia 50',
    iso: 50,
    format: '35mm / 120 (Slide)',
    badgeBg: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
    borderColor: 'border-green-400/50',
    paletteHex: ['#2E7D32', '#FBC02D', '#D32F2F', '#0288D1'],
    description: 'Huyền thoại film dương bản (Slide film), độ bão hòa siêu cao, sinh ra cho ảnh phong cảnh thiên nhiên.',
    filmImageUrl: 'https://thedarkroom.com/app/uploads/2019/07/Fujifilm-Velvia-50-120-35mm.jpg',
    sampleImageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1000&auto=format&fit=crop&q=80',
    recommendedTime: 'Trời nắng gắt, bình minh, hoàng hôn',
    bestSeasons: [5, 6, 7, 8],
    nearbyShops: [
      { name: "AEG Film Lab", address: "318 Bà Triệu", distance_to_core_spots: "Hai Bà Trưng", services: ["Tráng E-6"] }
    ]
  }
};


export interface FilmRecommendationResult {
  film: FilmStockInfo;
  recommendedSettings: string;
  rationale: string;
  matchScore: number;
}

export function recommendFilmForSpot(spot: Spot, currentMonth: number = new Date().getMonth() + 1): FilmRecommendationResult {
  const spotNameLower = spot.name.toLowerCase();
  const addressLower = spot.address.toLowerCase();
  const descLower = spot.description.toLowerCase();

  // 1. NIGHT STREET / NEON / LANTERNS
  if (
    spot.bestTimeOfDay === 'NIGHT' || 
    spotNameLower.includes('đêm') || 
    spotNameLower.includes('đèn lồng') ||
    spotNameLower.includes('bùi viện') ||
    addressLower.includes('đêm') ||
    descLower.includes('đèn lồng') ||
    descLower.includes('neon') ||
    descLower.includes('buổi tối')
  ) {
    return {
      film: FILM_STOCKS['cinestill-800t'],
      recommendedSettings: 'f/1.4 - f/2.0 · 1/60s · ISO 800 (Tungsten 3200K)',
      rationale: 'Hiệu ứng quầng đỏ Halation rực rỡ xoay quanh ánh đèn lồng, đèn neon đêm đầy ma mị.',
      matchScore: 98
    };
  }

  // 2. HARSH SUMMER SUN / LOTUS (Months 5-8)
  if (
    (currentMonth >= 5 && currentMonth <= 8) || 
    spotNameLower.includes('sen') || 
    descLower.includes('hoa sen') ||
    descLower.includes('mùa hè') ||
    descLower.includes('nắng hè')
  ) {
    return {
      film: FILM_STOCKS['kodak-ektar-100'],
      recommendedSettings: 'f/5.6 - f/8.0 · 1/500s - 1/1000s · Direct Sun',
      rationale: 'Tái hiện sắc hồng đầm sen và độ trong trẻo rực rỡ dưới nắng hè với hạt film siêu mịn.',
      matchScore: 95
    };
  }

  // 3. OVERCAST WINTER / WHITE FLOWERS (Months 11-1)
  if (
    currentMonth === 11 || currentMonth === 12 || currentMonth === 1 ||
    spotNameLower.includes('cúc họa mi') ||
    spotNameLower.includes('hoa mơ') ||
    spotNameLower.includes('hoa mận') ||
    descLower.includes('cúc họa mi') ||
    descLower.includes('hoa trắng') ||
    spot.seasonalTrend?.trendTitle.toLowerCase().includes('cúc họa mi')
  ) {
    return {
      film: FILM_STOCKS['fujifilm-400'],
      recommendedSettings: 'f/2.0 - f/2.8 · 1/250s · Soft Overcast Light',
      rationale: 'Bảo tồn sắc trắng hoa cúc vẹn nguyên, tone xanh lá thanh mát mát mắt dưới trời đông nhiều mây.',
      matchScore: 96
    };
  }

  // 4. SUNNY AUTUMN (Months 9-11)
  if (
    (currentMonth >= 9 && currentMonth <= 11) ||
    spotNameLower.includes('phan đình phùng') ||
    spotNameLower.includes('hoàng hôn') ||
    descLower.includes('mùa thu') ||
    descLower.includes('lá vàng') ||
    spot.bestTimeOfDay === 'SUNSET'
  ) {
    return {
      film: FILM_STOCKS['kodak-gold-200'],
      recommendedSettings: 'f/4.0 - f/5.6 · 1/250s - 1/500s · Golden Hour',
      rationale: 'Sắc vàng Kodak huyền thoại tôn vinh ánh nắng thu xuyên qua tán lá sấu và bóng chiều hoàng hôn.',
      matchScore: 97
    };
  }

  // 5. VINTAGE / ARCHITECTURE -> ILFORD HP5
  if ((spot.seasonalTrend?.conceptTags || []).includes('KIEN_TRUC') || spotNameLower.includes('chung cư') || spotNameLower.includes('nhà cổ')) {
    return {
      film: FILM_STOCKS['ilford-hp5'],
      recommendedSettings: 'f/4.0 - f/8.0 · 1/125s - 1/250s · High Contrast',
      rationale: 'Tương phản đen trắng sâu lắng tôn vinh đường nét hình khối kiến trúc cổ kính.',
      matchScore: 92
    };
  }

  // Default fallback -> Kodak Portra 400
  return {
    film: FILM_STOCKS['kodak-portra-400'],
    recommendedSettings: 'f/2.8 - f/4.0 · 1/250s · Natural Daylight',
    rationale: 'Chất phim chuẩn mực với khả năng tái tạo màu da mịn màng và dải tương phản cực kỳ an toàn.',
    matchScore: 90
  };
}
