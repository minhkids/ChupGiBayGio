import type { AccessorySuggestion } from '../components/views/AccessoryEditorialExperience';

/** Plain Shopee product URLs — swap a value here when attaching affiliate links. */
export const MAP_ACCESSORY_SHOPEE_URLS = {
  tuiDeoCheoGon: 'https://shopee.vn/product/1261431653/40531859824',
  khanCottonTron: 'https://shopee.vn/product/348487281/52053019462',
  muVaiMemBeige: 'https://shopee.vn/product/24415883/25716834128',
  muVaiMemMustard: 'https://shopee.vn/product/550938/5737410843',
} as const;

export const featuredMapAccessorySet: AccessorySuggestion[] = [
  {
    title: 'Cây thông Noel mini (workshop 98k)',
    description: 'Tự tay trang trí một cây thông nhỏ tại Đoài cà phê, Mỹ Đình 2. Workshop 98k, mang cây về làm quà.',
    productImageUrl: '/accessories/doai-workshop-cay-thong.webp',
    linkUrl: 'https://www.threads.com/@quangkwang',
    linkLabel: 'Xem trên Threads',
  },
  {
    title: 'Túi đeo chéo gọn',
    description: 'Đựng đồ thiết yếu, để hai tay thoải mái khi đi dạo.',
    productImageUrl: '/accessories/tui-deo-cheo-gon.webp',
    shopeeUrl: MAP_ACCESSORY_SHOPEE_URLS.tuiDeoCheoGon,
  },
  {
    title: 'Khăn cotton trơn',
    description: 'Chọn màu trung tính để dễ phối với trang phục sẵn có.',
    productImageUrl: '/accessories/khan-cotton-tron.webp',
    shopeeUrl: MAP_ACCESSORY_SHOPEE_URLS.khanCottonTron,
  },
  {
    title: 'Mũ vải mềm',
    description: 'Dễ gấp cất trong túi, tiện mang theo khi ra ngoài.',
    productImageUrl: '/accessories/mu-vai-mem-beige.webp',
    shopeeUrl: MAP_ACCESSORY_SHOPEE_URLS.muVaiMemBeige,
  },
  {
    title: 'Mũ bucket nhung (vàng mù tạt)',
    description: 'Phiên bản màu ấm — thay thế dễ dàng nếu bạn thích tông mustard.',
    productImageUrl: '/accessories/mu-vai-mem-mustard.webp',
    shopeeUrl: MAP_ACCESSORY_SHOPEE_URLS.muVaiMemMustard,
  },
];
