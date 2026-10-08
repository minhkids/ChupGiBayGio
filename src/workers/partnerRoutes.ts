import { Hono, type Context } from 'hono';

type Bindings = { DB: D1Database; R2_BUCKET: R2Bucket; CACHE: KVNamespace };
const routes = new Hono<{ Bindings: Bindings }>();
const districts = new Set(['Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Cầu Giấy', 'Hai Bà Trưng', 'Tây Hồ', 'Thanh Xuân', 'Long Biên', 'Hà Đông', 'Hoàng Mai', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Thanh Trì', 'Hoài Đức', 'Đan Phượng', 'Thanh Oai', 'Thường Tín', 'Phúc Thọ', 'Quốc Oai', 'Thạch Thất', 'Chương Mỹ', 'Mỹ Đức', 'Ứng Hòa', 'Ba Vì', 'Sơn Tây', 'Mê Linh']);
const text = (value: unknown, limit: number) => typeof value === 'string' && value.trim().length <= limit ? value.trim() : '';
const list = (value: unknown, max: number) => Array.isArray(value) && value.length <= max && value.every((item) => typeof item === 'string' && item.trim().length > 0 && item.length <= 100) ? value.map((item: string) => item.trim()) : null;
const link = (value: unknown) => {
  if (!value) return '';
  const url = text(value, 2000);
  try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : null; } catch { return null; }
};
const phone = (value: unknown) => /^0\d{9,10}$/.test(String(value ?? '').replace(/\s/g, '')) ? String(value).replace(/\s/g, '') : '';
const validPoint = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= 20.4 && lat <= 21.7 && lng >= 105.2 && lng <= 106.3;
const types = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);

async function photos(form: FormData, min: number, max: number) {
  const files = form.getAll('photos');
  if (files.length < min || files.length > max || files.some((file) => !(file instanceof File) || file.size < 1 || file.size > 3 * 1024 * 1024)) return { error: 'Cần 3–6 ảnh portfolio (JPG, PNG, WebP; tối đa 3 MB/ảnh).' };
  const uploads: { bytes: Uint8Array; ext: string; type: string }[] = [];
  for (const file of files as File[]) {
    const ext = types.get(file.type);
    if (!ext) return { error: 'Định dạng ảnh không hợp lệ.' };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const jpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
    const webp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!(ext === 'jpg' && jpg || ext === 'png' && png || ext === 'webp' && webp)) return { error: 'Nội dung ảnh không khớp định dạng.' };
    uploads.push({ bytes, ext, type: file.type });
  }
  return { uploads };
}

async function geocode(address: string, district: string, cache: KVNamespace) {
  const query = [address, district, 'Hà Nội', 'Việt Nam'].join(', ');
  const key = `geocode:${query.toLocaleLowerCase('vi').replace(/\s+/g, ' ')}`;
  const cached = await cache.get(key).catch(() => null);
  if (cached) {
    const point = JSON.parse(cached) as { lat: number; lng: number };
    if (validPoint(point.lat, point.lng)) return point;
  }
  const params = new URLSearchParams({ q: query, format: 'jsonv2', limit: '1', countrycodes: 'vn', viewbox: '105.2,21.7,106.3,20.4', bounded: '1' });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { 'User-Agent': 'ChupGiBayGio/1.0 (https://chupgibaygio.com)', Accept: 'application/json' }, signal: AbortSignal.timeout(7000) });
  if (!response.ok) return null;
  const results = await response.json() as { lat: string; lon: string }[];
  const point = { lat: Number(results[0]?.lat), lng: Number(results[0]?.lon) };
  if (!results.length || !validPoint(point.lat, point.lng)) return null;
  await cache.put(key, JSON.stringify(point), { expirationTtl: 86400 * 30 }).catch(() => undefined);
  return point;
}

async function registration(c: Context<{ Bindings: Bindings }>, kind: 'lab' | 'photographer') {
  // These unauthenticated endpoints publish immediately; throttle by visitor and keep the form human-operated.
  const origin = c.req.header('Origin');
  if (origin && !['https://chupgibaygio.com', 'https://www.chupgibaygio.com', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173'].includes(origin)) return c.json({ error: 'Nguồn gửi không hợp lệ.' }, 403);
  if (Number(c.req.header('Content-Length') || 0) > 20 * 1024 * 1024) return c.json({ error: 'Tệp gửi vượt quá 20 MB.' }, 413);
  const ip = c.req.header('CF-Connecting-IP') || 'local';
  const quota = `partner:${kind}:${ip}`;
  if (await c.env.CACHE.get(quota)) return c.json({ error: 'Vui lòng thử lại sau 24 giờ hoặc liên hệ quản trị viên.' }, 429);
  const form = await c.req.formData().catch(() => null);
  if (!form) return c.json({ error: 'Biểu mẫu không hợp lệ.' }, 400);
  const raw = form.get('payload');
  if (typeof raw !== 'string' || raw.length > 12000) return c.json({ error: 'Thông tin quá dài.' }, 400);
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw) as Record<string, unknown>; if (!body || Array.isArray(body)) throw Error(); } catch { return c.json({ error: 'Dữ liệu không hợp lệ.' }, 400); }
  if (body.website) return c.json({ error: 'Thông tin không hợp lệ.' }, 400); // honeypot
  const name = text(body.name, 160);
  const number = phone(body.phone);
  const social = link(body.socialUrl);
  const imageUrl = link(body.imageUrl);
  if (!name || !number || social === null || imageUrl === null) return c.json({ error: 'Kiểm tra tên, số Zalo và đường dẫn HTTPS.' }, 400);
  const images = await photos(form, kind === 'lab' ? 0 : 3, kind === 'lab' ? 1 : 6);
  if ('error' in images) return c.json({ error: images.error }, images.error?.includes('định dạng') ? 415 : 400);
  let point: { lat: number; lng: number } | null = null;
  let district = '';
  let address = '';
  let stocks: string[] = [];
  let styles: string[] = [];
  let shootSpots: string[] = [];
  let pkg: { name: string; price: number; duration: string; deliveredPhotos: string } | null = null;
  if (kind === 'lab') {
    address = text(body.address, 300); district = text(body.district, 80);
    stocks = list(body.filmStocks, 20) ?? [];
    if (address.length < 8 || !districts.has(district) || !list(body.filmStocks, 20)) return c.json({ error: 'Vui lòng nhập địa chỉ, quận/huyện Hà Nội và danh sách film hợp lệ.' }, 400);
    try { point = await geocode(address, district, c.env.CACHE); } catch { return c.json({ error: 'Dịch vụ xác định vị trí tạm gián đoạn. Vui lòng thử lại.' }, 503); }
    if (!point) return c.json({ error: 'Không xác định được tọa độ. Hãy ghi rõ số nhà, đường và quận/huyện Hà Nội.' }, 422);
  } else {
    styles = list(body.styles, 12) ?? [];
    shootSpots = list(body.shootSpots, 20) ?? [];
    const pack = body.package as Record<string, unknown> | null;
    const price = Number(pack?.price);
    if (!list(body.styles, 12) || !list(body.shootSpots, 20) || !pack || !text(pack.name, 160) || !Number.isSafeInteger(price) || price < 0 || price > 100000000 || !text(pack.duration, 120) || !text(pack.deliveredPhotos, 120)) return c.json({ error: 'Gói chụp hoặc thông tin phong cách không hợp lệ.' }, 400);
    pkg = { name: text(pack.name, 160), price, duration: text(pack.duration, 120), deliveredPhotos: text(pack.deliveredPhotos, 120) };
  }
  const id = crypto.randomUUID();
  const keys: string[] = [];
  const base = new URL(c.req.url).origin;
  try {
    for (const upload of images.uploads ?? []) {
      const key = `partner/${kind}/${id}/${crypto.randomUUID()}.${upload.ext}`;
      await c.env.R2_BUCKET.put(key, upload.bytes, { httpMetadata: { contentType: upload.type } });
      keys.push(key);
    }
    const urls = keys.map((key) => `${base}/api/partner/images/${key}`);
    if (kind === 'lab') {
      await c.env.DB.prepare(`INSERT INTO film_labs (id, name, address, district, lat, lng, opening_hours, hotline, fast_2h, in_stock_films, fanpage_url, image_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, name, address, district, point!.lat, point!.lng, text(body.openingHours, 120), number, 0, JSON.stringify(stocks), social || '', urls[0] || imageUrl || '', 'published').run();
    } else {
      await c.env.DB.batch([
        c.env.DB.prepare(`INSERT INTO photographers (id, name, avatar_url, bio, phone, instagram, gear_body, gear_lens, styles, portfolio_photos, preferred_spots, facebook_url, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, name, imageUrl || urls[0], text(body.bio, 500), number, social || '', text(body.gear, 200), '', JSON.stringify(styles), JSON.stringify(urls), JSON.stringify(shootSpots), social || '', 'published'),
        c.env.DB.prepare('INSERT INTO photographer_packages (id, photographer_id, name, price, duration, delivered_photos, delivered_photos_text) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(crypto.randomUUID(), id, pkg!.name, pkg!.price, pkg!.duration, 0, pkg!.deliveredPhotos)
      ]);
    }
    await c.env.CACHE.put(quota, '1', { expirationTtl: 86400 }).catch(() => undefined);
    const section = kind === 'lab' ? 'film' : 'photographers';
    return c.json({ id, status: 'published', url: `https://chupgibaygio.com/?services=${section}&partner=${id}` }, 201);
  } catch (error) {
    await Promise.all(keys.map((key) => c.env.R2_BUCKET.delete(key).catch(() => undefined)));
    throw error;
  }
}

routes.post('/api/partner/register-lab', (c) => registration(c, 'lab'));
routes.post('/api/partner/register-photographer', (c) => registration(c, 'photographer'));
routes.get('/api/partner/images/partner/:kind/:id/:filename', async (c) => {
  const { kind, id, filename } = c.req.param();
  if (!['lab', 'photographer'].includes(kind) || !/^[0-9a-f-]{36}$/.test(id) || !/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename)) return c.notFound();
  const object = await c.env.R2_BUCKET.get(`partner/${kind}/${id}/${filename}`);
  if (!object) return c.notFound();
  return new Response(object.body as BodyInit, { headers: { 'Content-Type': object.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' } });
});
routes.get('/api/partner/images/*', (c) => c.notFound());

export default routes;
