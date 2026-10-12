import { afterEach, describe, expect, it, vi } from 'vitest';
import { request } from './serviceHubApi';

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
});
