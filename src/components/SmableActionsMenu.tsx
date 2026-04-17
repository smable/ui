import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, MoreHorizontal } from 'lucide-react'
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
}

export interface SmableActionsMenuProps {
  items: SmableActionItem[]
  label?: string
  size?: SmableButtonSize
  align?: 'left' | 'right'
  className?: string
}

const SIZE: Record<SmableButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
}

export function SmableActionsMenu({
  items,
  label = 'Akce',
  size = 'md',
  align = 'right',
  className,
}: SmableActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
          'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
          'text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
          SIZE[size]
        )}
      >
        <MoreHorizontal className="w-4 h-4" />
        <span>{label}</span>
        <ChevronDown className={clsx('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={clsx(
              'absolute top-full mt-2 min-w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 py-1 z-50',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item, i) => (
              <div key={item.key}>
                {item.divider && i > 0 && (
                  <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                )}
                <button
                  type="button"
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
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
