import type { ElementType } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import clsx from 'clsx'

export type ViewToggleMode = 'grid' | 'list'

export interface ViewToggleOption<T extends string = ViewToggleMode> {
  value: T
  /** Komponenta ikony (lucide nebo vlastní), dostane `className`. */
  icon: ElementType
  /** Tooltip a aria-label tlačítka. */
  label: string
}

export interface ViewToggleProps<T extends string = ViewToggleMode> {
  value: T
  onChange: (value: T) => void
  /** Popisky výchozích voleb Karty / Tabulka; s `options` se nepoužijí. */
  labels?: { grid: string; list: string }
  /** Vlastní volby (ikona, hodnota, popisek). Bez nich Karty / Tabulka. */
  options?: ViewToggleOption<T>[]
}

export function ViewToggle<T extends string = ViewToggleMode>({
  value,
  onChange,
  labels = { grid: 'Karty', list: 'Tabulka' },
  options,
}: ViewToggleProps<T>) {
  const items = options ?? ([
    { value: 'grid', icon: LayoutGrid, label: labels.grid },
    { value: 'list', icon: List, label: labels.list },
  ] as ViewToggleOption<string>[] as ViewToggleOption<T>[])

  return (
    <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
      {items.map(({ value: optionValue, icon: Icon, label }) => (
        <button type="button"
          key={optionValue}
          onClick={() => onChange(optionValue)}
          className={clsx(
            'rounded-md p-2 transition-all',
            value === optionValue
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          )}
          title={label}
          aria-label={label}
          aria-pressed={value === optionValue}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
