import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Copy, ImagePlus, MapPin, Sparkles } from 'lucide-react';
import { LivePreviewCard } from './LivePreviewCard';
import { AddressSuggestionsField } from './AddressSuggestionsField';

const districts = ['Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Cầu Giấy', 'Hai Bà Trưng', 'Tây Hồ', 'Thanh Xuân', 'Long Biên', 'Hà Đông', 'Hoàng Mai', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Thanh Trì', 'Hoài Đức', 'Đan Phượng', 'Thanh Oai', 'Thường Tín', 'Phúc Thọ', 'Quốc Oai', 'Thạch Thất', 'Chương Mỹ', 'Mỹ Đức', 'Ứng Hòa', 'Ba Vì', 'Sơn Tây', 'Mê Linh'];
const films = ['Kodak Gold 200', 'Kodak ColorPlus', 'Fujifilm 200', 'CineStill 800T', 'Ilford HP5', 'Vision3 chiết'];
const styles = ['MàuFilm', 'NàngThơ', 'ÁoDài', 'ĐườngPhố', 'ChụpĐêm', 'Couple'];
const spots = ['Phan Đình Phùng', 'Hồ Tây', 'Bãi Đá Sông Hồng', 'Phố Cổ', 'Tòa Soạn Báo'];
const input = 'mt-1.5 block min-h-12 w-full rounded-xl border border-[#CFC4B2] bg-white px-4 py-3 text-base text-[#2C2621] outline-none placeholder:text-[#82786E] focus:border-[#C76B3C] focus:ring-2 focus:ring-[#C76B3C]/20';
const label = 'block text-sm font-semibold text-[#2C2621]';

type Kind = 'lab' | 'photographer';
type Result = { id: string; status: string; url: string };

export function PartnerJoinPage({ kind }: { kind: Kind }) {
  const lab = kind === 'lab';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [filmStocks, setFilmStocks] = useState<string[]>([]);
  const [customFilm, setCustomFilm] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [shootSpots, setShootSpots] = useState<string[]>([]);
  const [gear, setGear] = useState('');
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageDuration, setPackageDuration] = useState('');
  const [deliveredPhotos, setDeliveredPhotos] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const urlsRef = useRef<string[]>([]);
  useEffect(() => () => { urlsRef.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  const toggle = (item: string, values: string[], setter: (items: string[]) => void) => setter(values.includes(item) ? values.filter((value) => value !== item) : [...values, item]);
  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.target.files || []);
    if (next.length > (lab ? 1 : 6) || next.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024)) {
      setError('Chỉ nhận JPG, PNG hoặc WebP, tối đa 3 MB/ảnh; portfolio chọn tối đa 6 ảnh.');
      return;
    }
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const urls = typeof URL.createObjectURL === 'function' ? next.map((file) => URL.createObjectURL(file)) : [];
    urlsRef.current = urls;
    setPreviews(urls);
    setFiles(next);
    setError('');
  };
  const addFilm = () => {
    const value = customFilm.trim();
    if (value && value.length <= 100 && filmStocks.length < 20 && !filmStocks.includes(value)) setFilmStocks([...filmStocks, value]);
    setCustomFilm('');
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!lab && (files.length < 3 || files.length > 6)) { setError('Vui lòng chọn 3–6 ảnh portfolio.'); return; }
    setBusy(true); setError('');
    const payload = lab
      ? { name, address, district, phone, socialUrl, openingHours, filmStocks, imageUrl, website: '' }
      : { name, address, district, phone, socialUrl, imageUrl, gear, styles: selectedStyles, shootSpots, package: { name: packageName, price: Number(packagePrice), duration: packageDuration, deliveredPhotos }, website: '' };
    const body = new FormData();
    body.set('payload', JSON.stringify(payload));
    files.forEach((file) => body.append('photos', file));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/partner/register-${lab ? 'lab' : 'photographer'}`, { method: 'POST', body });
      const data = await response.json().catch(() => null) as (Result & { error?: string }) | null;
      if (!response.ok || !data?.id || !data.url) throw new Error(data?.error || 'Không thể gửi đăng ký. Vui lòng thử lại.');
      setResult(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể kết nối máy chủ.'); }
    finally { setBusy(false); }
  };
  const copy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.url); setCopied(true); }
    catch { setError('Không thể sao chép tự động; hãy giữ và sao chép liên kết bên dưới.'); }
  };
  const benefits = lab
    ? ['Hiện trên bản đồ GPS để khách tìm shop bán film gần nhất.', 'Khách xem các dòng film bạn đang bán.', 'Miễn phí, khách liên hệ Zalo / Fanpage trực tiếp.']
    : ['Xuất hiện cùng các điểm chụp quen thuộc ở Hà Nội.', 'Khách xem portfolio và giá trước khi liên hệ.', 'Liên hệ Zalo trực tiếp, không thu hoa hồng.'];
  return <main className="min-h-screen bg-[#F7F5F0] pb-[max(2.5rem,env(safe-area-inset-bottom))] text-[#2C2621]">
    <header className="border-b border-[#D8CFBD] bg-[#FAF8F4]"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"><a href="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" />Chụp Gì Bây Giờ</a><span className="text-xs font-semibold uppercase tracking-widest text-[#9A4F29]">Dành cho đối tác</span></div></header>
    <div className="mx-auto max-w-6xl px-4 pt-9 sm:px-6 sm:pt-14">
      <section className="mb-9 max-w-3xl"><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A8512C]"><Sparkles className="h-4 w-4" />Kết nối người yêu nhiếp ảnh</p><h1 className="text-3xl font-bold leading-tight sm:text-5xl">{lab ? 'Đưa Shop Bán Film Của Bạn Lên Bản Đồ Nhiếp Ảnh Hà Nội' : 'Kết Nối Khách Chụp Ảnh Quanh Các Điểm Check-in Hot'}</h1><ul className="mt-6 grid gap-3 text-sm leading-relaxed text-[#554D43] sm:grid-cols-3">{benefits.map((benefit) => <li key={benefit} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C76B3C]" />{benefit}</li>)}</ul></section>
      {result ? <section className="mx-auto max-w-xl rounded-3xl border border-[#D8CFBD] bg-[#FAF8F4] p-6 text-center shadow-sm sm:p-10" role="status"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8E1D4] text-[#A8512C]"><Check className="h-7 w-7" /></span><h2 className="mt-5 text-2xl font-bold">Đã cập nhật thông tin thành công!</h2><p className="mt-3 text-sm text-[#554D43]">Thông tin của bạn đã được đăng. Xem thẻ trên website và chia sẻ với khách hàng.</p><a href={result.url} className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 font-bold text-white">Xem thẻ trên website <ArrowUpRight className="h-4 w-4" /></a><button type="button" onClick={() => void copy()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D8CFBD] px-5 text-sm font-semibold"><Copy className="h-4 w-4" />{copied ? 'Đã sao chép — dán vào Zalo' : 'Sao chép link để chia sẻ qua Zalo'}</button><p className="mt-4 break-all text-xs text-[#675D52]">{result.url}</p></section>
      : <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:gap-12">
        <form onSubmit={(event) => void submit(event)} className="space-y-6 rounded-[28px] border border-[#D8CFBD] bg-[#FAF8F4] p-5 sm:p-8">
          <div><h2 className="text-xl font-bold">Thông tin {lab ? 'shop bán film' : 'nhiếp ảnh gia'}</h2><p className="mt-1 text-sm text-[#675D52]">Điền thông tin thật để khách dễ tìm thấy và liên hệ bạn. Dấu * là bắt buộc.</p></div>
          <label className={label}>{lab ? 'Tên shop bán film *' : 'Tên thợ ảnh / Nghệ danh *'}<input className={input} value={name} onChange={(e) => setName(e.target.value)} required maxLength={160} placeholder={lab ? 'Ví dụ: Tiệm Film Hà Nội' : 'Ví dụ: Minh Studio'} autoComplete="organization" /></label>
          <AddressSuggestionsField label={lab ? 'Địa chỉ chính xác *' : 'Địa chỉ studio / nơi nhận khách (tùy chọn)'} value={address} onChange={setAddress}
            onPick={(suggestion) => { const found = districts.find((item) => suggestion.toLocaleLowerCase('vi').includes(item.toLocaleLowerCase('vi'))); if (found) setDistrict(found); }}
            required={lab} inputClassName={input} placeholder={lab ? 'Số nhà, đường, phường — để ghim đúng vị trí' : 'Chỉ nhập nếu bạn muốn công khai địa chỉ studio'} />
          <label className={label}>Quận / Huyện {lab ? '*' : '(tùy chọn)'}<select className={input} value={district} required={lab} onChange={(e) => setDistrict(e.target.value)}><option value="">Chọn quận / huyện</option>{districts.map((name) => <option key={name}>{name}</option>)}</select></label>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-[#675D52]"><MapPin className="h-4 w-4 shrink-0 text-[#C76B3C]" />{lab ? 'Chọn gợi ý nếu phù hợp hoặc nhập tay; kiểm tra số nhà và quận/huyện trước khi gửi.' : 'Địa chỉ này sẽ hiển thị công khai. Không nhập địa chỉ nhà riêng nếu bạn không muốn chia sẻ.'}</p>
          <label className={label}>{lab ? 'Hotline / Số Zalo nhận khách *' : 'Số điện thoại / Zalo *'}<input className={input} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required pattern="0[0-9 ]{9,14}" placeholder="09xx xxx xxx" /></label>
          <label className={label}>Link Facebook / Instagram<input className={input} type="url" value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} placeholder="https://facebook.com/…" /></label>
          {lab ? <>
            <label className={label}>Giờ mở cửa<input className={input} value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} maxLength={120} placeholder="09:00 – 19:30 hàng ngày" /></label>
            <fieldset><legend className={label}>Các dòng film đang bán</legend><div className="mt-3 flex flex-wrap gap-2">{films.map((film) => <button type="button" key={film} aria-pressed={filmStocks.includes(film)} onClick={() => toggle(film, filmStocks, setFilmStocks)} className={`min-h-10 rounded-full border px-3 py-2 text-xs font-semibold ${filmStocks.includes(film) ? 'border-[#C76B3C] bg-[#C76B3C] text-white' : 'border-[#D8CFBD] bg-white'}`}>{film}</button>)}{filmStocks.filter((film) => !films.includes(film)).map((film) => <button type="button" key={film} aria-label={`Bỏ ${film}`} onClick={() => toggle(film, filmStocks, setFilmStocks)} className="min-h-10 rounded-full border border-[#C76B3C] bg-[#F3E6D6] px-3 text-xs">{film} ×</button>)}</div><div className="mt-3 flex gap-2"><input aria-label="Thêm tên film" className={input + ' !mt-0'} value={customFilm} onChange={(e) => setCustomFilm(e.target.value)} maxLength={100} placeholder="Tên film khác" /><button type="button" onClick={addFilm} className="rounded-xl border border-[#C76B3C] px-4 text-sm font-semibold text-[#8B4828]">Thêm</button></div></fieldset>
          </> : <>
            <label className={label}>Thiết bị sử dụng chính<input className={input} value={gear} onChange={(e) => setGear(e.target.value)} maxLength={200} placeholder="Ví dụ: Fujifilm X-T5, Sony A7 IV" /></label>
            <fieldset><legend className={label}>Phong cách chụp</legend><div className="mt-3 flex flex-wrap gap-2">{styles.map((style) => <button type="button" key={style} aria-pressed={selectedStyles.includes(style)} onClick={() => toggle(style, selectedStyles, setSelectedStyles)} className={`min-h-10 rounded-full border px-3 py-2 text-xs font-semibold ${selectedStyles.includes(style) ? 'border-[#C76B3C] bg-[#C76B3C] text-white' : 'border-[#D8CFBD] bg-white'}`}>#{style}</button>)}</div></fieldset>
            <fieldset><legend className={label}>Địa bàn hay chụp</legend><div className="mt-3 flex flex-wrap gap-2">{spots.map((spot) => <button type="button" key={spot} aria-pressed={shootSpots.includes(spot)} onClick={() => toggle(spot, shootSpots, setShootSpots)} className={`min-h-10 rounded-full border px-3 py-2 text-xs font-semibold ${shootSpots.includes(spot) ? 'border-[#C76B3C] bg-[#C76B3C] text-white' : 'border-[#D8CFBD] bg-white'}`}>{spot}</button>)}</div></fieldset>
            <fieldset className="space-y-4 rounded-2xl border border-[#D8CFBD] bg-[#F7F5F0] p-4"><legend className="px-2 font-bold">Gói chụp tiêu biểu</legend><label className={label}>Tên gói *<input className={input} value={packageName} onChange={(e) => setPackageName(e.target.value)} required maxLength={160} placeholder="Nàng Thơ Ngoại Cảnh" /></label><div className="grid gap-4 sm:grid-cols-2"><label className={label}>Giá (VNĐ) *<input className={input} type="number" min="0" max="100000000" value={packagePrice} onChange={(e) => setPackagePrice(e.target.value)} required placeholder="600000" /></label><label className={label}>Thời lượng *<input className={input} value={packageDuration} onChange={(e) => setPackageDuration(e.target.value)} required maxLength={120} placeholder="1.5 giờ" /></label></div><label className={label}>Số ảnh trả *<input className={input} value={deliveredPhotos} onChange={(e) => setDeliveredPhotos(e.target.value)} required maxLength={120} placeholder="Toàn bộ ảnh gốc + 15 ảnh chỉnh" /></label></fieldset>
          </>}
          <div className="space-y-3"><label className={label}>Ảnh đại diện {lab ? 'tiệm' : '/ Avatar'} (link HTTPS, tùy chọn)<input className={input} type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></label><label className={label}><span className="flex items-center gap-2"><ImagePlus className="h-4 w-4 text-[#C76B3C]" />{lab ? 'Hoặc tải ảnh tiệm' : 'Tải 3–6 ảnh portfolio *'}</span><input className="mt-2 block w-full rounded-xl border border-dashed border-[#B6A88F] bg-white p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#EFE5D4] file:px-3 file:py-2" type="file" accept="image/jpeg,image/png,image/webp" multiple={!lab} onChange={handleFiles} required={!lab} /></label><p className="text-xs text-[#675D52]">JPG, PNG hoặc WebP; tối đa 3 MB/ảnh. Ảnh được lưu trên website.</p></div>
          <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button type="submit" disabled={busy} className="min-h-13 w-full rounded-xl bg-[#C76B3C] px-5 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#AA542D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C76B3C] disabled:opacity-60">{busy ? 'Đang lưu thông tin…' : 'Hoàn tất đăng ký'}</button>
          <p className="text-center text-xs leading-relaxed text-[#675D52]">Bằng cách đăng ký, bạn đồng ý công khai thông tin liên hệ và ảnh đã gửi trên website.</p>
        </form>
        <aside className="lg:sticky lg:top-8"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Xem trước thẻ của bạn</h2><span className="text-xs text-[#8B4828]">Cập nhật trực tiếp</span></div><LivePreviewCard data={{ kind, name, image: previews[0] || imageUrl, address, district, phone, openingHours, filmStocks, styles: selectedStyles, shootSpots, packageName, packagePrice, packageDuration, packageDeliverables: deliveredPhotos, portfolio: previews }} /><p className="mt-3 text-xs leading-relaxed text-[#675D52]">Bản xem trước mô phỏng thẻ khách hàng; vị trí và ảnh được xác nhận khi gửi biểu mẫu.</p></aside>
      </div>}
      <footer className="mt-12 border-t border-[#D8CFBD] pt-5 text-xs text-[#675D52]">© Chụp Gì Bây Giờ · Kết nối trực tiếp với cộng đồng nhiếp ảnh Hà Nội</footer>
    </div>
  </main>;
}
