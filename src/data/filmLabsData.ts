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
    id: 'nadar-club',
    name: 'Nadar Club',
    address: '110 Triệu Việt Vương, Bùi Thị Xuân, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    lat: 21.0152,
    lng: 105.8504,
    openingHours: '09:00 - 21:00 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'Kodak ColorPlus 200', 'CineStill 800T', 'Fuji 200', 'Ilford HP5 Plus 400', 'Kodak UltraMax 400'],
    phone: '0961 888 234',
    zaloUrl: 'https://zalo.me/0961888234',
    fanpageUrl: 'https://www.facebook.com/nadarclub',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=110+Trieu+Viet+Vuong+Hai+Ba+Trung+Ha+Noi',
    services: ['Bán film cuộn', 'Tráng C41/ECN-2/B&W', 'Thuê máy film PnS & SLR', 'Scan Noritsu HD'],
    priceRange: '150.000đ - 350.000đ',
    rating: 4.9,
    reviewCount: 128,
    description: 'Không gian ấm cúng tại con phố cà phê Triệu Việt Vương, luôn dồi dào stock film tươi date.'
  },
  {
    id: '36plus-lab',
    name: '36+ Lab',
    address: '36 Lý Quốc Sư, Hàng Trống, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    lat: 21.0308,
    lng: 105.8496,
    openingHours: '08:30 - 20:30 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'Kodak UltraMax 400', 'Kodak Portra 400', 'Fuji 200', 'CineStill 400D', 'Kodak ProImage 100'],
    phone: '0989 363 636',
    zaloUrl: 'https://zalo.me/0989363636',
    fanpageUrl: 'https://www.facebook.com/36pluslab',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=36+Ly+Quoc+Su+Hoan+Kiem+Ha+Noi',
    services: ['Bán film cuộn', 'Tráng scan lấy ngay', 'Bán máy ảnh film', 'Scan Fuji Frontier'],
    priceRange: '160.000đ - 420.000đ',
    rating: 4.8,
    reviewCount: 95,
    description: 'Nằm ngay cạnh Nhà Thờ Lớn, điểm ghé chân quen thuộc của các nhiếp ảnh gia đường phố Hà Nội.'
  },
  {
    id: 'croplab-hanoi',
    name: 'Croplab Hà Nội',
    address: '102 A2 ngõ 72 Đặng Văn Ngữ, Trung Tự, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    lat: 21.0112,
    lng: 105.8340,
    openingHours: '09:00 - 20:00 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'CineStill 800T', 'Kodak ProImage 100', 'Fuji Superia X-TRA 400', 'Kodak ColorPlus 200', 'Kodak Vision3 250D'],
    phone: '0904 226 238',
    zaloUrl: 'https://zalo.me/0904226238',
    fanpageUrl: 'https://www.facebook.com/croplabhanoi',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=102+A2+ngo+72+Dang+Van+Ngu+Dong+Da+Ha+Noi',
    services: ['Bán film các loại', 'Tráng C41 & ECN-2 chuẩn màu', 'Vệ sinh lens & body', 'Scan độ phân giải cao'],
    priceRange: '140.000đ - 380.000đ',
    rating: 4.9,
    reviewCount: 160,
    description: 'Chi nhánh Hà Nội của Croplab uy tín, chuyên nghiệp trong việc xử lý màu Cine điện ảnh và film màu 35mm.'
  },
  {
    id: 'aeg-lab',
    name: 'AEG Lab',
    address: 'Số 37 Ngõ 165 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    lat: 21.0337,
    lng: 105.7951,
    openingHours: '09:00 - 19:30 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak ColorPlus 200', 'Kodak Gold 200', 'Fuji 200', 'Ilford Pan 400', 'CineStill 800T', 'Kodak Portra 160'],
    phone: '0356 222 678',
    zaloUrl: 'https://zalo.me/0356222678',
    fanpageUrl: 'https://www.facebook.com/aegfilmlab',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=So+37+Ngo+165+Cau+Giay+Ha+Noi',
    services: ['Bán film giá học sinh sinh viên', 'Tráng film siêu tốc', 'Phụ kiện máy film', 'Tủ chống ẩm'],
    priceRange: '135.000đ - 340.000đ',
    rating: 4.7,
    reviewCount: 82,
    description: 'Địa chỉ quen thuộc của giới trẻ và sinh viên khu vực Cầu Giấy với giá thành hợp lý và dịch vụ tận tâm.'
  },
  {
    id: 'zone5-lab',
    name: 'Zone 5 Film Lab',
    address: '256 Bạch Mai, Cầu Dền, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    lat: 21.0028,
    lng: 105.8524,
    openingHours: '09:00 - 21:00 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak UltraMax 400', 'Kodak Gold 200', 'Fuji 200', 'CineStill 800T', 'Kodak Vision3 500T', 'Fomapan 400'],
    phone: '0912 345 678',
    zaloUrl: 'https://zalo.me/0912345678',
    fanpageUrl: 'https://www.facebook.com/zone5filmlab',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=256+Bach+Mai+Hai+Ba+Trung+Ha+Noi',
    services: ['Bán film chiết & film date', 'Tráng ECN-2 chuyên nghiệp', 'Scan SP3000 màu vintage', 'Sửa máy cơ'],
    priceRange: '120.000đ - 360.000đ',
    rating: 4.8,
    reviewCount: 110,
    description: 'Chuyên film điện ảnh Cine chiết bánh lớn và tráng thủ công kỹ lưỡng cho tone màu đậm chất điện ảnh.'
  },
  {
    id: 'laphoto-lab',
    name: 'Laphoto Film Lab',
    address: '41 Tôn Đức Thắng, Quốc Tử Giám, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    lat: 21.0264,
    lng: 105.8335,
    openingHours: '08:30 - 20:00 hàng ngày',
    hasFastService: true,
    fastServiceNotes: '⚡ Tráng lấy ngay 2h',
    availableFilms: ['Kodak Gold 200', 'Kodak ColorPlus 200', 'CineStill 800T', 'Fuji 200', 'Kodak Tri-X 400', 'Ilford HP5 Plus 400'],
    phone: '0945 111 222',
    zaloUrl: 'https://zalo.me/0945111222',
    fanpageUrl: 'https://www.facebook.com/laphotolab',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=41+Ton+Duc+Thang+Dong+Da+Ha+Noi',
    services: ['Bán film chính hãng', 'Tráng C41/B&W lấy ngay', 'Bán máy ảnh film', 'Workshop nhiếp ảnh film'],
    priceRange: '150.000đ - 390.000đ',
    rating: 4.9,
    reviewCount: 74,
    description: 'Vị trí trung tâm gần Văn Miếu, không gian văn hóa film photography với đầy đủ các dòng film 35mm và 120.'
  }
];
