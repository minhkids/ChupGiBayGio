import { afterEach, describe, expect, it, vi } from 'vitest';
import { request, serviceHubApi } from './serviceHubApi';

afterEach(() => vi.unstubAllGlobals());

describe('serviceHubApi.request', () => {
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
        { id: 'lab-1', name: 'Crolab', min_roll_price: 0, max_roll_price: 0, in_stock_films: '[]' },
        { id: 'shop-1', name: 'Tiệm Film', min_roll_price: 50000, max_roll_price: 150000, cheapest_roll_name: 'Kodak Gold 200', in_stock_films: '["Kodak Gold 200"]' },
      ],
    };
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(Response.json(responses[url] || []))));

    const listings = await serviceHubApi.adminList();

    expect(listings.find((item) => item.id === 'lab-1')?.category).toBe('filmLab');
    expect(listings.find((item) => item.id === 'shop-1')).toMatchObject({ category: 'filmShop', cheapestRollName: 'Kodak Gold 200', minRollPrice: 50000, maxRollPrice: 150000 });
  });

  it('sends film-shop admin records to the shared labs endpoint with their category and prices', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 'shop-2' }));
    vi.stubGlobal('fetch', fetchMock);
    await serviceHubApi.create({ category: 'filmShop', name: 'Shop mới', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 45000, maxRollPrice: 120000 });

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/labs', expect.objectContaining({ method: 'POST' }));
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload).toMatchObject({ adminCategory: 'filmShop', minRollPrice: 45000, maxRollPrice: 120000, cheapestRollName: 'Kodak Gold 200', inStockFilms: ['Kodak Gold 200'] });
  });
});
