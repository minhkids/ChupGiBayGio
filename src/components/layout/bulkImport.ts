import type { ServiceCategory, ServiceListing } from '../../services/serviceHubApi';

export type BulkRecord = Omit<ServiceListing, 'id'>;
export interface BulkRowError { row: number; message: string }
export interface BulkParseResult { records: BulkRecord[]; errors: BulkRowError[] }

const fields: Partial<Record<ServiceCategory, Record<string, string[]>>> = {
  spot: {
    name: ['name', 'ten', 'tendiem', 'tendiadiem'], slug: ['slug'], regionId: ['regionid', 'khuvuc', 'tinhthanh'], district: ['district', 'quanhuyen', 'quan'],
    address: ['address', 'diachi'], lat: ['lat', 'latitude', 'vido'], lng: ['lng', 'lon', 'longitude', 'kinhdo'], bestTimeOfDay: ['besttimeofday', 'khunggio', 'khunggiodep'],
 goldenHour: ['goldenhour', 'giovang'], bestMonths: ['bestmonths', 'thangdep', 'thangdepnhat'], entryFee: ['entryfee', 'phive'],
 parkingFee: ['parkingfee', 'phiguixe'], coverImageUrl: ['coverimageurl', 'anhbia', 'urlanhbia', 'anhbiaurl'], description: ['description', 'mota'], sourceUrl: ['sourceurl', 'linknguon']
  },
  rental: {
    name: ['name', 'ten', 'tentiem', 'tentiemthue'], address: ['address', 'diachi'], phone: ['phone', 'hotline', 'sodienthoai'],
    link: ['link', 'fanpage', 'fanpageurl'], price: ['price', 'dailyprice', 'giangay', 'giathue', 'giathue/ngay']
  },
  outfit: {
    name: ['name', 'ten', 'tenset', 'tensetdo', 'tenoutfit'], spotId: ['spotid', 'diemchupid', 'iddiadiem'], description: ['description', 'mota'], material: ['material', 'chatlieu'],
    price: ['price', 'estimatedprice', 'giathamkhao', 'giauoctinh'], imageUrl: ['imageurl', 'anhmau', 'urlanh', 'anhmauurl'], hotspots: ['hotspots', 'diemghim', 'hotspotsjson'],
    link: ['link', 'shopee', 'shopeeurl'], secondaryLink: ['secondarylink', 'tiktok', 'tiktokurl']
  },
  photographer: {
    name: ['name', 'ten', 'tennhiepanhgia'], imageUrl: ['imageurl', 'avatar', 'avatarurl'], description: ['description', 'bio', 'gioithieu'],
    phone: ['phone', 'hotline', 'hotlinezalo', 'zalo', 'sodienthoai'], link: ['link', 'instagram', 'instagramurl'], gearBody: ['gearbody', 'body'], gearLens: ['gearlens', 'lens'],
    tags: ['tags', 'styles', 'hashtag', 'phongcach'], portfolioPhotos: ['portfoliophotos', 'portfolio', 'anhportfolio', 'anhportfoliourl'], packages: ['packages', 'goichup', 'goichupjson']
  },
  filmLab: {
    name: ['name', 'ten', 'tenlab'], address: ['address', 'diachi'], lat: ['lat', 'latitude', 'vido'], lng: ['lng', 'lon', 'longitude', 'kinhdo'],
    openingHours: ['openinghours', 'giomocua'], phone: ['phone', 'hotline', 'sodienthoai'], fastService: ['fastservice', 'fast2h', 'trangnhanh2h', 'cotrangnhanh2h'],
    filmStocks: ['filmstocks', 'instockfilms', 'filmcosan'], services: ['services', 'dichvu']
  },
  filmColor: {
    name: ['name', 'ten', 'tenfilm'], iso: ['iso'], format: ['format', 'khofilm'], recommendedTime: ['recommendedtime', 'tone', 'tonemau'],
    suitableSeasons: ['suitableseasons', 'seasons', 'muathichhop', 'muaphuhop'], filmImageUrl: ['filmimageurl', 'packageimageurl', 'anhvofilm', 'anhvocuonfilmurl'],
    imageUrl: ['imageurl', 'sampleimageurl', 'anhdemo', 'anhdemourl'], paletteHex: ['palettehex', 'palette']
  }
};

const arrays = new Set(['bestMonths', 'hotspots', 'tags', 'portfolioPhotos', 'packages', 'filmStocks', 'services', 'suitableSeasons', 'paletteHex']);
const strings = new Set(['name', 'slug', 'regionId', 'district', 'address', 'bestTimeOfDay', 'goldenHour', 'entryFee', 'parkingFee', 'coverImageUrl', 'description', 'sourceUrl', 'price', 'spotId', 'material', 'imageUrl', 'link', 'secondaryLink', 'phone', 'gearBody', 'gearLens', 'openingHours', 'filmImageUrl', 'format', 'recommendedTime']);

function normalizeHeader(value: unknown): string {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '');
}

function parseArray(value: unknown, field: string): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  const text = String(value).trim();
  try { const parsed: unknown = JSON.parse(text); if (Array.isArray(parsed)) return parsed; } catch { /* Allow Excel comma-separated values. */ }
  if (field === 'hotspots' || field === 'packages') return [];
  return text.split(/[;,]/).map((item) => item.trim()).filter(Boolean).map((item) => field === 'bestMonths' ? Number(item) : item);
}

function parseBoolean(value: unknown): boolean {
  return ['true', '1', 'yes', 'co', 'có', 'x'].includes(String(value ?? '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
}

export function parseBulkRows(category: ServiceCategory, rows: unknown[][]): BulkParseResult {
  if (rows.length < 2) return { records: [], errors: [{ row: 1, message: 'Tệp cần có hàng tiêu đề và ít nhất một dòng dữ liệu.' }] };
  const schema = fields[category] || {};
  const headers = rows[0].map(normalizeHeader);
  const records: BulkRecord[] = [];
  const errors: BulkRowError[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const values = rows[rowIndex];
    if (!values.some((value) => String(value ?? '').trim() !== '')) continue;
    const record: Record<string, unknown> = { category, id: '' };
    for (const [field, aliases] of Object.entries(schema)) {
      const columnIndex = headers.findIndex((header) => aliases.includes(header));
      if (columnIndex < 0) continue;
      const value = values[columnIndex];
      if (arrays.has(field)) record[field] = parseArray(value, field);
      else if (field === 'fastService') record[field] = parseBoolean(value);
      else if (field === 'lat' || field === 'lng') record[field] = value === '' || value == null ? undefined : Number(value);
      else if (field === 'iso') record[field] = value === '' || value == null ? '' : String(Number(value) || value);
      else if (strings.has(field)) record[field] = String(value ?? '').trim();
    }
    const line = rowIndex + 1;
    if (!String(record.name || '').trim()) { errors.push({ row: line, message: 'Thiếu tên.' }); continue; }
    if (category === 'spot') {
      if (!record.slug || !record.address || !Number.isFinite(record.lat) || !Number.isFinite(record.lng)) {
        errors.push({ row: line, message: 'Địa điểm cần có slug, địa chỉ, vĩ độ và kinh độ.' }); continue;
      }
      const months = record.bestMonths as number[] | undefined;
      if (months?.some((month) => !Number.isInteger(month) || month < 1 || month > 12)) {
        errors.push({ row: line, message: 'Tháng đẹp phải là số từ 1 đến 12.' }); continue;
      }
    }
    records.push(record as BulkRecord);
  }
  return { records, errors };
}

export function bulkTemplateHeaders(category: ServiceCategory): string[] {
  const labels: Partial<Record<ServiceCategory, Record<string, string>>> = {
    spot: { name: 'Tên địa điểm', slug: 'Slug', regionId: 'Khu vực', district: 'Quận huyện', address: 'Địa chỉ', lat: 'Vĩ độ', lng: 'Kinh độ', bestTimeOfDay: 'Khung giờ đẹp', goldenHour: 'Giờ vàng', bestMonths: 'Tháng đẹp', entryFee: 'Phí vé', parkingFee: 'Phí gửi xe', coverImageUrl: 'Ảnh bìa URL', description: 'Mô tả', sourceUrl: 'Link nguồn' },
    rental: { name: 'Tên tiệm thuê', address: 'Địa chỉ', phone: 'Hotline', link: 'Fanpage URL', price: 'Giá/ngày' },
    outfit: { name: 'Tên set đồ', spotId: 'ID địa điểm', description: 'Mô tả', material: 'Chất liệu', price: 'Giá ước tính', imageUrl: 'Ảnh mẫu URL', hotspots: 'Hotspots JSON', link: 'Shopee URL', secondaryLink: 'TikTok URL' },
    photographer: { name: 'Tên nhiếp ảnh gia', imageUrl: 'Avatar URL', description: 'Bio', phone: 'Hotline/Zalo', link: 'Instagram URL', gearBody: 'Body', gearLens: 'Lens', tags: 'Hashtag', portfolioPhotos: 'Ảnh portfolio URL', packages: 'Gói chụp JSON' },
    filmLab: { name: 'Tên lab', address: 'Địa chỉ', lat: 'Vĩ độ', lng: 'Kinh độ', openingHours: 'Giờ mở cửa', phone: 'Hotline', fastService: 'Tráng nhanh 2h', filmStocks: 'Film có sẵn', services: 'Dịch vụ' },
    filmColor: { name: 'Tên film', iso: 'ISO', format: 'Khổ film', recommendedTime: 'Tone màu', suitableSeasons: 'Mùa phù hợp', filmImageUrl: 'Ảnh vỏ cuộn film URL', imageUrl: 'Ảnh demo URL', paletteHex: 'Mã màu palette' }
  };
  return Object.keys(fields[category] || {}).map((field) => labels[category]?.[field] || field);
}
