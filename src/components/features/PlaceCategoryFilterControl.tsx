import type { PlaceCategory, PlaceCategoryFilter } from '../../types';
import { DEFAULT_PLACE_CATEGORIES } from '../../utils/placeCategories';

interface Props {
  value: PlaceCategoryFilter;
  onChange: (category: PlaceCategoryFilter) => void;
  categories?: PlaceCategory[];
  className?: string;
}

export const PlaceCategoryFilterControl = ({ value, onChange, categories = DEFAULT_PLACE_CATEGORIES, className = '' }: Props) => (
  <label className={`flex min-w-0 items-center gap-2 text-xs font-semibold text-[#554D43] ${className}`}>
    <span className="shrink-0">Loại địa điểm</span>
    <select aria-label="Nhóm địa điểm" value={value} onChange={event => onChange(event.target.value as PlaceCategoryFilter)} className="min-h-10 min-w-0 flex-1 rounded-lg border border-[#D8CFBD] bg-[#FAF8F4] px-2 text-xs text-[#2C2621]">
      <option value="ALL">Tất cả</option>
      {categories.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
  </label>
);
