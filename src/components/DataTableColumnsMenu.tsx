/**
 * DataTableColumnsMenu — standalone dropdown pro přepínání viditelnosti
 * sloupců (colvis) nad libovolnou TanStack Table instancí.
 *
 * DataTable ho používá interně (prop `columnToggle`); stránky s vlastní
 * TanStack instancí (např. ItemList) ho použijí přímo — stejný vzor jako
 * DataTableExport:
 *
 *   <DataTableColumnsMenu table={table} />
 */

import { useState } from 'react'
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

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
      >
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</p>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {table.getAllLeafColumns()
                .filter(col => !excludeColumnIds.includes(col.id))
                .map(col => {
                  const isVisible = col.getIsVisible()
                  const header = col.columnDef.header
                  const colLabel = typeof header === 'string' ? header : col.id
                  return (
                    <label
                      key={col.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                      onClick={() => col.toggleVisibility(!isVisible)}
                    >
                      <div
                        className={clsx(
                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                          isVisible
                            ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white'
                            : 'border-neutral-300 dark:border-neutral-600',
                        )}
                      >
                        {isVisible && <Check className="w-3 h-3 text-white dark:text-neutral-900" />}
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{colLabel}</span>
                    </label>
                  )
                })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
