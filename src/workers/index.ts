import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  CACHE: KVNamespace;
  // AI: Ai;
};

type Variables = {
  userId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('/api/*', cors({
  origin: ['https://chupgibaygio.pages.dev', 'https://*.chupgibaygio.pages.dev', 'http://localhost:5173'],
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
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM post_outfits WHERE spot_id = ? ORDER BY created_at DESC LIMIT 30'
  ).bind(spotId).all();

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
  }));

  return c.json({ spotId, count: formatted.length, outfits: formatted });
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

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;