import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import cmsAdminRoutes from './cmsAdminRoutes';
import partnerRoutes from './partnerRoutes';
import { getD1 } from './d1Client';

type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  CACHE: KVNamespace;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  // AI: Ai;
};

type Variables = {
  userId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

type ServiceCategory = 'rental' | 'outfit' | 'photographer' | 'filmLab' | 'filmColor';
const SERVICE_CATEGORIES = new Set<ServiceCategory>(['rental', 'outfit', 'photographer', 'filmLab', 'filmColor']);
const encoder = new TextEncoder();

function base64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - base64.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signAdminToken(secret: string, expiresAt: number) {
  const payload = base64Url(encoder.encode(JSON.stringify({ exp: expiresAt })));
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${base64Url(new Uint8Array(signature))}`;
}

async function isValidAdminToken(token: string, secret: string) {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const claims = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as { exp?: number };
    if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) return false;
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    return crypto.subtle.verify('HMAC', key, fromBase64Url(signature), encoder.encode(payload));
  } catch {
    return false;
  }
}

function normalizeService(body: Record<string, unknown>) {
  if (typeof body.category !== 'string' || !SERVICE_CATEGORIES.has(body.category as ServiceCategory)) return null;
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 160) return null;
  const { id: _id, ...data } = body;
  return { category: body.category, name: body.name.trim(), data };
}

function mapServiceRow(row: Record<string, unknown>) {
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(String(row.data || '{}')) as Record<string, unknown>; } catch { /* Ignore malformed legacy payload */ }
  return { ...data, id: row.id, category: row.category, name: row.name };
}

function parseJsonField<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; }
  catch { return fallback; }
}

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('/api/*', cors({
  origin: ['https://chupgibaygio.com', 'https://www.chupgibaygio.com', 'https://chupgibaygio.pages.dev', 'https://*.chupgibaygio.pages.dev', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.get('/api/spots', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM spots WHERE is_active = 1 ORDER BY created_at DESC LIMIT 50'
  ).all();
  return c.json(results);
});

app.get('/api/spots/:id', async (c) => {
  const id = c.req.param('id');
  const spot = await c.env.DB.prepare('SELECT * FROM spots WHERE id = ?').bind(id).first();
  if (!spot) return c.json({ error: 'Not found' }, 404);
  return c.json(spot);
});

app.get('/api/spots/:id/posts', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM inspiration_posts WHERE spot_id = ? ORDER BY created_at DESC'
  ).bind(id).all();
  return c.json(results);
});

// Image upload to R2
app.post('/api/upload', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const spotId = formData.get('spotId') as string;

  if (!file) return c.json({ error: 'No file' }, 400);

  const key = `spots/${spotId}/${crypto.randomUUID()}-${file.name}`;
  await c.env.R2_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { spotId, originalName: file.name },
  });

  const publicUrl = `https://pub-${c.env.R2_BUCKET.name}.r2.dev/${key}`;
  return c.json({ url: publicUrl, key });
});

// Search spots
app.get('/api/search', async (c) => {
  const q = c.req.query('q') || '';
  const region = c.req.query('region');
  const month = c.req.query('month');

  let sql = 'SELECT * FROM spots WHERE is_active = 1';
  const params: (string | number)[] = [];

  if (q) {
    sql += ' AND (name LIKE ? OR address LIKE ? OR description LIKE ?)';
    const term = `%${q}%`;
    params.push(term, term, term);
  }
  if (region) {
    sql += ' AND region_id = ?';
    params.push(region);
  }
  if (month) {
    sql += ' AND start_month <= ? AND end_month >= ?';
    params.push(month, month);
  }

  sql += ' ORDER BY trend_score DESC LIMIT 20';
  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(results);
});

// ============================================================================
// VISUAL OUTFIT TAP-TO-SHOP API ENDPOINTS
// ============================================================================

// 1. Get outfit hotspots and shopping links for a specific post
app.get('/api/posts/:id/outfit', async (c) => {
  const postId = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM post_outfits WHERE post_id = ? ORDER BY created_at ASC'
  ).bind(postId).all();

  // Parse JSON fields
  const formatted = (results || []).map((row: any) => ({
    id: row.id,
    postId: row.post_id,
    spotId: row.spot_id,
    imageUrl: row.image_url,
    itemName: row.item_name,
    category: row.category,
    color: row.color,
    style: row.style,
    xPercent: row.x_percent,
    yPercent: row.y_percent,
    searchQuery: row.search_query,
    priceEstimate: row.price_estimate,
    shopeeUrl: row.shopee_url,
    tiktokUrl: row.tiktok_url,
    similarItems: row.similar_items ? JSON.parse(row.similar_items) : [],
    aiNotes: row.ai_notes,
    createdAt: row.created_at,
  }));

  return c.json({
    postId,
    count: formatted.length,
    outfits: formatted,
  });
});

// 2. Get all outfits associated with a photo spot
app.get('/api/spots/:id/outfits', async (c) => {
  const spotId = c.req.param('id');
  const [legacyRows, adminRows] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM post_outfits WHERE spot_id = ? ORDER BY created_at DESC LIMIT 30').bind(spotId).all(),
    getD1(c.env).prepare('SELECT * FROM outfits WHERE spot_id = ? ORDER BY created_at DESC LIMIT 30').bind(spotId).all()
  ]);

  const formatted = (legacyRows.results || []).map((row: any) => ({
    id: row.id,
    postId: row.post_id,
    spotId: row.spot_id,
    imageUrl: row.image_url,
    itemName: row.item_name,
    category: row.category,
    color: row.color,
    style: row.style,
    xPercent: row.x_percent,
    yPercent: row.y_percent,
    searchQuery: row.search_query,
    priceEstimate: row.price_estimate,
    shopeeUrl: row.shopee_url,
    tiktokUrl: row.tiktok_url,
    similarItems: row.similar_items ? JSON.parse(row.similar_items) : [],
    aiNotes: row.ai_notes,
  }));

  const adminFormatted = (adminRows.results || []).flatMap((value) => {
    const row = value as Record<string, unknown>;
    const hotspots = parseJsonField<unknown[]>(String(row.hotspots || '[]'), []);
    const pins = hotspots.length ? hotspots as Record<string, unknown>[] : [{}];
    return pins.map((pin, index) => ({
      id: `${String(row.id)}-${index}`, postId: '', spotId: String(row.spot_id), imageUrl: String(row.image_url || ''), itemName: String(row.name || ''),
      category: 'SET', color: '', style: String(row.material || ''), xPercent: Number(pin.xPercent ?? pin.x) || 50, yPercent: Number(pin.yPercent ?? pin.y) || 50,
      searchQuery: String(row.name || ''), priceEstimate: String(row.estimated_price || ''), shopeeUrl: String(row.shopee_url || ''),
      tiktokUrl: String(row.tiktok_url || ''), similarItems: [], aiNotes: String(row.description || '')
    }));
  });

  return c.json({ spotId, count: formatted.length + adminFormatted.length, outfits: [...formatted, ...adminFormatted] });
});

// 3. Save extracted outfit hotspots (called by OpenRouter Crawler Worker)
app.post('/api/posts/:id/outfit', async (c) => {
  const postId = c.req.param('id');
  const body = await c.req.json();
  const id = body.id || `outfit-${crypto.randomUUID()}`;

  await c.env.DB.prepare(`
    INSERT INTO post_outfits (
      id, post_id, spot_id, image_url, item_name, category, color, style,
      x_percent, y_percent, search_query, price_estimate, shopee_url,
      tiktok_url, similar_items, ai_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    postId,
    body.spotId || null,
    body.imageUrl,
    body.itemName,
    body.category,
    body.color || null,
    body.style || null,
    body.xPercent,
    body.yPercent,
    body.searchQuery,
    body.priceEstimate || null,
    body.shopeeUrl,
    body.tiktokUrl,
    body.similarItems ? JSON.stringify(body.similarItems) : '[]',
    body.aiNotes || null
  ).run();

  return c.json({ success: true, id }, 201);
});

// Public directory data for the Services Hub
app.get('/api/services', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, category, name, data FROM service_listings WHERE is_active = 1 ORDER BY created_at DESC'
  ).all();
  const legacy = (results || []).map((row) => mapServiceRow(row as Record<string, unknown>));
  const db = getD1(c.env);
  const [rentalRows, outfitRows, photographerRows, packageRows, filmRows, labRows] = await Promise.all([
    db.prepare('SELECT * FROM rental_shops ORDER BY created_at DESC').all(),
    db.prepare('SELECT * FROM outfits ORDER BY created_at DESC').all(),
    db.prepare("SELECT * FROM photographers WHERE status = 'published' ORDER BY created_at DESC").all(),
    db.prepare('SELECT * FROM photographer_packages ORDER BY rowid').all(),
    db.prepare('SELECT * FROM film_rolls ORDER BY created_at DESC').all(),
    db.prepare("SELECT * FROM film_labs WHERE status = 'published' ORDER BY created_at DESC").all()
  ]);
  const rows = (value: unknown) => Array.isArray(value) ? value as Record<string, unknown>[] : [];
  const packages = rows(packageRows.results);
  const mapFields = (row: Record<string, unknown>, keys: Record<string, string>) => Object.fromEntries(Object.entries(keys).map(([key, column]) => [key, row[column]]));
  const catalogs = [
    ...rows(rentalRows.results).map((row) => ({ ...mapFields(row, { address: 'address', phone: 'hotline', link: 'fanpage_url', price: 'daily_price' }), id: row.id, name: row.name, category: 'rental' })),
    ...rows(outfitRows.results).map((row) => ({ ...mapFields(row, { description: 'description', price: 'estimated_price', imageUrl: 'image_url', link: 'shopee_url', secondaryLink: 'tiktok_url', material: 'material' }), id: row.id, name: row.name, category: 'outfit', hotspots: parseJsonField(String(row.hotspots || '[]'), []) })),
    ...rows(photographerRows.results).map((row) => {
      const firstPackage = packages.find((pkg) => pkg.photographer_id === row.id);
      return { ...mapFields(row, { description: 'bio', imageUrl: 'avatar_url', phone: 'phone', link: 'instagram', gearBody: 'gear_body', gearLens: 'gear_lens' }), id: row.id, name: row.name, category: 'photographer', price: firstPackage?.price ? String(firstPackage.price) : '', tags: parseJsonField(String(row.styles || '[]'), []), shootSpots: parseJsonField(String(row.preferred_spots || '[]'), []), portfolioPhotos: parseJsonField(String(row.portfolio_photos || '[]'), []), packages: packages.filter((pkg) => pkg.photographer_id === row.id).map((pkg) => ({ id: pkg.id, name: pkg.name, price: pkg.price, duration: pkg.duration, deliveredPhotos: pkg.delivered_photos, deliveredPhotosText: pkg.delivered_photos_text })) };
    }),
    ...rows(filmRows.results).map((row) => ({ ...mapFields(row, { iso: 'iso', recommendedTime: 'tone', filmImageUrl: 'package_image_url', imageUrl: 'sample_image_url' }), id: row.id, name: row.name, category: 'filmColor', tags: parseJsonField(String(row.suitable_seasons || '[]'), []) })),
    ...rows(labRows.results).map((row) => ({ ...mapFields(row, { address: 'address', district: 'district', phone: 'hotline', openingHours: 'opening_hours', fastService: 'fast_2h', link: 'fanpage_url', imageUrl: 'image_url', lat: 'lat', lng: 'lng' }), id: row.id, name: row.name, category: 'filmLab', filmStocks: parseJsonField(String(row.in_stock_films || '[]'), []) }))
  ];
  return c.json([...catalogs, ...legacy]);
});

app.get('/api/films', async (c) => {
  const { results } = await getD1(c.env).prepare('SELECT * FROM film_rolls ORDER BY created_at DESC').all();
  return c.json(results || []);
});

app.get('/api/labs', async (c) => {
  const { results } = await getD1(c.env).prepare("SELECT * FROM film_labs WHERE status = 'published' ORDER BY created_at DESC").all();
  return c.json(results || []);
});

app.get('/api/outfits', async (c) => {
  const { results } = await getD1(c.env).prepare('SELECT * FROM outfits ORDER BY created_at DESC').all();
  return c.json((results || []).map((row) => {
    const item = row as Record<string, unknown>;
    return { ...item, imageUrl: item.image_url, estimatedPrice: item.estimated_price, shopeeUrl: item.shopee_url, tiktokUrl: item.tiktok_url, hotspots: parseJsonField(String(item.hotspots || '[]'), []) };
  }));
});

app.get('/api/photographers', async (c) => {
  const [people, packageRows] = await Promise.all([
    getD1(c.env).prepare("SELECT * FROM photographers WHERE status = 'published' ORDER BY created_at DESC").all(),
    getD1(c.env).prepare('SELECT * FROM photographer_packages ORDER BY rowid').all()
  ]);
  const packages = (packageRows.results || []) as Record<string, unknown>[];
  return c.json((people.results || []).map((row) => {
    const person = row as Record<string, unknown>;
    return { ...person, avatarUrl: person.avatar_url, gearBody: person.gear_body, gearLens: person.gear_lens,
      styles: parseJsonField(String(person.styles || '[]'), []), portfolioPhotos: parseJsonField(String(person.portfolio_photos || '[]'), []),
      packages: packages.filter((item) => item.photographer_id === person.id) };
  }));
});

app.get('/api/rental-shops', async (c) => {
  const { results } = await getD1(c.env).prepare('SELECT * FROM rental_shops ORDER BY created_at DESC').all();
  return c.json(results || []);
});

// Admin login. Secrets must be configured with `wrangler secret put`.
app.post('/api/admin/login', async (c) => {
  const { ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = c.env;
  if (!ADMIN_PASSWORD || !ADMIN_SESSION_SECRET) return c.json({ error: 'Quản trị chưa được cấu hình trên máy chủ.' }, 503);
  const body = await c.req.json().catch(() => ({})) as { password?: unknown };
  if (typeof body.password !== 'string' || body.password.length > 256) return c.json({ error: 'Mật khẩu không hợp lệ.' }, 400);
  const providedHash = await crypto.subtle.digest('SHA-256', encoder.encode(body.password));
  const expectedHash = await crypto.subtle.digest('SHA-256', encoder.encode(ADMIN_PASSWORD));
  const provided = new Uint8Array(providedHash);
  const expected = new Uint8Array(expectedHash);
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) mismatch |= provided[i] ^ expected[i];
  if (mismatch !== 0) return c.json({ error: 'Mật khẩu không đúng.' }, 401);
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  return c.json({ token: await signAdminToken(ADMIN_SESSION_SECRET, expiresAt), expiresAt });
});

async function requireAdmin(c: Parameters<Parameters<typeof app.use>[1]>[0]) {
  const secret = c.env.ADMIN_SESSION_SECRET;
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(secret && token && await isValidAdminToken(token, secret));
}

app.use('/api/admin/services', async (c, next) => {
  if (!(await requireAdmin(c))) return c.json({ error: 'Cần đăng nhập quản trị.' }, 401);
  await next();
});
app.use('/api/admin/services/*', async (c, next) => {
  if (!(await requireAdmin(c))) return c.json({ error: 'Cần đăng nhập quản trị.' }, 401);
  await next();
});

app.get('/api/admin/services', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, category, name, data FROM service_listings ORDER BY category, created_at DESC'
  ).all();
  return c.json((results || []).map((row) => mapServiceRow(row as Record<string, unknown>)));
});

app.post('/api/admin/services', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return c.json({ error: 'Dữ liệu không hợp lệ.' }, 400);
  const service = normalizeService(body);
  if (!service) return c.json({ error: 'Vui lòng chọn mục hợp lệ và nhập tên.' }, 400);
  const id = crypto.randomUUID();
  const { category, name, data } = service;
  await c.env.DB.prepare('INSERT INTO service_listings (id, category, name, data) VALUES (?, ?, ?, ?)')
    .bind(id, category, name, JSON.stringify(data)).run();
  return c.json({ ...data, id, category, name }, 201);
});

app.put('/api/admin/services/:id', async (c) => {
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return c.json({ error: 'Dữ liệu không hợp lệ.' }, 400);
  const service = normalizeService(body);
  if (!service) return c.json({ error: 'Vui lòng chọn mục hợp lệ và nhập tên.' }, 400);
  const { category, name, data } = service;
  const result = await c.env.DB.prepare('UPDATE service_listings SET category = ?, name = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(category, name, JSON.stringify(data), c.req.param('id')).run();
  if (!result.meta.changes) return c.json({ error: 'Không tìm thấy mục dịch vụ.' }, 404);
  return c.json({ ...data, id: c.req.param('id'), category, name });
});

app.delete('/api/admin/services/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM service_listings WHERE id = ?').bind(c.req.param('id')).run();
  if (!result.meta.changes) return c.json({ error: 'Không tìm thấy mục dịch vụ.' }, 404);
  return c.json({ success: true });
});

app.route('/', partnerRoutes);
app.route('/', cmsAdminRoutes);

app.notFound((c) => c.json({ error: 'Not Found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;