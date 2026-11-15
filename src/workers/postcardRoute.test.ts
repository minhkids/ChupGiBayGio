import { describe, expect, it, vi } from 'vitest';
import { consumeQuota, dayKey, requestWatercolor } from './postcardRoute';

describe('postcard route helpers', () => {
  it('names the daily quota key by IP and date', () => {
    expect(dayKey('1.2.3.4', new Date('2026-11-11T00:00:00Z'))).toBe('postcard:1.2.3.4:2026-11-11');
  });

  it('allows three postcards then blocks', async () => {
    const store = new Map<string, string>();
    const kv = {
      get: async (key: string) => store.get(key) ?? null,
      put: async (key: string, value: string) => { store.set(key, value); },
    } as unknown as KVNamespace;
    expect(await consumeQuota(kv, 'a')).toBe(true);
    expect(await consumeQuota(kv, 'a')).toBe(true);
    expect(await consumeQuota(kv, 'a')).toBe(true);
    expect(await consumeQuota(kv, 'a')).toBe(false);
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
