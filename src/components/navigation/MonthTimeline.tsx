import React from 'react';
import { Calendar } from 'lucide-react';
import { isSpotActiveInMonth } from '../../utils/season';
import type { Spot } from '../../types';

interface MonthTimelineProps {
  selectedMonth: number | null;
  onSelectMonth: (month: number | null) => void;
  selectedSeason: string;
  onSelectSeason: (season: 'all' | 'spring' | 'summer' | 'autumn' | 'winter' | 'festive') => void;
  spots: Spot[];
}

const MONTH_DATA = [
  { id: 1, name: 'T.01', label: 'Tháng 1 — Hoa Đào & Tết' },
  { id: 2, name: 'T.02', label: 'Tháng 2 — Hoa Ban Tây Bắc' },
  { id: 3, name: 'T.03', label: 'Tháng 3 — Hoa Sưa & Gạo' },
  { id: 4, name: 'T.04', label: 'Tháng 4 — Loa Kèn Trắng' },
  { id: 5, name: 'T.05', label: 'Tháng 5 — Bằng Lăng & Phượng' },
  { id: 6, name: 'T.06', label: 'Tháng 6 — Sen Hồ Tây' },
  { id: 7, name: 'T.07', label: 'Tháng 7 — Biển Xanh' },
  { id: 8, name: 'T.08', label: 'Tháng 8 — Sương Mây' },
  { id: 9, name: 'T.09', label: 'Tháng 9 — Thu Hà Nội' },
  { id: 10, name: 'T.10', label: 'Tháng 10 — Xe Hoa Phố Cổ', isPeak: true },
  { id: 11, name: 'T.11', label: 'Tháng 11 — Cúc Họa Mi & Cỏ Hồng', isCurrent: true, isPeak: true },
  { id: 12, name: 'T.12', label: 'Tháng 12 — Dã Quỳ & Giáng Sinh', isPeak: true },
];

export const MonthTimeline: React.FC<MonthTimelineProps> = ({
  selectedMonth,
  onSelectMonth,
  selectedSeason,
  onSelectSeason,
  spots
}) => {
  const currentMonthNum = new Date().getMonth() + 1;

  const getMonthCount = (monthId: number) => {
    return spots.filter(s =>
      isSpotActiveInMonth(s.seasonalTrend.startMonth, s.seasonalTrend.endMonth, monthId)
    ).length;
  };

  return (
    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-6 py-2 transition-all select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Season Quick Selectors */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs font-medium">
          <span className="text-neutral-400 font-mono-spec text-[11px] mr-1 hidden md:inline flex items-center">
            <Calendar className="w-3.5 h-3.5 text-terracotta mr-1" />
            Mùa chụp:
          </span>
          {[
            { id: 'all', label: 'Cả năm' },
            { id: 'spring', label: '🌸 Xuân (T1-3)' },
            { id: 'summer', label: '☀️ Hạ (T4-6)' },
            { id: 'autumn', label: '🍂 Thu (T7-9)' },
            { id: 'winter', label: '❄️ Đông (T10-12)' },
          ].map((s) => {
            const isActive = selectedSeason === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSeason(s.id as any)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs scale-105'
                    : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Capsule Month Buttons Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          
          <button
            type="button"
            onClick={() => onSelectMonth(null)}
            className={`relative px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedMonth === null
                ? 'bg-terracotta text-white font-bold shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            <span>Tất cả</span>
          </button>

          {MONTH_DATA.map((m) => {
            const isSelected = selectedMonth === m.id;
            const isCurrent = currentMonthNum === m.id || m.isCurrent;
            const count = getMonthCount(m.id);

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMonth(isSelected ? null : m.id)}
                title={m.label}
                className={`relative px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold scale-105 shadow-sm'
                    : 'bg-neutral-100/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <span>{m.name}</span>
                
                {isCurrent && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'}`} />
                )}

                {count > 0 && (
                  <span className={`text-[10px] font-mono-spec px-1 rounded ${
                    isSelected 
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black font-bold' 
                      : 'text-neutral-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
