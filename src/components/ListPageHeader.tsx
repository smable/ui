import { Children, Fragment, isValidElement, useEffect, useId, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react'
import { MoreHorizontal, Plus } from 'lucide-react'
import clsx from 'clsx'

interface ListPageHeaderProps {
  title: string
  subtitle?: string
  onAdd?: () => void
  addLabel?: string
  actions?: ReactNode
  moreLabel?: string
}

function countActions(node: ReactNode): number {
  return Children.toArray(node).reduce<number>((sum, child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return sum + countActions((child as ReactElement<{ children?: ReactNode }>).props.children)
    }
    return sum + 1
  }, 0)
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ListPageHeader({
  title,
  subtitle,
  onAdd,
  addLabel = 'Přidat',
  actions,
  moreLabel = 'Další akce',
}: ListPageHeaderProps) {
  const actionCount = countActions(actions)
  const collapse = actionCount > 0 && actionCount + (onAdd ? 1 : 0) >= 2
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const closeAfterAction = (e: ReactMouseEvent) => {
    const target = (e.target as Element).closest('button, a')
    if (!target || target.hasAttribute('aria-haspopup') || target.hasAttribute('aria-expanded')) return
    setOpen(false)
  }

  return (
    <div
      className={clsx(
        'flex gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between',
        collapse ? 'flex-row items-start justify-between gap-3 sm:gap-4' : 'flex-col'
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div ref={rootRef} className="relative flex max-sm:shrink-0 items-center gap-2">
        {actions && (
          <div
            ref={panelRef}
            id={panelId}
            onClick={collapse && open ? closeAfterAction : undefined}
            className={clsx(
              'flex items-center gap-2',
              collapse && [
                'max-sm:absolute max-sm:right-0 max-sm:top-full max-sm:z-50 max-sm:mt-2',
                'max-sm:w-64 max-sm:max-w-[calc(100vw-2rem)] max-sm:flex-col max-sm:items-stretch max-sm:p-2',
                'max-sm:rounded-xl max-sm:border max-sm:border-neutral-200 max-sm:bg-white max-sm:shadow-lg',
                'max-sm:dark:border-neutral-800 max-sm:dark:bg-neutral-900',
                'max-sm:[&>*]:w-full max-sm:[&_button]:w-full max-sm:[&_button]:justify-start max-sm:[&_span.hidden]:inline',
                !open && 'max-sm:hidden',
              ]
            )}
          >
            {actions}
          </div>
        )}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={addLabel}
            className={clsx(
              'inline-flex items-center justify-center gap-2 h-10 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all hover:shadow-lg hover:shadow-neutral-900/10 dark:hover:shadow-white/10 hover:-translate-y-0.5',
              collapse ? 'w-10 sm:w-auto sm:px-5' : 'px-5'
            )}
          >
            <Plus className="w-4 h-4" />
            <span className={collapse ? 'hidden sm:inline' : undefined}>{addLabel}</span>
          </button>
        )}
        {collapse && (
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={moreLabel}
            title={moreLabel}
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls={panelId}
            className={clsx(
              'sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-colors',
              'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              open
                ? 'bg-neutral-100 dark:bg-neutral-800'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
