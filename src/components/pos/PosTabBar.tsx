export interface PosTabBarProps<T extends string> {
  tabs: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** Přes celou šířku rodiče, záložky stejně široké (pokladna na výšku, Figma T4/T10). */
  fluid?: boolean
}

/** Hlavní záložky pokladny (Pokladna / Transakce / Uzávěrka / Nastavení) — teal pilulka jako Air. */
export function PosTabBar<T extends string>({ tabs, value, onChange, fluid = false }: PosTabBarProps<T>) {
  return (
    <div role="tablist" className={`${fluid ? 'flex w-full' : 'inline-flex'} gap-0.5 rounded-full bg-neutral-200 p-1`}>
      {tabs.map((tab) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={`relative before:absolute before:inset-x-0 before:-inset-y-1 rounded-full ${fluid ? 'min-w-0 flex-1 px-1' : 'px-[18px]'} py-2 text-[15px] leading-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              selected ? 'bg-brand-500 font-semibold text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {fluid ? <span className="block truncate">{tab.label}</span> : tab.label}
          </button>
        )
      })}
    </div>
  )
}
