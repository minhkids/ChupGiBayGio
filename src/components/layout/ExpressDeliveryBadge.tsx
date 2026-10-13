import { Film, Zap } from 'lucide-react';

export function ExpressDeliveryBadge({ className = '' }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Giao hỏa tốc trong 2 giờ"
      title="Giao hỏa tốc trong 2 giờ"
      className={`inline-flex w-fit items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold leading-none text-emerald-900 ${className}`}
    >
      <span aria-hidden="true" className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <Film className="h-3.5 w-3.5" />
        <Zap className="absolute -right-1 -top-1 h-2.5 w-2.5 fill-amber-400 text-amber-600" />
      </span>
      2h
    </span>
  );
}
