export interface FilmLab {
  id: string;
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  openingHours: string;
  hasFastService: boolean; // ⚡ Tráng lấy ngay 2h
  fastServiceNotes?: string;
  availableFilms: string[];
  phone: string;
  zaloUrl?: string;
  fanpageUrl?: string;
  googleMapsUrl: string;
  services: string[];
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
}

export const HANOI_DEFAULT_COORDS = {
  lat: 21.0285,
  lng: 105.8542,
  label: 'Hồ Hoàn Kiếm (Mặc định)'
};

export const FILM_LABS: FilmLab[] = [
  {
    id: 'llab-hanoi',
    name: 'LLab Giảng Võ',
    address: 'Số 27 Ngõ 189 Giảng Võ, P. Ô Chợ Dừa, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    lat: 21.0253,
    lng: 105.8208,
    openingHours: '09:00 - 20:00 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'Kodak UltraMax 400', 'Fuji 200', 'CineStill 800T'],
    phone: '0981 123 456',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=27+Ngo+189+Giang+Vo+Dong+Da+Ha+Noi',
    services: ['Bán film cuộn', 'Tráng C41/ECN-2/B&W', 'Scan film'],
    priceRange: '150.000đ - 350.000đ',
    rating: 4.8,
    reviewCount: 230,
    description: 'Là một trong những lab chuyên nghiệp, có quy trình xử lý đa dạng các loại film (35mm, 120, film cine, slide...). Lab có ứng dụng riêng để khách hàng theo dõi trạng thái đơn hàng.'
  },
  {
    id: 'croplab-hanoi',
    name: 'Croplab Hà Nội',
    address: 'Số 102A3, Ngõ 72 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    lat: 21.0212,
    lng: 105.8080,
    openingHours: '09:00 - 20:00 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'CineStill 800T', 'Kodak ProImage 100', 'Fuji Superia X-TRA 400'],
    phone: '0904 226 238',
    zaloUrl: 'https://zalo.me/0904226238',
    fanpageUrl: 'https://www.facebook.com/croplabhanoi',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=102A3+Ngo+72+Nguyen+Chi+Thanh+Dong+Da+Ha+Noi',
    services: ['Bán film các loại', 'Tráng C41 & ECN-2 chuẩn màu', 'Scan Fuji Frontier SP-3000 & Noritsu HS-1800'],
    priceRange: '140.000đ - 380.000đ',
    rating: 4.9,
    reviewCount: 160,
    description: 'Lab nổi tiếng với chất lượng scan tốt, sử dụng các dòng máy scan hiện đại. Địa chỉ uy tín cho cả người mới bắt đầu và người chơi lâu năm.'
  },
  {
    id: '36plus-zone5',
    name: '36+ Lab & Coffee (Zone5)',
    address: 'Số 1B Lê Phụng Hiểu, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    lat: 21.0268,
    lng: 105.8566,
    openingHours: '08:30 - 20:30 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'Kodak UltraMax 400', 'Kodak Portra 400', 'Fuji 200', 'CineStill 400D'],
    phone: '0989 363 636',
    zaloUrl: 'https://zalo.me/0989363636',
    fanpageUrl: 'https://www.facebook.com/36pluslab',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=1B+Le+Phung+Hieu+Hoan+Kiem+Ha+Noi',
    services: ['Bán film cuộn', 'Tráng scan lấy ngay', 'Bán máy ảnh film', 'Cà phê & Giao lưu'],
    priceRange: '160.000đ - 420.000đ',
    rating: 4.8,
    reviewCount: 195,
    description: 'Kết hợp mô hình lab tráng film và quán cà phê trong khu nhà Pháp cổ, tạo không gian giao lưu cho cộng đồng. Dịch vụ tráng nhanh và không gian mang đậm chất hoài cổ.'
  },
  {
    id: 'aeg-lab',
    name: 'AEG Lab',
    address: '418 Bạch Mai, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    lat: 21.0037,
    lng: 105.8520,
    openingHours: '09:00 - 19:30 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak ColorPlus 200', 'Kodak Gold 200', 'Fuji 200', 'Ilford Pan 400', 'CineStill 800T'],
    phone: '0356 222 678',
    zaloUrl: 'https://zalo.me/0356222678',
    fanpageUrl: 'https://www.facebook.com/aegfilmlab',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=418+Bach+Mai+Hai+Ba+Trung+Ha+Noi',
    services: ['Bán film giá tốt', 'Tráng film siêu tốc', 'Phụ kiện máy film'],
    priceRange: '135.000đ - 340.000đ',
    rating: 4.7,
    reviewCount: 182,
    description: 'Một địa chỉ tráng film được nhiều người dùng đánh giá cao về sự nhiệt tình và chất lượng dịch vụ ổn định.'
  },
  {
    id: 'nadar-club',
    name: 'Nadar Photo Club',
    address: '67 Trần Hưng Đạo (cuối ngõ), Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    lat: 21.0222,
    lng: 105.8454,
    openingHours: '09:00 - 21:00 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'Kodak ColorPlus 200', 'CineStill 800T', 'Fuji 200', 'Ilford HP5 Plus 400'],
    phone: '0961 888 234',
    zaloUrl: 'https://zalo.me/0961888234',
    fanpageUrl: 'https://www.facebook.com/nadarclub',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=67+Tran+Hung+Dao+Hoan+Kiem+Ha+Noi',
    services: ['Bán film cuộn', 'Tráng C41/ECN-2/B&W', 'Thuê máy film PnS & SLR', 'Giao lưu cộng đồng'],
    priceRange: '150.000đ - 350.000đ',
    rating: 4.9,
    reviewCount: 228,
    description: 'Là nơi giao lưu thường xuyên của cộng đồng chụp ảnh film tại Hà Nội với phong cách làm việc chuyên nghiệp.'
  },
  {
    id: 'chiu-lab',
    name: 'Chiu Lab',
    address: 'P. 202 – Tập thể số 8 Lý Đạo Thành, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    lat: 21.0260,
    lng: 105.8570,
    openingHours: '08:30 - 20:00 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'Kodak ColorPlus 200', 'CineStill 800T', 'Fuji 200'],
    phone: '0945 111 222',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=So+8+Ly+Dao+Thanh+Hoan+Kiem+Ha+Noi',
    services: ['Bán film chính hãng', 'Tráng C41/B&W lấy ngay'],
    priceRange: '150.000đ - 390.000đ',
    rating: 4.9,
    reviewCount: 94,
    description: 'Một lab có vị trí trung tâm, nằm trong khu tập thể Pháp cổ, rất thuận tiện cho việc gửi và lấy film tại khu vực quận Hoàn Kiếm.'
  }
];
