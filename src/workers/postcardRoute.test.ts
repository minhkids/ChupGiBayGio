import { describe, expect, it, vi } from 'vitest';
import routes, { consumeQuota, dayKey, quotaSubject, requestWatercolor } from './postcardRoute';

describe('postcard route helpers', () => {
  it('names the daily quota key by IP and date', () => {
    expect(dayKey('1.2.3.4', new Date('2026-11-11T00:00:00Z'))).toBe('postcard:1.2.3.4:2026-11-11');
  });

  it('keys IPv6 on the /64 and leaves IPv4 unchanged', () => {
    expect(quotaSubject('1.2.3.4')).toBe('1.2.3.4');
    expect(quotaSubject('2001:0DB8:85A3:0000:0000:8A2E:0370:7334')).toBe('2001:0db8:85a3:0000');
    expect(quotaSubject('2a09:bac5:d45f:188c::272:68')).toBe('2a09:bac5:d45f:188c');
    expect(quotaSubject('2A09:BAC5:D45F:188C::272:68')).toBe('2a09:bac5:d45f:188c');
    expect(quotaSubject('::1')).toBe('0:0:0:0');
    expect(quotaSubject('0:0:0:0:ffff:1:2:3')).toBe('0:0:0:0');
    expect(quotaSubject('1::')).toBe('1:0:0:0');
    expect(quotaSubject('2a09:bac5::188c:0:272:68')).toBe('2a09:bac5:0:0');
    const day = new Date('2026-11-11T00:00:00Z');
    expect(dayKey('2a09:bac5:d45f:188c::272:68', day)).toBe('postcard:2a09:bac5:d45f:188c:2026-11-11');
    expect(dayKey('2a09:bac5:d45f:188c:aaaa:bbbb:cccc:dddd', day)).toBe('postcard:2a09:bac5:d45f:188c:2026-11-11');
  });

  it('allows one postcard then blocks', async () => {
    const store = new Map<string, string>();
    const kv = {
      get: async (key: string) => store.get(key) ?? null,
      put: async (key: string, value: string) => { store.set(key, value); },
    } as unknown as KVNamespace;
    expect(await consumeQuota(kv, 'a')).toBe(true);
    expect(await consumeQuota(kv, 'a')).toBe(false);
    expect(await consumeQuota(kv, '2a09:bac5:d45f:188c::272:68')).toBe(true);
    expect(await consumeQuota(kv, '2a09:bac5:d45f:188c:ffff:1:2:3')).toBe(false);
    expect(await consumeQuota(kv, '1.2.3.4')).toBe(true);
  });

  it('sends a low-quality edit to OpenAI', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: [{ b64_json: 'abc' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const artwork = await requestWatercolor('sk-test', new Blob(['x'], { type: 'image/jpeg' }));
    expect(artwork).toBe('abc');
    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body.get('quality')).toBe('low');
    expect(body.get('size')).toBe('1024x1536');
    expect(body.get('model')).toBe('gpt-image-2');
    expect(body.get('input_fidelity')).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.openai.com/v1/images/edits');
    vi.unstubAllGlobals();
  });
});

function memoryCache() {
  const store = new Map<string, string>();
  const kv = {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => { store.set(key, value); },
  } as unknown as KVNamespace;
  return { store, kv };
}

const image = (bytes = 8) => new File([new Uint8Array(bytes)], 'photo.jpg', { type: 'image/jpeg' });
const upload = (file: File, ip = '203.0.113.9') => {
  const form = new FormData();
  form.set('image', file);
  return { method: 'POST', headers: { 'cf-connecting-ip': ip }, body: form };
};

describe('POST /api/postcard', () => {
  it('returns 503 without spending quota when OpenAI is not configured', async () => {
    const { store, kv } = memoryCache();
    const response = await routes.request('/api/postcard', upload(image()), { CACHE: kv });
    expect(response.status).toBe(503);
    expect(store.size).toBe(0);
  });

  it('rejects an invalid image before spending quota', async () => {
    const { store, kv } = memoryCache();
    const env = { CACHE: kv, OPENAI_API_KEY: 'sk-test' };
    const missing = await routes.request('/api/postcard', { method: 'POST', body: new FormData() }, env);
    expect(missing.status).toBe(400);
    expect(await missing.json()).toEqual({ error: 'Thiếu ảnh.' });
    const broken = await routes.request('/api/postcard', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=----broken' },
      body: 'not a form',
    }, env);
    expect(broken.status).toBe(400);
    expect(await broken.json()).toEqual({ error: 'Dữ liệu không hợp lệ.' });
    const huge = await routes.request('/api/postcard', upload(image(2_500_001)), env);
    expect(huge.status).toBe(413);
    expect(await huge.json()).toEqual({ error: 'Ảnh lớn hơn 2.5MB sau khi thu nhỏ.' });
    expect(store.size).toBe(0);
  });

  it('spends one /64 quota only after a valid image and refunds when OpenAI fails', async () => {
    const { store, kv } = memoryCache();
    const env = { CACHE: kv, OPENAI_API_KEY: 'sk-test' };
    let attempts = 0;
    const fetchMock = vi.fn(async () => {
      attempts += 1;
      if (attempts === 1) return new Response('upstream down', { status: 500 });
      return new Response(JSON.stringify({ data: [{ b64_json: 'abc' }] }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const prefix = '2a09:bac5:d45f:188c';
    try {
      const failed = await routes.request('/api/postcard', upload(image(), `${prefix}::272:68`), env);
      expect(failed.status).toBe(502);
      expect(store.get(dayKey(`${prefix}::272:68`))).toBe('0');
      const created = await routes.request('/api/postcard', upload(image(), `${prefix}:aaaa:bbbb:cccc:dddd`), env);
      expect(created.status).toBe(200);
      expect(await created.json()).toEqual({ artwork: 'abc' });
      const again = await routes.request('/api/postcard', upload(image(), `${prefix}::1`), env);
      expect(again.status).toBe(429);
      const other = await routes.request('/api/postcard', upload(image(), '203.0.113.10'), env);
      expect(other.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
