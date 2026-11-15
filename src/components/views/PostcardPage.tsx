import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  POSTCARD_FONT_FAMILIES,
  POSTCARD_MESSAGE_MAX,
  POSTCARD_RECIPIENT_MAX,
  drawPostcard,
  type PostcardLayout,
} from '../../lib/postcard';

const POSTCARD_FONT_HREF = `https://fonts.googleapis.com/css2?family=${POSTCARD_FONT_FAMILIES.serif.replace(/ /g, '+')}:ital,wght@0,500;0,600;1,500;1,600&family=${POSTCARD_FONT_FAMILIES.script.replace(/ /g, '+')}&display=swap`;
const VIETNAMESE_SAMPLE = 'Thân gửi ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ';

let fontStylesheet: Promise<void> | null = null;

function loadPostcardFontStylesheet() {
  if (typeof document === 'undefined') return Promise.resolve();
  if (fontStylesheet) return fontStylesheet;
  fontStylesheet = new Promise(resolve => {
    const existing = document.querySelector<HTMLLinkElement>('link[data-postcard-fonts]');
    if (existing?.dataset.loaded === '1') {
      resolve();
      return;
    }
    const link = existing ?? document.createElement('link');
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      link.dataset.loaded = '1';
      resolve();
    };
    link.addEventListener('load', finish, { once: true });
    link.addEventListener('error', finish, { once: true });
    window.setTimeout(finish, 2500);
    if (!existing) {
      link.rel = 'stylesheet';
      link.href = POSTCARD_FONT_HREF;
      link.dataset.postcardFonts = '';
      document.head.appendChild(link);
    }
  });
  return fontStylesheet;
}

async function ensurePostcardFonts() {
  await loadPostcardFontStylesheet();
  if (!document.fonts?.load) return;
  const jobs = [
    document.fonts.load(`italic 500 46px "${POSTCARD_FONT_FAMILIES.serif}"`, VIETNAMESE_SAMPLE),
    document.fonts.load(`600 24px "${POSTCARD_FONT_FAMILIES.serif}"`, VIETNAMESE_SAMPLE),
    document.fonts.load(`400 32px "${POSTCARD_FONT_FAMILIES.script}"`, VIETNAMESE_SAMPLE),
  ];
  await Promise.race([
    Promise.all(jobs),
    new Promise(resolve => window.setTimeout(resolve, 2500)),
  ]);
}

async function loadImage(src: string) {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

async function downscale(file: File) {
  const url = URL.createObjectURL(file);
  const image = await loadImage(url);
  URL.revokeObjectURL(url);
  const max = 1024;
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.82));
  return { blob, image };
}

export function PostcardPage({ initialLocation = '' }: { initialLocation?: string }) {
  const [location, setLocation] = useState(initialLocation);
  const [date, setDate] = useState(() => new Date().toLocaleDateString('vi-VN'));
  const [layout, setLayout] = useState<PostcardLayout>('zine');
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const artRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef<() => Promise<void>>(async () => {});
  const paintGen = useRef(0);

  const params = useMemo(() => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search), []);
  void params;

  const paint = useCallback(async () => {
    const gen = ++paintGen.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    await ensurePostcardFonts();
    if (gen !== paintGen.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const artwork = artRef.current;
    canvas.width = 1000;
    canvas.height = 1500;
    drawPostcard(ctx, 1000, 1500, {
      artwork,
      artworkWidth: artwork?.naturalWidth || 0,
      artworkHeight: artwork?.naturalHeight || 0,
      recipient,
      message: note,
      location,
      date,
      layout,
      side,
    });
    setReady(true);
  }, [recipient, note, location, date, layout, side]);

  useEffect(() => {
    paintRef.current = paint;
    void paint();
  }, [paint]);

  const onFile = () => {
    artRef.current = null;
    setStatus('');
    void paintRef.current();
  };

  const create = async () => {
    const input = document.querySelector<HTMLInputElement>('#postcard-file');
    const file = input?.files?.[0];
    if (!file) {
      setStatus('Hãy chọn một tấm ảnh trước.');
      return;
    }
    setBusy(true);
    setStatus('');
    try {
      const { blob } = await downscale(file);
      const body = new FormData();
      body.set('image', blob, 'photo.jpg');
      const response = await fetch('/api/postcard', { method: 'POST', body });
      const json = await response.json() as { artwork?: string; error?: string };
      if (!response.ok || !json.artwork) {
        setStatus(json.error || 'Không tạo được bưu thiếp.');
        artRef.current = null;
        await paintRef.current();
        return;
      }
      artRef.current = await loadImage(`data:image/png;base64,${json.artwork}`);
      await paintRef.current();
    } catch {
      setStatus('Không kết nối được máy chủ. Bố cục mẫu vẫn xem được.');
      artRef.current = null;
      await paintRef.current();
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = canvasRef.current?.toDataURL('image/png') || '';
    link.download = side === 'back' ? 'buu-thiep-mat-sau.png' : 'buu-thiep.png';
    link.click();
  };

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-4 py-6 text-[#2C2621] sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-3xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C76B3C]">Bưu thiếp</p>
          <h1 className="text-2xl font-bold">Ảnh thành bưu thiếp thủy mặc</h1>
          <p className="text-sm leading-relaxed text-[#6E655B]">Tải ảnh của bạn. AI vẽ bản thủy mặc lớn trên giấy ngà; lời nhắn, địa điểm và ngày được viết phía dưới.</p>
          <label className="block text-sm font-semibold" htmlFor="postcard-file">Ảnh
            <input id="postcard-file" type="file" accept="image/*" className="mt-1 block w-full text-sm" onChange={() => onFile()} />
          </label>
          <label className="block text-sm font-semibold" htmlFor="postcard-recipient">Thân gửi
            <input id="postcard-recipient" value={recipient} maxLength={POSTCARD_RECIPIENT_MAX} autoComplete="off" placeholder="Lan" onChange={event => setRecipient(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#D8CFBD] bg-white px-3" />
          </label>
          <label className="block text-sm font-semibold" htmlFor="postcard-note">Lời nhắn
            <textarea id="postcard-note" value={note} maxLength={POSTCARD_MESSAGE_MAX} rows={4} placeholder="Chiều nay trời đẹp." onChange={event => setNote(event.target.value)} className="mt-1 w-full resize-y rounded-xl border border-[#D8CFBD] bg-white px-3 py-2 text-sm leading-relaxed" />
            <span className="mt-1 block text-right text-xs font-medium text-[#6E655B]">{note.length}/{POSTCARD_MESSAGE_MAX}</span>
          </label>
          <label className="block text-sm font-semibold" htmlFor="postcard-location">Địa điểm
            <input id="postcard-location" value={location} onChange={event => setLocation(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#D8CFBD] bg-white px-3" />
          </label>
          <label className="block text-sm font-semibold" htmlFor="postcard-date">Ngày
            <input id="postcard-date" value={date} onChange={event => setDate(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#D8CFBD] bg-white px-3" />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLayout('zine')} className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${layout === 'zine' ? 'border-[#2C2621] bg-[#2C2621] text-white' : 'border-[#D8CFBD]'}`}>Zine</button>
            <button type="button" onClick={() => setLayout('wash')} className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${layout === 'wash' ? 'border-[#2C2621] bg-[#2C2621] text-white' : 'border-[#D8CFBD]'}`}>Thủy mặc</button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSide('front')} className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${side === 'front' ? 'border-[#C76B3C] bg-[#F3EAD7]' : 'border-[#D8CFBD]'}`}>Mặt trước</button>
            <button type="button" onClick={() => setSide('back')} className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${side === 'back' ? 'border-[#C76B3C] bg-[#F3EAD7]' : 'border-[#D8CFBD]'}`}>Mặt sau</button>
          </div>
          <button type="button" disabled={busy} onClick={() => void create()} className="min-h-12 w-full rounded-xl bg-[#C76B3C] text-sm font-bold text-white disabled:opacity-60">{busy ? 'Đang vẽ…' : 'Tạo bưu thiếp'}</button>
          <button type="button" onClick={() => void paint()} className="min-h-11 w-full rounded-xl border border-[#D8CFBD] text-sm font-semibold">Xem bố cục mẫu</button>
          <button type="button" disabled={!ready} onClick={download} className="min-h-11 w-full rounded-xl border border-[#D8CFBD] text-sm font-semibold disabled:opacity-50">Tải PNG</button>
          {status && <p role="status" className="text-sm text-[#8F3F23]">{status}</p>}
          <a href="/" className="inline-block text-sm font-semibold text-[#8F3F23] underline">Về bản đồ</a>
        </section>
        <canvas ref={canvasRef} aria-label="Xem trước bưu thiếp" className="mx-auto w-full max-w-[420px] rounded-sm border border-[#D8CFBD] bg-[#F6F1E6] shadow-md" />
      </div>
    </main>
  );
}
