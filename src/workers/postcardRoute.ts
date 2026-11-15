import { Hono } from 'hono';

const MAX_BYTES = 2_500_000;
const DAILY_LIMIT = 1;

export function quotaSubject(ip: string) {
  if (!ip.includes(':')) return ip;
  const lower = ip.toLowerCase();
  const halves = lower.split('::');
  if (halves.length > 2) return lower;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves[1] ? halves[1].split(':') : [];
  const missing = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (missing < 0) return lower;
  const groups = [...head, ...Array(missing).fill('0'), ...tail];
  if (groups.length !== 8) return lower;
  return groups.slice(0, 4).join(':');
}

export function dayKey(ip: string, now = new Date()) {
  return `postcard:${quotaSubject(ip)}:${now.toISOString().slice(0, 10)}`;
}

export async function consumeQuota(kv: KVNamespace, ip: string) {
  const key = dayKey(ip);
  const used = Number(await kv.get(key) || 0);
  if (used >= DAILY_LIMIT) return false;
  await kv.put(key, String(used + 1), { expirationTtl: 60 * 60 * 36 });
  return true;
}

export const WATERCOLOR_PROMPT = 'Turn this photograph into a restrained watercolor and ink illustration on warm ivory paper. Keep the recognizable silhouette and colors. Soft painted edges, no text, no border, no frame, no signature.';

export async function requestWatercolor(apiKey: string, file: Blob) {
  const body = new FormData();
  body.set('model', 'gpt-image-2');
  body.set('prompt', WATERCOLOR_PROMPT);
  body.set('size', '1024x1536');
  body.set('quality', 'low');
  body.set('image', file, 'photo.jpg');
  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.slice(0, 300));
  }
  const json = await response.json() as { data?: { b64_json?: string }[] };
  const artwork = json.data?.[0]?.b64_json;
  if (!artwork) throw new Error('OpenAI không trả ảnh');
  return artwork;
}

type Env = { CACHE: KVNamespace; OPENAI_API_KEY?: string };

const routes = new Hono<{ Bindings: Env }>();

routes.post('/api/postcard', async (c) => {
  if (!c.env.OPENAI_API_KEY) {
    return c.json({ error: 'Chưa cấu hình khóa OpenAI. Thêm secret OPENAI_API_KEY trên Worker.' }, 503);
  }
  const form = await c.req.formData().catch(() => null);
  if (!form) return c.json({ error: 'Dữ liệu không hợp lệ.' }, 400);
  const file = form.get('image');
  if (!(file instanceof File)) return c.json({ error: 'Thiếu ảnh.' }, 400);
  if (file.size > MAX_BYTES) return c.json({ error: 'Ảnh lớn hơn 2.5MB sau khi thu nhỏ.' }, 413);
  const ip = c.req.header('cf-connecting-ip') || 'local';
  if (!(await consumeQuota(c.env.CACHE, ip))) {
    return c.json({ error: 'Mỗi người chỉ tạo được 1 bưu thiếp mỗi ngày. Thử lại vào ngày mai nhé.' }, 429);
  }
  try {
    const artwork = await requestWatercolor(c.env.OPENAI_API_KEY, file);
    return c.json({ artwork });
  } catch (error) {
    await c.env.CACHE.put(dayKey(ip), String(Math.max(0, Number(await c.env.CACHE.get(dayKey(ip)) || 1) - 1)), { expirationTtl: 60 * 60 * 36 });
    return c.json({ error: error instanceof Error ? error.message : 'Không tạo được tranh.' }, 502);
  }
});

export default routes;
