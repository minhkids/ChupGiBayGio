import { afterEach, expect, it, vi } from 'vitest';
import { db } from './db';

afterEach(() => vi.unstubAllGlobals());

it.each(['list', 'detail'])('normalizes a partial candidate seasonal trend from the %s API before detail consumers render', async (endpoint) => {
  const forecast = { status: 'ACTIVE', upcoming: true, expectedMonths: [11, 12], trendTitle: 'Unconfirmed forecast' };
  const row = { id: 'local-candidate', name: 'Candidate', seasonal_trend: JSON.stringify(forecast) };
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(endpoint === 'list' ? [row] : row)));
  const spot = endpoint === 'list' ? (await db.spots.getAll())[0] : await db.spots.getById(row.id);
  expect(spot?.seasonalTrend.conceptTags).toEqual([]);
  expect(spot?.seasonalTrend.placeCategories).toEqual([]);
  expect(spot?.seasonalTrend).toMatchObject(forecast);
});

it('hydrates the exact best-month set into the public seasonal trend', async () => {
  const row = { id: 'seasonal-spot', best_months: '[3,9]', seasonal_trend: JSON.stringify({ startMonth: 1, endMonth: 12, status: 'ACTIVE' }) };
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([row])));

  const [spot] = await db.spots.getAll();

  expect(spot.seasonalTrend.bestMonths).toEqual([3, 9]);
});

it('maps an admin-entered entry fee to the public ticket cost fields', async () => {
  const row = { id: 'paid-spot', name: 'Điểm có vé', entry_fee: '100.000đ', cost_type: 'FREE', ticket_price_range: '' };
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([row])));

  const [spot] = await db.spots.getAll();

  expect(spot).toMatchObject({ costType: 'TICKET', ticketPriceRange: '100.000đ' });
});
