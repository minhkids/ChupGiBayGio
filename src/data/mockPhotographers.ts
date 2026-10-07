import type { Photographer, PhotographerBudgetCategory, PhotographerVibe } from '../types';

export const MOCK_PHOTOGRAPHERS: Photographer[] = [
  {
    id: 'photo-hn-01',
    name: 'Dương Tuấn Anh',
    avatarUrl: '/facebook_media/avatar_11.jpg',
    badge: 'SINH VIÊN ƯU ĐÃI',
    bio: 'Nhiếp ảnh gia chuyên màu film hoài cổ, nhiệt tình hướng dẫn tạo dáng từ A-Z cho các bạn ngại trước ống kính. Ưu đãi đặc biệt cho học sinh - sinh viên chụp cúc họa mi & mùa đông Hà Nội.',
    rating: 4.9,
    reviewCount: 128,
    startingPrice: 450000,
    startingPriceFormatted: 'Từ 450k/buổi',
    budgetCategory: 'student',
    vibes: ['MàuFilm', 'NàngThơ', 'ÁoDài'],
    specialtySpots: [
      'spot-hn-01', // Bãi Đá Sông Hồng
      'spot-hn-03', // Phan Đình Phùng
      'spot-hn-19', // Nhà thờ Lớn
      'spot-hn-02', // Phố Hàng Mã
    ],
    gear: 'Fujifilm X-T4 • XF 35mm f/1.4 R • XF 56mm f/1.2 • Giả lập film Classic Chrome',
    contact: {
      zaloPhone: '0978123456',
      zaloUrl: 'https://zalo.me/0978123456',
      phone: '0978 123 456',
      instagram: '@tuananh.film',
      facebook: 'https://facebook.com/tuananh.photo.film',
    },
    featuredPhotos: [
      '/facebook_media/post_0_0.jpg',
      '/facebook_media/post_0_1.jpg',
      '/facebook_media/post_1_0.jpg',
      '/facebook_media/post_3_0.jpg',
    ],
    packages: [
      {
        id: 'pkg-01-a',
        name: 'Gói Sinh Viên Cơ Bản (1 Người)',
        price: 450000,
        priceFormatted: '450.000đ',
        duration: '1.5 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ 150+ ảnh gốc ngay sau buổi chụp',
          retouchedPhotos: '12 ảnh blend màu film & chỉnh da tự nhiên',
          turnaroundTime: 'Trả ảnh trong 24 giờ',
          supportProps: 'Hỗ trợ đạo cụ hoa cúc, giỏ cói, sách cổ miễn phí',
        },
        highlight: true,
      },
      {
        id: 'pkg-01-b',
        name: 'Gói Đôi Bạn / Couple Hoài Niệm',
        price: 750000,
        priceFormatted: '750.000đ',
        duration: '2.5 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ 250+ ảnh gốc chất lượng cao',
          retouchedPhotos: '25 ảnh chỉnh sửa màu film chuyên sâu',
          turnaroundTime: 'Trả ảnh trong 48 giờ',
          supportProps: 'Tư vấn trang phục và đạo cụ theo concept',
        },
      },
    ],
    albums: [
      {
        id: 'alb-01',
        title: 'Mùa Cúc Họa Mi Trong Sương',
        spotId: 'spot-hn-01',
        spotName: 'Bãi Đá Sông Hồng',
        coverUrl: '/facebook_media/post_0_0.jpg',
        photoUrls: [
          '/facebook_media/post_0_0.jpg',
          '/facebook_media/post_0_1.jpg',
          '/facebook_media/post_0_2.jpg',
        ],
        vibe: 'NàngThơ',
      },
      {
        id: 'alb-02',
        title: 'Lá Vàng Rơi Phố Phan Đình Phùng',
        spotId: 'spot-hn-03',
        spotName: 'Phan Đình Phùng',
        coverUrl: '/facebook_media/post_1_0.jpg',
        photoUrls: [
          '/facebook_media/post_1_0.jpg',
          '/facebook_media/post_1_1.jpg',
          '/facebook_media/post_1_2.jpg',
        ],
        vibe: 'ÁoDài',
      },
    ],
  },
  {
    id: 'photo-hn-02',
    name: 'Minh Hoàng Studio',
    avatarUrl: '/facebook_media/avatar_8.jpg',
    badge: 'TOP RATED',
    bio: 'Bắt trọn khoảnh khắc tự nhiên, ánh sáng trong trẻo kiểu Hàn Quốc & Áo dài thơ mộng. Hơn 5 năm kinh nghiệm chụp ảnh chân dung ngoại cảnh tại các biểu tượng lịch sử Hà Nội.',
    rating: 5.0,
    reviewCount: 96,
    startingPrice: 650000,
    startingPriceFormatted: 'Từ 650k/buổi',
    budgetCategory: 'standard',
    vibes: ['ÁoDài', 'NàngThơ', 'MàuFilm'],
    specialtySpots: [
      'spot-hn-03', // Phan Đình Phùng
      'spot-hn-05', // Bảo Tàng Mỹ Thuật
      'spot-hn-20', // Nhà thờ Cửa Bắc
      'spot-hn-22', // Đặng Văn Ngữ
    ],
    gear: 'Sony A7III • Tamron 28-75mm f/2.8 G2 • Sony FE 85mm f/1.8 • Đèn Godox TT685',
    contact: {
      zaloPhone: '0983456789',
      zaloUrl: 'https://zalo.me/0983456789',
      phone: '0983 456 789',
      instagram: '@hoangminh.lens',
      facebook: 'https://facebook.com/minhhoang.portrait',
    },
    featuredPhotos: [
      '/facebook_media/post_1_0.jpg',
      '/facebook_media/post_1_1.jpg',
      '/facebook_media/post_4_0.jpg',
      '/facebook_media/post_3_1.jpg',
    ],
    packages: [
      {
        id: 'pkg-02-a',
        name: 'Gói Chân Dung Nàng Thơ Ngoại Cảnh',
        price: 650000,
        priceFormatted: '650.000đ',
        duration: '2 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ 200+ ảnh gốc độ phân giải cao',
          retouchedPhotos: '18 ảnh photoshop da & tone màu trong trẻo',
          turnaroundTime: 'Trả ảnh trong 24 giờ',
          supportProps: 'Có sẵn ô trong suốt, mũ beret, xe đạp mini',
        },
        highlight: true,
      },
      {
        id: 'pkg-02-b',
        name: 'Gói Concept Áo Dài Nghệ Thuật',
        price: 950000,
        priceFormatted: '950.000đ',
        duration: '3 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ ảnh gốc không giới hạn',
          retouchedPhotos: '30 ảnh chỉnh sửa tỉ mỉ từng chi tiết',
          turnaroundTime: 'Trả ảnh trong 48 giờ',
          supportProps: 'Bao gồm hoa sen/hoa cúc tươi theo mùa',
        },
      },
    ],
    albums: [
      {
        id: 'alb-03',
        title: 'Áo Dài Nét Đẹp Hà Thành',
        spotId: 'spot-hn-03',
        spotName: 'Phan Đình Phùng',
        coverUrl: '/facebook_media/post_1_1.jpg',
        photoUrls: ['/facebook_media/post_1_1.jpg', '/facebook_media/post_1_2.jpg'],
        vibe: 'ÁoDài',
      },
      {
        id: 'alb-04',
        title: 'Nắng Nghiêng Bảo Tàng Mỹ Thuật',
        spotId: 'spot-hn-05',
        spotName: 'Bảo Tàng Mỹ Thuật Việt Nam',
        coverUrl: '/facebook_media/post_4_0.jpg',
        photoUrls: ['/facebook_media/post_4_0.jpg', '/facebook_media/post_4_1.jpg'],
        vibe: 'NàngThơ',
      },
    ],
  },
  {
    id: 'photo-hn-03',
    name: 'Lê Hải Đăng',
    avatarUrl: '/facebook_media/avatar_5.jpg',
    badge: 'CHUYÊN CHỤP ĐÊM',
    bio: 'Phong cách đường phố cinematic, chuyên trị chụp đêm và bắt bokeh lung linh mùa Giáng sinh. Kinh nghiệm bắt góc ánh sáng flash đô thị và làm chủ độ tương phản cao.',
    rating: 4.8,
    reviewCount: 84,
    startingPrice: 750000,
    startingPriceFormatted: 'Từ 750k/buổi',
    budgetCategory: 'standard',
    vibes: ['ĐườngPhố', 'ChụpĐêm', 'MàuFilm'],
    specialtySpots: [
      'spot-hn-04', // Cầu Long Biên
      'spot-hn-31', // Hồ Gươm - Phố Cổ
      'spot-hn-19', // Nhà thờ Lớn
      'spot-hn-30', // Tràng Tiền Plaza
    ],
    gear: 'Nikon Z6 II • Nikkor Z 50mm f/1.8 S • 24-70mm f/2.8 S • Đèn Flash Godox V1 & Softbox di động',
    contact: {
      zaloPhone: '0912987654',
      zaloUrl: 'https://zalo.me/0912987654',
      phone: '0912 987 654',
      instagram: '@dang.streetpulse',
      facebook: 'https://facebook.com/haidang.cinematic',
    },
    featuredPhotos: [
      '/facebook_media/post_5_0.jpg',
      '/facebook_media/post_5_1.jpg',
      '/facebook_media/post_10_0.jpg',
      '/facebook_media/post_11_0.jpg',
    ],
    packages: [
      {
        id: 'pkg-03-a',
        name: 'Gói Night Street & Bokeh Lễ Hội',
        price: 750000,
        priceFormatted: '750.000đ',
        duration: '2 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ 180+ ảnh gốc',
          retouchedPhotos: '16 ảnh tone cinematic đêm & chỉnh da kỹ',
          turnaroundTime: 'Trả ảnh trong 24 giờ',
          supportProps: 'Trang bị đèn phụ trợ led & flash chuyên dụng',
        },
        highlight: true,
      },
      {
        id: 'pkg-03-b',
        name: 'Gói Hoàng Hôn Đến Đêm Cầu Long Biên',
        price: 900000,
        priceFormatted: '900.000đ',
        duration: '2.5 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ 250+ ảnh gốc',
          retouchedPhotos: '25 ảnh nghệ thuật bắt trọn hoàng hôn & cầu đêm',
          turnaroundTime: 'Trả ảnh trong 48 giờ',
        },
      },
    ],
    albums: [
      {
        id: 'alb-05',
        title: 'Hoàng Hôn Trên Nhịp Cầu Sắt',
        spotId: 'spot-hn-04',
        spotName: 'Cầu Long Biên',
        coverUrl: '/facebook_media/post_5_0.jpg',
        photoUrls: ['/facebook_media/post_5_0.jpg', '/facebook_media/post_5_1.jpg'],
        vibe: 'ĐườngPhố',
      },
      {
        id: 'alb-06',
        title: 'Sắc Màu Lễ Hội Giáng Sinh Phố Cổ',
        spotId: 'spot-hn-19',
        spotName: 'Nhà thờ Lớn Hà Nội',
        coverUrl: '/facebook_media/post_10_0.jpg',
        photoUrls: ['/facebook_media/post_10_0.jpg', '/facebook_media/post_11_0.jpg'],
        vibe: 'ChụpĐêm',
      },
    ],
  },
  {
    id: 'photo-hn-04',
    name: 'Trần Thùy Linh',
    avatarUrl: '/facebook_media/avatar_4.jpg',
    badge: 'THỢ NỮ NHIỆT TÌNH',
    bio: 'Thợ ảnh nữ thân thiện, tâm lý, bắt góc siêu xinh. Hỗ trợ phụ kiện hoa tươi, gợi ý trang phục hợp tone da và chỉnh sửa dáng tỉ mỉ cho các bạn nữ lần đầu đi chụp.',
    rating: 4.9,
    reviewCount: 142,
    startingPrice: 400000,
    startingPriceFormatted: 'Từ 400k/buổi',
    budgetCategory: 'student',
    vibes: ['NàngThơ', 'ÁoDài', 'MàuFilm'],
    specialtySpots: [
      'spot-hn-01', // Bãi Đá Sông Hồng
      'spot-hn-03', // Phan Đình Phùng
      'spot-hn-22', // Đặng Văn Ngữ
      'spot-hn-24', // Indoor Cafe Tây Sơn
    ],
    gear: 'Canon EOS R • RF 50mm f/1.8 STM • EF 85mm f/1.8 USM • Hắt sáng chuyên dụng',
    contact: {
      zaloPhone: '0965112233',
      zaloUrl: 'https://zalo.me/0965112233',
      phone: '0965 112 233',
      instagram: '@linhthuy.visuals',
      facebook: 'https://facebook.com/linhthuy.photo',
    },
    featuredPhotos: [
      '/facebook_media/post_0_1.jpg',
      '/facebook_media/post_0_2.jpg',
      '/facebook_media/post_8_0.jpg',
      '/facebook_media/post_8_1.jpg',
    ],
    packages: [
      {
        id: 'pkg-04-a',
        name: 'Gói Mini Nàng Thơ Sinh Viên',
        price: 400000,
        priceFormatted: '400.000đ',
        duration: '1.5 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ 150+ ảnh gốc đầy đủ',
          retouchedPhotos: '10 ảnh photoshop bóp dáng & làm mịn da kỹ',
          turnaroundTime: 'Trả ảnh trong 24 giờ',
          supportProps: 'Có hoa cầm tay và kẹp tóc xinh miễn phí',
        },
        highlight: true,
      },
      {
        id: 'pkg-04-b',
        name: 'Gói Nàng Thơ & Cà Phê Mùa Đông',
        price: 600000,
        priceFormatted: '600.000đ',
        duration: '2.5 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ 250+ ảnh gốc',
          retouchedPhotos: '20 ảnh blend màu Hàn Quốc mộng mơ',
          turnaroundTime: 'Trả ảnh trong 48 giờ',
          supportProps: 'Hỗ trợ thay 2 bộ trang phục trong buổi chụp',
        },
      },
    ],
    albums: [
      {
        id: 'alb-07',
        title: 'Nụ Cười Giữa Vườn Cúc',
        spotId: 'spot-hn-01',
        spotName: 'Bãi Đá Sông Hồng',
        coverUrl: '/facebook_media/post_0_1.jpg',
        photoUrls: ['/facebook_media/post_0_1.jpg', '/facebook_media/post_0_2.jpg'],
        vibe: 'NàngThơ',
      },
      {
        id: 'alb-08',
        title: 'Mùa Đông Dịu Êm Đặng Văn Ngữ',
        spotId: 'spot-hn-22',
        spotName: 'Khu B6 Trung Tự',
        coverUrl: '/facebook_media/post_8_0.jpg',
        photoUrls: ['/facebook_media/post_8_0.jpg', '/facebook_media/post_8_1.jpg'],
        vibe: 'MàuFilm',
      },
    ],
  },
  {
    id: 'photo-hn-05',
    name: 'Hoàng Long Studio',
    avatarUrl: '/facebook_media/avatar_2.jpg',
    badge: 'LOOKBOOK PRO',
    bio: 'Chuyên chụp lookbook thời trang, concept editorial cao cấp cho các thương hiệu và cá nhân. Đảm bảo chất lượng nước ảnh tạp chí, dàn gear khủng và chỉ đạo diễn xuất chuyên nghiệp.',
    rating: 5.0,
    reviewCount: 160,
    startingPrice: 1300000,
    startingPriceFormatted: 'Từ 1.3tr/buổi',
    budgetCategory: 'premium',
    vibes: ['NàngThơ', 'ĐườngPhố', 'ChụpĐêm'],
    specialtySpots: [
      'spot-hn-05', // Bảo Tàng Mỹ Thuật
      'spot-hn-28', // Lotte Mall Tây Hồ
      'spot-hn-30', // Tràng Tiền Plaza
      'spot-hn-29', // Lotte Center Liễu Giai
    ],
    gear: 'Sony A7IV • FE 50mm f/1.2 GM • FE 85mm f/1.4 GM • 16-35mm f/2.8 GM • Đèn Profoto A10 & Dù tản sáng',
    contact: {
      zaloPhone: '0904556677',
      zaloUrl: 'https://zalo.me/0904556677',
      phone: '0904 556 677',
      instagram: '@longhoang.lookbook',
      facebook: 'https://facebook.com/hoanglong.editorial',
    },
    featuredPhotos: [
      '/facebook_media/post_4_0.jpg',
      '/facebook_media/post_4_1.jpg',
      '/facebook_media/post_11_2.jpg',
      '/facebook_media/post_5_1.jpg',
    ],
    packages: [
      {
        id: 'pkg-05-a',
        name: 'Gói Cá Nhân Cao Cấp / Lookbook Solo',
        price: 1300000,
        priceFormatted: '1.300.000đ',
        duration: '2.5 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ file RAW & JPEG gốc không giới hạn',
          retouchedPhotos: '20 ảnh Retouch chuẩn màu tạp chí thời trang',
          turnaroundTime: 'Trả ảnh trong 48 giờ',
          supportProps: 'Có trợ lý ánh sáng đi kèm suốt buổi chụp',
        },
        highlight: true,
      },
      {
        id: 'pkg-05-b',
        name: 'Gói Lookbook Thương Hiệu / Editorial Set',
        price: 2500000,
        priceFormatted: '2.500.000đ',
        duration: '4 tiếng (Half-day)',
        deliverables: {
          totalOriginalPhotos: 'Toàn bộ file chất lượng cao thương mại',
          retouchedPhotos: '45 ảnh High-End Retouch chi tiết',
          turnaroundTime: 'Trả ảnh trong 72 giờ',
          supportProps: 'Hệ thống đèn studio di động Profoto chuyên nghiệp',
        },
      },
    ],
    albums: [
      {
        id: 'alb-09',
        title: 'Kiến Trúc Pháp & Lookbook Tối Giản',
        spotId: 'spot-hn-05',
        spotName: 'Bảo Tàng Mỹ Thuật Việt Nam',
        coverUrl: '/facebook_media/post_4_0.jpg',
        photoUrls: ['/facebook_media/post_4_0.jpg', '/facebook_media/post_4_1.jpg'],
        vibe: 'NàngThơ',
      },
      {
        id: 'alb-10',
        title: 'Ánh Đèn Tràng Tiền Plaza Đêm',
        spotId: 'spot-hn-30',
        spotName: 'Tràng Tiền Plaza',
        coverUrl: '/facebook_media/post_11_2.jpg',
        photoUrls: ['/facebook_media/post_11_2.jpg'],
        vibe: 'ChụpĐêm',
      },
    ],
  },
  {
    id: 'photo-hn-06',
    name: 'Vũ Đức Anh',
    avatarUrl: '/facebook_media/avatar_0.jpg',
    badge: 'CYBER & FILM GU',
    bio: 'Gu màu film đậm chất điện ảnh Hồng Kông & Cyberpunk huyền ảo. Chuyên chụp đêm với ánh đèn neon, lễ hội phố cổ và góc phố đời thường có chiều sâu cảm xúc.',
    rating: 4.9,
    reviewCount: 76,
    startingPrice: 850000,
    startingPriceFormatted: 'Từ 850k/buổi',
    budgetCategory: 'standard',
    vibes: ['ChụpĐêm', 'ĐườngPhố', 'MàuFilm'],
    specialtySpots: [
      'spot-hn-02', // Phố Hàng Mã
      'spot-hn-31', // Hồ Gươm - Phố Cổ
      'spot-hn-04', // Cầu Long Biên
      'spot-hn-19', // Nhà thờ Lớn
    ],
    gear: 'Leica Q2 • Summilux 28mm f/1.7 ASPH • Ricoh GR IIIx • Giả lập film Kodachrome',
    contact: {
      zaloPhone: '0936778899',
      zaloUrl: 'https://zalo.me/0936778899',
      phone: '0936 778 899',
      instagram: '@ducanh.cyberfilm',
      facebook: 'https://facebook.com/ducanh.leica',
    },
    featuredPhotos: [
      '/facebook_media/post_10_0.jpg',
      '/facebook_media/post_11_0.jpg',
      '/facebook_media/post_11_2.jpg',
      '/facebook_media/post_5_0.jpg',
    ],
    packages: [
      {
        id: 'pkg-06-a',
        name: 'Gói Phim Điện Ảnh Hồng Kông Đêm',
        price: 850000,
        priceFormatted: '850.000đ',
        duration: '2 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Trả toàn bộ 160+ ảnh gốc Leica/Ricoh',
          retouchedPhotos: '18 ảnh blend màu film điện ảnh đặc trưng',
          turnaroundTime: 'Trả ảnh trong 24 giờ',
          supportProps: 'Có phụ kiện đèn ống neon cầm tay',
        },
        highlight: true,
      },
      {
        id: 'pkg-06-b',
        name: 'Gói Storytelling Phố Cổ Hà Nội',
        price: 1200000,
        priceFormatted: '1.200.000đ',
        duration: '3 tiếng',
        deliverables: {
          totalOriginalPhotos: 'Toàn bộ ảnh chụp phóng sự đường phố',
          retouchedPhotos: '30 ảnh câu chuyện ảnh hoàn chỉnh',
          turnaroundTime: 'Trả ảnh trong 48 giờ',
        },
      },
    ],
    albums: [
      {
        id: 'alb-11',
        title: 'Đêm Lễ Hội Hàng Mã Rực Rỡ',
        spotId: 'spot-hn-02',
        spotName: 'Phố Hàng Mã',
        coverUrl: '/facebook_media/post_10_0.jpg',
        photoUrls: ['/facebook_media/post_10_0.jpg', '/facebook_media/post_11_0.jpg'],
        vibe: 'ChụpĐêm',
      },
      {
        id: 'alb-12',
        title: 'Góc Phố Cổ Hà Nội Lên Đèn',
        spotId: 'spot-hn-31',
        spotName: 'Hồ Gươm & Khu Phố Cổ',
        coverUrl: '/facebook_media/post_11_2.jpg',
        photoUrls: ['/facebook_media/post_11_2.jpg'],
        vibe: 'ĐườngPhố',
      },
    ],
  },
];

/**
 * Lấy danh sách thợ ảnh chuyên chụp một địa điểm cụ thể
 */
export function getPhotographersForSpot(spotId: string, spotName?: string): Photographer[] {
  const byId = MOCK_PHOTOGRAPHERS.filter(p => p.specialtySpots.includes(spotId));
  if (byId.length > 0) return byId;

  if (spotName) {
    const spotNameLower = spotName.toLowerCase();
    const byName = MOCK_PHOTOGRAPHERS.filter(p =>
      p.albums.some(a => a.spotName.toLowerCase().includes(spotNameLower) || spotNameLower.includes(a.spotName.toLowerCase()))
    );
    if (byName.length > 0) return byName;
  }

  // Fallback: trả về 2 thợ tiêu biểu
  return MOCK_PHOTOGRAPHERS.slice(0, 2);
}

/**
 * Lọc danh sách thợ ảnh theo phân khúc giá và vibe
 */
export function filterPhotographers(
  budget: PhotographerBudgetCategory,
  vibe: PhotographerVibe | 'all' | 'ALL'
): Photographer[] {
  return MOCK_PHOTOGRAPHERS.filter(photographer => {
    // 1. Lọc giá
    if (budget === 'student' && photographer.budgetCategory !== 'student') return false;
    if (budget === 'standard' && photographer.budgetCategory !== 'standard') return false;
    if (budget === 'premium' && photographer.budgetCategory !== 'premium') return false;

    // 2. Lọc vibe phong cách
    if (vibe !== 'ALL' && vibe !== 'all' && !photographer.vibes.includes(vibe)) return false;

    return true;
  });
}
