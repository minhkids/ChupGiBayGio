import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { REGIONS } from '../data/regions';
import { CONCEPT_METADATA } from '../utils/season';

const routes = new Hono<{ Bindings: { DB: D1Database; CACHE: KVNamespace } }>();

// Public contributions remain hidden until an authenticated admin approves them.
routes.post('/api/community/spots', bodyLimit({ maxSize: 16000, onError: c => c.json({ error: 'Thông tin quá dài.' }, 413) }), async (c) => {
  const origin = c.req.header('Origin');
  if (origin && !['https://chupgibaygio.com', 'https://www.chupgibaygio.com', 'https://chupgibaygio.pages.dev', ...[5173, 5174, 5175].flatMap(port => [`http://localhost:${port}`, `http://127.0.0.1:${port}`])].includes(origin)) return c.json({ error: 'Nguồn gửi không hợp lệ.' }, 403);
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  const fields = new Set(['name', 'address', 'regionId', 'lat', 'lng', 'description', 'coverImageUrl', 'conceptTags', 'placeCategories', 'spotStatus', 'statusValidUntil']);
  const text = (value: unknown, max: number, required = false) => typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);
  if (!body || Array.isArray(body) || Object.keys(body).some(key => !fields.has(key)) ||
    !text(body.name, 160, true) || /[<>"]/.test(String(body.name)) || !text(body.address, 500, true) || !text(body.description, 5000) ||
    !REGIONS.some(region => region.id !== 'all' && region.id === body.regionId) ||
    typeof body.lat !== 'number' || !Number.isFinite(body.lat) || Math.abs(body.lat) > 90 ||
    typeof body.lng !== 'number' || !Number.isFinite(body.lng) || Math.abs(body.lng) > 180 ||
    !Array.isArray(body.conceptTags) || body.conceptTags.length > 20 || body.conceptTags.some(tag => typeof tag !== 'string' || !Object.hasOwn(CONCEPT_METADATA, tag)) ||
    !Array.isArray(body.placeCategories) || body.placeCategories.length < 1 || body.placeCategories.length > 20 || body.placeCategories.some(category => typeof category !== 'string' || !/^[A-Z][A-Z0-9_]{0,39}$/.test(category)) ||
    !['ACTIVE', 'PEAK', 'ENDING_SOON'].includes(String(body.spotStatus))) return c.json({ error: 'Thông tin địa điểm không hợp lệ.' }, 400);
  const placeCategories = [...new Set(body.placeCategories as string[])];
  const categoryPlaceholders = placeCategories.map(() => '?').join(', ');
  const { results: knownCategories } = await c.env.DB.prepare(`SELECT id FROM place_categories WHERE id IN (${categoryPlaceholders})`).bind(...placeCategories).all();
  const knownCategoryIds = new Set((knownCategories || []).map(row => String((row as Record<string, unknown>).id)));
  if (placeCategories.some(category => !knownCategoryIds.has(category))) return c.json({ error: 'Nhóm địa điểm không hợp lệ hoặc đã bị xóa.' }, 400);
  const expiry = body.statusValidUntil;
  if (body.spotStatus !== 'ACTIVE' && (typeof expiry !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(expiry) || !Number.isFinite(Date.parse(expiry)) || new Date(expiry).toISOString().slice(0, 10) !== expiry)) return c.json({ error: 'Hạn nhãn mùa không hợp lệ.' }, 400);
  let imageValid = body.coverImageUrl === '/spot-image-pending.svg';
  if (text(body.coverImageUrl, 2000)) {
    try {
      const image = new URL(String(body.coverImageUrl));
      imageValid ||= image.origin === new URL(c.req.url).origin && !image.search && !image.hash && /^\/api\/spot-images\/[a-zA-Z0-9_-]{1,100}\/[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(image.pathname);
    } catch { /* Only the placeholder or our uploaded images are accepted. */ }
  }
  if (!imageValid) return c.json({ error: 'Ảnh minh họa không hợp lệ.' }, 400);
  // Same best-effort KV quota as partner onboarding; fail closed on KV outage.
  const quota = `community:spot:${c.req.header('CF-Connecting-IP') || 'local'}`;
  if (await c.env.CACHE.get(quota)) return c.json({ error: 'Vui lòng thử lại sau 24 giờ hoặc liên hệ quản trị viên.' }, 429);
  await c.env.CACHE.put(quota, '1', { expirationTtl: 86400 });
  const id = crypto.randomUUID();
  const trend = { id, trendTitle: String(body.name).trim(), startMonth: 1, endMonth: 12, status: body.spotStatus, ...(body.spotStatus !== 'ACTIVE' ? { statusValidUntil: expiry } : {}), conceptTags: body.conceptTags, placeCategories, isTrending: false, trendScore: 0 };
  await c.env.DB.prepare(`INSERT INTO spots
    (id, name, slug, region_id, address, lat, lng, description, cover_image_url, gallery_urls, seasonal_trend, best_time_of_day, best_time_description, cost_type, is_active, is_featured, saves_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, String(body.name).trim(), `community-${id}`, body.regionId, String(body.address).trim(), body.lat, body.lng, String(body.description).trim(), body.coverImageUrl, JSON.stringify([body.coverImageUrl]), JSON.stringify(trend), 'SUNSET', 'Chưa xác minh khung giờ chụp', 'FREE', 0, 0, 0).run();
  return c.json({ id, status: 'pending_review' }, 201);
});

export default routes;
