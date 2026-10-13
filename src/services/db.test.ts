import { afterEach, expect, it, vi } from 'vitest';
import { db } from './db';

afterEach(() => vi.unstubAllGlobals());

it.each(['list', 'detail'])('normalizes a partial candidate seasonal trend from the %s API before detail consumers render', async (endpoint) => {
  const forecast = { status: 'ACTIVE', upcoming: true, expectedMonths: [11, 12], trendTitle: 'Unconfirmed forecast' };
  const row = { id: 'local-candidate', name: 'Candidate', seasonal_trend: JSON.stringify(forecast) };
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(endpoint === 'list' ? [row] : row)));
  const spot = endpoint === 'list' ? (await db.spots.getAll())[0] : await db.spots.getById(row.id);
  expect(spot?.seasonalTrend.conceptTags).toEqual([]);
  expect(spot?.seasonalTrend).toMatchObject(forecast);
});
