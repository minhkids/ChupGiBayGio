import { Hono } from 'hono';
import { isSpotLocationResult, photonLocations } from '../utils/spotLocationSearch';

const routes = new Hono<{ Bindings: { CACHE: KVNamespace } }>();
routes.get('/api/spot-location-search', async c => {
  const query = c.req.query('q') || '';
  if (query.trim().length < 3 || query.length > 160) return c.json({ error: 'Nhập địa chỉ từ 3 đến 160 ký tự.' }, 400);
  // Exact query is hashed, not abbreviated/rewritten or exposed in a KV key.
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(query));
  const cacheKey = `spot:location:v1:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
  try {
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      try {
        const rows: unknown = JSON.parse(cached);
        if (Array.isArray(rows) && rows.length <= 5 && rows.every(isSpotLocationResult)) return c.json(rows);
      } catch { /* Ignore corrupt cached results. */ }
    }
    // Best-effort per-IP KV quota (not atomic across isolates; see docs).
    const rateKey = `spot:location:rate:${c.req.header('CF-Connecting-IP') || 'local'}`;
    const count = Number(await c.env.CACHE.get(rateKey)) || 0;
    if (count >= 10) return c.json({ error: 'Bạn đã tìm nhiều địa chỉ. Vui lòng đợi một phút rồi thử lại.' }, 429);
    await c.env.CACHE.put(rateKey, String(count + 1), { expirationTtl: 60 });
    const params = new URLSearchParams({ q: query, limit: '5', lat: '21.0285', lon: '105.8542' });
    const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'ChupGiBayGio/1.0 (https://chupgibaygio.com)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Provider unavailable');
    const results = photonLocations(await response.json());
    await c.env.CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 3600 });
    return c.json(results);
  } catch {
    return c.json({ error: 'Chưa tìm được địa chỉ lúc này. Hãy thử lại hoặc chọn điểm trên bản đồ.' }, 503);
  }
});
export default routes;