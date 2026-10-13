import { NAV_ITEMS, type ViewId } from './viewItems';

interface MobileViewMenuItemsProps {
  activeView: ViewId;
  onChangeView: (view: ViewId) => void;
  onClose: () => void;
}

export function MobileViewMenuItems({ activeView, onChangeView, onClose }: MobileViewMenuItemsProps) {
  return <>
    {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        type="button"
        aria-label={label}
        aria-current={activeView === id ? 'page' : undefined}
        onClick={() => {
          onChangeView(id);
          onClose();
        }}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs ${activeView === id
          ? 'bg-[#C76B3C] font-bold text-white'
          : 'text-[#554D43] hover:bg-[#ECE4D0]'
        }`}
      >
        <span className="flex items-center gap-2">
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
          {label}
        </span>
        {activeView === id && <span aria-hidden="true" className="text-xs">✓</span>}
      </button>
    ))}
  </>;
}
