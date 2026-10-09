import { describe, expect, it } from 'vitest';
import { bulkTemplateHeaders, parseBulkRows } from './bulkImport';

describe('parseBulkRows', () => {
  it('converts Excel rows to spot records and reports invalid rows without discarding valid ones', () => {
    const result = parseBulkRows('spot', [
      ['Tên', 'Slug', 'Địa chỉ', 'Vĩ độ', 'Kinh độ', 'Tháng đẹp'],
      ['Vườn đào', 'vuon-dao', 'Hà Nội', 21.02, 105.8, '1,2,3'],
      ['Thiếu slug', '', 'Hà Nội', 21.03, 105.7, '4'],
      ['', '', '', '', '', '']
    ]);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({ category: 'spot', name: 'Vườn đào', bestMonths: [1, 2, 3] });
    expect(result.errors).toEqual([{ row: 3, message: 'Địa điểm cần có slug, địa chỉ, vĩ độ và kinh độ.' }]);
  });

  it('keeps explicit seasonal labels and rejects unsupported ones', () => {
    const result = parseBulkRows('spot', [
      ['Tên địa điểm', 'Slug', 'Địa chỉ', 'Vĩ độ', 'Kinh độ', 'Trạng thái mùa', 'Hạn kiểm chứng'],
      ['Hồ hoa', 'ho-hoa', 'Hà Nội', 21, 105, 'PEAK', '2026-10-16'],
      ['Mùa lúa', 'mua-lua', 'Lào Cai', 22, 104, 'ENDING_SOON', '2026-10-19'],
      ['Sai nhãn', 'sai-nhan', 'Hà Nội', 21, 105, 'HOT', '2026-10-16']
    ]);
    expect(result.records).toMatchObject([
      { spotStatus: 'PEAK', statusValidUntil: '2026-10-16' },
      { spotStatus: 'ENDING_SOON', statusValidUntil: '2026-10-19' }
    ]);
    expect(result.errors).toEqual([{ row: 4, message: 'Trạng thái mùa phải là PEAK, ACTIVE hoặc ENDING_SOON.' }]);
  });

  it('parses JSON hotspot and photographer package cells from Excel', () => {
    const outfit = parseBulkRows('outfit', [['name', 'imageUrl', 'hotspots'], ['Váy hoa', 'https://img/a.jpg', '[{"x":20,"y":35,"label":"Váy"}]']]);
    expect(outfit.records[0]).toMatchObject({ name: 'Váy hoa', hotspots: [{ x: 20, y: 35, label: 'Váy' }] });
    const photographer = parseBulkRows('photographer', [['name', 'packages'], ['An Nhiên', '[{"name":"Cơ bản","price":1000000,"duration":"2 giờ","deliveredPhotos":20}]']]);
    expect(photographer.records[0]).toMatchObject({ packages: [{ name: 'Cơ bản', price: 1000000, duration: '2 giờ', deliveredPhotos: 20 }] });
  });

  it('maps Vietnamese columns for rental, film, and lab records', () => {
    expect(parseBulkRows('rental', [['Tên tiệm', 'Địa chỉ', 'Hotline', 'Giá/ngày'], ['Áo Dài', 'Hà Nội', '0900', '200k']]).records[0]).toMatchObject({ name: 'Áo Dài', phone: '0900', price: '200k' });
    expect(parseBulkRows('filmColor', [['Tên film', 'ISO', 'Tone màu', 'Mùa thích hợp'], ['Gold 200', 200, 'Ấm', 'xuân,hạ']]).records[0]).toMatchObject({ name: 'Gold 200', iso: '200', suitableSeasons: ['xuân', 'hạ'] });
    expect(parseBulkRows('filmLab', [['Tên lab', 'Film có sẵn', 'Tráng nhanh 2h'], ['Lab X', 'Gold 200, Portra 400', 'Có']]).records[0]).toMatchObject({ name: 'Lab X', filmStocks: ['Gold 200', 'Portra 400'], fastService: true });
  });

  it('provides a matching Excel template header for every admin category', () => {
    const categories = ['spot', 'rental', 'outfit', 'photographer', 'filmLab', 'filmColor'] as const;
    for (const category of categories) {
      const headers = bulkTemplateHeaders(category);
      expect(headers.length, category).toBeGreaterThan(1);
      expect(parseBulkRows(category, [headers]).errors[0]?.message).toContain('dòng dữ liệu');
    }
  });
});
