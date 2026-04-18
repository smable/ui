import { useState, useEffect, type ReactNode } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type ColumnFiltersState,
  type VisibilityState,
  type ColumnOrderState,
  type OnChangeFn,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, GripVertical, Columns3, Eye, Check, X } from 'lucide-react'
import clsx from 'clsx'
import { DataTableExport, type ExportFormat } from './DataTableExport'
import { normalize } from '../lib/search'

function DefaultColumnFilter({ column }: { column: any }) {
  const value = (column.getFilterValue() ?? '') as string
  return (
    <input
      type="text"
      value={value}
      onChange={e => column.setFilterValue(e.target.value || undefined)}
      placeholder="Filtr..."
      className="w-full h-8 px-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-transparent transition-colors"
    />
  )
}

// ============================================================================
// Props
// ============================================================================

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  globalFilter?: string
  pageSize?: number

  // Selection
  selectable?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>

  // Column reorder (drag & drop)
  draggableColumns?: boolean
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: (order: ColumnOrderState) => void

  // Column visibility
  columnToggle?: boolean
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>

  // Column filters
  filterable?: boolean
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  showColumnFilters?: boolean
  onShowColumnFiltersChange?: (show: boolean) => void
  renderColumnFilter?: (column: any, facetedValues: Map<any, number>) => ReactNode

  // Row behavior
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string | undefined

  // Fixed layout
  fixedLayout?: boolean

  // Export
  exportable?: boolean
  exportFilename?: string
  exportTitle?: string
  exportFormats?: ('csv' | 'excel' | 'pdf' | 'print')[]

  // Empty state
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string

  // Toolbar (extra content before table)
  toolbar?: ReactNode

  // Table instance ref (for external access, e.g. DataTableExport in header)
  tableRef?: (table: any) => void
}

// ============================================================================
// Component
// ============================================================================

export function DataTable<T>({
  data,
  columns,
  globalFilter,
  pageSize = 20,
  selectable = false,
  rowSelection: externalRowSelection,
  onRowSelectionChange: externalOnRowSelectionChange,
  draggableColumns = false,
  columnOrder: externalColumnOrder,
  onColumnOrderChange,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange,
  columnFilters: externalColumnFilters,
  onColumnFiltersChange,
  showColumnFilters = false,
  renderColumnFilter,
  onRowClick,
  rowClassName,
  fixedLayout = false,
  columnToggle = false,
  onShowColumnFiltersChange,
  exportable = false,
  exportFilename = 'export',
  exportTitle,
  exportFormats,
  emptyIcon,
  filterable = false,
  emptyTitle = 'Žádné záznamy',
  emptyDescription,
  toolbar,
  tableRef,
}: DataTableProps<T>) {
  // Auto-prepend select column if selectable
  const allColumns = selectable
    ? [
        {
          id: 'select',
          size: 50,
          enableSorting: false,
          header: ({ table: t }: any) => (
            <input
              type="checkbox"
              checked={t.getIsAllRowsSelected()}
              onChange={t.getToggleAllRowsSelectedHandler()}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
            />
          ),
          cell: ({ row }: any) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
            />
          ),
        } as ColumnDef<T, unknown>,
        ...columns,
      ]
    : columns

  // Internal state (used when external not provided)
  const [sorting, setSorting] = useState<SortingState>([])
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({})
  const [internalColumnOrder, setInternalColumnOrder] = useState<ColumnOrderState>([])
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [internalShowFilters, setInternalShowFilters] = useState(false)
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)

  const rowSelectionState = externalRowSelection ?? internalSelection
  const setRowSelection = externalOnRowSelectionChange ?? setInternalSelection
  const columnOrderState = externalColumnOrder ?? internalColumnOrder
  const setColumnOrder = onColumnOrderChange ?? setInternalColumnOrder
  const columnFiltersState = externalColumnFilters ?? internalColumnFilters
  const setColumnFilters = onColumnFiltersChange ?? setInternalColumnFilters
  const isShowFilters = showColumnFilters !== undefined ? showColumnFilters : internalShowFilters
  const toggleShowFilters = () => {
    if (onShowColumnFiltersChange) {
      onShowColumnFiltersChange(!isShowFilters)
    } else {
      setInternalShowFilters(prev => !prev)
    }
  }
  const hasActiveFilters = columnFiltersState.length > 0

  const table = useReactTable<T>({
    data,
    columns: allColumns as ColumnDef<T, unknown>[],
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
    state: {
      sorting,
      globalFilter,
      ...(selectable ? { rowSelection: rowSelectionState } : {}),
      ...(draggableColumns ? { columnOrder: columnOrderState } : {}),
      columnVisibility: externalColumnVisibility ?? internalColumnVisibility,
      ...(filterable ? { columnFilters: columnFiltersState } : {}),
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      const value = row.getValue(columnId)
      if (value === null || value === undefined) return false
      const normalizedValue = normalize(String(value))
      const terms = normalize(String(filterValue)).split(/\s+/).filter(Boolean)
      return terms.some(term => normalizedValue.includes(term))
    },
    onSortingChange: setSorting,
    onRowSelectionChange: selectable ? setRowSelection : undefined,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalColumnVisibility,
    onColumnFiltersChange: filterable ? setColumnFilters : undefined,
    enableRowSelection: selectable,
    enableColumnFilters: filterable,
    filterFns: {
      smart: (row, columnId, filterValue) => {
        if (!filterValue) return true
        const value = row.getValue(columnId)
        if (value === null || value === undefined) return false
        return normalize(String(value)).includes(normalize(String(filterValue)))
      },
    },
    defaultColumn: filterable ? { filterFn: 'smart' as any } : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(filterable ? {
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
    } : {}),
  })

  // Expose table instance (only on mount/data change)
  useEffect(() => {
    if (tableRef) tableRef(table)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex
  const filteredCount = table.getFilteredRowModel().rows.length
  const showPagination = filteredCount > pageSize

  // Drag & drop handlers
  const handleDragStart = (columnId: string, e: React.DragEvent) => {
    setDraggedColumn(columnId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', columnId)
  }

  const handleDragOver = (columnId: string, e: React.DragEvent) => {
    if (!draggedColumn || draggedColumn === columnId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (columnId: string, e: React.DragEvent) => {
    if (!draggedColumn) return
    e.preventDefault()
    const fromId = draggedColumn
    const toId = columnId
    if (fromId === toId) return

    const currentOrder = table.getAllLeafColumns().map(col => col.id)
    const fromIndex = currentOrder.indexOf(fromId)
    const toIndex = currentOrder.indexOf(toId)

    if (fromIndex !== -1 && toIndex !== -1) {
      const newOrder = [...currentOrder]
      newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, fromId)
      setColumnOrder(newOrder)
    }
    setDraggedColumn(null)
  }

  return (
    <>
      {/* Toolbar — above the table */}
      {(toolbar || exportable || filterable || columnToggle) && (
        <div className="flex items-center gap-2 mb-4">
          {toolbar}
          {/* More filters toggle */}
          {filterable && (
              <>
                <button
                  onClick={() => toggleShowFilters()}
                  className={clsx(
                    "inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-xl border transition-all",
                    isShowFilters
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent"
                      : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                  )}
                >
                  <Columns3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Více filtrů</span>
                  {hasActiveFilters && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-brand-600 text-white rounded-full">
                      {columnFiltersState.length}
                    </span>
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={() => setColumnFilters([])}
                    className="inline-flex items-center gap-1 h-9 px-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                    title="Zrušit filtry"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {/* Column visibility toggle */}
            {columnToggle && (
              <>
                {filterable && (
                  <div className="hidden sm:block w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
                )}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowColumnMenu(!showColumnMenu)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Sloupce</span>
                  </button>
                  {showColumnMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowColumnMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                        <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Zobrazit sloupce</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto py-1">
                          {table.getAllLeafColumns()
                            .filter(col => col.id !== 'select' && col.id !== 'actions')
                            .map(col => {
                              const isVisible = col.getIsVisible()
                              const header = col.columnDef.header
                              const label = typeof header === 'string' ? header : col.id
                              return (
                                <label
                                  key={col.id}
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                                  onClick={() => col.toggleVisibility(!isVisible)}
                                >
                                  <div
                                    className={clsx(
                                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                      isVisible
                                        ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white"
                                        : "border-neutral-300 dark:border-neutral-600"
                                    )}
                                  >
                                    {isVisible && <Check className="w-3 h-3 text-white dark:text-neutral-900" />}
                                  </div>
                                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                                </label>
                              )
                            })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Export */}
            {exportable && (
              <>
                {(filterable || columnToggle) && (
                  <div className="hidden sm:block w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
                )}
                <DataTableExport
                  table={table}
                  filename={exportFilename}
                  title={exportTitle}
                  formats={exportFormats as ExportFormat[]}
                />
              </>
            )}
        </div>
      )}

    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full" style={fixedLayout ? { tableLayout: 'fixed' } : undefined}>
          {/* Header */}
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-neutral-100 dark:border-neutral-800">
                {headerGroup.headers.map(header => {
                  const canDrag = draggableColumns && header.column.id !== 'select' && header.column.id !== 'actions'
                  return (
                    <th
                      key={header.id}
                      className={clsx(
                        "px-4 py-3.5 text-left first:pl-6 last:pr-6 bg-neutral-50/80 dark:bg-neutral-800/40 transition-all group",
                        draggedColumn === header.column.id && "opacity-50 bg-brand-100 dark:bg-brand-900/30",
                        canDrag && draggedColumn && draggedColumn !== header.column.id && "border-l-2 border-transparent hover:border-brand-500"
                      )}
                      style={fixedLayout ? { width: header.getSize(), minWidth: header.getSize() } : (header.getSize() !== 150 ? { width: header.getSize() } : undefined)}
                      draggable={canDrag}
                      onDragStart={canDrag ? (e) => handleDragStart(header.column.id, e) : undefined}
                      onDragOver={canDrag ? (e) => handleDragOver(header.column.id, e) : undefined}
                      onDrop={canDrag ? (e) => handleDrop(header.column.id, e) : undefined}
                      onDragEnd={canDrag ? () => setDraggedColumn(null) : undefined}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={clsx(
                            "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500",
                            header.column.getCanSort() && "cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                          )}
                        >
                          {canDrag && (
                            <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-40 hover:!opacity-100 cursor-grab active:cursor-grabbing flex-shrink-0 -ml-1" />
                          )}
                          <span onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="ml-0.5">
                                {{
                                  asc: <ChevronUp className="w-3.5 h-3.5 text-brand-500" />,
                                  desc: <ChevronDown className="w-3.5 h-3.5 text-brand-500" />,
                                }[header.column.getIsSorted() as string] ?? (
                                  <ChevronsUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}

            {/* Column Filters Row */}
            {filterable && isShowFilters && (
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-amber-50/50 dark:bg-amber-950/20">
                {table.getHeaderGroups()[0]?.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 first:pl-6 last:pr-6"
                    style={fixedLayout ? { width: header.getSize(), minWidth: header.getSize() } : undefined}
                  >
                    {header.column.getCanFilter() ? (
                      renderColumnFilter
                        ? renderColumnFilter(header.column, header.column.getFacetedUniqueValues())
                        : <DefaultColumnFilter column={header.column} />
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          {/* Body */}
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    {emptyIcon && (
                      <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 text-neutral-400">
                        {emptyIcon}
                      </div>
                    )}
                    <p className="text-neutral-900 dark:text-white font-medium mb-1">{emptyTitle}</p>
                    {emptyDescription && (
                      <p className="text-sm text-neutral-500">{emptyDescription}</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={clsx(
                    "group transition-all duration-200",
                    onRowClick && "cursor-pointer",
                    selectable && row.getIsSelected()
                      ? "bg-brand-50 dark:bg-brand-950/40"
                      : onRowClick && "hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40",
                    index !== table.getRowModel().rows.length - 1 && "border-b border-neutral-100 dark:border-neutral-800/50",
                    rowClassName?.(row.original)
                  )}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, input, a')) return
                    onRowClick?.(row.original)
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 first:pl-6 last:pr-6"
                      style={fixedLayout ? { width: cell.column.getSize(), minWidth: cell.column.getSize() } : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">
              Zobrazeno{' '}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {currentPage * table.getState().pagination.pageSize + 1}–{Math.min((currentPage + 1) * table.getState().pagination.pageSize, filteredCount)}
              </span>{' '}
              z <span className="font-medium text-neutral-700 dark:text-neutral-300">{filteredCount}</span>
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="h-8 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-600 dark:text-neutral-400"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} položek</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={clsx(
                "inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all",
                table.getCanPreviousPage()
                  ? "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  : "text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {pageCount > 0 && Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                let pageNum: number
                if (pageCount <= 5) {
                  pageNum = i
                } else if (currentPage < 3) {
                  pageNum = i
                } else if (currentPage > pageCount - 4) {
                  pageNum = pageCount - 5 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => table.setPageIndex(pageNum)}
                    className={clsx(
                      "w-9 h-9 text-sm font-medium rounded-xl transition-all",
                      currentPage === pageNum
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    )}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={clsx(
                "inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all",
                table.getCanNextPage()
                  ? "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  : "text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
