import { ClipboardList } from 'lucide-react';
import { useShootPlan } from '../../context/ShootPlanContext';

export function ShootPlannerTray({ dossierOpen = false }: { dossierOpen?: boolean }) {
  const plan = useShootPlan();
  return <button type="button" onClick={plan.openDrawer} aria-label={`Kế hoạch chụp (${plan.totalCount} mục), dự toán ${plan.grandTotalFormatted}`} className={`editorial-planner-tray ${dossierOpen ? 'dossier-open' : ''} fixed z-[var(--z-panel)] flex min-h-14 items-center gap-3 rounded-full border border-editorial-border bg-editorial-bg px-5 py-3 text-left text-neutral-100 shadow-lg`}>
    <ClipboardList size={20} strokeWidth={1.5} className="shrink-0 text-kodak-amber" />
    <span><span className="block text-xs font-semibold">Kế hoạch chụp ({plan.totalCount} mục)</span><span className="mt-0.5 block font-mono text-[11px] text-kodak-amber">Dự toán: {plan.grandTotalFormatted}</span></span>
  </button>;
}
