import { describe, expect, it, vi } from 'vitest';
import worker from './index';
import { consumeQuota, dayKey, requestWatercolor, resetPostcardQuota } from './postcardRoute';

describe('postcard route helpers', () => {
  it('names the daily quota key by IP and date', () => {
    expect(dayKey('1.2.3.4', new Date('2026-11-11T00:00:00Z'))).toBe('postcard:1.2.3.4:2026-11-11');
  });

  it('allows one postcard then blocks', async () => {
    const store = new Map<string, string>();
    const kv = {
      get: async (key: string) => store.get(key) ?? null,
      put: async (key: string, value: string) => { store.set(key, value); },
    } as unknown as KVNamespace;
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
    expect(body.get('size')).toBe('1536x1024');
    expect(body.get('model')).toBe('gpt-image-2');
    expect(body.get('input_fidelity')).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.openai.com/v1/images/edits');
    vi.unstubAllGlobals();
  });
});

function quotaEnv(keys: string[], pageSize = 2) {
  const deleted: string[] = [];
  const listed: { prefix?: string | null; cursor?: string | null }[] = [];
  const cache = new Map<string, string>();
  const kv = {
    get: async (key: string) => cache.get(key) ?? null,
    put: async (key: string, value: string) => { cache.set(key, value); },
    delete: async (key: string) => { deleted.push(key); cache.delete(key); },
    list: async (options: { prefix?: string | null; cursor?: string | null } = {}) => {
      listed.push(options);
      const prefix = options.prefix ?? '';
      const start = options.cursor ? Number(options.cursor) : 0;
      const matches = keys.filter(name => name.startsWith(prefix));
      const slice = matches.slice(start, start + pageSize);
      const next = start + slice.length;
      const list_complete = next >= matches.length;
      return { keys: slice.map(name => ({ name })), list_complete, cursor: list_complete ? undefined : String(next) };
    },
  } as unknown as KVNamespace;
  return {
    env: {
      CACHE: kv,
      DB: {} as D1Database,
      R2_BUCKET: {} as R2Bucket,
      ADMIN_PASSWORD: 'unit-test-password',
      ADMIN_SESSION_SECRET: 'unit-test-session-secret',
    },
    deleted,
    listed,
  };
}

describe('postcard quota reset', () => {
  it('deletes every postcard key, following the list cursor', async () => {
    const { env, deleted, listed } = quotaEnv([
      'postcard:1.1.1.1:2026-11-14',
      'other:keep',
      'postcard:2.2.2.2:2026-11-15',
      'postcard:3.3.3.3:2026-11-15',
    ]);
    expect(await resetPostcardQuota(env.CACHE)).toBe(3);
    expect(deleted).toEqual([
      'postcard:1.1.1.1:2026-11-14',
      'postcard:2.2.2.2:2026-11-15',
      'postcard:3.3.3.3:2026-11-15',
    ]);
    expect(listed.map(call => call.prefix)).toEqual(['postcard:', 'postcard:']);
    expect(listed.map(call => call.cursor)).toEqual([undefined, '2']);
  });

  it('requires the same admin session as other admin routes', async () => {
    const { env, deleted, listed } = quotaEnv(['postcard:9.9.9.9:2026-11-15', 'postcard:8.8.8.8:2026-11-15']);
    const anonymous = await worker.request('/api/admin/postcard-quota/reset', { method: 'POST' }, env);
    expect(anonymous.status).toBe(401);
    expect(await anonymous.json()).toEqual({ error: 'Cần đăng nhập quản trị.' });
    expect(listed).toHaveLength(0);

    const rejected = await worker.request('/api/admin/postcard-quota/reset', {
      method: 'POST',
      headers: { Authorization: 'Bearer not-a-session' },
    }, env);
    expect(rejected.status).toBe(401);
    expect(deleted).toEqual([]);

    const login = await worker.request('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
    }, env);
    expect(login.status).toBe(200);
    const { token } = await login.json() as { token: string };
    const reset = await worker.request('/api/admin/postcard-quota/reset', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, env);
    expect(reset.status).toBe(200);
    expect(await reset.json()).toEqual({ deleted: 2 });
    expect(deleted).toEqual(['postcard:9.9.9.9:2026-11-15', 'postcard:8.8.8.8:2026-11-15']);
  });
});
