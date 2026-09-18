export interface PosSegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** Popis pro čtečky obrazovky. */
  label?: string
}

/** Menší přepínač v obsahu (Knihovna / Kalkulačka, 80 mm / 58 mm). */
export function PosSegmentedControl<T extends string>({ options, value, onChange, label }: PosSegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-0.5 rounded-lg bg-neutral-200 p-0.5">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-[7px] px-[18px] py-2 text-[14px] leading-[17px] text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              selected ? 'bg-white font-semibold shadow-sm' : 'hover:bg-neutral-100'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
