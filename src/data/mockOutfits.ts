import type { PostOutfit } from '../types';

export const buildShopeeSearchUrl = (query: string, affiliateId: string = 'chupgibaygio_vn') => {
  const q = encodeURIComponent(query.trim());
  return `https://shopee.vn/search?keyword=${q}&af_siteid=${affiliateId}&utm_source=affiliate&utm_campaign=visual_tap_to_shop`;
};

export const buildTikTokShopSearchUrl = (query: string) => {
  const q = encodeURIComponent(query.trim());
  return `https://www.tiktok.com/search?q=${q}&t=product`;
};

/**
 * Mock data các trang phục bóc tách từ ảnh check-in thực tế
 */
export const MOCK_POST_OUTFITS: PostOutfit[] = [
  // 1. Áo dài trắng cách tân tại Phan Đình Phùng / Phố Cổ
  {
    id: 'outfit-pdp-01',
    postId: 'post-fb-01',
    spotId: 'spot-phan-dinh-phung',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    itemName: 'Áo dài lụa tơ tằm trắng ngà dáng suông tay lỡ',
    category: 'AO_DAI',
    color: 'Trắng ngà / Kem nhạt',
    style: 'Nàng thơ hoài niệm',
    xPercent: 48.0,
    yPercent: 44.0,
    searchQuery: 'áo dài lụa tơ tằm trắng ngà dáng suông',
    priceEstimate: '380.000đ - 590.000đ',
    shopeeUrl: buildShopeeSearchUrl('áo dài lụa tơ tằm trắng ngà dáng suông'),
    tiktokUrl: buildTikTokShopSearchUrl('áo dài lụa tơ tằm trắng ngà dáng suông'),
    similarItems: [
      {
        id: 'sim-pdp-1',
        name: 'Áo dài cách tân lụa trơn 4 tà thắt eo nhẹ',
        priceEstimate: '320.000đ - 460.000đ',
        shopeeUrl: buildShopeeSearchUrl('áo dài cách tân lụa 4 tà'),
        tiktokUrl: buildTikTokShopSearchUrl('áo dài cách tân lụa 4 tà'),
        matchScore: 94,
      },
      {
        id: 'sim-pdp-2',
        name: 'Set áo dài suông gấm vân hoa cổ 2cm vintage',
        priceEstimate: '450.000đ - 680.000đ',
        shopeeUrl: buildShopeeSearchUrl('áo dài gấm vân hoa cổ 2cm'),
        tiktokUrl: buildTikTokShopSearchUrl('áo dài gấm vân hoa cổ 2cm'),
        matchScore: 89,
      },
      {
        id: 'sim-pdp-3',
        name: 'Bó hoa sen trắng gấp cánh chụp ảnh ngoại cảnh (Đạo cụ)',
        priceEstimate: '85.000đ - 140.000đ',
        shopeeUrl: buildShopeeSearchUrl('bó hoa sen gấp cánh chụp ảnh'),
        tiktokUrl: buildTikTokShopSearchUrl('bó hoa sen gấp cánh chụp ảnh'),
        matchScore: 82,
      },
    ],
    aiNotes: 'Chất lụa tơ mềm rủ tự nhiên, bắt sáng ven cực đẹp khi đứng dưới vòm cây sấu đường Phan Đình Phùng.',
  },

  // 2. Váy hoa nhí vintage tại Vườn hoa Bãi Đá Sông Hồng
  {
    id: 'outfit-baida-01',
    postId: 'post-fb-02',
    spotId: 'spot-bai-da-song-hong',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    itemName: 'Váy maxi hoa nhí cổ vuông tay phồng vintage',
    category: 'DRESS',
    color: 'Vàng kem hoa cúc cam',
    style: 'French Retro / Đồng quê Cottagecore',
    xPercent: 52.0,
    yPercent: 48.0,
    searchQuery: 'váy maxi hoa nhí cổ vuông tay bồng vintage',
    priceEstimate: '260.000đ - 390.000đ',
    shopeeUrl: buildShopeeSearchUrl('váy maxi hoa nhí cổ vuông tay bồng vintage'),
    tiktokUrl: buildTikTokShopSearchUrl('váy maxi hoa nhí cổ vuông tay bồng vintage'),
    similarItems: [
      {
        id: 'sim-baida-1',
        name: 'Đầm xòe hoa nhí vintage buộc dây lưng',
        priceEstimate: '220.000đ - 310.000đ',
        shopeeUrl: buildShopeeSearchUrl('đầm xòe hoa nhí vintage buộc dây'),
        tiktokUrl: buildTikTokShopSearchUrl('đầm xòe hoa nhí vintage buộc dây'),
        matchScore: 92,
      },
      {
        id: 'sim-baida-2',
        name: 'Mũ cói rộng vành đan tay phong cách Pháp (Phụ kiện)',
        priceEstimate: '95.000đ - 150.000đ',
        shopeeUrl: buildShopeeSearchUrl('mũ cói rộng vành vintage pháp'),
        tiktokUrl: buildTikTokShopSearchUrl('mũ cói rộng vành vintage pháp'),
        matchScore: 86,
      },
    ],
    aiNotes: 'Họa tiết hoa cúc cam nổi bật giữa cánh đồng cúc họa mi trắng, không bị chìm nền.',
  },

  // 3. Áo khoác len cardigan / Đầm công chúa tại Đà Lạt
  {
    id: 'outfit-dalat-01',
    postId: 'post-fb-03',
    spotId: 'spot-doi-che-cau-dat',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    itemName: 'Cardigan len vặn thừng dày dặn màu nâu mocha phối đầm dài',
    category: 'JACKET',
    color: 'Nâu Mocha / Be sữa',
    style: 'Mùa đông Đà Lạt / Hàn Quốc',
    xPercent: 49.0,
    yPercent: 42.0,
    searchQuery: 'áo khoác cardigan len vặn thừng form rộng nâu',
    priceEstimate: '290.000đ - 450.000đ',
    shopeeUrl: buildShopeeSearchUrl('áo khoác cardigan len vặn thừng form rộng nâu'),
    tiktokUrl: buildTikTokShopSearchUrl('áo khoác cardigan len vặn thừng form rộng nâu'),
    similarItems: [
      {
        id: 'sim-dl-1',
        name: 'Áo khoác len cardigan lông thỏ mịn dáng lửng',
        priceEstimate: '340.000đ - 480.000đ',
        shopeeUrl: buildShopeeSearchUrl('cardigan lông thỏ mịn'),
        tiktokUrl: buildTikTokShopSearchUrl('cardigan lông thỏ mịn'),
        matchScore: 90,
      },
      {
        id: 'sim-dl-2',
        name: 'Khăn choàng len cashmere bản to màu nâu camel',
        priceEstimate: '120.000đ - 190.000đ',
        shopeeUrl: buildShopeeSearchUrl('khăn choàng len cashmere camel'),
        tiktokUrl: buildTikTokShopSearchUrl('khăn choàng len cashmere camel'),
        matchScore: 88,
      },
    ],
    aiNotes: 'Tone nâu mocha giữ nhiệt tốt và tạo độ tương phản ấm áp với sương sớm và đồi chè xanh ngát.',
  },

  // 4. Áo dài cổ phục Nhật Bình tại Hồ Gươm / Hoàng Thành
  {
    id: 'outfit-hoankiem-01',
    postId: 'post-fb-04',
    spotId: 'spot-ho-guom',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    itemName: 'Áo Nhật Bình cổ phục thêu tay ngũ thân hoàng gia',
    category: 'AO_DAI',
    color: 'Xanh thiên thanh / Đỏ chu sa',
    style: 'Cổ phục truyền thống Việt Nam',
    xPercent: 51.0,
    yPercent: 40.0,
    searchQuery: 'áo nhật bình cổ phục thêu tay',
    priceEstimate: '550.000đ - 1.200.000đ',
    shopeeUrl: buildShopeeSearchUrl('áo nhật bình cổ phục thêu tay'),
    tiktokUrl: buildTikTokShopSearchUrl('áo nhật bình cổ phục thêu tay'),
    similarItems: [
      {
        id: 'sim-nb-1',
        name: 'Áo Tấc lụa tơ Hà Đông kèm khăn đóng truyền thống',
        priceEstimate: '420.000đ - 750.000đ',
        shopeeUrl: buildShopeeSearchUrl('áo tấc lụa hà đông'),
        tiktokUrl: buildTikTokShopSearchUrl('áo tấc lụa hà đông'),
        matchScore: 95,
      },
      {
        id: 'sim-nb-2',
        name: 'Quạt xếp lụa vẽ tranh thủy mặc vintage (Đạo cụ)',
        priceEstimate: '55.000đ - 95.000đ',
        shopeeUrl: buildShopeeSearchUrl('quạt xếp lụa thủy mặc cầm tay'),
        tiktokUrl: buildTikTokShopSearchUrl('quạt xếp lụa thủy mặc cầm tay'),
        matchScore: 88,
      },
    ],
    aiNotes: 'Trang phục cổ phong ấn tượng, cực kỳ tôn nét văn hóa Tràng An khi chụp cạnh tháp Rùa và cầu Thê Húc.',
  },
];

/**
 * Lấy danh sách outfits cho 1 bài post hoặc 1 địa điểm
 */
export const getOutfitsForPost = (postId: string): PostOutfit[] => {
  return MOCK_POST_OUTFITS.filter(o => o.postId === postId);
};

export const getOutfitsForSpot = (spotId: string): PostOutfit[] => {
  return MOCK_POST_OUTFITS.filter(o => o.spotId === spotId);
};

export const getOutfitByImage = (imageUrl: string): PostOutfit | undefined => {
  return MOCK_POST_OUTFITS.find(o => o.imageUrl === imageUrl);
};
