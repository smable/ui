/**
 * DataTableBulkSelect — zaškrtávátko v hlavičce DataTable s nabídkou rozsahu
 * výběru: stránku, vše podle filtru, nebo zrušit výběr — u každé volby s počtem.
 *
 * Nabídka se kreslí portálem do `body` (fixed pozice), protože tabulka ořezává
 * přetečení a absolutně umístěný dropdown by v hlavičce zmizel.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { Checkbox } from './Checkbox'

export interface DataTableBulkSelectProps {
  checked: boolean
  indeterminate: boolean
  /** Zaškrtávátko bez řádků k výběru. */
  disabled?: boolean
  /** Kolik vybratelných řádků je na stránce. */
  pageCount: number
  /** Kolik vybratelných řádků odpovídá filtru; `undefined` = volbu „vše podle filtru" nenabízet. */
  filteredCount?: number
  /** Kolik je vybráno celkem (i mimo stránku). */
  selectedCount: number
  /** Klik přímo do zaškrtávátka (když není plně zaškrtnuté). */
  onToggle: () => void
  onSelectPage: () => void
  onSelectFiltered?: () => void
  onClear: () => void
  labels: {
    checkbox: string
    options: string
    title: string
    page: string
    filtered: string
    clear: string
    count: (n: number) => string
  }
}

export function DataTableBulkSelect({
  checked,
  indeterminate,
  disabled,
  pageCount,
  filteredCount,
  selectedCount,
  onToggle,
  onSelectPage,
  onSelectFiltered,
  onClear,
  labels,
}: DataTableBulkSelectProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 6, left: Math.max(8, r.left - 28) })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  const pick = (fn: () => void) => () => {
    fn()
    setOpen(false)
  }

  const item = 'w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

  return (
    <div className="flex items-center gap-0.5">
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        aria-label={labels.checkbox}
        onChange={() => (checked ? onClear() : onToggle())}
      />
      <button
        ref={triggerRef}
        type="button"
        aria-label={labels.options}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        className="flex items-center justify-center w-5 h-6 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && pos && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-50 min-w-56 py-1 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 normal-case tracking-normal font-normal"
          >
            <p className="px-4 pt-2 pb-1 text-xs font-medium text-neutral-500 uppercase tracking-wider">{labels.title}</p>
            <button type="button" role="menuitem" className={item} disabled={pageCount === 0} onClick={pick(onSelectPage)}>
              <span className="block">{labels.page}</span>
              <span className="block text-xs text-neutral-500">{labels.count(pageCount)}</span>
            </button>
            {filteredCount !== undefined && onSelectFiltered && (
              <button type="button" role="menuitem" className={item} disabled={filteredCount === 0} onClick={pick(onSelectFiltered)}>
                <span className="block">{labels.filtered}</span>
                <span className="block text-xs text-neutral-500">{labels.count(filteredCount)}</span>
              </button>
            )}
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
            <button type="button" role="menuitem" className={item} disabled={selectedCount === 0} onClick={pick(onClear)}>
              {labels.clear}
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
