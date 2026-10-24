import { Camera, Film, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { PlaceCategory, PlaceCategoryFilter } from '../../types';
import { PlaceCategoryLabel } from '../features/PlaceCategoryLabel';

interface ShotFrame {
  label: string;
  title: string;
  direction: string;
}

interface Moodboard {
  eyebrow: string;
  title: string;
  description: string;
  palette: { name: string; color: string }[];
  frames: ShotFrame[];
}

interface Props {
  categories: PlaceCategory[];
  selectedCategory: PlaceCategoryFilter;
  onSelectCategory: (category: PlaceCategoryFilter) => void;
  showFilmLabs?: boolean;
  onToggleFilmLabs?: () => void;
}

const moodboards: Record<string, Moodboard[]> = {
  ALL: [
    { eyebrow: 'OPEN FRAME / 01', title: 'Một ngày, ba nhịp hình', description: 'Ghép một khung rộng, một khoảnh khắc có người và một chi tiết nhỏ thành câu chuyện.', palette: [{ name: 'Nắng nhạt', color: '#E5C58A' }, { name: 'Giấy ảnh', color: '#F2E7D3' }, { name: 'Bóng râm', color: '#56614E' }], frames: [{ label: '01 · RỘNG', title: 'Đặt bối cảnh', direction: 'Chừa khoảng thở quanh chủ thể, đừng lấp đầy khung.' }, { label: '02 · NGƯỜI', title: 'Bắt chuyển động', direction: 'Bấm lúc đang bước hoặc quay đầu, thay vì tạo dáng.' }, { label: '03 · CHI TIẾT', title: 'Chốt câu chuyện', direction: 'Tìm một vật nhỏ lặp lại màu sắc của khung đầu.' }] },
    { eyebrow: 'OPEN FRAME / 02', title: 'Săn những lớp phản chiếu', description: 'Đặt kính, bóng nước hoặc vùng sáng ở tiền cảnh để bức hình có chiều sâu.', palette: [{ name: 'Kính khói', color: '#7C8278' }, { name: 'Kem ấm', color: '#E6D9C2' }, { name: 'Đất nung', color: '#B96642' }], frames: [{ label: '01 · LỚP', title: 'Tìm tiền cảnh', direction: 'Chụp xuyên qua kính hoặc tán lá, lấy nét vào chủ thể.' }, { label: '02 · BÓNG', title: 'Để bóng kể chuyện', direction: 'Canh đường bóng chạy chéo qua khung hình.' }, { label: '03 · MÀU', title: 'Giữ một điểm nhấn', direction: 'Chỉ để một màu nổi bật dẫn mắt người xem.' }] },
  ],
  CAFE: [
    { eyebrow: 'CAFÉ / SOFT WINDOW LIGHT', title: 'Một khoảng chậm giữa phố', description: 'Kể chuyện bằng hơi nước, bàn tay và vệt nắng — không cần pose cầu kỳ.', palette: [{ name: 'Sữa', color: '#E9D8BE' }, { name: 'Espresso', color: '#5A4034' }, { name: 'Olive', color: '#74765B' }], frames: [{ label: '01 · CẬN', title: 'Hơi ấm', direction: 'Đặt tách lệch 1/3 khung, chờ ánh cửa sổ bắt vào mặt cà phê.' }, { label: '02 · CHÂN DUNG', title: 'Qua lớp kính', direction: 'Dùng phản chiếu làm tiền cảnh, giữ gương mặt ở vùng sáng.' }, { label: '03 · CHI TIẾT', title: 'Một thói quen', direction: 'Gom bàn tay, trang sách và chiếc đĩa vào cùng một khung.' }] },
    { eyebrow: 'CAFÉ / STILL LIFE', title: 'Tách cà phê trong khung cửa', description: 'Biến một góc bàn quen thành tĩnh vật có nhịp điệu và khoảng trống.', palette: [{ name: 'Bơ nhạt', color: '#D8C38F' }, { name: 'Gỗ', color: '#906648' }, { name: 'Mực', color: '#302925' }], frames: [{ label: '01 · TOP-DOWN', title: 'Sắp một vòng tròn', direction: 'Xếp tách, thìa và khăn thành đường dẫn mắt.' }, { label: '02 · NGHIÊNG', title: 'Để bàn có chiều sâu', direction: 'Hạ máy thấp, cho mép bàn chạy vào hậu cảnh.' }, { label: '03 · CẬN', title: 'Bắt một vệt sáng', direction: 'Tiến gần để thấy texture bọt, gốm và bóng đổ.' }] },
  ],
  VINTAGE: [
    { eyebrow: 'VINTAGE / QUIET STORY', title: 'Kể chuyện bằng dấu vết thời gian', description: 'Tìm bề mặt cũ, màu phai và một chủ thể nhỏ để khung hình giống trang phim lưu trữ.', palette: [{ name: 'Ảnh bạc màu', color: '#D4C3A7' }, { name: 'Rêu cũ', color: '#69705A' }, { name: 'Gạch', color: '#A15D44' }], frames: [{ label: '01 · TEXTURE', title: 'Chạm vào bề mặt', direction: 'Lấy nét vào vết xước, lớp sơn hoặc thớ gỗ.' }, { label: '02 · LỚP LANG', title: 'Đặt người vào ký ức', direction: 'Chụp qua khung cửa hoặc vật tiền cảnh đã cũ.' }, { label: '03 · MÀU', title: 'Giữ tông trầm', direction: 'Giảm bớt màu rực, để một sắc ấm làm điểm neo.' }] },
    { eyebrow: 'VINTAGE / FRAME WITHIN FRAME', title: 'Một khung hình như tấm bưu thiếp', description: 'Dùng viền cửa, lan can hoặc bóng nắng để tạo cảm giác ảnh được tìm thấy trong cuốn album cũ.', palette: [{ name: 'Sepia', color: '#B58D67' }, { name: 'Giấy cũ', color: '#E5D7BE' }, { name: 'Xanh chai', color: '#4E6259' }], frames: [{ label: '01 · VIỀN', title: 'Khung trong khung', direction: 'Để cạnh cửa hoặc rèm tạo viền tự nhiên.' }, { label: '02 · NGƯỢC SÁNG', title: 'Giữ quầng sáng', direction: 'Chụp ngược nắng nhẹ để có lớp haze mềm.' }, { label: '03 · CHÂN DUNG', title: 'Nhìn lệch khỏi máy', direction: 'Để ánh mắt hướng vào khoảng trống trong ảnh.' }] },
  ],
  SHOPPING_MALL: [
    { eyebrow: 'CITY / CLEAN GEOMETRY', title: 'Đường nét giữa ánh đèn đô thị', description: 'Biến cầu thang, lan can và mặt kính thành những đường dẫn có nhịp.', palette: [{ name: 'Chrome', color: '#C8C6BE' }, { name: 'Đá lạnh', color: '#89918E' }, { name: 'Cam đèn', color: '#C9784D' }], frames: [{ label: '01 · ĐỐI XỨNG', title: 'Đứng vào trục giữa', direction: 'Canh hai cạnh kiến trúc cân nhau trước khi bấm.' }, { label: '02 · DI CHUYỂN', title: 'Theo một đường chéo', direction: 'Để thang cuốn hoặc lan can kéo mắt qua ảnh.' }, { label: '03 · PHẢN CHIẾU', title: 'Chụp qua mặt kính', direction: 'Giữ chủ thể thật và bóng phản chiếu cùng xuất hiện.' }] },
    { eyebrow: 'CITY / AFTER DARK', title: 'Chân dung trong thành phố sáng đèn', description: 'Tách chủ thể khỏi nền bằng một nguồn sáng nhỏ và hậu cảnh nhiều lớp.', palette: [{ name: 'Đêm xanh', color: '#39444A' }, { name: 'Bạc', color: '#BFC2B8' }, { name: 'Hổ phách', color: '#D28C4B' }], frames: [{ label: '01 · BOKEH', title: 'Làm mềm hậu cảnh', direction: 'Đưa đèn xa phía sau để tạo những đốm sáng tròn.' }, { label: '02 · SILHOUETTE', title: 'Giữ đường viền', direction: 'Đặt chủ thể trước mảng sáng, chừa viền vai rõ.' }, { label: '03 · CẬN', title: 'Bắt ánh mắt', direction: 'Tìm một đốm sáng phản chiếu trong mắt người mẫu.' }] },
  ],
  RED_RIVER: [
    { eyebrow: 'OPEN AIR / WIND & SPACE', title: 'Gió mở, khung hình rộng', description: 'Dùng đường chân trời và chuyển động của cỏ, tà áo để khung hình có cảm giác thoáng.', palette: [{ name: 'Cỏ khô', color: '#B79A68' }, { name: 'Trời nhạt', color: '#C9D0C5' }, { name: 'Đất phù sa', color: '#8A684C' }], frames: [{ label: '01 · TOÀN', title: 'Chừa nhiều bầu trời', direction: 'Đặt chân trời thấp, để khoảng trống trở thành chủ thể.' }, { label: '02 · CHUYỂN ĐỘNG', title: 'Bắt một cơn gió', direction: 'Chụp liên tiếp khi tóc hoặc vạt áo vừa chuyển động.' }, { label: '03 · BÓNG DÀI', title: 'Đi cùng ánh xiên', direction: 'Đợi bóng đổ kéo dài để tạo một đường chéo tự nhiên.' }] },
    { eyebrow: 'OPEN AIR / SMALL HUMAN', title: 'Một dáng người giữa khoảng trời', description: 'Thu nhỏ chủ thể trong khung rộng để nhấn vào cảm giác tự do và tĩnh lặng.', palette: [{ name: 'Nắng cát', color: '#D1B27C' }, { name: 'Xanh mây', color: '#AABBC0' }, { name: 'Nâu đất', color: '#745B45' }], frames: [{ label: '01 · TỶ LỆ', title: 'Người thật nhỏ', direction: 'Đặt người ở một góc, để cảnh vật chiếm phần lớn khung.' }, { label: '02 · ĐƯỜNG DẪN', title: 'Tìm lối đi', direction: 'Dùng bờ cỏ hoặc lối mòn dẫn vào chủ thể.' }, { label: '03 · CHÂN DUNG', title: 'Quay lưng với gió', direction: 'Chụp khoảnh khắc nhìn ra xa, không cần nhìn máy.' }] },
  ],
  SUNSET: [
    { eyebrow: 'GOLDEN HOUR / LAST LIGHT', title: 'Giữ lại lớp sáng cuối ngày', description: 'Đo sáng vào vùng trời, để màu ấm và silhouette tự kể phần còn lại.', palette: [{ name: 'Mật ong', color: '#D88B4A' }, { name: 'Mơ chín', color: '#E6B57E' }, { name: 'Chạng vạng', color: '#66514F' }], frames: [{ label: '01 · SILHOUETTE', title: 'Để người thành nét', direction: 'Chạm lấy nét vào trời sáng rồi giữ chủ thể tối vừa đủ.' }, { label: '02 · FLARE', title: 'Cho nắng lọt khung', direction: 'Đặt mặt trời sát mép vật thể để flare dịu hơn.' }, { label: '03 · PHẢN CHIẾU', title: 'Tìm một mặt gương', direction: 'Dùng mặt nước hoặc kính để nhân đôi dải màu hoàng hôn.' }] },
    { eyebrow: 'GOLDEN HOUR / COLOR STUDY', title: 'Một dải màu chuyển từ vàng sang tím', description: 'Chụp liên tiếp khi ánh sáng đổi tông, rồi chọn khung có chuyển màu rõ nhất.', palette: [{ name: 'Vàng cuối ngày', color: '#E9B85F' }, { name: 'Hồng bụi', color: '#C88279' }, { name: 'Tím khói', color: '#6D6474' }], frames: [{ label: '01 · WIDE', title: 'Giữ dải chân trời', direction: 'Chừa phần trời rộng, đặt đường chân trời lệch 1/3.' }, { label: '02 · LỚP', title: 'Thêm một silhouette', direction: 'Tìm cành cây, mái nhà hoặc dáng người làm lớp trước.' }, { label: '03 · DETAIL', title: 'Kết bằng ánh phản', direction: 'Bắt một vệt màu trên tóc, kính hoặc mặt nước.' }] },
  ],
};

const fallbackMoodboards = (label: string): Moodboard[] => [
  { eyebrow: `${label.toUpperCase()} / STYLE NOTE`, title: `Kể một câu chuyện bằng ${label.toLowerCase()}`, description: 'Chọn một điểm nhấn, một lớp nền và một vùng sáng — rồi giữ khung hình thật gọn.', palette: [{ name: 'Điểm nhấn', color: '#C76B3C' }, { name: 'Nền giấy', color: '#E8DEC7' }, { name: 'Bóng râm', color: '#59624E' }], frames: [{ label: '01 · WIDE', title: 'Mở câu chuyện', direction: 'Cho bối cảnh đủ rộng để người xem nhận ra mood.' }, { label: '02 · PORTRAIT', title: 'Thêm một nhân vật', direction: 'Để chủ thể tương tác với ánh sáng hoặc tiền cảnh.' }, { label: '03 · DETAIL', title: 'Khép bằng chi tiết', direction: 'Tìm một texture hoặc màu sắc nhắc lại khung đầu.' }] },
    { eyebrow: `${label.toUpperCase()} / STYLE NOTE`, title: 'Thử phá vỡ bố cục quen thuộc', description: 'Đổi góc nhìn trước khi đổi thiết bị: thấp hơn, gần hơn hoặc chụp xuyên qua một lớp.', palette: [{ name: 'Nắng', color: '#D8B16A' }, { name: 'Linen', color: '#F1E6D2' }, { name: 'Olive', color: '#73785C' }], frames: [{ label: '01 · LOW', title: 'Hạ máy xuống', direction: 'Để đường dẫn hoặc tiền cảnh mở rộng hơn bình thường.' }, { label: '02 · THROUGH', title: 'Chụp xuyên lớp', direction: 'Dùng kính, lá hoặc bóng đổ để tạo chiều sâu.' }, { label: '03 · CROP', title: 'Cắt sát chủ thể', direction: 'Bỏ bớt chi tiết thừa, giữ lại đúng một điểm nhấn.' }] },
  ];

export const MapStyleCategoryBrowser = ({ categories, selectedCategory, onSelectCategory, showFilmLabs = true, onToggleFilmLabs }: Props) => {
  const [moodCursor, setMoodCursor] = useState({ category: selectedCategory, index: 0 });
  const selectedLabel = categories.find(category => category.id === selectedCategory)?.label ?? 'Tất cả style';
  const boardOptions = moodboards[selectedCategory] ?? fallbackMoodboards(selectedLabel);
  const boardIndex = moodCursor.category === selectedCategory ? moodCursor.index : 0;
  const board = boardOptions[boardIndex % boardOptions.length];

  const changeMood = () => setMoodCursor({ category: selectedCategory, index: (boardIndex + 1) % boardOptions.length });

  return (
    <section aria-label="Khám phá style chụp" className="space-y-5 sm:space-y-4">
      <header className="space-y-1">
        <p className="font-mono-spec text-[10px] font-bold uppercase tracking-[0.14em] text-[#C76B3C]">Style finder / map</p>
        <h2 className="text-xl font-bold leading-tight text-[#2C2621] sm:text-lg">Bạn định chụp style gì?</h2>
        <p className="text-sm leading-relaxed text-[#6E655B] sm:text-xs">Chọn một mood. Ghim trên bản đồ sẽ đổi theo category bạn chọn.</p>
      </header>

      <div role="group" aria-label="Category địa điểm" className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={selectedCategory === 'ALL'} onClick={() => onSelectCategory('ALL')} className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${selectedCategory === 'ALL' ? 'border-[#2C2621] bg-[#2C2621] text-white' : 'border-[#D8CFBD] bg-[#FAF8F4] text-[#554D43] hover:bg-white'}`}>
          Tất cả style
        </button>
        {categories.map(category => {
          const selected = selectedCategory === category.id;
          const halloween = category.id === 'HALLOWEEN';
          const halloweenClasses = selected
            ? 'relative mt-3 border-[#12303D] bg-[#12303D] text-[#FFF7E8] shadow-sm'
            : 'relative mt-3 border-[#C76B3C]/60 bg-[#FFF7EB] text-[#12303D] hover:border-[#12303D]';
          return <button key={category.id} type="button" aria-pressed={selected} onClick={() => onSelectCategory(category.id)} className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${halloween ? halloweenClasses : selected ? 'border-[#2C2621] bg-[#2C2621] text-white' : 'border-[#D8CFBD] bg-[#FAF8F4] text-[#554D43] hover:bg-white'}`}>
            <PlaceCategoryLabel id={category.id} label={category.label} selected={selected} />
          </button>;
        })}
        <button type="button" aria-pressed={showFilmLabs} onClick={onToggleFilmLabs} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${showFilmLabs ? 'border-[#C76B3C] bg-[#F3EAD7] text-[#8F3F23]' : 'border-[#D8CFBD] bg-[#FAF8F4] text-[#6E655B] hover:bg-white'}`}>
          <Film aria-hidden="true" className="h-4 w-4 shrink-0" />Lab film
        </button>
      </div>

      <section aria-label="Bảng cảm hứng chụp" aria-live="polite" className="overflow-hidden rounded-2xl border border-[#D8CFBD] bg-[#FAF8F4] shadow-sm sm:rounded-[1.35rem]">
        <div className="relative isolate min-h-44 overflow-hidden bg-[#2C2621] p-5 text-[#FAF8F4] sm:min-h-40 sm:p-4">
          <div aria-hidden="true" className="absolute -right-7 -top-9 h-36 w-36 rounded-full opacity-25 max-[360px]:hidden" style={{ backgroundColor: board.palette[0].color }} />
          <div aria-hidden="true" className="absolute right-5 top-4 h-28 w-20 rotate-6 rounded-xl border border-white/40 bg-white/10 p-2 shadow-xl max-[360px]:hidden">
            <div className="relative h-full overflow-hidden rounded-lg border border-white/30">
              <span className="absolute right-2 top-2 h-5 w-5 rounded-full" style={{ backgroundColor: board.palette[0].color }} />
              <span className="absolute inset-x-0 bottom-0 h-12 opacity-80" style={{ background: `linear-gradient(155deg, transparent 20%, ${board.palette[2].color} 21%)` }} />
              <span className="absolute bottom-0 left-0 h-8 w-9 opacity-80" style={{ background: `linear-gradient(35deg, ${board.palette[1].color} 48%, transparent 50%)` }} />
            </div>
          </div>
          <div className="relative z-10 max-w-[calc(100%-7rem)] space-y-2 max-[360px]:max-w-full sm:max-w-[calc(100%-6rem)]">
            <p className="font-mono-spec text-[9px] font-bold uppercase tracking-[0.16em] text-[#E8B184]">Moodboard / {String(boardIndex + 1).padStart(2, '0')}</p>
            <h3 className="font-editorial text-xl font-bold leading-tight">{board.title}</h3>
            <p className="text-xs leading-relaxed text-white/75">{board.description}</p>
          </div>
          <Camera aria-hidden="true" className="absolute bottom-3 right-3 h-4 w-4 text-white/70" />
        </div>

        <div className="space-y-5 p-4 sm:space-y-4 sm:p-3.5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-mono-spec text-[10px] font-bold uppercase tracking-[0.12em] text-[#6E655B]">Bảng màu</h4>
              <span className="text-[10px] text-[#8C8377]">3 tông gợi ý</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {board.palette.map(color => <div key={color.name} className="flex min-h-11 min-w-0 items-center gap-1.5 rounded-lg bg-[#F3EAD7] px-2 py-2 sm:min-h-0 sm:py-1.5">
                <span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: color.color }} />
                <span className="break-words text-[11px] font-medium leading-tight text-[#554D43] sm:truncate sm:text-[10px]">{color.name}</span>
              </div>)}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#2C2621]">Ba khung hình thử ngay</h4>
              <span className="font-mono-spec text-[9px] font-bold text-[#C76B3C]">01 — 03</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {board.frames.map((frame, index) => <article key={frame.label} className={`min-w-0 rounded-xl border border-[#E2D8C6] bg-white/70 p-3 sm:p-2.5 ${index === 2 ? 'sm:col-span-2' : ''}`}>
                <p className="font-mono-spec text-[10px] font-bold tracking-wide text-[#C76B3C] sm:text-[9px]">{frame.label}</p>
                <h5 className="mt-1 text-sm font-bold leading-snug text-[#2C2621] sm:text-xs">{frame.title}</h5>
                <p className="mt-1 text-xs leading-relaxed text-[#6E655B] sm:text-[10px]">{frame.direction}</p>
              </article>)}
            </div>
          </div>

          <button type="button" onClick={changeMood} aria-label={`Đổi mood cho ${selectedLabel}`} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#D8CFBD] bg-[#ECE4D0] px-3 py-2 text-sm font-semibold text-[#554D43] transition-colors hover:bg-[#E0D5BE] sm:min-h-10 sm:text-xs">
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />Đổi mood cho nhóm này<Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-[#C76B3C]" />
          </button>
        </div>
      </section>
      <footer className="border-t border-[#D8CFBD] pt-4 text-center">
        <a href="/chup-gi/" className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold text-[#8F3F23] underline decoration-[#C76B3C]/60 underline-offset-4 hover:text-[#6F2D18]">
          Chưa biết chụp gì hôm nay? Xem gợi ý chụp ảnh
        </a>
      </footer>
    </section>
  );
};
