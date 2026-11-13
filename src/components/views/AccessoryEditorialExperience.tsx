import { ArrowLeft, BookOpen, Camera, Check, ChevronRight, Copy, ExternalLink, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShootPlan } from '../../context/ShootPlanContext';
import type { PlaceCategoryFilter } from '../../types';

export interface AccessorySuggestion {
  title: string;
  description: string;
  productImageUrl?: string;
  shopeeUrl?: string;
  priceText?: string;
}

interface EditorialPhoto {
  url: string;
  alt: string;
  credit?: string;
  sourceUrl?: string;
}

interface Props {
  category: PlaceCategoryFilter;
  categoryLabel: string;
  suggestions: AccessorySuggestion[];
  photos?: EditorialPhoto[];
  autoOpenSharedPost?: boolean;
}

const photoSlots = [
  { label: 'Ảnh mở đầu', note: 'Ảnh bộ chụp sẽ được bổ sung sau khi xác nhận quyền sử dụng.' },
  { label: 'Chi tiết phụ kiện', note: 'Cần ghép ảnh thực tế thể hiện cách dùng món đồ.' },
  { label: 'Ảnh toàn bộ trang phục', note: 'Ảnh thực tế, credit và nguồn sẽ hiển thị ở đây.' },
  { label: 'Khoảnh khắc cuối buổi', note: 'Ảnh trong cùng bộ chụp.' },
];

function MediaPlaceholder({ label, note, aspect = 'aspect-[4/3]' }: { label: string; note: string; aspect?: string }) {
  return (
    <div role="img" aria-label={`${label}. ${note}`} className={`flex ${aspect} min-h-24 items-end rounded-2xl border border-dashed border-[#CFC4B2] bg-[#F3EAD7] p-3`}>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#554D43]">{label}</p>
        <p className="text-xs leading-relaxed text-[#6E655B]">{note}</p>
      </div>
    </div>
  );
}

function EditorialPhotoFrame({ photo, label, note, aspect }: { photo?: EditorialPhoto; label: string; note: string; aspect: string }) {
  if (!photo?.url) return <MediaPlaceholder label={label} note={note} aspect={aspect} />;
  return <figure className={`overflow-hidden rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] ${aspect}`}>
    <img src={photo.url} alt={photo.alt} loading="lazy" className="h-full w-full object-cover" />
    {photo.credit && <figcaption className="px-3 py-2 text-xs text-[#6E655B]">{photo.credit}{photo.sourceUrl && <> · <a href={photo.sourceUrl} target="_blank" rel="noreferrer" className="underline">Nguồn</a></>}</figcaption>}
  </figure>;
}

function ProductImage({ item, className = 'aspect-[4/3]' }: { item: AccessorySuggestion; className?: string }) {
  if (!item.productImageUrl) return <MediaPlaceholder label="Ảnh sản phẩm chờ bổ sung" note="Không hiển thị ảnh bộ chụp như ảnh sản phẩm." aspect={className || 'aspect-[4/3]'} />;
  return <img src={item.productImageUrl} alt={`Ảnh sản phẩm: ${item.title}`} loading="lazy" className={`${className} w-full rounded-2xl border border-[#D8CFBD] object-cover`} />;
}

const SHOPEE_LINK_REL = 'noopener nofollow sponsored';

/** Unpublished illustrated-article card. Set to true to show it again. */
export const SHOW_ILLUSTRATED_ARTICLE = false;

function validShopeeUrl(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['shopee.vn', 'www.shopee.vn', 'shopee.com', 'www.shopee.com'].includes(url.hostname);
  } catch {
    return false;
  }
}

export function AccessoryEditorialExperience({ category, categoryLabel, suggestions, photos = [], autoOpenSharedPost = false }: Props) {
  const [isOpen, setIsOpen] = useState(() => autoOpenSharedPost && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('accessory-story') === 'demo');
  const [selectedAccessory, setSelectedAccessory] = useState<AccessorySuggestion | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { addItem, isItemInPlan } = useShootPlan();
  const sceneName = category === 'ALL' ? 'chụp ảnh' : category === 'CAFE' ? 'cà phê' : categoryLabel.toLocaleLowerCase('vi');
  const articleTitle = `Một buổi ${sceneName} — phối phụ kiện từ những món sẵn có`;

  useEffect(() => {
    if (!isOpen || !autoOpenSharedPost) return;
    const url = new URL(window.location.href);
    url.searchParams.set('accessory-story', 'demo');
    window.history.replaceState(window.history.state, '', url);
  }, [autoOpenSharedPost, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    return () => {
      if (!dialog.open) return;
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    };
  }, [isOpen]);

  const closeArticle = () => {
    setIsOpen(false);
    setSelectedAccessory(null);
    setLinkCopied(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('accessory-story');
    window.history.replaceState(window.history.state, '', url);
  };

  const openArticle = (item?: AccessorySuggestion) => {
    setSelectedAccessory(item ?? null);
    setIsOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set('accessory-story', 'demo');
    window.history.replaceState(window.history.state, '', url);
  };

  const copyArticleLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('accessory-story', 'demo');
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
    } catch {
      setLinkCopied(false);
    }
  };

  const getItemId = (item: AccessorySuggestion) => `accessory-demo-${category}-${encodeURIComponent(item.title.toLocaleLowerCase('vi'))}`;
  const saveToPlan = (item: AccessorySuggestion) => {
    const id = getItemId(item);
    addItem({
      id,
      name: item.title,
      category: 'accessory',
      categoryLabel: 'Phụ kiện',
      priceText: item.priceText || '',
      imageUrl: item.productImageUrl,
      sourceUrl: validShopeeUrl(item.shopeeUrl) ? item.shopeeUrl : undefined,
    });
    setSavedIds(current => current.includes(id) ? current : [...current, id]);
  };

  return (
    <>
      <section aria-label="Gợi ý phụ kiện" className="winter-panel space-y-4 overflow-hidden rounded-3xl border border-[#D8CFBD] bg-[#FAF8F4] p-4">
        <header className="space-y-1.5">
          <p className="font-mono-spec text-[10px] font-bold uppercase tracking-[0.12em] text-[#C76B3C]">Phụ kiện / {categoryLabel}</p>
          <h3 className="font-editorial text-[22px] font-bold leading-tight text-[#2C2621]">Phụ kiện bạn có thể thích</h3>
          <p className="text-sm leading-relaxed text-[#6E655B]">Một bộ ảnh minh họa cách phối; ưu tiên những món bạn đã có.</p>
        </header>

        {SHOW_ILLUSTRATED_ARTICLE ? (
          <button type="button" onClick={() => openArticle()} className="group block w-full overflow-hidden rounded-2xl border border-[#E2D8C6] bg-white text-left transition-colors hover:border-[#C76B3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C76B3C]">
            <div className="grid grid-cols-2 gap-1.5 bg-[#E8DEC7] p-1.5">
            <EditorialPhotoFrame photo={photos[0]} label="Bộ ảnh · 01" note="Ảnh chờ bổ sung" aspect="aspect-[1.2/1]" />
            <EditorialPhotoFrame photo={photos[1]} label="Bộ ảnh · 02" note="Ảnh chờ bổ sung" aspect="aspect-[1.2/1]" />
            </div>
            <div className="space-y-2 p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EAD7] px-2.5 py-1 text-xs font-semibold text-[#8F3F23]"><BookOpen aria-hidden="true" className="h-3.5 w-3.5" />Bài viết minh họa · chưa xuất bản</span>
              <h4 className="text-base font-bold leading-snug text-[#2C2621]">{articleTitle}</h4>
              <p className="text-sm leading-relaxed text-[#6E655B]">Xem bộ ảnh, ghi chú phối đồ và danh sách món được dùng trong bài.</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#8F3F23]">Xem bộ ảnh & cách phối <ChevronRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
            </div>
          </button>
        ) : null}

        <div className="space-y-2" aria-label="Phụ kiện trong bài viết">
          {suggestions.map(item => (
            <article key={item.title} className="overflow-hidden rounded-xl border border-[#E2D8C6] bg-white/70">
              <button type="button" onClick={() => openArticle(item)} className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C76B3C]">
                {item.productImageUrl ? <img src={item.productImageUrl} alt={`Ảnh sản phẩm: ${item.title}`} className="h-14 w-14 shrink-0 rounded-xl object-cover" /> : <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#F3EAD7] text-[10px] font-semibold text-[#6E655B]">Ảnh món</span>}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#2C2621]">{item.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[#6E655B]">{item.description}</span>
                </span>
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#8F3F23]" />
              </button>
              {validShopeeUrl(item.shopeeUrl) ? (
                <div className="border-t border-[#ECE4D0] px-3 py-2">
                  <a href={item.shopeeUrl} target="_blank" rel={SHOPEE_LINK_REL} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#D8CFBD] bg-[#FAF8F4] px-3 text-xs font-semibold text-[#8F3F23] transition-colors hover:border-[#C76B3C] hover:bg-white">
                    Xem trên Shopee <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {isOpen && createPortal(
        <dialog
          ref={dialogRef}
          aria-label={selectedAccessory ? `Chi tiết phụ kiện ${selectedAccessory.title}` : articleTitle}
          className="m-0 h-[100dvh] max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 text-[#2C2621] backdrop:bg-[#211D18]/45 sm:m-auto sm:h-[min(92dvh,960px)] sm:max-w-5xl sm:rounded-3xl"
          onCancel={event => { event.preventDefault(); closeArticle(); }}
          onClick={event => { if (event.target === dialogRef.current) closeArticle(); }}
        >
          <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-none bg-[#F7F5F0] sm:rounded-3xl">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#D8CFBD] bg-[#FAF8F4] px-4 py-3 sm:px-6">
              {selectedAccessory ? (
                <button type="button" onClick={() => setSelectedAccessory(null)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-[#ECE4D0]"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Quay lại bài viết</button>
              ) : (
                <div className="min-w-0"><p className="font-mono-spec text-[10px] font-bold uppercase tracking-wider text-[#C76B3C]">Bài viết minh họa · chưa xuất bản</p><h2 className="truncate text-lg font-bold">{categoryLabel}</h2></div>
              )}
              <div className="flex shrink-0 items-center gap-1">
                {!selectedAccessory && <button type="button" onClick={() => void copyArticleLink()} aria-label={linkCopied ? 'Đã sao chép link bài' : 'Sao chép link bài'} className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#554D43] hover:bg-[#ECE4D0]"><Copy aria-hidden="true" className="h-4 w-4" /><span className="hidden sm:inline">{linkCopied ? 'Đã sao chép' : 'Chia sẻ bài'}</span></button>}
                <button type="button" onClick={closeArticle} aria-label="Đóng bài viết" className="grid h-11 w-11 place-items-center rounded-xl text-[#554D43] hover:bg-[#ECE4D0]"><X aria-hidden="true" className="h-5 w-5" /></button>
              </div>
            </header>

            {selectedAccessory ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8">
                <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] md:items-start">
                  <ProductImage item={selectedAccessory} className="aspect-square" />
                  <section className="space-y-4">
                    <div><p className="font-mono-spec text-xs font-bold uppercase tracking-wide text-[#C76B3C]">Phụ kiện gợi ý · {categoryLabel}</p><h1 className="mt-2 text-2xl font-bold">{selectedAccessory.title}</h1><p className="mt-3 text-base leading-relaxed text-[#554D43]">{selectedAccessory.description}</p></div>
                    <p className="rounded-2xl bg-[#F3EAD7] p-4 text-sm leading-relaxed text-[#554D43]">Gợi ý phối trong bài minh họa. Chỉ hiển thị liên kết Shopee khi URL đã được xác minh.</p>
                    <p className="text-sm text-[#6E655B]">Giá: {selectedAccessory.priceText || 'chưa có thông tin; chưa tính vào dự toán.'}</p>
                    {validShopeeUrl(selectedAccessory.shopeeUrl)
                      ? <a href={selectedAccessory.shopeeUrl} target="_blank" rel={SHOPEE_LINK_REL} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 text-sm font-semibold text-white hover:bg-[#A9552E]">Xem trên Shopee <ExternalLink aria-hidden="true" className="h-4 w-4" /></a>
                      : <button type="button" disabled className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#D8CFBD] bg-[#ECE4D0] px-4 text-sm font-semibold text-[#6E655B] disabled:cursor-not-allowed">Link Shopee sẽ bổ sung sau <ExternalLink aria-hidden="true" className="h-4 w-4" /></button>}
                    <button type="button" onClick={() => saveToPlan(selectedAccessory)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C76B3C] px-4 text-sm font-semibold text-white hover:bg-[#A9552E]">
                      {savedIds.includes(getItemId(selectedAccessory)) || isItemInPlan(getItemId(selectedAccessory)) ? <><Check aria-hidden="true" className="h-4 w-4" />Đã lưu vào kế hoạch</> : <>+ Lưu vào kế hoạch</>}
                    </button>
                  </section>
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-8">
                  <section className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#F3EAD7] px-3 py-1.5 text-xs font-semibold text-[#8F3F23]">Bài viết minh họa · nội dung mẫu</span>
                    <h1 className="text-2xl font-bold leading-tight sm:text-4xl">{articleTitle}</h1>
                    <p className="text-base leading-relaxed text-[#554D43]">Bắt đầu từ trang phục bạn đang có, rồi chọn một món nhỏ làm điểm nhấn. Trong bộ ảnh thật, mỗi sản phẩm sẽ được ghép với khung hình tương ứng và ghi rõ nguồn ảnh.</p>
                    <p className="text-xs text-[#6E655B]">Ảnh, tác giả, quyền sử dụng và link sản phẩm: chờ cung cấp · Không phải bài đã xuất bản</p>
                  </section>

                  <section aria-label="Bộ ảnh minh họa" className="space-y-3">
                    <h2 className="text-xl font-bold">Bộ ảnh</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {photoSlots.map((slot, index) => <div key={slot.label} id={`accessory-photo-${index + 1}`}><EditorialPhotoFrame photo={photos[index]} label={`${String(index + 1).padStart(2, '0')} · ${slot.label}`} note={slot.note} aspect="aspect-[4/3]" /></div>)}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div><h2 className="text-xl font-bold">Phụ kiện trong bài</h2><p className="mt-1 text-sm text-[#6E655B]">Ảnh sản phẩm và ảnh đang sử dụng được giữ riêng, chỉ ghép khi đã xác minh đúng món.</p></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {suggestions.map((item, index) => (
                        <article key={item.title} className="overflow-hidden rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4]">
                          <button type="button" onClick={() => setSelectedAccessory(item)} className="block w-full p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C76B3C]">
                            <ProductImage item={item} />
                            <div className="space-y-1.5 p-1 pt-3"><h3 className="font-bold">{item.title}</h3><p className="text-sm leading-relaxed text-[#6E655B]">{item.description}</p><span className="inline-flex items-center gap-1 text-sm font-semibold text-[#8F3F23]">Xem thông tin món <ChevronRight aria-hidden="true" className="h-4 w-4" /></span></div>
                          </button>
                          {validShopeeUrl(item.shopeeUrl) ? (
                            <div className="px-3 pb-3">
                              <a href={item.shopeeUrl} target="_blank" rel={SHOPEE_LINK_REL} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#D8CFBD] bg-white px-3 text-xs font-semibold text-[#8F3F23] hover:border-[#C76B3C]">
                                Xem trên Shopee <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          ) : null}
                          <div className="flex flex-wrap gap-2 border-t border-[#E2D8C6] p-3">
                            <button type="button" onClick={() => { document.getElementById(`accessory-photo-${index + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-[#ECE4D0] px-3 text-xs font-semibold text-[#554D43]">Ảnh dùng trong bài <Camera aria-hidden="true" className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => saveToPlan(item)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-[#C76B3C] px-3 text-xs font-semibold text-white">Lưu kế hoạch</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                  <p className="border-t border-[#D8CFBD] pt-4 text-xs leading-relaxed text-[#6E655B]">Liên kết tiếp thị sẽ được công bố nếu bài viết có affiliate. {suggestions.some(item => validShopeeUrl(item.shopeeUrl)) ? 'Một số liên kết sản phẩm đã được xác minh.' : 'Chưa có liên kết mua hàng trong bản demo này.'}</p>
                </div>
              </div>
            )}
          </article>
        </dialog>,
        document.body,
      )}
    </>
  );
}
