/**
 * DataTableDensityMenu — přepínač výšky řádku.
 *
 * Při revizi stovek řádků se hutná hustota vyplatí, při čtení jednotlivých
 * záznamů vzdušná. `normal` je dnešní výška, takže nic nepřeskládá.
 *
 * DataTable ho používá interně (prop `densityToggle`); samostatně:
 *
 *   <DataTableDensityMenu value={density} onChange={setDensity} />
 */

import { useState } from 'react'
import { Rows3, Check } from 'lucide-react'
import clsx from 'clsx'

export type DataTableDensity = 'compact' | 'normal' | 'relaxed'

/** Svislý padding buňky pro danou hustotu. */
export const DENSITY_CELL_CLASS: Record<DataTableDensity, string> = {
  compact: 'py-1.5',
  normal: 'py-4',
  relaxed: 'py-6',
}

const OPTIONS: { value: DataTableDensity; label: string }[] = [
  { value: 'compact', label: 'Hutná' },
  { value: 'normal', label: 'Běžná' },
  { value: 'relaxed', label: 'Vzdušná' },
]

export interface DataTableDensityMenuProps {
  value: DataTableDensity
  onChange: (value: DataTableDensity) => void
  /** Text tlačítka (default „Hustota"). */
  label?: string
  className?: string
}

export function DataTableDensityMenu({
  value,
  onChange,
  label = 'Hustota',
  className,
}: DataTableDensityMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={clsx('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
      >
        <Rows3 className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Výška řádku</p>
            </div>
            {OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={value === option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <span className="w-4 flex-shrink-0">
                  {value === option.value && <Check className="w-3.5 h-3.5 text-brand-500" />}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
