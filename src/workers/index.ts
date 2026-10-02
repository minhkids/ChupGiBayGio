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

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;