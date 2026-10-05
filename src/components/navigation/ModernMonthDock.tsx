import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import type { Spot } from '../../types';
import { isSpotActiveInMonth } from '../../utils/season';

interface ModernMonthDockProps {
  selectedMonth: number | null;
  onSelectMonth: (month: number | null) => void;
  spots: Spot[];
  onOpenFilters?: () => void;
}

const MONTH_DATA = [
  { id: 1, name: 'Tháng 1', theme: 'Đào mai & Tết', isPeak: false },
  { id: 2, name: 'Tháng 2', theme: 'Hoa ban Tây Bắc', isPeak: false },
  { id: 3, name: 'Tháng 3', theme: 'Hoa sưa & Gạo đỏ', isPeak: false },
  { id: 4, name: 'Tháng 4', theme: 'Loa kèn trắng', isPeak: false },
  { id: 5, name: 'Tháng 5', theme: 'Bằng lăng & Phượng', isPeak: false },
  { id: 6, name: 'Tháng 6', theme: 'Mùa sen Hồ Tây', isPeak: false },
  { id: 7, name: 'Tháng 7', theme: 'Biển xanh hè', isPeak: false },
  { id: 8, name: 'Tháng 8', theme: 'Mùa sương mây', isPeak: false },
  { id: 9, name: 'Tháng 9', theme: 'Đầu thu lá vàng', isPeak: false },
  { id: 10, name: 'Tháng 10', theme: 'Mùa thu & Xe hoa', isPeak: true },
  { id: 11, name: 'Tháng 11', theme: 'Mùa Cúc họa mi & Cỏ hồng', isCurrent: true, isPeak: true },
  { id: 12, name: 'Tháng 12', theme: 'Giáng sinh phố cổ', isPeak: false },
];

export const ModernMonthDock: React.FC<ModernMonthDockProps> = ({
  selectedMonth,
  onSelectMonth,
  spots,
  onOpenFilters
}) => {
  const currentMonthNum = new Date().getMonth() + 1;

  // Calculate dynamic spot count per month
  const getMonthCount = (monthId: number) => {
    return spots.filter(s =>
      isSpotActiveInMonth(s.seasonalTrend.startMonth, s.seasonalTrend.endMonth, monthId)
    ).length;
  };

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Horizontal Capsule Month List */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          
          {/* 'All Year' option */}
          <button
            type="button"
            onClick={() => onSelectMonth(null)}
            className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedMonth === null 
                ? 'text-white font-semibold' 
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {selectedMonth === null && (
              <motion.div
                layoutId="activeMonthCapsule"
                className="absolute inset-0 bg-neutral-950 dark:bg-white rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <span className={`relative z-10 ${selectedMonth === null ? 'dark:text-neutral-950' : ''}`}>
              Cả năm (365d)
            </span>
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
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer group ${
                  isSelected ? 'text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeMonthCapsule"
                    className="absolute inset-0 bg-neutral-950 dark:bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                
                <span className={`relative z-10 ${isSelected ? 'dark:text-neutral-950 font-semibold' : ''}`}>
                  {m.name}
                </span>

                {isCurrent && (
                  <span className={`relative z-10 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-rose-500'}`} />
                )}

                {count > 0 && (
                  <span className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                    isSelected 
                      ? 'bg-white/20 text-white dark:bg-black/10 dark:text-neutral-900' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover:text-neutral-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Filter Trigger */}
        <div className="flex items-center space-x-2 shrink-0">
          {onOpenFilters && (
            <button 
              type="button"
              onClick={onOpenFilters}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Lọc concept</span>
            </button>
          )}

          {selectedMonth && (
            <span className="hidden xl:flex items-center text-[11px] font-mono text-neutral-400">
              <Sparkles className="w-3 h-3 text-amber-500 mr-1" />
              {MONTH_DATA.find(m => m.id === selectedMonth)?.theme}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};
