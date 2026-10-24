interface PlaceCategoryLabelProps {
  id: string;
  label: string;
  selected?: boolean;
}

export const PlaceCategoryLabel = ({ id, label, selected = false }: PlaceCategoryLabelProps) => {
  if (id !== 'HALLOWEEN') return <>{label}</>;

  return (
    <span className="inline-flex items-center">
      <svg
        aria-hidden="true"
        focusable="false"
        data-icon="witch-hat"
        viewBox="0 0 48 40"
        className="pointer-events-none absolute -right-1 -top-5 h-9 w-11 -rotate-12"
      >
        <path d="M11 28 20 5Q21 2 25 4L37 11 42 20 32 14 34 28Z" fill="#12303D" stroke={selected ? '#F4CF76' : '#FFF7EB'} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="m14 22 18-1 2 7-22 1Z" fill="#C76B3C" />
        <rect x="21" y="21" width="8" height="7" rx="1" fill="#12303D" stroke="#F4BE38" strokeWidth="2" />
        <path d="M4 28Q13 25 22 27 34 27 43 24Q47 24 44 29C36 38 10 40 3 32Q1 29 4 28Z" fill="#12303D" stroke={selected ? '#F4CF76' : '#FFF7EB'} strokeWidth="1.3" />
      </svg>
      <span>{label}</span>
    </span>
  );
};
