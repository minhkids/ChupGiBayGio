import { useMemo, useRef, useState } from 'react';
import { drawPostcard, sampleSwatches, type PostcardLayout } from '../../lib/postcard';

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
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const artRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const params = useMemo(() => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search), []);
  void params;

  const paint = async (artwork: HTMLImageElement | null) => {
    const photo = photoRef.current;
    const canvas = canvasRef.current;
    if (!photo || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sample = document.createElement('canvas');
    sample.width = 48;
    sample.height = 48;
    const sctx = sample.getContext('2d')!;
    sctx.drawImage(photo, 0, 0, 48, 48);
    const swatches = sampleSwatches(sctx.getImageData(0, 0, 48, 48).data);
    canvas.width = 1000;
    canvas.height = 1500;
    drawPostcard(ctx, 1000, 1500, {
      photo,
      artwork: artwork || photo,
      photoWidth: photo.naturalWidth,
      photoHeight: photo.naturalHeight,
      location,
      date,
      layout,
      swatches,
      side,
    });
    setReady(true);
  };

  const onFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    photoRef.current = await loadImage(url);
    artRef.current = null;
    setReady(false);
    setMessage('');
  };

  const create = async () => {
    const input = document.querySelector<HTMLInputElement>('#postcard-file');
    const file = input?.files?.[0];
    if (!file || !photoRef.current) {
      setMessage('Hãy chọn một tấm ảnh trước.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const { blob } = await downscale(file);
      const body = new FormData();
      body.set('image', blob, 'photo.jpg');
      const response = await fetch('/api/postcard', { method: 'POST', body });
      const json = await response.json() as { artwork?: string; error?: string };
      if (!response.ok || !json.artwork) {
        setMessage(json.error || 'Không tạo được bưu thiếp.');
        await paint(null);
        return;
      }
      artRef.current = await loadImage(`data:image/png;base64,${json.artwork}`);
      await paint(artRef.current);
    } catch {
      setMessage('Không kết nối được máy chủ. Bố cục mẫu vẫn xem được.');
      await paint(null);
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
          <p className="text-sm leading-relaxed text-[#6E655B]">Tải ảnh của bạn. Phần giấy, chữ và ô màu được vẽ sẵn; AI chỉ vẽ bản watercolor.</p>
          <label className="block text-sm font-semibold">Ảnh
            <input id="postcard-file" type="file" accept="image/*" className="mt-1 block w-full text-sm" onChange={event => { const file = event.target.files?.[0]; if (file) void onFile(file); }} />
          </label>
          <label className="block text-sm font-semibold">Địa điểm
            <input value={location} onChange={event => setLocation(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#D8CFBD] bg-white px-3" />
          </label>
          <label className="block text-sm font-semibold">Ngày
            <input value={date} onChange={event => setDate(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#D8CFBD] bg-white px-3" />
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
          <button type="button" onClick={() => void paint(artRef.current)} className="min-h-11 w-full rounded-xl border border-[#D8CFBD] text-sm font-semibold">Xem bố cục mẫu</button>
          <button type="button" disabled={!ready} onClick={download} className="min-h-11 w-full rounded-xl border border-[#D8CFBD] text-sm font-semibold disabled:opacity-50">Tải PNG</button>
          {message && <p role="status" className="text-sm text-[#8F3F23]">{message}</p>}
          <a href="/" className="inline-block text-sm font-semibold text-[#8F3F23] underline">Về bản đồ</a>
        </section>
        <canvas ref={canvasRef} className="mx-auto w-full max-w-[420px] rounded-sm border border-[#D8CFBD] bg-[#F6F1E6] shadow-md" />
      </div>
    </main>
  );
}
