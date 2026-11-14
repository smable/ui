import { cloneElement, isValidElement, useEffect, useRef, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react'
import { Check, ChevronDown, MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'
import type { SmableButtonSize } from './SmableButton'

export interface SmableActionItem {
  key: string
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
  divider?: boolean
  /**
   * Volba ve výběrovém menu (filtr v toolbaru): `true` = vybraná, s fajfkou vpravo.
   * Položka s `selected` (i `false`) má `role="menuitemradio"` a `aria-checked`.
   */
  selected?: boolean
  /** Doplněk vpravo, např. počet. */
  meta?: ReactNode
}

export type SmableActionsMenuTrigger = 'default' | 'icon' | 'toolbar' | ReactNode

export interface SmableActionsMenuProps {
  items: SmableActionItem[]
  /** Text tlačítka a název menu; u `trigger="icon"` jen aria-label. */
  label?: string
  size?: SmableButtonSize
  align?: 'left' | 'right'
  className?: string
  /**
   * Vzhled spouštěče:
   * - `default` — tlačítko s ikonou, textem a šipkou (dosavadní vzhled),
   * - `icon` — jen ikona (kebab v řádku), `label` je aria-label,
   * - `toolbar` — vzhled `DataTableColumnsMenu` (h-9, rounded-xl, okraj), např. filtr,
   * - vlastní element — dostane `onClick`, `aria-haspopup` a `aria-expanded`.
   */
  trigger?: SmableActionsMenuTrigger
  /** Ikona spouštěče. U `default` a `icon` výchozí `MoreHorizontal`, `toolbar` bez ikony. */
  icon?: ReactNode
  /** Zvýraznění spouštěče `toolbar` (aktivní filtr). */
  active?: boolean
  /** Menu pod spouštěčem (výchozí), nebo nad ním (uživatelské menu dole v liště). */
  placement?: 'bottom' | 'top'
  /** Strop výšky panelu (číslo = px), delší seznam se posouvá. Výchozí bez omezení. */
  maxHeight?: number | string
}

const SIZE: Record<SmableButtonSize, string> = {
  xs: 'h-8 px-2.5 text-xs',
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
}

const ICON_SIZE: Record<SmableButtonSize, string> = {
  xs: 'h-8 w-8',
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
}

const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'

type TriggerProps = { onClick?: (e: MouseEvent<HTMLElement>) => void; 'aria-haspopup'?: string; 'aria-expanded'?: boolean }

export function SmableActionsMenu({
  items,
  label = 'Akce',
  size = 'md',
  align = 'right',
  className,
  trigger = 'default',
  icon,
  active = false,
  placement = 'bottom',
  maxHeight,
}: SmableActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const toggle = () => setOpen((v) => !v)
  const triggerIcon = icon ?? <MoreHorizontal className="w-4 h-4" />

  let triggerNode: ReactNode
  if (trigger === 'default') {
    triggerNode = (
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
          'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
          'text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800',
          FOCUS,
          SIZE[size]
        )}
      >
        {triggerIcon}
        <span>{label}</span>
        <ChevronDown className={clsx('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>
    )
  } else if (trigger === 'icon') {
    triggerNode = (
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={clsx(
          'inline-flex flex-shrink-0 items-center justify-center rounded-lg transition-colors',
          'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800',
          open && 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white',
          FOCUS,
          ICON_SIZE[size]
        )}
      >
        {triggerIcon}
      </button>
    )
  } else if (trigger === 'toolbar') {
    triggerNode = (
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={icon ? label : undefined}
        className={clsx(
          'inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-xl border transition-all',
          FOCUS,
          active
            ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800'
            : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
        )}
      >
        {icon}
        {/* S ikonou se text na mobilu schová (jako Sloupce / Hustota), název nese aria-label. */}
        <span className={icon ? 'hidden sm:inline' : undefined}>{label}</span>
        <ChevronDown className={clsx('w-3 h-3 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
    )
  } else if (isValidElement(trigger)) {
    const el = trigger as ReactElement<TriggerProps>
    triggerNode = cloneElement(el, {
      onClick: (e: MouseEvent<HTMLElement>) => {
        el.props.onClick?.(e)
        toggle()
      },
      'aria-haspopup': 'menu',
      'aria-expanded': open,
    })
  } else {
    triggerNode = (
      <button type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open} className={clsx('rounded-lg', FOCUS)}>
        {trigger}
      </button>
    )
  }

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      {triggerNode}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            aria-label={label}
            style={maxHeight !== undefined ? { maxHeight } : undefined}
            className={clsx(
              'absolute min-w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 py-1 z-50',
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
              align === 'right' ? 'right-0' : 'left-0',
              maxHeight !== undefined && 'overflow-y-auto'
            )}
          >
            {items.map((item, i) => {
              const radio = item.selected !== undefined
              return (
                <div key={item.key} role="none">
                  {item.divider && i > 0 && (
                    <div role="separator" className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                  )}
                  <button
                    type="button"
                    role={radio ? 'menuitemradio' : 'menuitem'}
                    aria-checked={radio ? item.selected : undefined}
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick()
                      setOpen(false)
                    }}
                    className={clsx(
                      'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      item.variant === 'danger'
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                        : item.selected
                          ? 'font-medium text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {(radio || item.meta !== undefined) && (
                      <span className="ml-auto flex items-center gap-2 pl-2">
                        {item.meta !== undefined && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">{item.meta}</span>
                        )}
                        {radio && (
                          <Check aria-hidden className={clsx('w-4 h-4 text-brand-600 dark:text-brand-400', !item.selected && 'invisible')} />
                        )}
                      </span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
