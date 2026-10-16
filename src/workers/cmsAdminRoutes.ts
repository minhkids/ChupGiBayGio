import { Hono } from 'hono';
import { getD1, jsonText } from './d1Client';

type Bindings = { DB: D1Database; R2_BUCKET: R2Bucket; ADMIN_SESSION_SECRET?: string; R2_PUBLIC_BASE_URL?: string };
const cms = new Hono<{ Bindings: Bindings }>();
const encoder = new TextEncoder();
const districts = new Set(['Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Cầu Giấy', 'Hai Bà Trưng', 'Tây Hồ', 'Thanh Xuân', 'Long Biên', 'Hà Đông', 'Hoàng Mai', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Thanh Trì', 'Hoài Đức', 'Đan Phượng', 'Thanh Oai', 'Thường Tín', 'Phúc Thọ', 'Quốc Oai', 'Thạch Thất', 'Chương Mỹ', 'Mỹ Đức', 'Ứng Hòa', 'Ba Vì', 'Sơn Tây', 'Mê Linh']);

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

cms.post('/api/admin/community-spots/:id/approve', async (c) => {
  const id = c.req.param('id');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return c.json({ error: 'Mã địa điểm không hợp lệ.' }, 400);
  const result = await getD1(c.env).prepare(`UPDATE spots SET is_active = 1
    WHERE id = ? AND is_active = 0 AND slug LIKE 'community-%'`).bind(id).run();
  if (!result.meta.changes) return c.json({ error: 'Không tìm thấy địa điểm đang chờ duyệt.' }, 404);
  return c.json({ success: true, id });
});

cms.delete('/api/admin/community-spots/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return c.json({ error: 'Mã địa điểm không hợp lệ.' }, 400);
  const result = await getD1(c.env).prepare(`DELETE FROM spots
    WHERE id = ? AND is_active = 0 AND slug LIKE 'community-%'`).bind(id).run();
  if (!result.meta.changes) return c.json({ error: 'Không tìm thấy địa điểm đang chờ duyệt.' }, 404);
  return c.json({ success: true, id });
});

cms.post('/api/admin/upload', async (c) => {
  const form = await c.req.formData().catch(() => null);
  const file = form?.get('file');
  const entity = form?.get('entity');
  if (!file || typeof file === 'string' || !('arrayBuffer' in file) || !('size' in file) || !('type' in file)) return c.json({ error: 'Vui lòng chọn tệp ảnh.' }, 400);
  if (!['spots', 'outfits', 'photographers', 'films', 'trendArticles'].includes(String(entity))) return c.json({ error: 'Nhóm ảnh không hợp lệ.' }, 400);
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
const trendSection = (value: unknown): value is 'hotTrend' | 'upcomingSpot' => value === 'hotTrend' || value === 'upcomingSpot';
const conceptTagValues = new Set(['HOA_CO', 'VINTAGE', 'NANG_THO', 'AO_DAI', 'FILM', 'STREET', 'CYBERPUNK', 'MINIMAL', 'KIEN_TRUC', 'MAT_TROI', 'CHRISTMAS', 'SUNSET']);
function array(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}

function boundedStringArray(value: unknown, maxItems: number, maxLength: number): string[] | null {
  const values = array(value);
  if (values.length > maxItems || values.some((item) => typeof item !== 'string' || !item.trim() || item.length > maxLength)) return null;
  return values.map((item) => (item as string).trim());
}

function validatedConceptTags(value: unknown): string[] | null {
  const tags = boundedStringArray(value, 20, 40);
  if (!tags || tags.some((tag) => !conceptTagValues.has(tag))) return null;
  return [...new Set(tags)];
}

function validatedPlaceCategories(value: unknown): string[] | null {
  const categories = boundedStringArray(value, 20, 40);
  if (!categories || categories.some((category) => !/^[A-Z][A-Z0-9_]{0,39}$/.test(category))) return null;
  return [...new Set(categories)];
}

async function placeCategoriesExist(db: D1Database, categories: string[]): Promise<boolean> {
  if (!categories.length) return true;
  const placeholders = categories.map(() => '?').join(', ');
  const { results } = await db.prepare(`SELECT id FROM place_categories WHERE id IN (${placeholders})`).bind(...categories).all();
  const existing = new Set((results || []).map((row) => String((row as Record<string, unknown>).id)));
  return categories.every((category) => existing.has(category));
}

function categoryIdFromLabel(label: string): string {
  return label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'D').toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40).replace(/_+$/g, '');
}

function candidateFields(body: Record<string, unknown>) {
  if (body.upcoming !== undefined && typeof body.upcoming !== 'boolean') return null;
  if (body.expectedMonths !== undefined && (!Array.isArray(body.expectedMonths) || body.expectedMonths.length > 12
    || body.expectedMonths.some(month => !Number.isInteger(month) || Number(month) < 1 || Number(month) > 12))) return null;
  if (body.upcoming === true && (!Array.isArray(body.expectedMonths) || !body.expectedMonths.length)) return null;
  return {
    ...(body.upcoming !== undefined ? { upcoming: body.upcoming } : {}),
    ...(body.expectedMonths !== undefined ? { expectedMonths: [...new Set(body.expectedMonths as number[])] } : {}),
  };
}

function rollPriceFields(body: Record<string, unknown>, films: unknown[], isShop: boolean) {
  const minRollPrice = body.minRollPrice == null || body.minRollPrice === '' ? 0 : Number(body.minRollPrice);
  const maxRollPrice = body.maxRollPrice == null || body.maxRollPrice === '' ? 0 : Number(body.maxRollPrice);
  const cheapestRollName = text(body.cheapestRollName, 120);
  const hasRetailPrice = minRollPrice > 0 || maxRollPrice > 0;
  if (!Number.isSafeInteger(minRollPrice) || !Number.isSafeInteger(maxRollPrice) || minRollPrice < 0 || minRollPrice > 50000000 || maxRollPrice < 0 || maxRollPrice > 0 && maxRollPrice < minRollPrice || maxRollPrice > 50000000
    || body.adminCategory !== undefined && !['filmLab', 'filmShop'].includes(String(body.adminCategory))
    || isShop && !hasRetailPrice
    || hasRetailPrice && (minRollPrice < 1 || !cheapestRollName || !films.map(String).includes(cheapestRollName))) return null;
  return { minRollPrice, maxRollPrice, cheapestRollName };
}

function shopLocations(body: Record<string, unknown>) {
  const submitted = body.locations === undefined
    ? body.ward || body.district ? [{ ward: body.ward, district: body.district, openingHours: body.openingHours }] : []
    : body.locations;
  if (!Array.isArray(submitted) || submitted.length > 3 || body.locations !== undefined && submitted.length < 1) return null;
  const locations = submitted.map((value) => {
    const item = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
    return { ward: text(item.ward, 80), district: text(item.district, 80), openingHours: text(item.openingHours, 120) };
  });
  return locations.some((item) => !item.ward || !districts.has(item.district)) ? null : locations;
}

cms.get('/api/admin/place-categories', async (c) => {
  const { results } = await getD1(c.env).prepare('SELECT id, label, sort_order FROM place_categories ORDER BY sort_order ASC, label COLLATE NOCASE ASC').all();
  return c.json((results || []).map((value) => {
    const row = value as Record<string, unknown>;
    return { id: String(row.id), label: String(row.label), sortOrder: Number(row.sort_order) };
  }));
});

cms.post('/api/admin/place-categories', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  const label = typeof body?.label === 'string' ? body.label.trim() : '';
  const id = categoryIdFromLabel(label);
  if (!label || label.length > 80 || !id || !/^[A-Z][A-Z0-9_]{0,39}$/.test(id)) return c.json({ error: 'Tên nhóm cần từ 1 đến 80 ký tự và tạo được mã nhóm hợp lệ.' }, 400);
  const db = getD1(c.env);
  const current = await db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS maximum FROM place_categories').first() as { maximum?: number } | null;
  const sortOrder = Number(current?.maximum || 0) + 1;
  try {
    await db.prepare('INSERT INTO place_categories (id, label, sort_order) VALUES (?, ?, ?)').bind(id, label, sortOrder).run();
  } catch {
    return c.json({ error: 'Tên hoặc mã nhóm này đã tồn tại.' }, 409);
  }
  return c.json({ id, label, sortOrder }, 201);
});

cms.put('/api/admin/place-categories/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  const label = typeof body?.label === 'string' ? body.label.trim() : '';
  if (!label || label.length > 80) return c.json({ error: 'Tên nhóm cần từ 1 đến 80 ký tự.' }, 400);
  const db = getD1(c.env);
  try {
    const result = await db.prepare('UPDATE place_categories SET label = ? WHERE id = ?').bind(label, id).run();
    if (!result.meta.changes) return c.json({ error: 'Không tìm thấy nhóm địa điểm.' }, 404);
  } catch {
    return c.json({ error: 'Tên nhóm này đã được sử dụng.' }, 409);
  }
  const row = await db.prepare('SELECT id, label, sort_order FROM place_categories WHERE id = ?').bind(id).first() as Record<string, unknown>;
  return c.json({ id: String(row.id), label: String(row.label), sortOrder: Number(row.sort_order) });
});

cms.delete('/api/admin/place-categories/:id', async (c) => {
  const id = c.req.param('id');
  const db = getD1(c.env);
  const category = await db.prepare('SELECT id FROM place_categories WHERE id = ?').bind(id).first();
  if (!category) return c.json({ error: 'Không tìm thấy nhóm địa điểm.' }, 404);
  const usage = await db.prepare(`SELECT COUNT(DISTINCT s.id) AS spot_count
    FROM spots AS s, json_each(CASE WHEN json_valid(s.seasonal_trend) THEN s.seasonal_trend ELSE '{}' END, '$.placeCategories') AS category
    WHERE category.value = ?`).bind(id).first() as { spot_count?: number } | null;
  const spotCount = Number(usage?.spot_count || 0);
  if (spotCount > 0) return c.json({ error: `Nhóm đang được gán cho ${spotCount} địa điểm. Hãy gỡ nhóm khỏi các địa điểm trước khi xóa.`, spotCount }, 409);
  await db.prepare('DELETE FROM place_categories WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

cms.post('/api/admin/spots', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!named(body) || !text(body.slug, 180) || !text(body.address)) return c.json({ error: 'Tên, slug và địa chỉ là bắt buộc.' }, 400);
  const lat = Number(body.lat); const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return c.json({ error: 'Tọa độ không hợp lệ.' }, 400);
  const bestMonths = array(body.bestMonths);
  if (bestMonths.some((month) => !Number.isInteger(month) || Number(month) < 1 || Number(month) > 12)) return c.json({ error: 'Tháng đẹp phải nằm trong khoảng 1–12.' }, 400);
  const recommendedLenses = boundedStringArray(body.recommendedLenses ?? [], 12, 120);
  const conceptTags = validatedConceptTags(body.conceptTags ?? []);
  const placeCategories = validatedPlaceCategories(body.placeCategories ?? []);
  const bloomPercentage = body.bloomPercentage === undefined ? 85 : Number(body.bloomPercentage);
  if (!recommendedLenses || !conceptTags || !placeCategories || !(await placeCategoriesExist(getD1(c.env), placeCategories)) || !Number.isInteger(bloomPercentage) || bloomPercentage < 0 || bloomPercentage > 100) return c.json({ error: 'Phần trăm hiện trạng, ống kính, nhóm địa điểm hoặc concept không hợp lệ.' }, 400);
  const spotStatus = text(body.spotStatus, 20) || 'ACTIVE';
  const statusValidUntil = text(body.statusValidUntil, 10);
  if (!['PEAK', 'ACTIVE', 'ENDING_SOON'].includes(spotStatus) || (spotStatus !== 'ACTIVE' && !/^\d{4}-\d{2}-\d{2}$/.test(statusValidUntil))) {
    return c.json({ error: 'Nhãn theo mùa cần trạng thái hợp lệ và hạn kiểm chứng YYYY-MM-DD.' }, 400);
  }
  const id = crypto.randomUUID();
  const monthNumbers = bestMonths.map(Number);
  const candidate = candidateFields(body);
  if (!candidate) return c.json({ error: 'Dự kiến mùa tới cần cờ bật/tắt và tháng dự kiến 1–12.' }, 400);
  const seasonalTrend = JSON.stringify({ id, trendTitle: text(body.goldenHour, 300), startMonth: monthNumbers.length ? Math.min(...monthNumbers) : 1, endMonth: monthNumbers.length ? Math.max(...monthNumbers) : 12, status: spotStatus, ...(spotStatus !== 'ACTIVE' ? { statusValidUntil } : {}), bloomPercentage, conceptTags, placeCategories, isTrending: false, trendScore: 0, ...candidate });
  const bestTimeDescription = body.bestTimeDescription === undefined ? text(body.goldenHour, 300) : text(body.bestTimeDescription, 1000);
  await getD1(c.env).prepare(`INSERT INTO spots (id, region_id, name, slug, address, lat, lng, best_time_of_day,
    best_time_description, recommended_lenses, cost_type, cover_image_url, description, district, best_months, golden_hour, entry_fee, parking_fee, source_url, seasonal_trend)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, text(body.regionId, 80) || 'hanoi', text(body.name, 160), text(body.slug, 180), text(body.address), lat, lng,
      text(body.bestTimeOfDay, 40) || 'afternoon', bestTimeDescription, jsonText(recommendedLenses), text(body.costType, 40) || 'FREE', text(body.coverImageUrl, 2000),
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

for (const [path, table] of [['/api/admin/labs', 'film_labs'], ['/api/admin/film-shops', 'film_shops']] as const) {
  cms.post(path, async (c) => {
    const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
    if (!named(body)) return c.json({ error: 'Tên lab là bắt buộc.' }, 400);
    const lat = body.lat == null || body.lat === '' ? null : Number(body.lat);
    const lng = body.lng == null || body.lng === '' ? null : Number(body.lng);
    if ((lat !== null && !Number.isFinite(lat)) || (lng !== null && !Number.isFinite(lng))) return c.json({ error: 'Tọa độ không hợp lệ.' }, 400);
    const id = crypto.randomUUID(); const films = array(body.inStockFilms); const rollPrices = rollPriceFields(body, films, table === 'film_shops');
    if (!rollPrices) return c.json({ error: 'Cuộn film và khoảng giá bán chưa hợp lệ.' }, 400);
    const locations = shopLocations(body);
    if (!locations || rollPrices.minRollPrice > 0 && !locations.length) return c.json({ error: 'Shop cần khai báo 1–3 địa chỉ Hà Nội hợp lệ.' }, 400);
    const mainLocation = locations[0] || { ward: text(body.ward, 80), district: text(body.district, 80), openingHours: text(body.openingHours, 120) };
    const services = body.services === undefined ? [] : Array.isArray(body.services) ? boundedStringArray(body.services, 20, 120) : null;
    if (!services) return c.json({ error: 'Danh sách dịch vụ không hợp lệ.' }, 400);
    await getD1(c.env).prepare(`INSERT INTO ${table} (id, name, slogan, address, district, ward, lat, lng, opening_hours, hotline, fast_2h, in_stock_films, fanpage_url, image_url, product_image_url, cheapest_roll_name, min_roll_price, max_roll_price, locations, express_delivery_2h, services, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, text(body.name, 160), text(body.slogan, 50), text(body.address), mainLocation.district, mainLocation.ward, lat, lng, mainLocation.openingHours, text(body.hotline, 80), body.fast2h ? 1 : 0, jsonText(films), text(body.fanpageUrl, 2000), text(body.imageUrl, 2000), text(body.productImageUrl, 2000), rollPrices.cheapestRollName, rollPrices.minRollPrice, rollPrices.maxRollPrice, jsonText(locations), body.expressDelivery2h === true ? 1 : 0, jsonText(services), 'published').run();
    return c.json({ ...body, id, inStockFilms: films, ...rollPrices }, 201);
  });
}

cms.get('/api/admin/cms/:table', async (c) => {
  const queries: Record<string, string> = {
    spots: 'SELECT * FROM spots ORDER BY created_at DESC', outfits: 'SELECT * FROM outfits ORDER BY created_at DESC',
    photographers: 'SELECT * FROM photographers ORDER BY created_at DESC', films: 'SELECT * FROM film_rolls ORDER BY created_at DESC',
    labs: 'SELECT * FROM film_labs ORDER BY created_at DESC', filmShops: 'SELECT * FROM film_shops ORDER BY created_at DESC', rentalShops: 'SELECT * FROM rental_shops ORDER BY created_at DESC',
    trendArticles: 'SELECT * FROM trend_articles ORDER BY created_at DESC'
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

cms.post('/api/admin/cms/trendArticles', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !text(body.title, 180) || !trendSection(body.section)) return c.json({ error: 'Tiêu đề và một trong hai tab xu hướng là bắt buộc.' }, 400);
  const id = crypto.randomUUID();
  const article = {
    id,
    section: body.section,
    title: text(body.title, 180),
    content: text(body.content, 10000),
    imageUrl: text(body.imageUrl, 2000),
    location: text(body.location, 300),
    regionId: text(body.regionId, 80) || 'all',
    sourceUrl: text(body.sourceUrl, 2000),
    isPublished: body.isPublished !== false,
  };
  await getD1(c.env).prepare(`INSERT INTO trend_articles (id, section, title, content, image_url, location, region_id, source_url, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, article.section, article.title, article.content, article.imageUrl, article.location, article.regionId, article.sourceUrl, article.isPublished ? 1 : 0).run();
  return c.json(article, 201);
});

cms.put('/api/admin/cms/:table/:id', async (c) => {
  const table = c.req.param('table'); const id = c.req.param('id');
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !(table === 'trendArticles' ? text(body.title, 180) : named(body))) return c.json({ error: 'Tên hiển thị là bắt buộc.' }, 400);
  const db = getD1(c.env);
  let result: D1Result;
  if (table === 'spots') {
    const lat = Number(body.lat); const lng = Number(body.lng); const months = array(body.bestMonths);
    if (!text(body.slug, 180) || !text(body.address) || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || months.some((month) => !Number.isInteger(month) || Number(month) < 1 || Number(month) > 12)) return c.json({ error: 'Thông tin địa điểm hoặc tọa độ không hợp lệ.' }, 400);
    const spotStatus = text(body.spotStatus, 20);
    const statusValidUntil = text(body.statusValidUntil, 10);
    const recommendedLenses = body.recommendedLenses === undefined ? undefined : boundedStringArray(body.recommendedLenses, 12, 120);
    const conceptTags = body.conceptTags === undefined ? undefined : validatedConceptTags(body.conceptTags);
    const placeCategories = body.placeCategories === undefined ? undefined : validatedPlaceCategories(body.placeCategories);
    const bloomPercentage = body.bloomPercentage === undefined ? undefined : Number(body.bloomPercentage);
    if (body.recommendedLenses !== undefined && !recommendedLenses
      || body.conceptTags !== undefined && !conceptTags
      || body.placeCategories !== undefined && (!placeCategories || !(await placeCategoriesExist(getD1(c.env), placeCategories)))
      || body.bloomPercentage !== undefined && (!Number.isInteger(bloomPercentage) || Number(bloomPercentage) < 0 || Number(bloomPercentage) > 100)) {
      return c.json({ error: 'Phần trăm hiện trạng, ống kính, nhóm địa điểm hoặc concept không hợp lệ.' }, 400);
    }
    if (body.spotStatus !== undefined && (!['PEAK', 'ACTIVE', 'ENDING_SOON'].includes(spotStatus) || (spotStatus !== 'ACTIVE' && !/^\d{4}-\d{2}-\d{2}$/.test(statusValidUntil)))) {
      return c.json({ error: 'Nhãn theo mùa cần trạng thái hợp lệ và hạn kiểm chứng YYYY-MM-DD.' }, 400);
    }
    const candidate = candidateFields(body);
    if (!candidate) return c.json({ error: 'Dự kiến mùa tới cần cờ bật/tắt và tháng dự kiến 1–12.' }, 400);
    const seasonalPatch = JSON.stringify({
      ...candidate,
      trendTitle: text(body.goldenHour, 300),
      startMonth: months.length ? Math.min(...months.map(Number)) : 1,
      endMonth: months.length ? Math.max(...months.map(Number)) : 12,
      ...(body.spotStatus !== undefined ? { status: spotStatus, statusValidUntil: spotStatus === 'ACTIVE' ? null : statusValidUntil } : {}),
      ...(conceptTags !== undefined ? { conceptTags } : {}),
      ...(placeCategories !== undefined ? { placeCategories } : {}),
      ...(bloomPercentage !== undefined ? { bloomPercentage } : {}),
    });
    const bestTimeDescription = body.bestTimeDescription === undefined ? text(body.goldenHour, 300) : text(body.bestTimeDescription, 1000);
    // Patch only admin-owned fields; retain concept tags and other map metadata.
    result = await db.prepare(`UPDATE spots SET name = ?, slug = ?, region_id = ?, address = ?, district = ?, lat = ?, lng = ?, best_time_of_day = ?, golden_hour = ?, best_months = ?, entry_fee = ?, parking_fee = ?, source_url = ?, cover_image_url = ?, description = ?, best_time_description = ?, recommended_lenses = COALESCE(?, recommended_lenses), seasonal_trend = json_patch(CASE WHEN json_valid(seasonal_trend) THEN seasonal_trend ELSE '{}' END, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(text(body.name, 160), text(body.slug, 180), text(body.regionId, 80) || 'hanoi', text(body.address), text(body.district, 120), lat, lng, text(body.bestTimeOfDay, 40) || 'afternoon', text(body.goldenHour, 300), jsonText(months), text(body.entryFee, 200), text(body.parkingFee, 200), text(body.sourceUrl, 2000), text(body.coverImageUrl, 2000), text(body.description), bestTimeDescription, recommendedLenses === undefined ? null : jsonText(recommendedLenses), seasonalPatch, id).run();
  } else if (table === 'trendArticles') {
    if (!trendSection(body.section)) return c.json({ error: 'Tab bài viết không hợp lệ.' }, 400);
    result = await db.prepare('UPDATE trend_articles SET section = ?, title = ?, content = ?, image_url = ?, location = ?, region_id = ?, source_url = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(body.section, text(body.title, 180), text(body.content, 10000), text(body.imageUrl, 2000), text(body.location, 300), text(body.regionId, 80) || 'all', text(body.sourceUrl, 2000), body.isPublished === false ? 0 : 1, id).run();
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
  } else if (table === 'labs' || table === 'filmShops') {
    const lat = body.lat == null || body.lat === '' ? null : Number(body.lat); const lng = body.lng == null || body.lng === '' ? null : Number(body.lng);
    if ((lat !== null && !Number.isFinite(lat)) || (lng !== null && !Number.isFinite(lng))) return c.json({ error: 'Tọa độ không hợp lệ.' }, 400);
    const films = array(body.inStockFilms); const rollPrices = rollPriceFields(body, films, table === 'filmShops');
    if (!rollPrices) return c.json({ error: 'Cuộn film và khoảng giá bán chưa hợp lệ.' }, 400);
    const locations = shopLocations(body);
    if (!locations || rollPrices.minRollPrice > 0 && !locations.length) return c.json({ error: 'Shop cần khai báo 1–3 địa chỉ Hà Nội hợp lệ.' }, 400);
    const mainLocation = locations[0] || { ward: text(body.ward, 80), district: text(body.district, 80), openingHours: text(body.openingHours, 120) };
    const services = body.services === undefined ? undefined : Array.isArray(body.services) ? boundedStringArray(body.services, 20, 120) : null;
    if (body.services !== undefined && !services) return c.json({ error: 'Danh sách dịch vụ không hợp lệ.' }, 400);
    const directoryTable = table === 'labs' ? 'film_labs' : 'film_shops';
    result = await db.prepare(`UPDATE ${directoryTable} SET name = ?, slogan = ?, address = ?, district = ?, ward = ?, lat = ?, lng = ?, opening_hours = ?, hotline = ?, fast_2h = ?, in_stock_films = ?, fanpage_url = ?, image_url = ?, product_image_url = ?, cheapest_roll_name = ?, min_roll_price = ?, max_roll_price = ?, locations = ?, express_delivery_2h = ?, services = COALESCE(?, services), updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(text(body.name, 160), text(body.slogan, 50), text(body.address), mainLocation.district, mainLocation.ward, lat, lng, mainLocation.openingHours, text(body.hotline, 80), body.fast2h ? 1 : 0, jsonText(films), text(body.fanpageUrl, 2000), text(body.imageUrl, 2000), text(body.productImageUrl, 2000), rollPrices.cheapestRollName, rollPrices.minRollPrice, rollPrices.maxRollPrice, jsonText(locations), body.expressDelivery2h === true ? 1 : 0, services === undefined ? null : jsonText(services), id).run();
  } else {
    return c.json({ error: 'Danh mục không hợp lệ.' }, 404);
  }
  return result.meta.changes ? c.json({ ...body, id }) : c.json({ error: 'Không tìm thấy mục.' }, 404);
});

cms.delete('/api/admin/cms/:table/:id', async (c) => {
  const table = c.req.param('table'); const id = c.req.param('id'); const db = getD1(c.env);
  const statements: Record<string, string> = {
    spots: 'DELETE FROM spots WHERE id = ?', outfits: 'DELETE FROM outfits WHERE id = ?', rentalShops: 'DELETE FROM rental_shops WHERE id = ?',
    photographers: 'DELETE FROM photographers WHERE id = ?', films: 'DELETE FROM film_rolls WHERE id = ?', labs: 'DELETE FROM film_labs WHERE id = ?', filmShops: 'DELETE FROM film_shops WHERE id = ?',
    trendArticles: 'DELETE FROM trend_articles WHERE id = ?'
  };
  const sql = statements[table];
  if (!sql) return c.json({ error: 'Danh mục không hợp lệ.' }, 404);
  if (table === 'photographers') await db.prepare('DELETE FROM photographer_packages WHERE photographer_id = ?').bind(id).run();
  const result = await db.prepare(sql).bind(id).run();
  return result.meta.changes ? c.json({ success: true }) : c.json({ error: 'Không tìm thấy mục.' }, 404);
});

export default cms;
