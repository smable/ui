export interface PosCategoryItemProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function PosCategoryItem({ label, selected, onClick }: PosCategoryItemProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-[42px] w-full truncate rounded-lg px-3 text-left text-[15px] leading-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        selected ? 'bg-brand-500 font-semibold text-white' : 'text-neutral-900 hover:bg-neutral-100'
      }`}
    >
      {label}
    </button>
  )
}
