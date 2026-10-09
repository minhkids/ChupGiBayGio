import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { MapPin } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPick?: (value: string) => void;
  required?: boolean;
  inputClassName: string;
  placeholder: string;
}

export function AddressSuggestionsField({ label, value, onChange, onPick, required = false, inputClassName, placeholder }: Props) {
  const id = useId();
  const listId = `${id}-suggestions`;
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [message, setMessage] = useState('');
  const open = focused && suggestions.length > 0 && value !== selected;

  useEffect(() => {
    const query = value.trim();
    if (!focused || query.length < 3 || query === selected) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/partner/address-suggestions?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('unavailable');
        const data: unknown = await response.json();
        if (controller.signal.aborted) return;
        const options = Array.isArray(data) ? data.filter((entry): entry is { label: string } => typeof entry?.label === 'string').map((entry) => entry.label).slice(0, 5) : [];
        setSuggestions(options);
        setActiveIndex(-1);
        setMessage(options.length ? '' : 'Không tìm thấy địa chỉ phù hợp. Thử gõ tên đường hoặc nhập tay.');
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setMessage('Không tải được gợi ý. Bạn vẫn có thể nhập địa chỉ bằng tay.');
        }
      }
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [value, focused, selected]);

  const choose = (option: string) => {
    setSelected(option);
    setSuggestions([]);
    setActiveIndex(-1);
    setMessage('');
    onChange(option);
    onPick?.(option);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { setSuggestions([]); return; }
    if (!open) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => (index + 1) % suggestions.length); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length); }
    if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); choose(suggestions[activeIndex]); }
  };

  return <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <label htmlFor={id} className="block text-sm font-semibold text-[#2C2621]">{label}</label>
    <input id={id} className={inputClassName} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      value={value} onChange={(event) => { setSelected(''); setSuggestions([]); setMessage(''); onChange(event.target.value); }} onFocus={() => setFocused(true)} onKeyDown={handleKeyDown}
      required={required} minLength={required ? 8 : undefined} maxLength={300} autoComplete="off" placeholder={placeholder} />
    <p className="mt-1.5 text-xs text-[#675D52]">Gõ ít nhất 3 ký tự để xem gợi ý; nếu không có số nhà, bạn có thể nhập tay.</p>
    {open && <div id={listId} role="listbox" aria-label="Gợi ý địa chỉ" className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-[#D8CFBD] bg-[#FAF8F4] p-1 shadow-sm">
      {suggestions.map((option, index) => <button id={`${listId}-${index}`} key={option} type="button" role="option" aria-selected={activeIndex === index} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}
        className={`flex min-h-11 w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#2C2621] ${activeIndex === index ? 'bg-[#ECE4D0]' : 'hover:bg-[#F0E8D9]'}`}><MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#C76B3C]" />{option}</button>)}
    </div>}
    {focused && message && <p role="status" className="mt-1 text-xs text-[#675D52]">{message}</p>}
  </div>;
}
