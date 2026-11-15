/**
 * DataTableColumnsMenu — standalone dropdown pro přepínání viditelnosti
 * sloupců (colvis) nad libovolnou TanStack Table instancí.
 *
 * DataTable ho používá interně (prop `columnToggle`); stránky s vlastní
 * TanStack instancí (např. ItemList) ho použijí přímo — stejný vzor jako
 * DataTableExport:
 *
 *   <DataTableColumnsMenu table={table} />
 *
 * K tabulce z `DataTable` patří do `toolbar={table => …}` — mimo DataTable
 * (přes `tableRef`) by se po přepnutí sloupce nepřekreslilo.
 */

import { useState, useRef } from 'react'
import { useMenuAlign } from '../lib/useMenuAlign'
import { useOverlay } from './overlay'
import type { Table } from '@tanstack/react-table'
import { Eye, Check } from 'lucide-react'
import clsx from 'clsx'

export interface DataTableColumnsMenuProps<T> {
  table: Table<T>
  /** Text tlačítka (default „Sloupce"). */
  label?: string
  /** Nadpis dropdownu (default „Zobrazit sloupce"). */
  title?: string
  /** Column id vynechaná z menu (default ['select', 'actions']). */
  excludeColumnIds?: string[]
  /** Extra třídy na wrapper (např. `hidden sm:block`). */
  className?: string
}

export function DataTableColumnsMenu<T>({
  table,
  label = 'Sloupce',
  title = 'Zobrazit sloupce',
  excludeColumnIds = ['select', 'actions'],
  className,
}: DataTableColumnsMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const menuAlign = useMenuAlign(isOpen, anchorRef, 224)
  useOverlay(isOpen, { onEscape: () => setIsOpen(false), lockScroll: false })

  return (
    <div ref={anchorRef} className={clsx('relative', className)}>
      <button type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
      >
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div role="menu" aria-label={title} className={clsx('absolute top-full mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden max-w-[calc(100vw-1rem)]', menuAlign === 'left' ? 'left-0' : 'right-0')}>
            <div role="none" className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</p>
            </div>
            <div role="none" className="max-h-64 overflow-y-auto py-1">
              {table.getAllLeafColumns()
                .filter(col => !excludeColumnIds.includes(col.id))
                .map(col => {
                  const isVisible = col.getIsVisible()
                  const header = col.columnDef.header
                  const colLabel = typeof header === 'string' ? header : col.id
                  return (
                    <button
                      type="button"
                      key={col.id}
                      role="menuitemcheckbox"
                      aria-checked={isVisible}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors focus:outline-none focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-800/50"
                      onClick={() => col.toggleVisibility()}
                    >
                      <span
                        aria-hidden
                        className={clsx(
                          'w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors',
                          isVisible
                            ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white'
                            : 'border-neutral-300 dark:border-neutral-600',
                        )}
                      >
                        {isVisible && <Check className="w-3 h-3 text-white dark:text-neutral-900" />}
                      </span>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{colLabel}</span>
                    </button>
                  )
                })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
