import React, { useMemo, useState } from 'react';
import {
  Camera,
  Compass,
  ExternalLink,
  Film,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shirt,
  ShoppingBag,
  Star,
  Upload,
  X
} from 'lucide-react';
import { useNearestLabs } from '../../hooks/useNearestLabs';
import { MOCK_PHOTOGRAPHERS } from '../../data/mockPhotographers';
import { MOCK_POST_OUTFITS, buildShopeeSearchUrl, buildTikTokShopSearchUrl } from '../../data/mockOutfits';
import { RENTAL_SHOPS } from '../../data/rentalShops';
import { useShootPlan } from '../../context/ShootPlanContext';
import type { Photographer } from '../../types';
import type { FilmLab } from '../../data/filmLabsData';

export type ServicesHubTab = 'outfit' | 'photographers' | 'film';

interface ServicesHubViewProps {
  onClose: () => void;
  onSelectPhotographer?: (photographer: Photographer) => void;
  onFlyToLab?: (lab: FilmLab) => void;
}

const SERVICE_TABS: { id: ServicesHubTab; label: string; mobileLabel: string; icon: typeof Shirt }[] = [
  { id: 'outfit', label: 'Trang phục & Tiệm thuê', mobileLabel: 'Trang phục', icon: Shirt },
  { id: 'photographers', label: 'Nhiếp ảnh gia', mobileLabel: 'Nhiếp ảnh', icon: Camera },
  { id: 'film', label: 'Mua film & Lab', mobileLabel: 'Mua film', icon: Film }
];

const cardClass = 'rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4]';
const primaryButtonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B35D30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C] focus-visible:ring-offset-2';
const secondaryButtonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#ECE4D0] px-4 py-2 text-sm font-semibold text-[#2C2621] transition-colors hover:bg-[#E2DAD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C] focus-visible:ring-offset-2';

export const ServicesHubView: React.FC<ServicesHubViewProps> = ({ onClose, onSelectPhotographer, onFlyToLab }) => {
  const [activeTab, setActiveTab] = useState<ServicesHubTab>('outfit');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [outfitKeyword, setOutfitKeyword] = useState('áo dài trắng dáng suông');
  const [photographerQuery, setPhotographerQuery] = useState('');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under500' | '500to1000' | 'above1000'>('all');
  const [filmQuery, setFilmQuery] = useState('');
  const shootPlan = useShootPlan();
  const { labs, isFallback, isLocating, refreshLocation } = useNearestLabs({ filmStockQuery: filmQuery });

  const photographers = useMemo(() => MOCK_PHOTOGRAPHERS.filter((person) => {
    const query = photographerQuery.trim().toLowerCase();
    const matchesQuery = !query || person.name.toLowerCase().includes(query)
      || person.vibes.some((vibe) => vibe.toLowerCase().includes(query))
      || person.gear.toLowerCase().includes(query);
    const matchesBudget = budgetFilter === 'all'
      || (budgetFilter === 'under500' && person.startingPrice < 500000)
      || (budgetFilter === '500to1000' && person.startingPrice >= 500000 && person.startingPrice <= 1000000)
      || (budgetFilter === 'above1000' && person.startingPrice > 1000000);
    return matchesQuery && matchesBudget;
  }), [photographerQuery, budgetFilter]);

  const outfitShops = useMemo(() => RENTAL_SHOPS.filter((shop) => shop.type === 'OUTFIT'), []);
  const popularOutfits = MOCK_POST_OUTFITS.slice(0, 3);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addOutfitToPlan = (id: string, name: string, priceText: string, imageUrl: string) => {
    shootPlan?.addItem({ id, name, category: 'outfit', priceText, imageUrl, type: 'purchase' });
  };

  return (
    <section className="fixed inset-x-0 top-0 bottom-20 z-40 flex flex-col overflow-hidden bg-[#F7F5F0] text-[#2C2621] lg:bottom-0 lg:left-[76px]" aria-label="Chuẩn bị cho buổi chụp">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E2DAD0] bg-[#FAF8F4] px-4 py-3 sm:px-8 lg:px-12">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">Chuẩn bị cho buổi chụp</h1>
          <p className="mt-0.5 hidden text-sm text-[#6E655B] sm:block">Trang phục, người chụp và film — chọn nhanh mọi thứ bạn cần.</p>
        </div>
        <button type="button" onClick={onClose} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[#E8DEC7] px-4 text-sm font-semibold text-[#2C2621] transition-colors hover:bg-[#DDD2B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C]" aria-label="Trở về Bản đồ">
          <X className="h-4 w-4" /> <span>Trở về Bản đồ</span>
        </button>
      </header>

      <nav className="shrink-0 border-b border-[#E2DAD0] bg-[#F7F5F0] px-3 py-3 sm:px-6" aria-label="Danh mục dịch vụ">
        <div className="mx-auto grid w-full max-w-2xl grid-cols-3 gap-1.5 rounded-2xl bg-[#E8DEC7] p-1.5 shadow-inner select-none">
          {SERVICE_TABS.map(({ id, label, mobileLabel, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <button key={id} type="button" onClick={() => setActiveTab(id)} aria-label={label} aria-current={selected ? 'page' : undefined}
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl px-1.5 text-center text-[10px] font-semibold transition-all duration-200 sm:px-3 sm:text-xs ${selected ? 'bg-[#FAF8F4] font-bold text-[#2C2621] shadow-sm' : 'text-[#6E655B] hover:bg-[#DDD3BD]/50 hover:text-[#2C2621]'}`}>
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.8} />
                <span className="whitespace-nowrap sm:hidden">{mobileLabel}</span>
                <span className="hidden whitespace-nowrap sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7 lg:px-12">
        {activeTab === 'outfit' && (
          <div className="mx-auto max-w-6xl">
            <section className={`${cardClass} mx-auto mb-8 max-w-2xl p-5 sm:p-6`} aria-labelledby="outfit-tool-title">
              <div className="mb-4">
                <h2 id="outfit-tool-title" className="text-lg font-bold">Tìm trang phục từ ảnh mẫu</h2>
                <p className="mt-1 text-sm text-[#6E655B]">Kéo thả ảnh mẫu để tìm đồ trên Shopee & TikTok Shop.</p>
              </div>
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8CFBD] bg-[#FAF8F4] p-6 text-center transition-colors hover:border-[#C76B3C]">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Ảnh mẫu đã chọn" className="max-h-40 rounded-xl object-contain" />
                ) : (
                  <><span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#EFE9DF] text-[#C76B3C]"><Upload className="h-5 w-5" /></span><span className="text-sm font-semibold">Chọn ảnh hoặc kéo thả vào đây</span><span className="mt-1 text-xs text-[#6E655B]">JPG, PNG hoặc WebP</span></>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} aria-label="Tải ảnh trang phục mẫu" />
              </label>
              {uploadedImage && <button type="button" onClick={() => setUploadedImage(null)} className="mt-2 text-xs font-medium text-[#6E655B] hover:text-[#C76B3C]">Chọn ảnh khác</button>}
              <div className="mt-4">
                <label htmlFor="outfit-search-keyword" className="mb-2 block text-xs font-semibold text-[#6E655B]">Từ khóa tìm kiếm</label>
                <input id="outfit-search-keyword" value={outfitKeyword} onChange={(event) => setOutfitKeyword(event.target.value)} className="w-full rounded-xl border border-[#D8CFBD] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C76B3C]" />
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Áo dài trắng', 'Váy vintage hoa nhí', 'Cổ phục Nhật Bình', 'Túi cói vintage'].map((tag) => (
                    <button key={tag} type="button" onClick={() => setOutfitKeyword(tag)} className="rounded-full bg-[#EFE9DF] px-3 py-1.5 text-xs text-[#554D43] transition-colors hover:bg-[#E2DAD0]">{tag}</button>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <a href={buildShopeeSearchUrl(outfitKeyword)} target="_blank" rel="noopener noreferrer" className={primaryButtonClass}><ShoppingBag className="h-4 w-4" />Tìm Shopee</a>
                <a href={buildTikTokShopSearchUrl(outfitKeyword)} target="_blank" rel="noopener noreferrer" className={primaryButtonClass}><ExternalLink className="h-4 w-4" />Xem TikTok Shop</a>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <section aria-labelledby="rental-shops-title">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C76B3C]">Hà Nội · {outfitShops.length} địa chỉ</p><h2 id="rental-shops-title" className="mt-1 text-lg font-bold">Tiệm thuê trang phục uy tín</h2></div>
                </div>
                <div className="space-y-3">
                  {outfitShops.map((shop) => (
                    <article key={shop.id} className={`${cardClass} p-4`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><h3 className="font-bold">{shop.name}</h3><p className="mt-1 flex items-start gap-1.5 text-sm text-[#6E655B]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C76B3C]" />{shop.address}</p></div>
                        <span className="shrink-0 rounded-full bg-[#EFE9DF] px-2.5 py-1 text-xs font-semibold text-[#8A4A2C]">{shop.priceRange}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2DAD0] pt-3">
                        {shop.phone && <a href={`tel:${shop.phone}`} className="inline-flex items-center gap-1.5 text-xs text-[#6E655B] hover:text-[#C76B3C]"><Phone className="h-3.5 w-3.5" />{shop.phone}</a>}
                        <div className="ml-auto flex items-center gap-2">
                          {shop.link && <a href={shop.link} target="_blank" rel="noopener noreferrer" className="rounded-lg px-2.5 py-2 text-xs font-semibold text-[#6E655B] hover:bg-[#EFE9DF]">Fanpage</a>}
                          <button type="button" onClick={() => shootPlan?.addItem({ id: shop.id, name: `Thuê tại ${shop.name}`, category: 'outfit', priceText: shop.priceRange ?? 'Giá liên hệ', shopName: shop.name, link: shop.link, type: 'rent' })} className={secondaryButtonClass}><Plus className="h-3.5 w-3.5" />Lưu kế hoạch</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section aria-labelledby="popular-outfits-title">
                <div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C76B3C]">Gợi ý phối đồ</p><h2 id="popular-outfits-title" className="mt-1 text-lg font-bold">Trang phục check-in phổ biến</h2></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {popularOutfits.map((outfit) => (
                    <article key={outfit.id} className={`${cardClass} overflow-hidden`}>
                      <img src={outfit.imageUrl} alt={outfit.itemName} className="aspect-[3/4] w-full bg-[#EFE9DF] object-cover" loading="lazy" />
                      <div className="p-3.5">
                        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug">{outfit.itemName}</h3>
                        <p className="mt-1 text-xs font-semibold text-[#8A4A2C]">{outfit.priceEstimate}</p>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <a href={outfit.shopeeUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}><ExternalLink className="h-3.5 w-3.5" />Xem trên Shopee</a>
                          <button type="button" onClick={() => addOutfitToPlan(outfit.id, outfit.itemName, outfit.priceEstimate ?? 'Giá tham khảo', outfit.imageUrl)} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-[#6E655B] transition-colors hover:bg-[#EFE9DF] hover:text-[#2C2621]"><Plus className="h-3.5 w-3.5" />Thêm vào kế hoạch</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'photographers' && (
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <label className="relative min-w-[240px] flex-1 xl:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8377]" />
                <input value={photographerQuery} onChange={(event) => setPhotographerQuery(event.target.value)} placeholder="Tìm nhiếp ảnh gia hoặc phong cách" className="w-full rounded-full border border-[#D8CFBD] bg-[#FAF8F4] py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#C76B3C]" />
              </label>
              <div className="flex flex-wrap items-center gap-2" aria-label="Lọc theo ngân sách">
                {([
                  ['all', 'Tất cả'], ['under500', '< 500k'], ['500to1000', '500k – 1tr'], ['above1000', '> 1tr']
                ] as const).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setBudgetFilter(value)} aria-pressed={budgetFilter === value} className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${budgetFilter === value ? 'border-[#C76B3C] bg-[#C76B3C] text-white' : 'border-[#D8CFBD] bg-[#FAF8F4] text-[#6E655B] hover:border-[#C76B3C] hover:text-[#2C2621]'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="mb-4 flex items-center justify-between text-xs text-[#6E655B]"><span>Nhiếp ảnh gia phù hợp</span><span>{photographers.length} người</span></div>
            {photographers.length === 0 ? <p className={`${cardClass} p-8 text-center text-sm text-[#6E655B]`}>Không tìm thấy nhiếp ảnh gia phù hợp.</p> : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {photographers.map((person) => {
                  const heroPhoto = person.featuredPhotos[0] || person.albums[0]?.coverUrl;
                  return (
                    <article key={person.id} className={`${cardClass} overflow-hidden`}>
                      <div className="relative aspect-[3/2] bg-[#E8DEC7]">
                        {heroPhoto && <img src={heroPhoto} alt={`Portfolio ${person.name}`} className="h-full w-full object-cover" loading="lazy" />}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1E1915]/90 via-[#1E1915]/45 to-transparent px-4 pb-4 pt-14 text-white">
                          <div className="flex items-end gap-3">
                            <img src={person.avatarUrl} alt="" className="h-12 w-12 rounded-full border-2 border-[#FAF8F4] object-cover" loading="lazy" />
                            <div className="min-w-0 flex-1">
                              <h2 className="truncate text-base font-bold">{person.name}</h2>
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/90"><Star className="h-3.5 w-3.5 fill-[#D49A55] text-[#D49A55]" />{person.rating.toFixed(1)} <span className="text-white/70">· {person.reviewCount} đánh giá</span></p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#FAF8F4]/95 px-2.5 py-1 text-xs font-bold text-[#2C2621]">{person.startingPriceFormatted}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-4 flex flex-wrap gap-1.5">{person.vibes.map((vibe) => <span key={vibe} className="rounded-full bg-[#EFE9DF] px-2.5 py-1 text-[11px] font-medium text-[#554D43]">#{vibe}</span>)}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <a href={person.contact.facebook || person.contact.zaloUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass} onClick={() => onSelectPhotographer?.(person)}><ExternalLink className="h-4 w-4" />Xem Portfolio</a>
                          <a href={person.contact.zaloUrl} target="_blank" rel="noopener noreferrer" className={primaryButtonClass}><MessageCircle className="h-4 w-4" />Nhắn Zalo</a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'film' && (
          <div className="mx-auto max-w-6xl">
            <div className={`${cardClass} mb-5 flex flex-wrap items-center justify-between gap-3 p-4`}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFE9DF] text-[#C76B3C]"><MapPin className="h-5 w-5" /></span>
                <div><h2 className="text-sm font-bold">{isFallback ? 'Đang hiển thị tiệm quanh khu vực Hồ Gươm' : 'Đang hiển thị tiệm gần vị trí của bạn'}</h2><p className="mt-1 text-xs text-[#6E655B]">Lab film trong khu vực Hà Nội, sắp xếp theo khoảng cách.</p></div>
              </div>
              <button type="button" onClick={refreshLocation} disabled={isLocating} className={secondaryButtonClass}><RefreshCw className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />{isLocating ? 'Đang lấy vị trí' : 'Lấy lại vị trí'}</button>
            </div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <label className="relative min-w-[220px] flex-1 sm:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8377]" /><input value={filmQuery} onChange={(event) => setFilmQuery(event.target.value)} placeholder="Tìm film đang có sẵn ở lab" className="w-full rounded-full border border-[#D8CFBD] bg-[#FAF8F4] py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#C76B3C]" /></label>
              <span className="text-xs text-[#6E655B]">{labs.length} lab film</span>
            </div>
            {labs.length === 0 ? <p className={`${cardClass} p-8 text-center text-sm text-[#6E655B]`}>Chưa tìm thấy lab có cuộn film này.</p> : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {labs.map((lab) => (
                  <article key={lab.id} className={`${cardClass} flex flex-col p-5`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><h2 className="text-base font-bold">{lab.name}</h2><p className="mt-1 flex gap-1.5 text-sm text-[#6E655B]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C76B3C]" />{lab.address}</p></div>
                      <span className="shrink-0 font-mono text-sm font-bold text-[#C76B3C]">Cách {lab.distanceDisplay}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E655B]">
                      <span>{lab.openingHours}</span>
                      {lab.hasFastService && <span className="rounded-full border border-[#D8CFBD] bg-[#EFE9DF] px-2.5 py-1 font-semibold text-[#554D43]">Tráng lấy ngay 2h</span>}
                    </div>
                    <div className="mt-4"><p className="mb-2 text-xs font-semibold text-[#6E655B]">Film đang có</p><div className="flex flex-wrap gap-1.5">{lab.availableFilms.map((stock) => <span key={stock} className="rounded-full bg-[#ECE4D0] px-2.5 py-1 text-[11px] text-[#2C2621]">{stock}</span>)}</div></div>
                    <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[#E2DAD0] pt-4">
                      <button type="button" onClick={() => onFlyToLab ? onFlyToLab(lab) : window.open(lab.googleMapsUrl, '_blank', 'noopener,noreferrer')} className={secondaryButtonClass}><MapPin className="h-3.5 w-3.5" />Xem Map</button>
                      <a href={lab.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}><Compass className="h-3.5 w-3.5" />Chỉ đường</a>
                      <a href={lab.zaloUrl || lab.fanpageUrl || `tel:${lab.phone}`} target="_blank" rel="noopener noreferrer" className={primaryButtonClass}><MessageCircle className="h-3.5 w-3.5" />Nhắn tiệm</a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
