/**
 * DataTableFilterChips — aktivní filtry jako odznaky, každý se křížkem.
 *
 * Proč je v tabulce málo řádků, musí být vidět bez rozklikávání „Více filtrů".
 * Počet v odznaku na tlačítku říká kolik, ne co.
 *
 * DataTable ho používá interně (prop `filterChips`); samostatně:
 *
 *   <DataTableFilterChips table={table} globalFilter={q} onGlobalFilterClear={() => setQ('')} />
 *
 * Odznak pro hledání se zobrazí jen s `onGlobalFilterClear` — hodnotu drží stránka,
 * takže bez callbacku by se nedal zrušit.
 */

import type { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import clsx from 'clsx'

export interface DataTableFilterChipsProps<T> {
  table: Table<T>
  globalFilter?: string
  onGlobalFilterClear?: () => void
  /** Column id vynechaná z odznaků. */
  excludeColumnIds?: string[]
  className?: string
}

function columnLabel(column: any): string {
  const header = column.columnDef?.header
  return typeof header === 'string' ? header : column.id
}

function valueLabel(value: unknown): string {
  if (Array.isArray(value)) return value.filter(v => v != null && v !== '').join(', ')
  if (typeof value === 'boolean') return value ? 'ano' : 'ne'
  return String(value ?? '')
}

export function DataTableFilterChips<T>({
  table,
  globalFilter,
  onGlobalFilterClear,
  excludeColumnIds = ['select', 'actions'],
  className,
}: DataTableFilterChipsProps<T>) {
  const columnFilters = table
    .getState()
    .columnFilters.filter(filter => !excludeColumnIds.includes(filter.id))

  const search = globalFilter?.trim()
  const showSearch = !!search && !!onGlobalFilterClear
  if (columnFilters.length === 0 && !showSearch) return null

  return (
    <div className={clsx('flex flex-wrap items-center gap-2 mb-4 text-sm', className)}>
      <span className="text-neutral-500">Filtr:</span>

      {columnFilters.map(filter => {
        const column = table.getColumn(filter.id)
        const label = valueLabel(filter.value)
        if (!label) return null
        return (
          <Chip
            key={filter.id}
            name={column ? columnLabel(column) : filter.id}
            value={label}
            onClear={() => column?.setFilterValue(undefined)}
          />
        )
      })}

      {showSearch && <Chip name="Hledat" value={search} onClear={onGlobalFilterClear} />}

      <button
        type="button"
        onClick={() => {
          table.resetColumnFilters()
          onGlobalFilterClear?.()
        }}
        className="px-2 py-1 text-sm text-brand-600 dark:text-brand-400 hover:underline"
      >
        Zrušit filtry
      </button>
    </div>
  )
}

function Chip({ name, value, onClear }: { name: string; value: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-full">
      <span className="text-neutral-500">{name}:</span>
      <span className="text-neutral-800 dark:text-neutral-200">{value}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Zrušit filtr ${name}`}
        className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
