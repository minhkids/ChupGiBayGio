import { expect, it } from 'vitest';
import { bulkTemplateHeaders, parseBulkRows } from './bulkImport';

it('imports candidate forecasts as canonical spots with exact expected months', () => {
  const headers = ['name', 'slug', 'address', 'lat', 'lng', 'upcoming', 'expectedMonths'];
  const result = parseBulkRows('spot', [headers, ['Hoa', 'hoa', 'Hà Nội', 21, 105, 'true', '12,1']]);
  expect(result.errors).toEqual([]);
  expect(result.records[0]).toMatchObject({ upcoming: true, expectedMonths: [12, 1] });
  expect(bulkTemplateHeaders('spot')).toContain('Tháng dự kiến');
});

it('rejects missing or invalid forecast months in the import preview', () => {
  const headers = ['name', 'slug', 'address', 'lat', 'lng', 'upcoming', 'expectedMonths'];
  for (const months of ['', '0,13', '11,no']) {
    const result = parseBulkRows('spot', [headers, ['Hoa', 'hoa', 'Hà Nội', 21, 105, 'true', months]]);
    expect(result.records).toEqual([]);
    expect(result.errors).toHaveLength(1);
  }
});