import { useEffect, useRef, useState } from 'react';
import type { LocationData } from '../../hooks/useMapLocationPicker';
import { isSpotLocationResult, type SpotLocationResult } from '../../utils/spotLocationSearch';

export function SpotLocationSearch({ onSelect }: { onSelect: (location: LocationData) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotLocationResult[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; request.current?.abort(); }, []);
  const invalidate = () => { generation.current++; request.current?.abort(); setResults([]); setBusy(false); setMessage(''); };
  const search = async () => {
    if (busy || query.trim().length < 3 || query.length > 160) return;
    invalidate();
    const current = generation.current;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/spot-location-search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      const data: unknown = await response.json();
      if (generation.current !== current) return;
      if (!response.ok) throw new Error(response.status === 429 ? 'Bạn đã tìm nhiều địa chỉ. Vui lòng đợi một phút.' : 'Không tìm được địa chỉ lúc này. Thử lại hoặc chọn trên bản đồ.');
      if (!Array.isArray(data) || data.length > 5 || !data.every(isSpotLocationResult)) throw new Error('Dữ liệu địa chỉ không hợp lệ. Hãy chọn điểm trên bản đồ.');
      setResults(data);
      setMessage(data.length ? 'Chọn một kết quả rồi kiểm tra ghim trên bản đồ.' : 'Không có kết quả ở Việt Nam. Thử địa chỉ đầy đủ hơn hoặc chọn trên bản đồ.');
    } catch (error) {
      if (generation.current === current) setMessage(controller.signal.aborted ? 'Tìm kiếm quá lâu. Vui lòng thử lại.' : error instanceof Error ? error.message : 'Không tìm được địa chỉ.');
    } finally {
      clearTimeout(timer);
      if (generation.current === current) setBusy(false);
    }
  };
  return <section className="mb-3 space-y-2" aria-label="Tìm địa điểm theo địa chỉ">
    <label htmlFor="spot-address-search" className="block font-semibold text-slateInk">Tìm địa chỉ</label>
    <div className="flex gap-2">
      <input id="spot-address-search" value={query} maxLength={160} autoComplete="off" placeholder="VD: số 20 ngõ 465 Ngọc Thuỵ LB HN" className="min-w-0 flex-1 border border-slateInk/40 bg-paper-warm p-2.5 text-sm text-slateInk placeholder:text-slateInk-muted" onChange={event => { invalidate(); setQuery(event.target.value); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} />
      <button type="button" disabled={busy || query.trim().length < 3} onClick={() => void search()} className="min-h-11 shrink-0 border border-slateInk bg-terracotta px-3 font-semibold text-white disabled:opacity-50">{busy ? 'Đang tìm…' : 'Tìm địa chỉ'}</button>
    </div>
    <p className="text-slateInk-muted">Tìm trong Việt Nam, ưu tiên Hà Nội. Kết quả không bảo đảm đúng cửa vào.</p>
    <p role="status" aria-live="polite" className="text-slateInk">{busy ? 'Đang tìm địa chỉ…' : message}</p>
    {results.length > 0 && <ul className="divide-y divide-slateInk/20 border border-slateInk/30">{results.map(result => <li key={result.id}>
      <button type="button" className="w-full p-3 text-left text-slateInk hover:bg-paper-warm focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta" onClick={() => { invalidate(); onSelect({ ...result, source: 'search', precision: result.precision }); }}>
        {result.placeName && <strong className="block">{result.placeName}</strong>}
        <span className="block">{result.address}</span>
        <span className="mt-1 block text-xs text-slateInk-muted">{result.precision === 'area' ? 'Gần đúng · đường / khu vực' : 'Địa chỉ từ dữ liệu bản đồ · cần kiểm tra ghim'}</span>
      </button>
    </li>)}</ul>}
    <p className="text-[11px] text-slateInk-muted">Tìm kiếm bởi <a href="https://photon.komoot.io" target="_blank" rel="noreferrer" className="underline">Photon</a> · dữ liệu © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap contributors</a></p>
  </section>;
}