import { useState } from 'react';
import { Flame, MapPin, Sparkles, ExternalLink } from 'lucide-react';
import type { TrendArticle, TrendArticleSection } from '../../services/trendArticleApi';
import type { Spot } from '../../types';
import { getEffectiveSeasonalStatus } from '../../utils/season';

interface Props {
  articles: TrendArticle[];
  spots?: Spot[];
  regionId: string;
  searchQuery?: string;
  loading?: boolean;
  activeSection?: TrendArticleSection;
  onSectionChange?: (section: TrendArticleSection) => void;
  tabsOnly?: boolean;
  showTabs?: boolean;
  onOpenSpot?: (spot: Spot) => void;
}

const TABS: { id: TrendArticleSection; label: string; icon: typeof Flame }[] = [
  { id: 'hotTrend', label: 'Hot trend', icon: Flame },
  { id: 'upcomingSpot', label: 'Các điểm có thể hot sắp tới', icon: Sparkles },
];
const card = 'rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] text-[#2C2621]';

export const TrendArticleFeed = ({ articles, spots = [], regionId, searchQuery = '', loading = false, activeSection, onSectionChange, tabsOnly = false, showTabs = true, onOpenSpot }: Props) => {
  const [localSection, setLocalSection] = useState<TrendArticleSection>('hotTrend');
  const currentSection = activeSection ?? localSection;
  const changeSection = onSectionChange ?? setLocalSection;
  const query = searchQuery.trim().toLowerCase();
  const visible = articles.filter((article) => article.isPublished && (regionId === 'all' || article.regionId === 'all' || article.regionId === regionId)
    && (!query || `${article.title} ${article.content} ${article.location}`.toLowerCase().includes(query)));
  const hotSpots = spots.filter((spot) => getEffectiveSeasonalStatus(spot.seasonalTrend) === 'PEAK'
    && (regionId === 'all' || spot.regionId === regionId)
    && (!query || `${spot.name} ${spot.address} ${spot.description} ${spot.seasonalTrend.trendTitle}`.toLowerCase().includes(query)));
  const selected = visible.filter((article) => article.section === currentSection);
  const selectedHotSpots = currentSection === 'hotTrend' ? hotSpots : [];
  const counts: Record<TrendArticleSection, number> = {
    hotTrend: visible.filter((article) => article.section === 'hotTrend').length + hotSpots.length,
    upcomingSpot: visible.filter((article) => article.section === 'upcomingSpot').length,
  };

  const tabs = <div role="tablist" aria-label="Bài viết xu hướng" className="grid grid-cols-2 gap-1 rounded-xl border border-[#D0C5AC] bg-[#E0D6BF] p-1">
      {TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={currentSection === id} onClick={(event) => { event.stopPropagation(); changeSection(id); }} className={`flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-[11px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C76B3C] sm:text-xs ${currentSection === id ? 'bg-[#FAF8F4] font-bold text-[#2C2621] shadow-sm' : 'text-[#554D43] hover:bg-[#ECE4D0]'}`}>
        <Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${currentSection === id ? 'text-[#C76B3C]' : 'text-[#6E655B]'}`} />
        <span className="line-clamp-2">{label} ({counts[id]})</span>
      </button>)}
    </div>;
  if (tabsOnly) return tabs;

  return <div className="space-y-3">
    {showTabs && tabs}
    <div role="tabpanel" aria-label={TABS.find((tab) => tab.id === currentSection)?.label} className="space-y-3">
      {loading && selected.length === 0 && selectedHotSpots.length === 0 ? <p role="status" className={`${card} p-5 text-center text-sm text-[#6E655B]`}>Đang tải bài viết…</p>
        : selected.length === 0 && selectedHotSpots.length === 0 ? <div className={`${card} p-7 text-center text-sm text-[#6E655B]`}>
          <Sparkles aria-hidden="true" className="mx-auto mb-2 h-7 w-7 text-[#B9AD98]" />
          <p>{currentSection === 'hotTrend' ? 'Chưa có địa điểm đang rộ' : 'Chưa có bài viết trong mục này'}</p>
        </div>
          : <>
            {selectedHotSpots.map((spot) => <article key={`spot-${spot.id}`} className={`${card} overflow-hidden shadow-sm`}>
              {spot.coverImageUrl && <img src={spot.coverImageUrl} alt={spot.name} className="aspect-[16/9] w-full object-cover" loading="lazy" />}
              <div className="space-y-2 p-4">
                <p className="inline-flex rounded-full bg-[#C76B3C] px-2.5 py-1 text-[10px] font-bold text-white">Đang rộ</p>
                <h3 className="text-sm font-bold leading-snug">{spot.name}</h3>
                {spot.seasonalTrend.trendTitle && <p className="text-xs leading-relaxed text-[#6E655B]">{spot.seasonalTrend.trendTitle}</p>}
                <p className="flex items-center gap-1 text-[11px] text-[#6E655B]"><MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{spot.address}</p>
                <button type="button" onClick={() => onOpenSpot?.(spot)} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-[#A7502F] hover:underline">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />Xem địa điểm
                </button>
              </div>
            </article>)}
            {selected.map((article) => <article key={article.id} className={`${card} overflow-hidden shadow-sm`}>
            {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />}
            <div className="space-y-2 p-4">
              {article.location && <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#8A4A2C]"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />{article.location}</p>}
              <h3 className="text-sm font-bold leading-snug">{article.title}</h3>
              {article.content && <p className="whitespace-pre-line text-xs leading-relaxed text-[#6E655B] line-clamp-5">{article.content}</p>}
              {article.sourceUrl && /^https?:\/\//i.test(article.sourceUrl) && <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-[#A7502F] hover:underline"><ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />Nguồn bài viết</a>}
            </div>
          </article>)}
          </>}
    </div>
  </div>;
};
