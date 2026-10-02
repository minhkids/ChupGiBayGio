import type { RentalShop } from '../types';

export const RENTAL_SHOPS: RentalShop[] = [
  // Outfit
  { id: 'o1', name: 'Tiệm Áo Dài Thơ', type: 'OUTFIT', address: '12 Cầu Gỗ, Hoàn Kiếm', lat: 21.0315, lng: 105.8524, priceRange: '150k - 250k/ngày', phone: '0987654321', link: 'https://fb.com/aodaitho' },
  { id: 'o2', name: 'Nàng Vintage', type: 'OUTFIT', address: '45 Đặng Văn Ngữ, Đống Đa', lat: 21.0088, lng: 105.8315, priceRange: '100k - 200k/ngày', phone: '0912345678', link: 'https://fb.com/nangvintage' },
  { id: 'o3', name: 'Dreamy Studio (Váy Concept)', type: 'OUTFIT', address: '102 Phan Đình Phùng', lat: 21.0396, lng: 105.8351, priceRange: '200k - 500k/ngày', phone: '0933445566', link: 'https://fb.com/dreamy' },
  { id: 'o4', name: 'Cổ Phục Việt', type: 'OUTFIT', address: '33 Hoàng Diệu, Ba Đình', lat: 21.0335, lng: 105.8398, priceRange: '300k - 600k/ngày', phone: '0999888777', link: 'https://fb.com/cophucviet' },
  
  // Camera
  { id: 'c1', name: 'NexShop', type: 'CAMERA', address: '10 Hàng Bài, Hoàn Kiếm', lat: 21.0245, lng: 105.8510, priceRange: 'Body 300k - 500k/ngày', phone: '0888999888', link: 'https://nexshop.vn' },
  { id: 'c2', name: 'Camera Rental Hanoi', type: 'CAMERA', address: '55 Giải Phóng, Hai Bà Trưng', lat: 21.0031, lng: 105.8415, priceRange: 'Lens từ 150k/ngày', phone: '0777666555', link: 'https://camerarental.vn' },
  { id: 'c3', name: 'VJCamera (Thuê thiết bị)', type: 'CAMERA', address: '11 Nguyễn Phong Sắc, Cầu Giấy', lat: 21.0423, lng: 105.7942, priceRange: 'Từ 200k/ngày', phone: '0901234567', link: 'https://vjcamera.com' },
  { id: 'c4', name: 'Máy ảnh Cũ Hà Nội', type: 'CAMERA', address: '53 Thái Hà, Đống Đa', lat: 21.0116, lng: 105.8211, priceRange: 'Combo từ 350k/ngày', phone: '0944556677', link: 'https://mayanhcuhn.com' }
];
