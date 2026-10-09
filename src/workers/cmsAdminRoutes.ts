import { Hono } from 'hono';
import { getD1, jsonText } from './d1Client';

type Bindings = { DB: D1Database; R2_BUCKET: R2Bucket; ADMIN_SESSION_SECRET?: string; R2_PUBLIC_BASE_URL?: string };
const cms = new Hono<{ Bindings: Bindings }>();
const encoder = new TextEncoder();

async function validSession(token: string, secret: string): Promise<boolean> {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const raw = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(raw + '='.repeat((4 - raw.length % 4) % 4))) as { exp?: number };
    if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) return false;
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigRaw = signature.replace(/-/g, '+').replace(/_/g, '/');
    const sig = Uint8Array.from(atob(sigRaw + '='.repeat((4 - sigRaw.length % 4) % 4)), (char) => char.charCodeAt(0));
    return crypto.subtle.verify('HMAC', key, sig, encoder.encode(payload));
  } catch { return false; }
}

cms.use('*', async (c, next) => {
  const secret = c.env.ADMIN_SESSION_SECRET;
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!secret || !token || !(await validSession(token, secret))) return c.json({ error: 'Cần đăng nhập quản trị.' }, 401);
  await next();
});

cms.post('/api/admin/upload', async (c) => {
  const form = await c.req.formData().catch(() => null);
  const file = form?.get('file');
  const entity = form?.get('entity');
  if (!file || typeof file === 'string' || !('arrayBuffer' in file) || !('size' in file) || !('type' in file)) return c.json({ error: 'Vui lòng chọn tệp ảnh.' }, 400);
  if (!['spots', 'outfits', 'photographers', 'films'].includes(String(entity))) return c.json({ error: 'Nhóm ảnh không hợp lệ.' }, 400);
  if (file.size < 1 || file.size > 8 * 1024 * 1024) return c.json({ error: 'Ảnh phải nhỏ hơn hoặc bằng 8 MB.' }, 413);
  const allowed = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);
  const extension = allowed.get(file.type);
  if (!extension) return c.json({ error: 'Chỉ hỗ trợ JPG, PNG hoặc WebP.' }, 415);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  const webp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if ((file.type === 'image/jpeg' && !jpeg) || (file.type === 'image/png' && !png) || (file.type === 'image/webp' && !webp)) return c.json({ error: 'Nội dung tệp không khớp định dạng ảnh.' }, 415);
  const key = `admin/${String(entity)}/${crypto.randomUUID()}.${extension}`;
  await c.env.R2_BUCKET.put(key, bytes, { httpMetadata: { contentType: file.type }, customMetadata: { entity: String(entity) } });
  const baseUrl = c.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '') || `https://pub-${c.env.R2_BUCKET.name}.r2.dev`;
  return c.json({ key, url: `${baseUrl}/${key}` }, 201);
});

const text = (value: unknown, max = 5000): string => typeof value === 'string' ? value.trim().slice(0, max) : '';
const named = (body: Record<string, unknown> | null): body is Record<string, unknown> => Boolean(body && text(body.name, 160));
function array(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}

cms.post('/api/admin/spots', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!named(body) || !text(body.slug, 180) || !text(body.address)) return c.json({ error: 'Tên, slug và địa chỉ là bắt buộc.' }, 400);
  const lat = Number(body.lat); const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return c.json({ error: 'Tọa độ không hợp lệ.' }, 400);
  const bestMonths = array(body.bestMonths);
  if (bestMonths.some((month) => !Number.isInteger(month) || Number(month) < 1 || Number(month) > 12)) return c.json({ error: 'Tháng đẹp phải nằm trong khoảng 1–12.' }, 400);
  const spotStatus = text(body.spotStatus, 20) || 'ACTIVE';
  const statusValidUntil = text(body.statusValidUntil, 10);
  if (!['PEAK', 'ACTIVE', 'ENDING_SOON'].includes(spotStatus) || (spotStatus !== 'ACTIVE' && !/^\d{4}-\d{2}-\d{2}$/.test(statusValidUntil))) {
    return c.json({ error: 'Nhãn theo mùa cần trạng thái hợp lệ và hạn kiểm chứng YYYY-MM-DD.' }, 400);
  }
  const id = crypto.randomUUID();
  const monthNumbers = bestMonths.map(Number);
  const seasonalTrend = JSON.stringify({ id, trendTitle: text(body.goldenHour, 300), startMonth: monthNumbers.length ? Math.min(...monthNumbers) : 1, endMonth: monthNumbers.length ? Math.max(...monthNumbers) : 12, status: spotStatus, ...(spotStatus !== 'ACTIVE' ? { statusValidUntil } : {}), conceptTags: [], isTrending: false, trendScore: 0 });
  await getD1(c.env).prepare(`INSERT INTO spots (id, region_id, name, slug, address, lat, lng, best_time_of_day,
    best_time_description, cost_type, cover_image_url, description, district, best_months, golden_hour, entry_fee, parking_fee, source_url, seasonal_trend)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, text(body.regionId, 80) || 'hanoi', text(body.name, 160), text(body.slug, 180), text(body.address), lat, lng,
      text(body.bestTimeOfDay, 40) || 'afternoon', text(body.goldenHour, 300), text(body.costType, 40) || 'FREE', text(body.coverImageUrl, 2000),
      text(body.description), text(body.district, 120), jsonText(bestMonths), text(body.goldenHour, 300), text(body.entryFee, 200), text(body.parkingFee, 200), text(body.sourceUrl, 2000), seasonalTrend).run();
  return c.json({ ...body, id, bestMonths }, 201);
});

cms.post('/api/admin/outfits', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!named(body)) return c.json({ error: 'Tên trang phục là bắt buộc.' }, 400);
  const id = crypto.randomUUID(); const hotspots = array(body.hotspots);
  await getD1(c.env).prepare(`INSERT INTO outfits (id, spot_id, name, description, material, estimated_price, image_url, hotspots, shopee_url, tiktok_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, text(body.spotId, 160) || null, text(body.name, 160), text(body.description), text(body.material, 300), text(body.estimatedPrice, 100), text(body.imageUrl, 2000),
      jsonText(hotspots), text(body.shopeeUrl, 2000), text(body.tiktokUrl, 2000)).run();
  return c.json({ ...body, id, hotspots }, 201);
});

cms.post('/api/admin/rental-shops', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!named(body)) return c.json({ error: 'Tên tiệm là bắt buộc.' }, 400);
  const id = crypto.randomUUID();
  await getD1(c.env).prepare('INSERT INTO rental_shops (id, name, address, hotline, fanpage_url, daily_price) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, text(body.name, 160), text(body.address), text(body.hotline, 80), text(body.fanpageUrl, 2000), text(body.dailyPrice, 100)).run();
  return c.json({ ...body, id }, 201);
});

cms.post('/api/admin/photographers', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!named(body)) return c.json({ error: 'Tên nhiếp ảnh gia là bắt buộc.' }, 400);
  const id = crypto.randomUUID(); const db = getD1(c.env);
  await db.prepare(`INSERT INTO photographers (id, name, avatar_url, bio, phone, instagram, gear_body, gear_lens, styles, portfolio_photos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, text(body.name, 160), text(body.avatarUrl, 2000), text(body.bio), text(body.phone, 80), text(body.instagram, 300),
      text(body.gearBody, 300), text(body.gearLens, 300), jsonText(body.styles), jsonText(body.portfolioPhotos)).run();
  const packages = Array.isArray(body.packages) ? body.packages as Record<string, unknown>[] : [];
  for (const pkg of packages.slice(0, 30)) {
    const packageName = text(pkg.name, 160);
    if (!packageName) continue;
    await db.prepare('INSERT INTO photographer_packages (id, photographer_id, name, price, duration, delivered_photos) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), id, packageName, Math.max(0, Number(pkg.price) || 0), text(pkg.duration, 120), Math.max(0, Number(pkg.deliveredPhotos) || 0)).run();
  }
  return c.json({ ...body, id }, 201);
});

cms.post('/api/admin/films', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!named(body)) return c.json({ error: 'Tên cuộn film là bắt buộc.' }, 400);
  const id = crypto.randomUUID(); const seasons = array(body.suitableSeasons);
  await getD1(c.env).prepare('INSERT INTO film_rolls (id, name, iso, tone, suitable_seasons, package_image_url, sample_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, text(body.name, 160), Math.max(0, Number(body.iso) || 0), text(body.tone, 500), jsonText(seasons), text(body.packageImageUrl, 2000), text(body.sampleImageUrl, 2000)).run();
  return c.json({ ...body, id, suitableSeasons: seasons }, 201);
});

cms.post('/api/admin/labs', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!named(body)) return c.json({ error: 'Tên lab là bắt buộc.' }, 400);
  const lat = body.lat == null || body.lat === '' ? null : Number(body.lat);
  const lng = body.lng == null || body.lng === '' ? null : Number(body.lng);
  if ((lat !== null && !Number.isFinite(lat)) || (lng !== null && !Number.isFinite(lng))) return c.json({ error: 'Tọa độ không hợp lệ.' }, 400);
  const id = crypto.randomUUID(); const films = array(body.inStockFilms);
  await getD1(c.env).prepare('INSERT INTO film_labs (id, name, address, lat, lng, opening_hours, hotline, fast_2h, in_stock_films) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, text(body.name, 160), text(body.address), lat, lng, text(body.openingHours, 300), text(body.hotline, 80), body.fast2h ? 1 : 0, jsonText(films)).run();
  return c.json({ ...body, id, inStockFilms: films }, 201);
});

cms.get('/api/admin/cms/:table', async (c) => {
  const queries: Record<string, string> = {
    spots: 'SELECT * FROM spots ORDER BY created_at DESC', outfits: 'SELECT * FROM outfits ORDER BY created_at DESC',
    photographers: 'SELECT * FROM photographers ORDER BY created_at DESC', films: 'SELECT * FROM film_rolls ORDER BY created_at DESC',
    labs: 'SELECT * FROM film_labs ORDER BY created_at DESC', rentalShops: 'SELECT * FROM rental_shops ORDER BY created_at DESC'
  };
  const sql = queries[c.req.param('table')];
  if (!sql) return c.json({ error: 'Danh mục không hợp lệ.' }, 404);
  const { results } = await getD1(c.env).prepare(sql).all();
  if (c.req.param('table') === 'photographers') {
    const { results: packages } = await getD1(c.env).prepare('SELECT * FROM photographer_packages ORDER BY rowid').all();
    return c.json((results || []).map((row) => {
      const person = row as Record<string, unknown>;
      return { ...person, packages: ((packages || []) as Record<string, unknown>[]).filter((pkg) => pkg.photographer_id === person.id).map((pkg) => ({ name: pkg.name, price: pkg.price, duration: pkg.duration, deliveredPhotos: pkg.delivered_photos })) };
    }));
  }
  return c.json(results || []);
});

cms.put('/api/admin/cms/:table/:id', async (c) => {
  const table = c.req.param('table'); const id = c.req.param('id');
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!named(body)) return c.json({ error: 'Tên hiển thị là bắt buộc.' }, 400);
  const db = getD1(c.env);
  let result: D1Result;
  if (table === 'spots') {
    const lat = Number(body.lat); const lng = Number(body.lng); const months = array(body.bestMonths);
    if (!text(body.slug, 180) || !text(body.address) || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || months.some((month) => !Number.isInteger(month) || Number(month) < 1 || Number(month) > 12)) return c.json({ error: 'Thông tin địa điểm hoặc tọa độ không hợp lệ.' }, 400);
    result = await db.prepare('UPDATE spots SET name = ?, slug = ?, region_id = ?, address = ?, district = ?, lat = ?, lng = ?, best_time_of_day = ?, golden_hour = ?, best_months = ?, entry_fee = ?, parking_fee = ?, source_url = ?, cover_image_url = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(text(body.name, 160), text(body.slug, 180), text(body.regionId, 80) || 'hanoi', text(body.address), text(body.district, 120), lat, lng, text(body.bestTimeOfDay, 40) || 'afternoon', text(body.goldenHour, 300), jsonText(months), text(body.entryFee, 200), text(body.parkingFee, 200), text(body.sourceUrl, 2000), text(body.coverImageUrl, 2000), text(body.description), id).run();
  } else if (table === 'outfits') {
    result = await db.prepare('UPDATE outfits SET spot_id = ?, name = ?, description = ?, material = ?, estimated_price = ?, image_url = ?, hotspots = ?, shopee_url = ?, tiktok_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(text(body.spotId, 160) || null, text(body.name, 160), text(body.description), text(body.material, 300), text(body.estimatedPrice, 100), text(body.imageUrl, 2000), jsonText(array(body.hotspots)), text(body.shopeeUrl, 2000), text(body.tiktokUrl, 2000), id).run();
  } else if (table === 'rentalShops') {
    result = await db.prepare('UPDATE rental_shops SET name = ?, address = ?, hotline = ?, fanpage_url = ?, daily_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(text(body.name, 160), text(body.address), text(body.hotline, 80), text(body.fanpageUrl, 2000), text(body.dailyPrice, 100), id).run();
  } else if (table === 'photographers') {
    result = await db.prepare('UPDATE photographers SET name = ?, avatar_url = ?, bio = ?, phone = ?, instagram = ?, gear_body = ?, gear_lens = ?, styles = ?, portfolio_photos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(text(body.name, 160), text(body.avatarUrl, 2000), text(body.bio), text(body.phone, 80), text(body.instagram, 300), text(body.gearBody, 300), text(body.gearLens, 300), jsonText(body.styles), jsonText(body.portfolioPhotos), id).run();
    if (result.meta.changes) {
      await db.prepare('DELETE FROM photographer_packages WHERE photographer_id = ?').bind(id).run();
      const packages = Array.isArray(body.packages) ? body.packages as Record<string, unknown>[] : [];
      for (const pkg of packages.slice(0, 30)) if (text(pkg.name, 160)) {
        await db.prepare('INSERT INTO photographer_packages (id, photographer_id, name, price, duration, delivered_photos) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(crypto.randomUUID(), id, text(pkg.name, 160), Math.max(0, Number(pkg.price) || 0), text(pkg.duration, 120), Math.max(0, Number(pkg.deliveredPhotos) || 0)).run();
      }
    }
  } else if (table === 'films') {
    result = await db.prepare('UPDATE film_rolls SET name = ?, iso = ?, tone = ?, suitable_seasons = ?, package_image_url = ?, sample_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(text(body.name, 160), Math.max(0, Number(body.iso) || 0), text(body.tone, 500), jsonText(array(body.suitableSeasons)), text(body.packageImageUrl, 2000), text(body.sampleImageUrl, 2000), id).run();
  } else if (table === 'labs') {
    const lat = body.lat == null || body.lat === '' ? null : Number(body.lat); const lng = body.lng == null || body.lng === '' ? null : Number(body.lng);
    if ((lat !== null && !Number.isFinite(lat)) || (lng !== null && !Number.isFinite(lng))) return c.json({ error: 'Tọa độ không hợp lệ.' }, 400);
    result = await db.prepare('UPDATE film_labs SET name = ?, address = ?, lat = ?, lng = ?, opening_hours = ?, hotline = ?, fast_2h = ?, in_stock_films = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(text(body.name, 160), text(body.address), lat, lng, text(body.openingHours, 300), text(body.hotline, 80), body.fast2h ? 1 : 0, jsonText(array(body.inStockFilms)), id).run();
  } else {
    return c.json({ error: 'Danh mục không hợp lệ.' }, 404);
  }
  return result.meta.changes ? c.json({ ...body, id }) : c.json({ error: 'Không tìm thấy mục.' }, 404);
});

cms.delete('/api/admin/cms/:table/:id', async (c) => {
  const table = c.req.param('table'); const id = c.req.param('id'); const db = getD1(c.env);
  const statements: Record<string, string> = {
    spots: 'DELETE FROM spots WHERE id = ?', outfits: 'DELETE FROM outfits WHERE id = ?', rentalShops: 'DELETE FROM rental_shops WHERE id = ?',
    photographers: 'DELETE FROM photographers WHERE id = ?', films: 'DELETE FROM film_rolls WHERE id = ?', labs: 'DELETE FROM film_labs WHERE id = ?'
  };
  const sql = statements[table];
  if (!sql) return c.json({ error: 'Danh mục không hợp lệ.' }, 404);
  if (table === 'photographers') await db.prepare('DELETE FROM photographer_packages WHERE photographer_id = ?').bind(id).run();
  const result = await db.prepare(sql).bind(id).run();
  return result.meta.changes ? c.json({ success: true }) : c.json({ error: 'Không tìm thấy mục.' }, 404);
});

export default cms;
