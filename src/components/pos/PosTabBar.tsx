export interface PosTabBarProps<T extends string> {
  tabs: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/** Hlavní záložky pokladny (Pokladna / Transakce / Uzávěrka) — teal pilulka jako Air. */
export function PosTabBar<T extends string>({ tabs, value, onChange }: PosTabBarProps<T>) {
  return (
    <div role="tablist" className="inline-flex gap-0.5 rounded-full bg-neutral-200 p-1">
      {tabs.map((tab) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={`rounded-full px-[18px] py-2 text-[15px] leading-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              selected ? 'bg-brand-500 font-semibold text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
