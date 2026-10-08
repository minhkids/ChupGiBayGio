import { useEffect, useState } from 'react';
import { Camera, ExternalLink, MessageCircle } from 'lucide-react';
import { matchesPartnerSpot } from './partnerSpotMatch';

type PartnerRow = { id: string; name: string; phone: string; avatar_url: string; preferred_spots: string | string[]; packages?: { price?: number }[] };

export function PartnerPhotographersForSpot({ spotName }: { spotName: string }) {
  const [rows, setRows] = useState<PartnerRow[]>([]);
  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/photographers`).then(async (response) => {
      if (!response.ok) throw Error('Không tải được nhiếp ảnh gia');
      const data: unknown = await response.json();
      return Array.isArray(data) ? data as PartnerRow[] : [];
    }).then((data) => { if (active) setRows(data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const selected = rows.filter((row) => {
    try { const places: unknown = typeof row.preferred_spots === 'string' ? JSON.parse(row.preferred_spots) : row.preferred_spots; return Array.isArray(places) && matchesPartnerSpot(spotName, places.filter((name): name is string => typeof name === 'string')); }
    catch { return false; }
  });
  if (!selected.length) return null;
  return <section aria-label="Đối tác chụp tại địa điểm này" className="space-y-3 border-t border-neutral-800 pt-4 text-neutral-100"><h3 className="flex items-center gap-2 text-sm font-bold"><Camera className="h-4 w-4 text-amber-400" />Đối tác chụp tại {spotName}</h3>{selected.map((person) => <article key={person.id} className="rounded-xl border border-neutral-700 bg-neutral-900 p-3"><div className="flex items-center gap-3">{person.avatar_url ? <img src={person.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" /> : <Camera aria-hidden="true" className="h-9 w-9 text-amber-400" />}<div className="min-w-0"><h4 className="truncate text-sm font-bold">{person.name}</h4>{person.packages?.[0]?.price != null && <p className="text-xs text-amber-400">Từ {person.packages[0].price.toLocaleString('vi-VN')}đ</p>}</div></div><div className="mt-3 flex gap-2"><a href={`/?services=photographers&partner=${encodeURIComponent(person.id)}`} aria-label={`Xem ${person.name}`} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-600 text-xs"><ExternalLink className="h-3.5 w-3.5" />Xem portfolio</a><a href={`https://zalo.me/${person.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-amber-400 text-xs font-bold text-neutral-950"><MessageCircle className="h-3.5 w-3.5" />Nhắn Zalo</a></div></article>)}</section>;
}
