import { lazy, Suspense, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Drawer } from 'vaul';
import { Camera, Check, ExternalLink, MapPin, Pin, X } from 'lucide-react';
import type { Photographer, PoseItem, PostOutfit, RentalShop, Spot } from '../../types';
import { useShootPlan } from '../../context/ShootPlanContext';
import { db } from '../../services/db';
import { fetchSpotOutfits } from '../../services/outfitService';
import { getPhotographersForSpot } from '../../data/mockPhotographers';
import { PartnerPhotographersForSpot } from '../photographers/PartnerPhotographersForSpot';
import { recommendFilmForSpot } from '../../utils/filmAdvisor';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { openNearestFilmShops } from '../../hooks/useNearestLabs';

const PoseCamera = lazy(() => import('../features/PoseCamera').then(module => ({ default: module.PoseCamera })));

export interface SpotDossierDrawerProps {
  spot: Spot | null;
  onClose: () => void;
  month: number;
  onSelectPhotographer?: (p: Photographer) => void;
  onOpenPhotographers?: () => void;
  onReportSpot?: (spot: Spot) => void;
  onOpenAddPost?: (spotId: string) => void;
}

const tabs = ['Bối cảnh & Góc chụp', 'Mặc gì & Nơi mua', 'Thiết bị & Thợ ảnh'] as const;
const control = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-editorial-border px-3 text-xs font-semibold transition-colors hover:border-kodak-amber hover:text-kodak-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kodak-amber';
const heading = 'mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400';
function subscribeDesktop(callback: () => void) {
  const query = window.matchMedia('(min-width: 1024px)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

/** A controlled, modal dossier. Mount beneath ShootPlanProvider. */
export function SpotDossierDrawer(props: SpotDossierDrawerProps) {
  const desktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia('(min-width: 1024px)').matches, () => false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const open = !!props.spot;
  useEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) returnFocus.current = document.activeElement;
  }, [open]);
  return (
    <Drawer.Root open={!!props.spot} onOpenChange={open => { if (!open) props.onClose(); }} direction={desktop ? 'right' : 'bottom'} handleOnly={!desktop} shouldScaleBackground={false} autoFocus>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[var(--z-drawer,40)] bg-black/50" />
        <Drawer.Content onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }} className="fixed inset-x-0 bottom-0 z-[var(--z-drawer,40)] flex h-[90dvh] max-h-[96dvh] flex-col rounded-t-2xl border border-editorial-border bg-editorial-bg text-stone-100 shadow-2xl outline-none lg:inset-y-0 lg:left-auto lg:h-dvh lg:max-h-none lg:w-[var(--sidebar-width,420px)] lg:rounded-none">
          {!desktop && <Drawer.Handle className="!my-3 !bg-stone-600" aria-label="Kéo xuống để đóng" />}
          {props.spot && <DossierContent key={props.spot.id} {...props} spot={props.spot} />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DossierContent({ spot, month, onClose, onSelectPhotographer, onOpenPhotographers, onReportSpot, onOpenAddPost }: SpotDossierDrawerProps & { spot: Spot }) {
  const plan = useShootPlan();
  const [tab, setTab] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [outfits, setOutfits] = useState<PostOutfit[] | null>(null);
  const [outfitError, setOutfitError] = useState(false);
  const [cameraPose, setCameraPose] = useState<PoseItem | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const photos = [...new Set([spot.coverImageUrl, ...spot.galleryUrls].filter(Boolean))];
  const photo = photos[photoIndex];
  const film = recommendFilmForSpot(spot, month);
  const photographers = getPhotographersForSpot(spot.id, spot.name);
  const [shops, setShops] = useState<(RentalShop & { distance: number })[]>([]);
  const [poses, setPoses] = useState<PoseItem[]>([]);
  const suggestedPoses = poses.filter(pose => pose.matchedSpots?.some(name => spot.name.toLowerCase().includes(name.toLowerCase())));
  const availablePoses = suggestedPoses.length ? suggestedPoses : poses;
  const [poseId, setPoseId] = useState(availablePoses[0]?.id || '');
  const selectedPose = availablePoses.find(pose => pose.id === poseId);
  const pinned = plan.isSpotInPlan(spot.id);

  useEffect(() => {
    let active = true;
    void fetchSpotOutfits(spot.id).then(data => { if (active) setOutfits(data); }).catch(() => { if (active) { setOutfits([]); setOutfitError(true); } });
    void db.rentalShops.getAll().then(allShops => {
      if (active) {
        setShops(allShops.map(shop => ({ ...shop, distance: calculateDistanceKm(spot.lat, spot.lng, shop.lat, shop.lng) })).sort((a, b) => a.distance - b.distance));
      }
    });
    void db.poses.getAll().then(allPoses => {
      if (active) setPoses(allPoses);
    });
    return () => { active = false; };
  }, [spot.id, spot.lat, spot.lng]);

  const changeTab = (index: number) => {
    setTab(index);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  };
  const pinImage = (imageUrl: string, label: string) => plan.addReferencePhoto({ imageUrl, label });
  const imagePinned = !!photo && plan.referencePhotos.some(reference => reference.imageUrl === photo);

  return <>
    <header className="shrink-0 border-b border-editorial-border px-5 pb-4 pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-kodak-amber">Hồ sơ điểm chụp · Tháng {month}</span>
        <Drawer.Close asChild><button type="button" aria-label="Đóng hồ sơ điểm chụp" className={`${control} !w-11 !px-0`}><X size={18} /></button></Drawer.Close>
      </div>
      <Drawer.Title className="font-editorial text-2xl leading-tight">{spot.name}</Drawer.Title>
      <Drawer.Description className="mt-2 text-xs leading-relaxed text-stone-400">{spot.address}</Drawer.Description>
      <button type="button" aria-pressed={pinned} onClick={() => plan.toggleSpot(spot)} className={`${control} mt-4 w-full ${pinned ? 'border-kodak-amber text-kodak-amber' : 'bg-kodak-amber text-editorial-bg hover:text-editorial-bg'}`}>
        {pinned ? <Check size={16} /> : <Pin size={16} />}{pinned ? 'Đã ghim vào kế hoạch' : 'Ghim vào kế hoạch'}
      </button>
    </header>
    <div role="tablist" aria-label="Nội dung hồ sơ" className="grid shrink-0 grid-cols-3 border-b border-editorial-border px-2">
      {tabs.map((label, index) => <button key={label} ref={element => { tabRefs.current[index] = element; }} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={tab === index} tabIndex={tab === index ? 0 : -1} onClick={() => changeTab(index)} onKeyDown={event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault(); changeTab(next); tabRefs.current[next]?.focus();
      }} className={`min-h-16 border-b-2 px-2 py-3 text-[11px] leading-relaxed focus-visible:outline focus-visible:outline-2 focus-visible:outline-kodak-amber ${tab === index ? 'border-kodak-amber text-kodak-amber' : 'border-transparent text-stone-400 hover:text-stone-100'}`}>{label}</button>)}
    </div>
    <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5">
      {tabs.map((_, index) => <div key={index} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={tab !== index} tabIndex={0} className="space-y-6 focus-visible:outline focus-visible:outline-kodak-amber">
        {index === 0 && <>
          {photo && <figure>
            <div className="relative overflow-hidden rounded-md bg-editorial-surface">
              <img src={photo} alt={`${spot.name} — ảnh ${photoIndex + 1}`} className="aspect-[4/3] w-full object-cover" />
              <button type="button" aria-pressed={imagePinned} onClick={() => pinImage(photo, spot.name)} className={`${control} absolute bottom-3 right-3 bg-editorial-bg/95`}><Pin size={14} />{imagePinned ? 'Đã ghim ảnh' : 'Ghim ảnh'}</button>
            </div>
            {photos.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto py-1">{photos.map((url, i) => <button type="button" key={url} onClick={() => setPhotoIndex(i)} aria-label={`Xem ảnh ${i + 1}`} aria-pressed={photoIndex === i} className={`h-12 w-16 shrink-0 overflow-hidden rounded border-2 focus-visible:outline focus-visible:outline-kodak-amber ${i === photoIndex ? 'border-kodak-amber' : 'border-transparent'}`}><img src={url} alt="" className="h-full w-full object-cover" loading="lazy" /></button>)}</div>}
          </figure>}
          <section><h3 className={heading}>{spot.seasonalTrend.trendTitle || 'Bối cảnh'}</h3><p className="text-sm leading-7 text-stone-300">{spot.description}</p></section>
          <div className="grid grid-cols-2 gap-2"><button type="button" className={control} onClick={() => onReportSpot?.(spot)}>Báo tình trạng hoa</button><button type="button" className={control} onClick={() => onOpenAddPost?.(spot.id)}>Gửi bài viết</button></div>
          <dl className="space-y-4 border-y border-editorial-border py-5 text-sm"><div><dt className={heading}>Khung giờ đẹp</dt><dd>{spot.bestTimeDescription}</dd></div><div><dt className={heading}>Ánh sáng</dt><dd className="leading-6 text-stone-300">{spot.lightingNotes}</dd><dd className="mt-1 text-xs text-stone-400">{spot.sunOrientation}</dd></div></dl>
          <section><h3 className={heading}>Ghi chú góc chụp</h3><ol className="space-y-4">{spot.photographyTips.map((tip, i) => <li key={`${i}-${tip}`} className="flex gap-3 text-sm leading-6"><span className="text-kodak-amber">{String(i + 1).padStart(2, '0')}</span><span className="text-stone-300">{tip}</span></li>)}</ol>{spot.poseTip && <p className="mt-4 border-l-2 border-kodak-amber pl-3 text-sm leading-6 text-stone-300">{spot.poseTip}</p>}</section>
          {availablePoses.length > 0 && <section><h3 className={heading}>Thử dáng trước ống kính</h3><label htmlFor={`${id}-pose`} className="mb-2 block text-xs text-stone-400">{suggestedPoses.length ? 'Dáng phù hợp địa điểm' : 'Thư viện dáng tham khảo'}</label><select id={`${id}-pose`} value={poseId} onChange={event => setPoseId(event.target.value)} className="min-h-11 w-full rounded-md border border-editorial-border bg-editorial-surface px-3 text-sm">{availablePoses.map(pose => <option key={pose.id} value={pose.id}>{pose.name}</option>)}</select>{selectedPose && <><p className="my-3 text-xs leading-6 text-stone-400">{selectedPose.tips}</p><button type="button" className={`${control} w-full`} onClick={() => setCameraPose(selectedPose)}><Camera size={16} />Mở camera thử dáng</button></>}</section>}
          <a className={`${control} w-full`} target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}><ExternalLink size={14} />Chỉ đường đến điểm chụp</a>
        </>}
        {index === 1 && <>
          <section><h3 className={heading}>Trang phục theo bối cảnh</h3><p className="mb-4 text-xs leading-6 text-stone-400">Gợi ý từ địa điểm và bảng màu, không phải nhận diện trang phục trong ảnh.</p><ul className="space-y-3 text-sm text-stone-200">{spot.recommendedOutfits.map(outfit => <li key={outfit} className="border-l border-kodak-amber pl-3">{outfit}</li>)}</ul><div className="mt-5 flex flex-wrap gap-3">{spot.colorPalette.map((hex, i) => <span key={`${hex}-${i}`} title={hex} aria-label={`Màu ${hex}`} className="h-8 w-8 rounded-full border border-white/20" style={{ backgroundColor: hex }} />)}</div></section>
          <section><h3 className={heading}>Món đồ & nơi mua</h3>{outfits === null ? <p role="status" className="text-sm text-stone-400">Đang tải thông tin trang phục…</p> : outfits.length === 0 ? <p className="text-sm leading-6 text-stone-400">{outfitError ? 'Không tải được thông tin trang phục. Vui lòng mở lại hồ sơ để thử lại.' : 'Chưa có món đồ được liên kết với điểm chụp này.'}</p> : <div className="space-y-4">{outfits.map(outfit => <article key={outfit.id} className="rounded-md border border-editorial-border bg-editorial-surface p-4"><h4 className="text-sm font-semibold">{outfit.itemName}</h4><p className="mt-1 text-xs text-stone-400">{[outfit.color, outfit.style, outfit.priceEstimate].filter(Boolean).join(' · ')}</p><div className="mt-3 flex flex-wrap gap-2">{outfit.shopeeUrl && <a href={outfit.shopeeUrl} target="_blank" rel="noopener noreferrer" className={control}>Shopee <ExternalLink size={12} /></a>}{outfit.tiktokUrl && <a href={outfit.tiktokUrl} target="_blank" rel="noopener noreferrer" className={control}>TikTok Shop <ExternalLink size={12} /></a>}<button type="button" className={control} aria-pressed={plan.isItemInPlan(outfit.id)} onClick={() => plan.toggleItem({ id: outfit.id, name: outfit.itemName, category: 'outfit', priceText: outfit.priceEstimate, imageUrl: outfit.imageUrl, sourceUrl: outfit.shopeeUrl || outfit.tiktokUrl, type: 'purchase' })}>{plan.isItemInPlan(outfit.id) ? 'Đã ghim món đồ' : 'Ghim món đồ'}</button></div></article>)}</div>}</section>
          <ShopSection title="Địa chỉ thuê trang phục" shop={shops.find(shop => shop.type === 'OUTFIT')} />
        </>}
        {index === 2 && <>
          <section><h3 className={heading}>Ống kính & chi phí</h3><div className="flex flex-wrap gap-2">{spot.recommendedLenses.map(lens => <span key={lens} className="rounded border border-editorial-border bg-editorial-surface px-3 py-2 text-xs">{lens}</span>)}</div><p className="mt-4 text-sm text-kodak-amber">{spot.ticketPriceRange}</p><p className="mt-2 text-xs leading-6 text-stone-400">{spot.cameraFeePolicy}</p></section>
          <section className="rounded-md border border-editorial-border bg-editorial-surface p-4">
            <h3 className={heading}>Film gợi ý · Tháng {month}</h3>
            <h4 className="font-editorial text-xl">{film.film.fullName}</h4>
            <p className="mt-2 text-xs text-kodak-amber">ISO {film.film.iso} · {film.film.format}</p>
            <p className="mt-3 text-sm leading-6 text-stone-300">{film.rationale}</p>
            <p className="mt-4 border-t border-editorial-border pt-3 text-xs leading-6 text-stone-400">{film.recommendedSettings}</p>
            <button
              type="button"
              onClick={() => openNearestFilmShops(film.film.fullName)}
              className={`${control} mt-3 w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10`}
            >
              <MapPin size={16} /> Tìm Lab gần đây còn sẵn cuộn này
            </button>
          </section>
          <ShopSection title="Địa chỉ thuê thiết bị" shop={shops.find(shop => shop.type === 'CAMERA')} />
          <section><h3 className={heading}>Thợ ảnh ở điểm chụp</h3>{photographers.length === 0 && <p className="text-sm text-stone-400">Chưa có hồ sơ thợ ảnh cho địa điểm này.</p>}<div className="space-y-3">{photographers.map(person => <article key={person.id} className="border-b border-editorial-border pb-4"><div className="flex items-center gap-3"><img src={person.avatarUrl} alt="" loading="lazy" className="h-11 w-11 rounded-full object-cover" /><div className="min-w-0"><h4 className="text-sm font-semibold">{person.name}</h4><p className="mt-1 text-xs text-kodak-amber">Từ {person.startingPriceFormatted}</p></div></div><p className="my-3 text-xs leading-6 text-stone-400">{person.gear}</p><div className="flex flex-wrap gap-2">{onSelectPhotographer && <button type="button" className={control} onClick={() => { onClose(); onSelectPhotographer(person); }}>Xem hồ sơ</button>}<a className={control} href={person.contact.zaloUrl} target="_blank" rel="noopener noreferrer">Liên hệ Zalo <ExternalLink size={12} /></a><button type="button" className={control} onClick={() => plan.setPhotographer(person)}>{plan.photographer?.id === person.id ? 'Đã chọn thợ ảnh' : 'Chọn vào kế hoạch'}</button></div></article>)}</div>{onOpenPhotographers && <button type="button" className={`${control} mt-4 w-full`} onClick={() => { onClose(); onOpenPhotographers(); }}>Xem danh bạ thợ ảnh</button>}</section>
          <PartnerPhotographersForSpot spotName={spot.name} />
        </>}
      </div>)}
    </div>
    <Drawer.NestedRoot open={!!cameraPose} onOpenChange={open => { if (!open) setCameraPose(null); }} dismissible={false}>
      <Drawer.Portal><Drawer.Overlay className="fixed inset-0 z-[var(--z-camera,100)] bg-black" /><Drawer.Content className="fixed inset-0 z-[var(--z-camera,100)] bg-editorial-bg text-white outline-none"><Drawer.Title className="sr-only">Camera thử dáng</Drawer.Title><Drawer.Description className="sr-only">Thử dáng chụp với camera thiết bị.</Drawer.Description>{cameraPose && <Suspense fallback={<div className="p-6"><p role="status">Đang mở camera…</p><button type="button" onClick={() => setCameraPose(null)} className={control}>Đóng camera</button></div>}><PoseCamera pose={cameraPose} onClose={() => setCameraPose(null)} /></Suspense>}</Drawer.Content></Drawer.Portal>
    </Drawer.NestedRoot>
  </>;
}

function ShopSection({ title, shop }: { title: string; shop?: RentalShop & { distance: number } }) {
  return <section><h3 className={heading}>{title}</h3>{shop ? <div className="border-l border-editorial-border pl-4"><h4 className="text-sm font-semibold">{shop.name}</h4><p className="mt-2 text-xs leading-6 text-stone-400">{shop.address} · {formatDistance(shop.distance)} đường chim bay</p><p className="mt-2 text-xs text-kodak-amber">{shop.priceRange}</p><div className="mt-3 flex flex-wrap gap-2"><a href={`tel:${shop.phone}`} className={control}>Gọi cửa hàng</a><a href={shop.link} target="_blank" rel="noopener noreferrer" className={control}>Xem địa chỉ <ExternalLink size={12} /></a></div><p className="mt-3 text-[11px] leading-5 text-stone-500">Địa chỉ gần nhất trong danh sách hiện có. Liên hệ xác nhận giá và tình trạng trước khi đi.</p></div> : <p className="text-sm text-stone-400">Chưa có địa chỉ trong danh sách.</p>}</section>;
}
