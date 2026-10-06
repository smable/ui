/**
 * DataTableBulkSelect — zaškrtávátko v hlavičce s nabídkou výběru.
 *
 * Klik přímo do zaškrtávátka bere **celý filtr** napříč stránkami (to je, co
 * člověk čeká). Šipka vedle nabízí výslovně i jen stránku, u obojího s počtem —
 * jinak se o rozdílu nikdo nedozví a hromadná akce udělá pětinu práce.
 *
 * DataTable ho používá interně (prop `bulkSelectMenu`); stránky s vlastní
 * TanStack instancí ho můžou použít přímo:
 *
 *   <DataTableBulkSelect table={table} />
 *
 * Při serverovém stránkování tabulka zná jen načtenou stránku, takže počet
 * i samotný výběr napříč filtrem musí dodat stránka přes `allFilteredCount`
 * a `onSelectAllFiltered`.
 */

import { useState } from 'react'
import type { Table } from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface DataTableBulkSelectProps<T> {
  table: Table<T>
  /** Počet řádků odpovídajících filtru na serveru (`manualPagination`). */
  allFilteredCount?: number
  /** Výběr napříč filtrem si obstará stránka (`manualPagination`). */
  onSelectAllFiltered?: () => void
  className?: string
}

export function DataTableBulkSelect<T>({
  table,
  allFilteredCount,
  onSelectAllFiltered,
  className,
}: DataTableBulkSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  const pageRows = table.getRowModel().rows.filter(row => row.getCanSelect())
  const filteredRows = table.getFilteredRowModel().rows.filter(row => row.getCanSelect())
  const filteredCount = allFilteredCount ?? filteredRows.length
  // Pravdivé hodnoty, ne klíče — konzument může nechat klíč s `false`.
  const selectedCount = Object.values(table.getState().rowSelection ?? {}).filter(Boolean).length

  const allSelected = table.getIsAllRowsSelected()
  const someSelected = table.getIsSomeRowsSelected()

  const selectAllFiltered = () => {
    if (onSelectAllFiltered) onSelectAllFiltered()
    else table.toggleAllRowsSelected(true)
  }

  return (
    <div className={clsx('flex items-center gap-0.5', className)}>
      <input
        type="checkbox"
        checked={allSelected}
        aria-label="Vybrat vše podle filtru"
        ref={el => {
          if (el) el.indeterminate = !allSelected && someSelected
        }}
        onChange={e => {
          if (e.target.checked) selectAllFiltered()
          else table.toggleAllRowsSelected(false)
        }}
        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
      />

      <div className="relative">
        <button
          type="button"
          aria-label="Volby výběru"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-5 h-6 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div
              role="menu"
              className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-20 py-1"
            >
              <p className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Vybrat
              </p>
              <MenuItem
                label="Stránku"
                hint={`${pageRows.length.toLocaleString('cs-CZ')} položek`}
                disabled={pageRows.length === 0}
                onClick={() => {
                  table.toggleAllPageRowsSelected(true)
                  setIsOpen(false)
                }}
              />
              <MenuItem
                label="Vše podle filtru"
                hint={`${filteredCount.toLocaleString('cs-CZ')} položek`}
                disabled={filteredCount === 0}
                onClick={() => {
                  selectAllFiltered()
                  setIsOpen(false)
                }}
              />
              <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1 mx-2" />
              <MenuItem
                label="Zrušit výběr"
                disabled={selectedCount === 0}
                onClick={() => {
                  table.toggleAllRowsSelected(false)
                  setIsOpen(false)
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MenuItem({
  label,
  hint,
  disabled,
  onClick,
}: {
  label: string
  hint?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'w-full text-left px-3 py-2 text-sm transition-colors',
        disabled
          ? 'text-neutral-400 dark:text-neutral-600 cursor-default'
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
      )}
    >
      {label}
      {hint && <span className="block text-xs text-neutral-500">{hint}</span>}
    </button>
  )
}
