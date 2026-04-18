import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'

/**
 * IconSelect — dropdown picker where each option has a square icon +
 * a bold title + a smaller description line. Matches the Square
 * `select.jpg` reference used on the onboarding Business Type step.
 *
 * Behaviour:
 *  - Collapsed field shows the currently selected option the same way
 *    as the dropdown items (icon + title + description) plus a floating
 *    label above the title and a chevron on the right.
 *  - Click toggles the dropdown. Click outside closes it.
 *  - Selecting an option calls onChange(id) and closes the dropdown.
 *
 * This is a controlled component — the caller owns the selected id.
 */
export interface IconSelectOption<Id extends string | number> {
  id: Id
  title: string
  description?: string | null
  Icon?: LucideIcon
}

export interface IconSelectProps<Id extends string | number> {
  /** Floating label above the field (e.g. "Typ podniku") */
  label: string
  /** Placeholder shown when no value is selected */
  placeholder: string
  /** All available options — rendered in order in the dropdown */
  options: IconSelectOption<Id>[]
  /** Currently selected id, or null when nothing is picked yet */
  value: Id | null
  /** Called when the user picks an option */
  onChange: (id: Id) => void
  /** Fallback icon shown when an option doesn't supply one */
  fallbackIcon: LucideIcon
  /** Optional empty-state node rendered when options is empty */
  emptyState?: ReactNode
}

export function IconSelect<Id extends string | number>({
  label,
  placeholder,
  options,
  value,
  onChange,
  fallbackIcon: FallbackIcon,
  emptyState,
}: IconSelectProps<Id>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = value !== null ? options.find((o) => o.id === value) ?? null : null
  const SelectedIcon = selected?.Icon ?? FallbackIcon

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [isOpen])

  const handleSelect = (id: Id) => {
    onChange(id)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Collapsed/closed field */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={clsx(
          'w-full flex items-center gap-4 h-20 px-4 bg-white dark:bg-neutral-900 border-2 rounded-xl text-left transition-colors',
          isOpen
            ? 'border-neutral-900 dark:border-white'
            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
          <SelectedIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
          <p
            className={clsx(
              'text-base truncate',
              selected
                ? 'font-semibold text-neutral-900 dark:text-white'
                : 'text-neutral-400 dark:text-neutral-500'
            )}
          >
            {selected ? selected.title : placeholder}
          </p>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-neutral-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
        )}
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-10 overflow-hidden">
          <div className="max-h-[50vh] overflow-y-auto">
            {options.length === 0 && emptyState}
            {options.map((option, idx) => {
              const Icon = option.Icon ?? FallbackIcon
              const isSelected = value === option.id
              return (
                <button
                  key={String(option.id)}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={clsx(
                    'w-full flex items-start gap-4 px-4 py-4 text-left transition-colors',
                    idx > 0 && 'border-t border-neutral-100 dark:border-neutral-800',
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-semibold text-neutral-900 dark:text-white">{option.title}</p>
                    {option.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
