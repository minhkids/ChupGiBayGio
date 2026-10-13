import type { SpotStatus } from '../../types';

interface MapSpotLegendProps {
  selectedStatus: 'ALL' | SpotStatus;
  onSelectStatus: (status: SpotStatus) => void;
}

const OPTIONS: { status: SpotStatus; label: string; symbol: string; colorClass: string }[] = [
  { status: 'PEAK', label: 'Đang Rộ (Peak)', symbol: '★', colorClass: 'bg-terracotta text-white' },
  { status: 'ENDING_SOON', label: 'Sắp Hết Mùa', symbol: '!', colorClass: 'bg-amberFilm text-slateInk' },
  { status: 'ACTIVE', label: 'Quanh Năm', symbol: '+', colorClass: 'bg-olive text-white' },
];

export const MapSpotLegend = ({ selectedStatus, onSelectStatus }: MapSpotLegendProps) => (
  <div role="group" aria-label="Lọc địa điểm theo nhãn" className="space-y-1">
    {OPTIONS.map(({ status, label, symbol, colorClass }) => {
      const isSelected = selectedStatus === status;
      return (
        <button
          key={status}
          type="button"
          aria-label={label}
          aria-pressed={isSelected}
          onClick={() => onSelectStatus(status)}
          className={`flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta ${isSelected ? 'bg-[#ECE4D0] font-semibold text-[#2C2621]' : 'text-[#6E655B] hover:bg-[#ECE4D0]/70 hover:text-[#2C2621]'}`}
        >
          <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[9px] font-bold ${colorClass}`}>{symbol}</span>
          <span>{label}</span>
        </button>
      );
    })}
    <div className="flex items-center gap-2 px-1.5 py-1 text-[#6E655B]" title="Dự báo theo mùa, chưa xác nhận đang rộ. Xem tab Các điểm có thể hot sắp tới.">
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center bg-[#8A633C] text-[9px] font-bold text-white">?</span>
      <span>Có thể hot (dự kiến)</span>
    </div>
  </div>
);
