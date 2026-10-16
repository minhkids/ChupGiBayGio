import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Camera, ChevronDown, Compass, ExternalLink, FlaskConical, MapPin, MessageCircle, Phone, Plus, Search, Shirt, ShoppingBag, Upload, X, RefreshCw } from 'lucide-react';
import { useShootPlan } from '../../context/ShootPlanContext';
import { filmShopLocations, serviceHubApi, type ServiceListing } from '../../services/serviceHubApi';
import { ServicesHubAdminView } from './ServicesHubAdminView';
import { FilmShopCard } from './FilmShopCard';
import { FilmShopDetailDialog } from './FilmShopDetailDialog';

export type ServicesHubTab = 'outfit' | 'photographers' | 'labs' | 'film';
interface Props { onClose: () => void }
const tabItems: { id: ServicesHubTab; label: string; mobileLabel: string; icon: typeof Shirt }[] = [
  { id: 'outfit', label: 'Trang phục & Tiệm thuê', mobileLabel: 'Trang phục', icon: Shirt },
  { id: 'photographers', label: 'Nhiếp ảnh gia', mobileLabel: 'Nhiếp ảnh', icon: Camera },
  { id: 'labs', label: 'Lab', mobileLabel: 'Lab', icon: FlaskConical },
  { id: 'film', label: 'Mua film', mobileLabel: 'Mua film', icon: ShoppingBag }
];
const card = 'rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4]';
const primary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B35D30]';
const secondary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#ECE4D0] px-4 py-2 text-sm font-semibold text-[#2C2621] hover:bg-[#E2DAD0]';

export const ServicesHubView: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<ServicesHubTab>(() => {
    const section = new URLSearchParams(window.location.search).get('services');
    return section === 'film' || section === 'labs' || section === 'photographers' ? section : 'outfit';
  });
  const [adminOpen, setAdminOpen] = useState(() => window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));
  const [items, setItems] = useState<ServiceListing[]>([]);
  const [selectedFilmShop, setSelectedFilmShop] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [image, setImage] = useState<string>();
  const [keyword, setKeyword] = useState('');
  const [personQuery, setPersonQuery] = useState('');
  const [budget, setBudget] = useState('all');
  const [filmQuery, setFilmQuery] = useState('');
  const [filmDistrict, setFilmDistrict] = useState('all');
  const [filmWard, setFilmWard] = useState('all');
  const shootPlan = useShootPlan();
  const featuredPartner = new URLSearchParams(window.location.search).get('partner');
  useEffect(() => {
    if (loading || !featuredPartner || !items.some((item) => item.id === featuredPartner)) return;
    document.getElementById(`partner-${featuredPartner}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [featuredPartner, items, loading]);
  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await serviceHubApi.list()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    serviceHubApi.list().then((result) => { if (active) setItems(result); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const rentals = items.filter((x) => x.category === 'rental');
  const outfits = items.filter((x) => x.category === 'outfit');
  const photographers = useMemo(() => items.filter((x) => x.category === 'photographer').filter((x) => {
    const query = personQuery.trim().toLowerCase();
    const price = Number((x.price || '').replace(/[^\d]/g, ''));
    return (!query || [x.name, x.description, ...(x.tags || [])].some((v) => v?.toLowerCase().includes(query)))
      && (budget === 'all' || (budget === 'under500' && price > 0 && price < 500000) || (budget === '500to1000' && price >= 500000 && price <= 1000000) || (budget === 'above1000' && price > 1000000));
  }), [items, personQuery, budget]);
  const allLabs = items.filter((x) => x.category === 'filmLab');
  const hasRetailPrice = (item: ServiceListing) => Boolean(item.price?.trim()) || Number(item.minRollPrice) > 0 || Number(item.maxRollPrice) > 0;
  const labs = allLabs.filter((item) => !hasRetailPrice(item));
  const filmShops = allLabs.filter(hasRetailPrice);
  const directoryItems = activeTab === 'labs' ? labs : filmShops;
  const getAreas = (item: ServiceListing) => activeTab === 'film' ? filmShopLocations(item) : [{ ward: item.ward || '', district: item.district || '', openingHours: item.openingHours }];
  const allAreas = directoryItems.flatMap((item) => getAreas(item));
  const labDistricts = [...new Set(allAreas.map((location) => location.district).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  const labWards = [...new Set(allAreas.filter((location) => filmDistrict === 'all' || location.district === filmDistrict).map((location) => location.ward).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  const visibleFilmItems = directoryItems.filter((x) => (filmDistrict === 'all' || getAreas(x).some((location) => location.district === filmDistrict))
    && (filmWard === 'all' || getAreas(x).some((location) => location.ward === filmWard && (filmDistrict === 'all' || location.district === filmDistrict)))
    && (!filmQuery.trim() || [x.name, x.description, ...getAreas(x).flatMap((location) => [location.ward, location.district]), ...(activeTab === 'labs' ? x.services || [] : x.filmStocks || [])]
      .some((value) => value?.toLowerCase().includes(filmQuery.trim().toLowerCase()))));
  const addToPlan = (x: ServiceListing, type: 'rent' | 'purchase') => shootPlan?.addItem({ id: `service-${x.id}`, name: x.name, category: 'outfit', priceText: x.price || 'Giá liên hệ', imageUrl: x.imageUrl || '', shopName: x.category === 'rental' ? x.name : undefined, link: x.link, type });
  const empty = (message: string) => !loading && !error && <p className={`${card} p-8 text-center text-sm text-[#6E655B]`}>{message}</p>;
  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') setImage(reader.result); }; reader.readAsDataURL(file);
  };
  if (adminOpen) return <ServicesHubAdminView onBack={() => {
    setAdminOpen(false);
    if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
      window.history.replaceState(null, '', `/?services=${activeTab}`);
    }
    void load();
  }} />;

  return <section className="fixed inset-x-0 top-0 bottom-20 z-40 flex flex-col overflow-hidden bg-[#F7F5F0] text-[#2C2621] lg:bottom-0 lg:left-[76px]" aria-label="Chuẩn bị cho buổi chụp">
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E2DAD0] bg-[#FAF8F4] px-4 py-3 sm:px-8 lg:px-12"><div><h1 className="text-2xl font-bold">Chuẩn bị cho buổi chụp</h1><p className="hidden text-sm text-[#6E655B] sm:block">Trang phục, người chụp và film — chọn nhanh mọi thứ bạn cần.</p></div><button onClick={onClose} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#E8DEC7] px-4 text-sm font-semibold" aria-label="Trở về Bản đồ"><X className="h-4 w-4" />Trở về Bản đồ</button></header>
    <nav className="shrink-0 border-b border-[#E2DAD0] px-3 py-3 sm:px-6" aria-label="Danh mục dịch vụ"><div className="mx-auto grid w-full max-w-4xl grid-cols-4 gap-1.5 rounded-2xl bg-[#E8DEC7] p-1.5 shadow-inner select-none">{tabItems.map(({ id, label, mobileLabel, icon: Icon }) => <button key={id} onClick={() => { if ((id === 'labs' || id === 'film') && id !== activeTab) { setFilmQuery(''); setFilmDistrict('all'); setFilmWard('all'); } setActiveTab(id); }} aria-label={label} aria-current={activeTab === id ? 'page' : undefined} className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl px-1.5 text-center text-[10px] font-semibold sm:px-3 sm:text-xs ${activeTab === id ? 'bg-[#FAF8F4] font-bold text-[#2C2621] shadow-sm' : 'text-[#6E655B] hover:bg-[#DDD3BD]/50 hover:text-[#2C2621]'}`}><Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"/><span className="whitespace-nowrap sm:hidden">{mobileLabel}</span><span className="hidden whitespace-nowrap sm:inline">{label}</span></button>)}</div></nav>
    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7 lg:px-12">
      {(activeTab === 'film' || activeTab === 'photographers') && <div className="mx-auto mb-5 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] p-4 text-sm"><p className="font-semibold">{activeTab === 'film' ? 'Bạn có shop bán film?' : 'Bạn là nhiếp ảnh gia hoặc studio?'}</p><a href={activeTab === 'film' ? '/join/film-lab' : '/join/photographer'} className={primary}>Đăng ký miễn phí <ExternalLink className="h-4 w-4" /></a></div>}
      {error && <div role="alert" className="mx-auto mb-4 flex max-w-5xl justify-between rounded-xl border border-[#D8CFBD] bg-[#FAF8F4] p-3 text-sm">{error}<button onClick={() => void load()} className={secondary}><RefreshCw className="h-4 w-4"/>Thử lại</button></div>}{loading && <p className="mb-4 text-sm text-[#6E655B]">Đang tải thông tin dịch vụ…</p>}
      {activeTab === 'outfit' && <div className="mx-auto max-w-6xl"><section className={`${card} mx-auto mb-8 max-w-2xl p-5`}><h2 className="text-lg font-bold">Tìm trang phục từ ảnh mẫu</h2><p className="mb-4 mt-1 text-sm text-[#6E655B]">Kéo thả ảnh mẫu để tìm đồ trên Shopee & TikTok Shop.</p><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8CFBD] bg-[#FAF8F4] p-6 text-center">{image ? <img src={image} alt="Ảnh mẫu đã chọn" className="max-h-40 rounded-xl object-contain"/> : <><Upload className="mb-2 h-6 w-6 text-[#C76B3C]"/><span>Chọn ảnh hoặc kéo thả vào đây</span><span className="mt-1 text-xs text-[#6E655B]">JPG, PNG hoặc WebP</span></>}<input type="file" accept="image/*" className="sr-only" onChange={upload} aria-label="Tải ảnh trang phục mẫu"/></label><label className="mb-2 mt-4 block text-xs font-semibold" htmlFor="outfit-keyword">Từ khóa tìm kiếm</label><input id="outfit-keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Nhập tên hoặc kiểu trang phục" className="w-full rounded-xl border border-[#D8CFBD] bg-white px-3 py-2.5 text-sm"/><div className="mt-4 grid gap-2 sm:grid-cols-2"><a href={`https://shopee.vn/search?keyword=${encodeURIComponent(keyword)}`} target="_blank" rel="noreferrer" className={primary}><ShoppingBag className="h-4 w-4"/>Tìm Shopee</a><a href={`https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`} target="_blank" rel="noreferrer" className={primary}><ExternalLink className="h-4 w-4"/>Xem TikTok Shop</a></div></section><div className="grid gap-8 md:grid-cols-2">
        <section><p className="text-[10px] font-bold uppercase tracking-widest text-[#C76B3C]">{rentals.length} địa chỉ</p><h2 className="mb-4 mt-1 text-lg font-bold">Tiệm thuê trang phục</h2><div className="space-y-3">{rentals.map((x) => <article key={x.id} className={`${card} p-4`}><h3 className="font-bold">{x.name}</h3>{x.address && <p className="mt-1 flex gap-1 text-sm text-[#6E655B]"><MapPin className="h-4 w-4 shrink-0"/>{x.address}</p>}{x.price && <p className="mt-2 text-xs font-semibold text-[#8A4A2C]">{x.price}</p>}<div className="mt-3 flex justify-between border-t border-[#E2DAD0] pt-3">{x.phone && <a href={`tel:${x.phone}`} className="flex items-center gap-1 text-xs"><Phone className="h-3.5 w-3.5"/>{x.phone}</a>}<div className="ml-auto flex gap-2">{x.link && <a href={x.link} target="_blank" rel="noreferrer" className="px-2 py-2 text-xs">Fanpage</a>}<button onClick={() => addToPlan(x,'rent')} className={secondary}><Plus className="h-3.5 w-3.5"/>Lưu kế hoạch</button></div></div></article>)}</div>{empty('Chưa có tiệm thuê nào. Quản trị viên có thể thêm thông tin.')}</section>
        <section><p className="text-[10px] font-bold uppercase tracking-widest text-[#C76B3C]">{outfits.length} gợi ý</p><h2 className="mb-4 mt-1 text-lg font-bold">Trang phục check-in</h2><div className="grid gap-3 sm:grid-cols-2">{outfits.map((x) => <article key={x.id} className={`${card} overflow-hidden`}>{x.imageUrl ? <img src={x.imageUrl} alt={x.name} className="aspect-[3/4] w-full object-cover"/> : <div className="flex aspect-[3/4] items-center justify-center bg-[#EFE9DF]"><Shirt className="h-10 w-10"/></div>}<div className="p-3"><h3 className="font-bold">{x.name}</h3>{x.price && <p className="mt-1 text-xs text-[#8A4A2C]">{x.price}</p>}{x.link && <a href={x.link} target="_blank" rel="noreferrer" className={`${secondary} mt-3 w-full`}><ExternalLink className="h-4 w-4"/>Xem sản phẩm</a>}<button onClick={() => addToPlan(x,'purchase')} className="mt-2 flex min-h-9 w-full items-center justify-center gap-1 text-xs"><Plus className="h-3.5 w-3.5"/>Thêm vào kế hoạch</button></div></article>)}</div>{empty('Chưa có trang phục nào. Quản trị viên có thể thêm thông tin.')}</section></div></div>}
      {activeTab === 'photographers' && <div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap justify-between gap-4"><label className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"/><input value={personQuery} onChange={(e) => setPersonQuery(e.target.value)} placeholder="Tìm nhiếp ảnh gia hoặc phong cách" className="w-full rounded-full border border-[#D8CFBD] bg-[#FAF8F4] py-2.5 pl-9 pr-4 text-sm"/></label><div className="flex flex-wrap gap-2" aria-label="Lọc theo ngân sách">{[['all','Tất cả'],['under500','< 500k'],['500to1000','500k – 1tr'],['above1000','> 1tr']].map(([key,label]) => <button key={key} onClick={() => setBudget(key)} aria-pressed={budget===key} className={`rounded-full border px-3 py-2 text-xs ${budget===key?'border-[#C76B3C] bg-[#C76B3C] text-white':'border-[#D8CFBD] bg-[#FAF8F4]'}`}>{label}</button>)}</div></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{photographers.map((x) => <article key={x.id} className={`${card} overflow-hidden`}>{x.imageUrl ? <img src={x.imageUrl} alt={`Portfolio ${x.name}`} className="aspect-[3/2] w-full object-cover"/> : <div className="flex aspect-[3/2] items-center justify-center bg-[#E8DEC7]"><Camera className="h-10 w-10"/></div>}<div className="p-4"><h2 className="font-bold">{x.name}</h2>{x.rating && <p className="mt-1 text-xs">★ {x.rating}{x.reviewCount ? ` · ${x.reviewCount} đánh giá` : ''}</p>}{x.price && <p className="mt-1 text-xs font-bold text-[#8A4A2C]">{x.price}</p>}{x.description && <p className="mt-2 text-sm text-[#6E655B]">{x.description}</p>}<div className="my-3 flex flex-wrap gap-1">{x.tags?.map((tag) => <span key={tag} className="rounded-full bg-[#EFE9DF] px-2 py-1 text-[11px]">#{tag.replace(/^#/, '')}</span>)}</div><div className="grid grid-cols-2 gap-2">{x.secondaryLink && <a href={x.secondaryLink} target="_blank" rel="noreferrer" className={secondary}><ExternalLink className="h-4 w-4"/>Portfolio</a>}{x.link && <a href={x.link} target="_blank" rel="noreferrer" className={primary}><MessageCircle className="h-4 w-4"/>Liên hệ</a>}{x.phone && <a href={`tel:${x.phone}`} className={`${secondary} col-span-2`}><Phone className="h-4 w-4"/>{x.phone}</a>}</div></div></article>)}</div>{photographers.length===0 && empty('Chưa có nhiếp ảnh gia nào. Quản trị viên có thể thêm thông tin.')}</div>}
      {(activeTab === 'film' || activeTab === 'labs') && <div className="mx-auto max-w-6xl">{activeTab === 'labs' && <div className={`${card} mb-5 flex items-center justify-between p-4`}><div><h2 className="font-bold">Danh sách Lab</h2><p className="mt-1 text-xs text-[#6E655B]">Thông tin giờ mở cửa, dịch vụ và khu vực.</p></div><button onClick={() => void load()} className={secondary}><RefreshCw className="h-4 w-4"/>Làm mới</button></div>}<div className="mb-5 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(160px,200px)_minmax(150px,190px)_auto]">
          <label className="min-w-0"><span className="mb-1.5 block text-xs font-semibold text-[#6E655B]">Tìm kiếm</span><span className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E655B]"/><input value={filmQuery} onChange={(e) => setFilmQuery(e.target.value)} placeholder={activeTab === 'labs' ? 'Tìm lab, phường hoặc quận' : 'Tìm film, cửa hàng, phường hoặc quận'} className="h-11 w-full rounded-xl border border-[#D8CFBD] bg-[#FAF8F4] pl-9 pr-3 text-sm text-[#2C2621] placeholder:text-[#958A7C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C]"/></span></label>
          <label className="min-w-0" htmlFor="film-district-filter"><span className="mb-1.5 block text-xs font-semibold text-[#6E655B]">Quận / huyện</span><span className="relative block"><MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B4828]"/><select id="film-district-filter" aria-label="Quận / huyện" value={filmDistrict} onChange={(event) => { setFilmDistrict(event.target.value); setFilmWard('all'); }} className="h-11 w-full appearance-none rounded-xl border border-[#D8CFBD] bg-[#FAF8F4] pl-9 pr-10 text-sm text-[#2C2621] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C]"><option value="all">Tất cả quận/huyện</option>{labDistricts.map((district) => <option key={district} value={district}>{district}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E655B]"/></span></label>
          <label className="min-w-0" htmlFor="film-ward-filter"><span className="mb-1.5 block text-xs font-semibold text-[#6E655B]">Phường / xã</span><span className="relative block"><select id="film-ward-filter" aria-label="Phường / xã" value={filmWard} onChange={(event) => setFilmWard(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-[#D8CFBD] bg-[#FAF8F4] px-3 pr-9 text-sm text-[#2C2621] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C]"><option value="all">Tất cả phường/xã</option>{labWards.map((ward) => <option key={ward} value={ward}>{ward}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E655B]"/></span></label>
          <span role="status" aria-live="polite" className="pb-3 text-right text-xs text-[#6E655B]">{visibleFilmItems.length} {activeTab === 'labs' ? 'lab' : 'shop'}</span>
        </div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visibleFilmItems.map((x) => activeTab === 'film' ? <FilmShopCard key={x.id} shop={x} isFeatured={x.id === featuredPartner} onOpen={setSelectedFilmShop} /> : <article key={x.id} data-testid="film-shop-card" className={`${card} p-3`}><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h2 className="truncate font-bold">{x.name}</h2>{x.slogan && <p className="mt-1 text-xs leading-relaxed text-[#6E655B]">{x.slogan}</p>}{(x.ward || x.district) && <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-[#6E655B]"><MapPin className="h-3.5 w-3.5 shrink-0"/><span className="truncate">{[x.ward, x.district, 'Hà Nội'].filter(Boolean).join(', ')}</span></p>}</div></div>{activeTab === 'labs' && x.openingHours && <p className="mt-2 text-xs text-[#6E655B]">Giờ mở cửa: {x.openingHours}</p>}{activeTab === 'labs' && x.services?.length ? <p className="mt-1 text-xs text-[#6E655B]">{x.services.join(' · ')}</p> : null}<div className="mt-4 flex gap-2 border-t border-[#E2DAD0] pt-3">{x.secondaryLink && <a href={x.secondaryLink} target="_blank" rel="noreferrer" className={secondary}><Compass className="h-4 w-4"/>Chỉ đường</a>}{activeTab === 'labs' && x.link && <a href={x.link} target="_blank" rel="noreferrer" className={primary}><MessageCircle className="h-4 w-4"/>Liên hệ</a>}{activeTab === 'labs' && x.phone && <a href={`tel:${x.phone}`} className={secondary}><Phone className="h-4 w-4"/>{x.phone}</a>}</div></article>)}</div>{visibleFilmItems.length===0 && empty(activeTab === 'labs' ? 'Chưa có phòng lab nào.' : 'Chưa có shop bán film nào.')}</div>}
    </main>
    <AnimatePresence>{selectedFilmShop && <FilmShopDetailDialog key={selectedFilmShop.id} shop={selectedFilmShop} onClose={() => setSelectedFilmShop(null)} />}</AnimatePresence>
  </section>;
};
