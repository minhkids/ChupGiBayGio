import { describe, expect, it, vi } from 'vitest';
import worker from './frontend';

const assetsResponse = () => new Response('app shell', { headers: { 'Content-Type': 'text/html', 'X-Asset': 'preserved' } });

describe('frontend HTTPS enforcement', () => {
  it('permanently redirects production HTTP requests to the same HTTPS URL before serving assets', async () => {
    const fetch = vi.fn(async () => assetsResponse());
    const response = await worker.fetch(
      new Request('http://chupgibaygio.com/story?mode=vertical'),
      { ASSETS: { fetch } },
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe('https://chupgibaygio.com/story?mode=vertical');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('serves production HTTPS assets with HSTS while preserving asset headers and body', async () => {
    const fetch = vi.fn(async () => assetsResponse());
    const response = await worker.fetch(
      new Request('https://chupgibaygio.com/'),
      { ASSETS: { fetch } },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000');
    expect(response.headers.get('X-Asset')).toBe('preserved');
    expect(await response.text()).toBe('app shell');
  });

  it('does not force HTTPS on loopback development hosts', async () => {
    const fetch = vi.fn(async () => assetsResponse());
    const response = await worker.fetch(
      new Request('http://127.0.0.1:5173/'),
      { ASSETS: { fetch } },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Strict-Transport-Security')).toBeNull();
    expect(fetch).toHaveBeenCalledOnce();
  });
});
