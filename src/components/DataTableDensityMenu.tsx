/**
 * DataTableDensityMenu — přepínač výšky řádku. DataTable ho kreslí sám
 * (prop `densityToggle`); stránky s vlastní lištou ho použijí přímo
 * a výsledek předají do `density`:
 *
 *   <DataTableDensityMenu value={density} onChange={setDensity} />
 */

import { useState } from 'react'
import { Rows3, Check } from 'lucide-react'
import clsx from 'clsx'

export type DataTableDensity = 'compact' | 'normal' | 'relaxed'

/** Svislý padding buňky pro danou hustotu. `normal` je výchozí výška DataTable. */
export const DATA_TABLE_DENSITY_CLASS: Record<DataTableDensity, string> = {
  compact: 'py-2',
  normal: 'py-4',
  relaxed: 'py-6',
}

export interface DataTableDensityLabels {
  button: string
  title: string
  compact: string
  normal: string
  relaxed: string
}

const DEFAULT_LABELS: DataTableDensityLabels = {
  button: 'Hustota',
  title: 'Výška řádku',
  compact: 'Hutná',
  normal: 'Běžná',
  relaxed: 'Vzdušná',
}

export interface DataTableDensityMenuProps {
  value: DataTableDensity
  onChange: (value: DataTableDensity) => void
  labels?: Partial<DataTableDensityLabels>
  /** Extra třídy na wrapper (např. `hidden sm:block`). */
  className?: string
}

export function DataTableDensityMenu({ value, onChange, labels, className }: DataTableDensityMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const l = { ...DEFAULT_LABELS, ...labels }
  const options: DataTableDensity[] = ['compact', 'normal', 'relaxed']

  return (
    <div className={clsx('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={l.button}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
      >
        <Rows3 className="w-4 h-4" />
        <span className="hidden sm:inline">{l.button}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div role="menu" className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{l.title}</p>
            </div>
            {options.map(option => (
              <button
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={value === option}
                onClick={() => { onChange(option); setIsOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <span className="flex w-4 shrink-0 items-center">
                  {value === option && <Check className="w-3.5 h-3.5 text-brand-500" />}
                </span>
                {l[option]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
