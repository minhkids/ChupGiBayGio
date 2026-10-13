import { afterEach, describe, expect, it, vi } from 'vitest';
import { request, serviceHubApi } from './serviceHubApi';

afterEach(() => vi.unstubAllGlobals());

describe('serviceHubApi.request', () => {
  it('hydrates forecast metadata and includes it in both spot write payloads', async () => {
    const row = { id: 'forecast', name: 'Mùa hoa', seasonal_trend: JSON.stringify({ status: 'ACTIVE', upcoming: true, expectedMonths: [12, 1] }) };
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(Response.json(url === '/api/admin/cms/spots' ? [row] : []))));
    const [spot] = await serviceHubApi.adminList();
    expect(spot).toMatchObject({ upcoming: true, expectedMonths: [12, 1], spotStatus: 'ACTIVE' });
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json({ id: spot.id })));
    vi.stubGlobal('fetch', fetchMock);
    await serviceHubApi.create(spot);
    await serviceHubApi.update(spot);
    for (const call of fetchMock.mock.calls) expect(JSON.parse(call[1].body)).toMatchObject({ upcoming: true, expectedMonths: [12, 1], spotStatus: 'ACTIVE' });
  });
  it('reports an actionable error when the dev server serves its HTML fallback for an API request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<!doctype html><html></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' }
    })));

    await expect(request('/api/services')).rejects.toThrow(/API trả về trang HTML thay vì JSON/i);
  });

  it('returns JSON API responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json([{ id: 'lab-1' }])));

    await expect(request<{ id: string }[]>('/api/services')).resolves.toEqual([{ id: 'lab-1' }]);
  });

  it('separates retail film shops from processing labs using the saved roll prices', async () => {
    const responses: Record<string, unknown[]> = {
      '/api/admin/services': [],
      '/api/admin/cms/spots': [],
      '/api/admin/cms/rentalShops': [],
      '/api/admin/cms/outfits': [],
      '/api/admin/cms/photographers': [],
      '/api/admin/cms/films': [],
      '/api/admin/cms/labs': [
        { id: 'lab-1', name: 'Crolab', min_roll_price: 0, max_roll_price: 0, fast_2h: 1, in_stock_films: '[]' },
        { id: 'shop-1', name: 'Tiệm Film', min_roll_price: 50000, max_roll_price: 150000, cheapest_roll_name: 'Kodak Gold 200', in_stock_films: '["Kodak Gold 200"]', express_delivery_2h: 1 },
      ],
    };
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(Response.json(responses[url] || []))));

    const listings = await serviceHubApi.adminList();

    expect(listings.find((item) => item.id === 'lab-1')?.category).toBe('filmLab');
    expect(listings.find((item) => item.id === 'lab-1')).toMatchObject({ fastService: true, expressDelivery2h: false });
    expect(listings.find((item) => item.id === 'shop-1')).toMatchObject({ category: 'filmShop', cheapestRollName: 'Kodak Gold 200', minRollPrice: 50000, maxRollPrice: 150000, expressDelivery2h: true });
  });

  it('maps spot flower and photography data from D1 rows into admin form fields', async () => {
    const row = {
      id: 'spot-1', name: 'Hồ Tây', slug: 'ho-tay', region_id: 'hanoi', address: 'Hà Nội', lat: 21, lng: 105,
      best_time_of_day: 'afternoon', best_time_description: 'Chiều muộn.', golden_hour: 'Giờ vàng.',
      recommended_lenses: '["35mm"]', description: 'Hoa đang nở.', best_months: '[10,11]',
      seasonal_trend: JSON.stringify({ status: 'PEAK', statusValidUntil: '2026-12-31', bloomPercentage: 73, conceptTags: ['HOA_CO'] }),
    };
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(Response.json(url === '/api/admin/cms/spots' ? [row] : []))));

    const spot = (await serviceHubApi.adminList()).find((record) => record.category === 'spot');

    expect(spot).toMatchObject({
      bestTimeDescription: 'Chiều muộn.', recommendedLenses: ['35mm'], conceptTags: ['HOA_CO'],
      bloomPercentage: 73, description: 'Hoa đang nở.',
    });
  });

  it('sends spot detail edits in the authenticated update payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 'spot-1' }));
    vi.stubGlobal('fetch', fetchMock);
    await serviceHubApi.update({
      id: 'spot-1', category: 'spot', name: 'Hồ Tây', slug: 'ho-tay', address: 'Hà Nội', lat: 21, lng: 105,
      bestTimeDescription: 'Sáng sớm.', recommendedLenses: ['50mm', '85mm'], conceptTags: ['STREET'], bloomPercentage: 61,
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({
      bestTimeDescription: 'Sáng sớm.', recommendedLenses: ['50mm', '85mm'], conceptTags: ['STREET'], bloomPercentage: 61,
    });
  });

  it('sends film-shop admin records to the shared labs endpoint with their category and prices', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 'shop-2' }));
    vi.stubGlobal('fetch', fetchMock);
    await serviceHubApi.create({ category: 'filmShop', name: 'Shop mới', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 45000, maxRollPrice: 120000, expressDelivery2h: true });

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/labs', expect.objectContaining({ method: 'POST' }));
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload).toMatchObject({ adminCategory: 'filmShop', minRollPrice: 45000, maxRollPrice: 120000, cheapestRollName: 'Kodak Gold 200', inStockFilms: ['Kodak Gold 200'], expressDelivery2h: true });
  });

  it('preserves multiple shop locations in admin mapping and write payloads', async () => {
    const locations = [
      { ward: 'Cửa Nam', district: 'Hoàn Kiếm', openingHours: '09:00–18:00' },
      { ward: 'Dịch Vọng', district: 'Cầu Giấy', openingHours: '10:00–20:00' },
    ];
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(Response.json(url === '/api/admin/cms/labs' ? [{ id: 'shop-3', name: 'Nhiều chi nhánh', min_roll_price: 50000, locations: JSON.stringify(locations) }] : []))));
    const [shop] = await serviceHubApi.adminList();
    expect(shop.locations).toEqual(locations);

    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 'shop-4' }));
    vi.stubGlobal('fetch', fetchMock);
    await serviceHubApi.create({ category: 'filmShop', name: 'Nhiều chi nhánh', locations, filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 50000 });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).locations).toEqual(locations);
  });
});
