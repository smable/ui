import type { ReactNode } from 'react'

export interface PosCategoryItemProps {
  label: string
  selected: boolean
  onClick: () => void
  /** Ikona vlevo (např. lucide 20 px). Barvu dědí přes `currentColor`. */
  icon?: ReactNode
  /** Druhý řádek pod názvem — aktuální stav (Nastavení pokladny: „Epson · 192.168.1.50“). */
  description?: string
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

export function PosCategoryItem({ label, selected, onClick, icon, description }: PosCategoryItemProps) {
  if (icon === undefined && description === undefined) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onClick}
        className={`h-[42px] w-full truncate rounded-lg px-3 text-left text-[15px] leading-[18px] ${FOCUS} ${
          selected ? 'bg-brand-500 font-semibold text-white' : 'text-neutral-900 hover:bg-neutral-100'
        }`}
      >
        {label}
      </button>
    )
  }
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-[42px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${FOCUS} ${
        selected ? 'bg-brand-500 text-white' : 'text-neutral-900 hover:bg-neutral-100'
      }`}
    >
      {icon !== undefined && (
        <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center ${selected ? '' : 'text-neutral-600'}`}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-[18px]">{label}</span>
        {description !== undefined && (
          <span className={`mt-0.5 block truncate text-[13px] leading-4 ${selected ? 'text-white/85' : 'text-neutral-600'}`}>
            {description}
          </span>
        )}
      </span>
    </button>
  )
}
