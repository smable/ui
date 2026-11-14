import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

export interface StatusTab<T extends string> {
  key: T
  label: string
  /** Počet v odznaku. Bez něj se odznak nevykreslí (záložky, segmentový přepínač). */
  count?: number
  badgeColor?: string
  icon?: ReactNode
}

export interface StatusTabsProps<T extends string> {
  tabs: StatusTab<T>[]
  value: T
  onChange: (value: T) => void
  /** Popis výběru pro čtečky, když se záložky nevejdou a zobrazí se jako `<select>`. */
  label?: string
  /** `md` (výchozí) záložky, `sm` menší segmentový přepínač. */
  size?: 'sm' | 'md'
  /** Roztáhne záložky na celou šířku rodiče, rovným dílem. */
  fullWidth?: boolean
}

const TAB_SIZE = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1 text-xs',
} as const

export function StatusTabs<T extends string>({
  tabs,
  value,
  onChange,
  label = 'Filtr',
  size = 'md',
  fullWidth = false,
}: StatusTabsProps<T>) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  // Záložky, které se nevejdou do šířky rodiče (typicky mobil), by roztáhly celou
  // stránku do strany — místo nich se ukáže výběr se stejnými volbami a počty.
  const [compact, setCompact] = useState(false)
  const tabsKey = tabs.map(tab => `${tab.key}:${tab.label}:${tab.count}`).join('|')

  useLayoutEffect(() => {
    const parent = wrapRef.current?.parentElement
    const measure = measureRef.current
    if (!parent || !measure) return
    const check = () => {
      const style = getComputedStyle(parent)
      const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      setCompact(measure.offsetWidth > available)
    }
    check()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(check)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [tabsKey, size])

  const renderTabs = (interactive: boolean) =>
    tabs.map(tab => (
      <button type="button"
        key={tab.key}
        tabIndex={interactive ? undefined : -1}
        onClick={interactive ? () => onChange(tab.key) : undefined}
        className={clsx(
          // transition-colors místo transition-all aby shadow/bg switch
          // nebyl 150ms blink (vizuální 'posun' při kliknutí).
          'font-medium rounded-md transition-colors whitespace-nowrap',
          TAB_SIZE[size],
          tab.icon !== undefined && 'inline-flex items-center justify-center',
          fullWidth && interactive && 'flex-1',
          value === tab.key
            ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        )}
      >
        {tab.icon !== undefined && (
          <span aria-hidden className="mr-1.5 inline-flex flex-shrink-0">{tab.icon}</span>
        )}
        {tab.label}
        {tab.count !== undefined && (
          <span
            className={clsx(
              'rounded-full tabular-nums',
              size === 'sm' ? 'ml-1.5 px-1.5 text-2xs' : 'ml-2 px-1.5 py-0.5 text-xs',
              value === tab.key && tab.badgeColor
                ? tab.badgeColor
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
            )}
          >
            {tab.count}
          </span>
        )}
      </button>
    ))

  return (
    <div ref={wrapRef} className={clsx('relative max-w-full', compact || fullWidth ? 'flex w-full' : 'inline-flex')}>
      {/* Měřicí kopie v nulovém ořezaném rámečku — sama nesmí stránku rozšířit. */}
      <div aria-hidden className="invisible pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden">
        <div ref={measureRef} className={clsx('inline-flex w-max items-center gap-1', size === 'sm' ? 'p-0.5' : 'p-1')}>
          {renderTabs(false)}
        </div>
      </div>
      {compact ? (
        <div className="relative w-full">
          <select
            value={value}
            aria-label={label}
            onChange={e => onChange(e.target.value as T)}
            className={clsx(
              'w-full appearance-none rounded-lg bg-neutral-100 dark:bg-neutral-800 pl-4 pr-10 font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500',
              size === 'sm' ? 'h-9 text-xs' : 'h-10 text-sm'
            )}
          >
            {tabs.map(tab => (
              <option key={tab.key} value={tab.key}>
                {tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        </div>
      ) : (
        <div
          className={clsx(
            'items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg',
            size === 'sm' ? 'p-0.5' : 'p-1',
            fullWidth ? 'flex w-full' : 'inline-flex'
          )}
        >
          {renderTabs(true)}
        </div>
      )}
    </div>
  )
}
