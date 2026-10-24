import { Hono } from 'hono';

interface Point {
  lat: number;
  lng: number;
}

const routes = new Hono<{ Bindings: { CACHE: KVNamespace } }>();
const MAX_WAYPOINTS = 7;
const MAX_REQUESTS_PER_MINUTE = 10;
const ROUTER_BASE = 'https://routing.openstreetmap.de/routed-bike/route/v1/driving';
const encoder = new TextEncoder();

function validPoint(value: unknown): value is Point {
  if (!value || typeof value !== 'object') return false;
  const { lat, lng } = value as Record<string, unknown>;
  return typeof lat === 'number' && typeof lng === 'number'
    && Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= 8 && lat <= 24 && lng >= 102 && lng <= 110;
}

async function digest(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

routes.post('/api/cycling-route', async c => {
  if (Number(c.req.header('Content-Length') || 0) > 20000) return c.json({ error: 'Lộ trình có quá nhiều điểm.' }, 413);
  const body = await c.req.json().catch(() => null) as { stops?: unknown } | null;
  const stops = body?.stops;
  if (!Array.isArray(stops) || stops.length < 2 || stops.length > MAX_WAYPOINTS || !stops.every(validPoint)) {
    return c.json({ error: `Lộ trình cần từ 2 đến ${MAX_WAYPOINTS} điểm có tọa độ hợp lệ tại Việt Nam.` }, 400);
  }

  const routeKey = `cycling:route:v1:${await digest(JSON.stringify(stops))}`;
  try {
    const cached = await c.env.CACHE.get(routeKey);
    if (cached) {
      try { return c.json(JSON.parse(cached)); }
      catch { /* Ignore corrupt cached route. */ }
    }

    const ipHash = await digest(c.req.header('CF-Connecting-IP') || 'local');
    const cooldownKey = `cycling:cooldown:${ipHash}`;
    const now = Date.now();
    const lastRequest = Number(await c.env.CACHE.get(cooldownKey)) || 0;
    if (now - lastRequest < 1000) return c.json({ error: 'Vui lòng chờ một giây trước khi tạo hành trình khác.' }, 429);
    await c.env.CACHE.put(cooldownKey, String(now), { expirationTtl: 60 });
    const limitKey = `cycling:limit:${ipHash}`;
    const used = Number(await c.env.CACHE.get(limitKey)) || 0;
    if (used >= MAX_REQUESTS_PER_MINUTE) return c.json({ error: 'Bạn đã tạo nhiều hành trình. Vui lòng thử lại sau một phút.' }, 429);
    await c.env.CACHE.put(limitKey, String(used + 1), { expirationTtl: 60 });

    const coordinates = stops.map(point => `${point.lng},${point.lat}`).join(';');
    const url = new URL(`${ROUTER_BASE}/${coordinates}`);
    url.search = new URLSearchParams({ overview: 'full', geometries: 'geojson', steps: 'false', alternatives: 'false' }).toString();
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'ChupGiBayGio/1.0 (https://chupgibaygio.com)', 'X-Client-Id': 'chupgibaygio.com' },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error('Cycling router unavailable');
    const data = await response.json() as {
      code?: unknown;
      routes?: { geometry?: { type?: unknown; coordinates?: unknown }; distance?: unknown; duration?: unknown; legs?: { distance?: unknown; duration?: unknown }[] }[];
    };
    const route = data.routes?.[0];
    const geometry = route?.geometry;
    const coordinatesOut = geometry?.coordinates;
    if (data.code !== 'Ok' || !geometry || geometry.type !== 'LineString' || !Array.isArray(coordinatesOut)
      || coordinatesOut.length < 2 || !coordinatesOut.every(point => Array.isArray(point) && point.length >= 2
        && typeof point[0] === 'number' && typeof point[1] === 'number' && Number.isFinite(point[0]) && Number.isFinite(point[1]))
      || typeof route.distance !== 'number' || !Number.isFinite(route.distance) || route.distance <= 0
      || typeof route.duration !== 'number' || !Number.isFinite(route.duration) || route.duration <= 0) {
      return c.json({ error: 'Không tìm được tuyến xe đạp cho các điểm đã chọn.' }, 502);
    }

    const result = {
      geometry,
      distanceKm: route.distance / 1000,
      durationMinutes: route.duration / 60,
      legs: (route.legs || []).map(leg => ({
        distanceKm: typeof leg.distance === 'number' ? leg.distance / 1000 : 0,
        durationMinutes: typeof leg.duration === 'number' ? leg.duration / 60 : 0,
      })),
      attribution: '© OpenStreetMap contributors · tuyến xe đạp từ routing.openstreetmap.de',
    };
    await c.env.CACHE.put(routeKey, JSON.stringify(result), { expirationTtl: 3600 }).catch(() => undefined);
    return c.json(result);
  } catch {
    return c.json({ error: 'Dịch vụ định tuyến xe đạp đang tạm gián đoạn. Vui lòng thử lại.' }, 502);
  }
});

export default routes;