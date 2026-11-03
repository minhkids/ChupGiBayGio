import { Film, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import '../../styles/editorial-motion.css';
import { AccessoryEditorialExperience } from './AccessoryEditorialExperience';
import type { PlaceCategory, PlaceCategoryFilter } from '../../types';
import { PlaceCategoryLabel } from '../features/PlaceCategoryLabel';

interface Props {
  categories: PlaceCategory[];
  selectedCategory: PlaceCategoryFilter;
  autoOpenSharedPost?: boolean;
  onSelectCategory: (category: PlaceCategoryFilter) => void;
  showFilmLabs?: boolean;
  onToggleFilmLabs?: () => void;
}

interface Accessory {
  title: string;
  description: string;
}

type AccessorySet = [Accessory, Accessory, Accessory];

const fallbackAccessories: AccessorySet[] = [
  [
    { title: 'Túi đeo chéo gọn', description: 'Đựng đồ thiết yếu, để hai tay thoải mái khi đi dạo.' },
    { title: 'Khăn cotton trơn', description: 'Chọn màu trung tính để dễ phối với trang phục sẵn có.' },
    { title: 'Mũ vải mềm', description: 'Dễ gấp cất trong túi, tiện mang theo khi ra ngoài.' },
  ],
  [
    { title: 'Kẹp tóc nhỏ', description: 'Giữ tóc gọn mà không cần mang thêm nhiều đồ.' },
    { title: 'Đồng hồ dây vải', description: 'Nhẹ tay, hợp với trang phục thường ngày.' },
    { title: 'Túi tote có khóa', description: 'Gom đồ cá nhân gọn gàng cho một buổi đi chơi.' },
  ],
];

const accessories: Partial<Record<PlaceCategoryFilter, AccessorySet[]>> = {
  CAFE: [
    [
      { title: 'Túi vải nhỏ', description: 'Màu kem hoặc nâu nhạt, vừa đủ đựng sách và đồ cá nhân.' },
      { title: 'Khăn lụa mảnh', description: 'Buộc tóc hoặc quai túi để thêm một chút màu ấm.' },
      { title: 'Đồng hồ dây da', description: 'Mặt nhỏ, dây nâu dễ phối với áo sơ mi hoặc cardigan.' },
    ],
    [
      { title: 'Kẹp tóc tối giản', description: 'Giữ tóc gọn, chọn tông nâu hoặc màu ngà dịu.' },
      { title: 'Túi đeo vai mềm', description: 'Dáng gọn để đặt cạnh ghế mà không chiếm nhiều chỗ.' },
      { title: 'Vòng tay mảnh', description: 'Một chiếc đơn giản là đủ cho trang phục đi cà phê.' },
    ],
  ],
  VINTAGE: [
    [
      { title: 'Khăn họa tiết nhỏ', description: 'Tông nâu, đỏ gạch hoặc olive hợp với đồ cổ điển.' },
      { title: 'Túi da dáng hộp', description: 'Ưu tiên chiếc túi sẵn có với phom gọn và màu trầm.' },
      { title: 'Đồng hồ mặt tròn', description: 'Dây da mảnh tạo điểm nhấn nhẹ cho tay áo.' },
    ],
    [
      { title: 'Mũ beret mềm', description: 'Chọn màu trơn để dễ phối với áo khoác hoặc váy dài.' },
      { title: 'Thắt lưng da mảnh', description: 'Giúp trang phục gọn hơn, hợp quần cạp cao.' },
      { title: 'Cài áo nhỏ', description: 'Thử một chiếc cài cũ trên ve áo, không cần thêm nhiều trang sức.' },
    ],
  ],
  SUNSET: [
    [
      { title: 'Khăn choàng mỏng', description: 'Tông kem hoặc cam đất, tiện khoác khi trời về chiều.' },
      { title: 'Túi cói nhỏ', description: 'Chất liệu tự nhiên hợp với trang phục nhẹ và màu ấm.' },
      { title: 'Vòng cổ mảnh', description: 'Chọn một sợi ngắn, ít chi tiết để dễ phối áo cổ rộng.' },
    ],
    [
      { title: 'Kẹp tóc màu hổ phách', description: 'Giữ tóc gọn và thêm sắc ấm cho trang phục.' },
      { title: 'Túi đeo chéo màu cát', description: 'Nhẹ và gọn cho buổi đi dạo cuối ngày.' },
      { title: 'Khăn buộc tóc', description: 'Chọn vải mềm, buộc chắc khi có gió.' },
    ],
  ],
  RED_RIVER: [
    [
      { title: 'Mũ rộng vành có dây', description: 'Che nắng và giữ mũ chắc hơn khi có gió ven sông.' },
      { title: 'Túi đeo chéo có khóa', description: 'Giữ đồ cá nhân gọn khi đi trên lối đất hoặc bãi cỏ.' },
      { title: 'Khăn cotton nhẹ', description: 'Dễ thấm mồ hôi, chọn màu đất hoặc kem dễ phối.' },
    ],
    [
      { title: 'Mũ bucket gấp gọn', description: 'Tiện cất túi, ưu tiên loại có dây giữ khi trời gió.' },
      { title: 'Dây buộc tóc vải', description: 'Buộc tóc gọn để thoải mái đi dạo ngoài trời.' },
      { title: 'Túi đựng bình nước', description: 'Dây đeo vừa người giúp mang nước mà vẫn rảnh tay.' },
    ],
  ],
};

export const MapStyleCategoryBrowser = ({ categories, selectedCategory, autoOpenSharedPost = false, onSelectCategory, showFilmLabs = true, onToggleFilmLabs }: Props) => {
  const [cursor, setCursor] = useState({ category: selectedCategory, index: 0 });
  // Reset the stored cursor too, so revisiting a style starts at its first set.
  if (cursor.category !== selectedCategory) {
    setCursor({ category: selectedCategory, index: 0 });
  }
  const selectedLabel = categories.find(category => category.id === selectedCategory)?.label ?? 'Tất cả style';
  const options = accessories[selectedCategory] ?? fallbackAccessories;
  const index = cursor.category === selectedCategory ? cursor.index : 0;
  const suggestions = options[index % options.length];

  const changeAccessories = () => setCursor({ category: selectedCategory, index: (index + 1) % options.length });

  return (
    <section aria-label="Khám phá style chụp" className="editorial-motion space-y-5 sm:space-y-4">
      <header className="space-y-1">
        <p className="font-mono-spec text-[10px] font-bold uppercase tracking-[0.14em] text-[#C76B3C]">Style finder / map</p>
        <h2 className="text-[22px] font-bold leading-tight text-[#2C2621]">Bạn định chụp style gì?</h2>
        <p className="text-sm leading-relaxed text-[#6E655B]">Chọn style để lọc các điểm chụp trên bản đồ.</p>
      </header>

      <div role="group" aria-label="Category địa điểm" className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={selectedCategory === 'ALL'} onClick={() => onSelectCategory('ALL')} className={`min-h-12 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${selectedCategory === 'ALL' ? 'border-[#2C2621] bg-[#2C2621] text-white' : 'border-[#D8CFBD] bg-[#FAF8F4] text-[#554D43] hover:bg-white'}`}>
          Tất cả style
        </button>
        {categories.map(category => {
          const selected = selectedCategory === category.id;
          const halloween = category.id === 'HALLOWEEN';
          const halloweenClasses = selected
            ? 'relative mt-3 border-[#12303D] bg-[#12303D] text-[#FFF7E8] shadow-sm'
            : 'relative mt-3 border-[#C76B3C]/60 bg-[#FFF7EB] text-[#12303D] hover:border-[#12303D]';
          return <button key={category.id} type="button" aria-pressed={selected} onClick={() => onSelectCategory(category.id)} className={`min-h-12 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${halloween ? halloweenClasses : selected ? 'border-[#2C2621] bg-[#2C2621] text-white' : 'border-[#D8CFBD] bg-[#FAF8F4] text-[#554D43] hover:bg-white'}`}>
            <PlaceCategoryLabel id={category.id} label={category.label} selected={selected} />
          </button>;
        })}
        <button type="button" aria-pressed={showFilmLabs} onClick={onToggleFilmLabs} className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${showFilmLabs ? 'border-[#C76B3C] bg-[#F3EAD7] text-[#8F3F23]' : 'border-[#D8CFBD] bg-[#FAF8F4] text-[#6E655B] hover:bg-white'}`}>
          <Film aria-hidden="true" className="h-4 w-4 shrink-0" />Lab film
        </button>
      </div>

      <AccessoryEditorialExperience category={selectedCategory} categoryLabel={selectedLabel} suggestions={suggestions} autoOpenSharedPost={autoOpenSharedPost} />
      <button type="button" onClick={changeAccessories} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#D8CFBD] bg-[#ECE4D0] px-3 py-3 text-sm font-semibold text-[#554D43] transition-colors hover:bg-[#E0D5BE]">
        <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />Đổi gợi ý phụ kiện
      </button>
      <footer className="border-t border-[#D8CFBD] pt-4 text-center">
        <a href="/chup-gi/" className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold text-[#8F3F23] underline decoration-[#C76B3C]/60 underline-offset-4 hover:text-[#6F2D18]">
          Chưa biết chụp gì hôm nay? Xem gợi ý chụp ảnh
        </a>
      </footer>
    </section>
  );
};