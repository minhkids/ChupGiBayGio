import type { Region } from '../types';

export const REGIONS: Region[] = [
  {
    id: 'all',
    name: 'Toàn quốc',
    slug: 'toan-quoc',
    lat: 16.0544,
    lng: 108.2022,
    zoom: 6,
    currentSeasonalHighlight: 'Thu Đông — Mùa Cúc Họa Mi & Dã Quỳ chớm nở',
  },
  {
    id: 'hanoi',
    name: 'Hà Nội',
    slug: 'ha-noi',
    lat: 21.0378,
    lng: 105.8396,
    zoom: 13.5,
    currentSeasonalHighlight: 'Thu Hà Nội: Xe hoa Phan Đình Phùng & Cúc họa mi',
  },
  {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    slug: 'tp-ho-chi-minh',
    lat: 10.7769,
    lng: 106.7009,
    zoom: 12,
    currentSeasonalHighlight: 'Mùa nắng hanh chiều & Hoàng hôn Bến Bạch Đằng',
  },
  {
    id: 'dalat',
    name: 'Đà Lạt',
    slug: 'da-lat',
    lat: 11.9404,
    lng: 108.4583,
    zoom: 12,
    currentSeasonalHighlight: 'Mùa hoa Dã Quỳ vàng rực & Hồng chín trĩu cành',
  },
  {
    id: 'sapa',
    name: 'Sa Pa & Tây Bắc',
    slug: 'sa-pa',
    lat: 22.3364,
    lng: 103.8438,
    zoom: 11,
    currentSeasonalHighlight: 'Săn mây mùa thu & Mùa lúa chín muộn',
  }
];
