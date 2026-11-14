import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import clsx from 'clsx'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  clearLabel?: string
  /** Nápověda klávesové zkratky u prázdného pole (např. „⌘K“). Zkratku samotnou obsluhuje konzument přes `ref`. */
  shortcut?: string
  /** Enter v poli (výběr prvního výsledku, odeslání hledání). */
  onEnter?: (value: string) => void
  /** `md` (výchozí) h-10, `sm` h-9. */
  size?: 'sm' | 'md'
  /** Třídy obalu; bez nich zůstává `flex-1 max-w-md`. */
  className?: string
  autoFocus?: boolean
  /** Přístupný název pole, výchozí je `placeholder`. */
  'aria-label'?: string
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    value,
    onChange,
    placeholder = 'Hledat...',
    clearLabel = 'Vymazat hledání',
    shortcut,
    onEnter,
    size = 'md',
    className,
    autoFocus,
    'aria-label': ariaLabel,
  },
  ref
) {
  return (
    <div className={clsx('relative', className ?? 'flex-1 max-w-md')}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onEnter ? e => {
          if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
          e.preventDefault()
          onEnter(value)
        } : undefined}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        autoFocus={autoFocus}
        className={clsx(
          'w-full pl-10 pr-10 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all hover:border-neutral-300 dark:hover:border-neutral-700',
          size === 'sm' ? 'h-9' : 'h-10'
        )}
      />
      {value ? (
        <button type="button"
          aria-label={clearLabel}
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <X className="w-4 h-4" />
        </button>
      ) : shortcut ? (
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center h-5 px-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-sans text-2xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {shortcut}
        </kbd>
      ) : null}
    </div>
  )
})
