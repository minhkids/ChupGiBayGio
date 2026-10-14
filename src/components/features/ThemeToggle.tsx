import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { THEME_CHANGED_EVENT, toggleColorScheme } from '../../utils/scheduledTheme';

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGED_EVENT, onChange);
}

const getSnapshot = () => document.documentElement.dataset.colorScheme === 'dark';

export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'nav' }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const label = `Chuyển sang giao diện ${dark ? 'sáng' : 'tối'}`;
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={dark}
      title={`${label} · Tự động lại lúc 06:00 hoặc 19:00`}
      onClick={() => toggleColorScheme()}
      className={`flex min-h-11 min-w-11 shrink-0 items-center justify-center text-[var(--ui-text)] transition-colors hover:bg-[var(--ui-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-accent)] motion-reduce:transition-none ${variant === 'nav' ? 'flex-1 flex-col gap-0.5 rounded-xl px-1 py-1.5' : 'h-11 w-11 rounded-full border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-sm'}`}
    >
      <span className="relative h-5 w-5" aria-hidden="true">
        <Sun className={`absolute inset-0 h-5 w-5 transition-[opacity,transform] duration-200 motion-reduce:transition-none ${dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'}`} />
        <Moon className={`absolute inset-0 h-5 w-5 transition-[opacity,transform] duration-200 motion-reduce:transition-none ${dark ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      </span>
      {variant === 'nav' && <span className="text-[10px] leading-tight">{dark ? 'Sáng' : 'Tối'}</span>}
    </button>
  );
}
