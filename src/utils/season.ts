import type { ConceptTag, SpotStatus } from '../types';

export const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export const MONTH_SHORT_LABELS = [
  'T.01', 'T.02', 'T.03', 'T.04',
  'T.05', 'T.06', 'T.07', 'T.08',
  'T.09', 'T.10', 'T.11', 'T.12'
];

export const CONCEPT_METADATA: Record<ConceptTag, { label: string; iconName: string; description: string }> = {
  HOA_CO: { label: 'Hoa Cỏ & Mùa Nở', iconName: 'Flower2', description: 'Cúc họa mi, dã quỳ, sen, mai anh đào' },
  VINTAGE: { label: 'Cổ Điển & Retro', iconName: 'Camera', description: 'Phố cổ, chung cư xưa, kiến trúc Pháp' },
  NANG_THO: { label: 'Nàng Thơ & Pastel', iconName: 'Sparkles', description: 'Đồi cỏ hồng, vườn hoa, bờ hồ thơ mộng' },
  AO_DAI: { label: 'Áo Dài & Cổ Phục', iconName: 'Shirt', description: 'Không gian truyền thống, di tích lịch sử' },
  FILM: { label: 'Chất Màu Film 35mm', iconName: 'Film', description: 'Grain film, màu ấm Kodak, hoài niệm' },
  STREET: { label: 'Đường Phố Sống Động', iconName: 'Footprints', description: 'Góc phố cà phê, đời sống thường nhật' },
  CYBERPUNK: { label: 'Đêm Đô Thị & Flash', iconName: 'Zap', description: 'Ánh sáng neon, cầu đêm, bờ sông hiện đại' },
  MINIMAL: { label: 'Tối Giản & Hiện Đại', iconName: 'Layers', description: 'Kiến trúc hình khối, bảo tàng nghệ thuật' },
  KIEN_TRUC: { label: 'Kiến Trúc & Di Sản', iconName: 'Landmark', description: 'Công trình biểu tượng trăm năm' },
  CHRISTMAS: { label: 'Giáng Sinh & Đông', iconName: 'Gift', description: 'Không gian trang trí Noel, cây thông, đèn lồng, không khí lễ hội' }
};

export function isSpotActiveInMonth(startMonth: number, endMonth: number, targetMonth: number): boolean {
  if (startMonth <= endMonth) {
    return targetMonth >= startMonth && targetMonth <= endMonth;
  }
  // Boundary wrapping (e.g. November through February: 11 -> 2)
  return targetMonth >= startMonth || targetMonth <= endMonth;
}

export function getStatusBadgeInfo(status: SpotStatus, daysLeft?: number): { label: string; classNames: string; dotColor: string } {
  switch (status) {
    case 'PEAK':
      return {
        label: 'Đang Rộ Nhất (Peak)',
        classNames: 'bg-terracotta text-white border-terracotta',
        dotColor: 'bg-white'
      };
    case 'ENDING_SOON':
      return {
        label: daysLeft ? `Sắp Hết (${daysLeft} ngày)` : 'Sắp Hết Mùa',
        classNames: 'bg-amberFilm text-slateInk border-amberFilm',
        dotColor: 'bg-slateInk'
      };
    case 'ACTIVE':
    default:
      return {
        label: 'Quanh Năm',
        classNames: 'bg-paper-warm text-slateInk border-slateInk/30',
        dotColor: 'bg-olive'
      };
  }
}

// Get Golden Hour information for current time
export function getGoldenHourStatus(): {
  isGoldenHourNow: boolean;
  currentPhase: string;
  nextEventTitle: string;
  timeRemaining: string;
} {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Approximate for Vietnam latitude (~21°N to ~10°N):
  // Morning Golden Hour: 5:45 - 6:45 (345m - 405m)
  // Afternoon Golden Hour: 16:45 - 17:45 (1005m - 1065m)
  // Blue Hour: 17:45 - 18:15 (1065m - 1095m)

  if (totalMinutes >= 345 && totalMinutes <= 405) {
    const left = 405 - totalMinutes;
    return {
      isGoldenHourNow: true,
      currentPhase: 'Bình Minh • Golden Hour Sáng',
      nextEventTitle: 'Kết thúc giờ vàng sáng',
      timeRemaining: `Còn ${left} phút`
    };
  }

  if (totalMinutes >= 1005 && totalMinutes <= 1065) {
    const left = 1065 - totalMinutes;
    return {
      isGoldenHourNow: true,
      currentPhase: 'Hoàng Hôn • Golden Hour Chiều',
      nextEventTitle: 'Chuyển sang Blue Hour',
      timeRemaining: `Còn ${left} phút`
    };
  }

  if (totalMinutes < 345) {
    const diff = 345 - totalMinutes;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return {
      isGoldenHourNow: false,
      currentPhase: 'Đêm / Rạng Sáng',
      nextEventTitle: 'Giờ Vàng Bình Minh (05:45)',
      timeRemaining: `Còn ${h}h ${m}p`
    };
  }

  if (totalMinutes < 1005) {
    const diff = 1005 - totalMinutes;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return {
      isGoldenHourNow: false,
      currentPhase: 'Ánh Nắng Ban Ngày',
      nextEventTitle: 'Giờ Vàng Hoàng Hôn (16:45)',
      timeRemaining: `Còn ${h}h ${m}p`
    };
  }

  // After 17:45
  return {
    isGoldenHourNow: false,
    currentPhase: 'Chập Tối & Đêm',
    nextEventTitle: 'Giờ Vàng Bình Minh Ngày Mai',
    timeRemaining: 'Sáng mai 05:45'
  };
}
