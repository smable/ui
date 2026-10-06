import { useState, useEffect, useRef, type ReactNode } from 'react'
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
  type PaginationState,
  type OnChangeFn,
  type Row,
  type Table,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, GripVertical, Columns3, X } from 'lucide-react'
import clsx from 'clsx'
import { DataTableExport, type ExportFormat, type DataTableExportExtraOption } from './DataTableExport'
import { DataTableColumnsMenu } from './DataTableColumnsMenu'
import { DataTableBulkSelect } from './DataTableBulkSelect'
import { DataTableDensityMenu, DATA_TABLE_DENSITY_CLASS, type DataTableDensity, type DataTableDensityLabels } from './DataTableDensityMenu'
import { Checkbox } from './Checkbox'
import { usePersistentTableState, type UsePersistentTableStateOptions } from '../lib/usePersistentTableState'
import { normalize } from '../lib/search'

export interface DataTableLabels {
  selectRow: string
  rowNotSelectable: string
  selectPage: string
  selectFiltered: string
  selectionOptions: string
  selectionMenuTitle: string
  selectionMenuPage: string
  selectionMenuFiltered: string
  clearSelection: string
  itemCount: (n: number) => string
  selectionAnnouncement: (selected: number, total: number) => string
  clearFilters: string
  density: Partial<DataTableDensityLabels>
}

const czItems = (n: number) =>
  `${n.toLocaleString('cs-CZ')} ${n === 1 ? 'položka' : n >= 2 && n <= 4 ? 'položky' : 'položek'}`

const DEFAULT_LABELS: DataTableLabels = {
  selectRow: 'Vybrat řádek',
  rowNotSelectable: 'Řádek nelze vybrat',
  selectPage: 'Vybrat vše na stránce',
  selectFiltered: 'Vybrat vše podle filtru',
  selectionOptions: 'Možnosti výběru',
  selectionMenuTitle: 'Vybrat',
  selectionMenuPage: 'Stránku',
  selectionMenuFiltered: 'Vše podle filtru',
  clearSelection: 'Zrušit výběr',
  itemCount: czItems,
  selectionAnnouncement: (selected, total) => `Vybráno ${selected} z ${czItems(total)}.`,
  clearFilters: 'Zrušit filtry',
  density: {},
}

/** Klik nebo klávesa v ovládacím prvku řádku nesmí zároveň otevřít detail řádku. */
function isInteractiveTarget(el: HTMLElement | null): boolean {
  return !!el?.closest('button, input, a, label, select, textarea, [role="menu"], [role="menuitem"], [role="checkbox"]')
}

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
  /**
   * TanStack column definice. Pokud aspoň jeden viditelný sloupec definuje
   * `footer`, tabulka vyrenderuje `<tfoot>` (součtový řádek) nad stránkovací
   * patičkou — jinak se `<tfoot>` nerenderuje vůbec (zpětná kompatibilita).
   * Footer callback dostává TanStack context (`{ table, column, header }`);
   * součty počítej z `table.getFilteredRowModel().rows` (filtrovaná data
   * před stránkováním = poctivé totály):
   *
   * ```tsx
   * columns: [{ accessorKey: 'revenue', header: 'Tržby',
   *   footer: ({ table }) => czk(table.getFilteredRowModel().rows.reduce((s, r) => s + r.getValue<number>('revenue'), 0)) }]
   * ```
   *
   * Pozn.: při `manualPagination` obsahuje `getFilteredRowModel()` jen
   * načtenou stránku — součet je tedy za stránku, ne za celý dataset.
   * Export (`DataTableExport`) footer NEexportuje (parita s legacy chováním).
   */
  columns: ColumnDef<T, any>[]
  globalFilter?: string
  pageSize?: number

  /**
   * Persistence stavu do localStorage (`smable:table:{persistKey}`):
   * sorting, columnVisibility, columnOrder a pageSize. Hydratace je lazy
   * (bez flashe), SSR-safe, neznámá column id v uloženém stavu se tiše
   * ignorují a payload nese `v: 1` pro budoucí invalidaci.
   *
   * Priorita: explicitní controlled props (`sorting`/`onSortingChange`,
   * `columnVisibility`/`onColumnVisibilityChange`, `columnOrder`/
   * `onColumnOrderChange`, `paginationState`/`onPaginationChange`) mají
   * VŽDY přednost před persistKey — pro daný kus stavu se pak persistence
   * nepoužije (stránka si ji může řešit sama přes usePersistentTableState).
   * Klíč musí být stabilní po celý život komponenty.
   */
  persistKey?: string

  /**
   * Options pro interní usePersistentTableState (defaultSorting,
   * defaultColumnVisibility, defaultColumnOrder, defaultPageSize,
   * knownColumnIds). Použije se JEN spolu s `persistKey` — bez něj se
   * ignoruje. Explicitní fieldy mají přednost před interními defaulty;
   * `defaultPageSize` má jako fallback prop `pageSize`. Controlled props
   * (`columnVisibility`, `sorting`, …) mají dál přednost před celou
   * persistencí — chování se nemění. Options se čtou jen při hydrataci
   * a resetu (musí být stabilní jako persistKey).
   */
  persistOptions?: UsePersistentTableStateOptions

  // Sorting (controlled / server-side)
  /** Server-side řazení — TanStack passthrough; řazení dat dělá server. */
  manualSorting?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>

  // Pagination (controlled / server-side)
  /** Server-side stránkování — `data` je jen aktuální stránka. */
  manualPagination?: boolean
  /** Počet stránek při manualPagination (alternativa: totalCount). */
  pageCount?: number
  /** Celkový počet záznamů na serveru — přesné totály v patičce. */
  totalCount?: number
  paginationState?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>

  // Selection
  selectable?: boolean
  /**
   * Klíče `rowSelection` (a `row.id`). Bez něj je klíčem index řádku v `data`,
   * takže výběr nepřežije přestránkování ani nové načtení dat — u
   * `manualPagination` ho proto předávej vždy.
   */
  getRowId?: (row: T, index: number) => string
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /** Které řádky jdou vybrat — ostatní mají zaškrtávátko zakázané s vysvětlením. */
  canSelectRow?: (row: T) => boolean
  /** Co vybere zaškrtávátko v hlavičce: vše podle filtru (napříč stránkami), nebo jen stránku. */
  selectionScope?: 'filter' | 'page'
  /** Šipka u zaškrtávátka v hlavičce s volbami Stránku / Vše podle filtru / Zrušit výběr. */
  bulkSelectMenu?: boolean
  /** Shift + klik označí rozsah řádků na stránce. */
  rangeSelect?: boolean
  /**
   * Při `manualPagination` zná tabulka jen načtenou stránku. Kolik řádků
   * odpovídá filtru (default `totalCount`) a jak je vybrat, musí dodat stránka —
   * výsledek čeká v `rowSelection`. Bez `onSelectAllFiltered` se nabízí jen stránka.
   */
  allFilteredCount?: number
  onSelectAllFiltered?: () => void
  /** Hlásit změnu výběru čtečce obrazovky (`aria-live`). */
  announceSelection?: boolean

  // Display
  /** Hlavička drží při svislém posunu; výšku těla omezuje `maxBodyHeight`. */
  stickyHeader?: boolean
  maxBodyHeight?: string
  /** Výška řádku; `normal` = dosavadní vzhled. */
  density?: DataTableDensity
  onDensityChange?: (density: DataTableDensity) => void
  /** Přepínač hustoty v liště nad tabulkou. */
  densityToggle?: boolean

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
  /** Extra položky export menu (pod vestavěnými formáty) — viz DataTableExport. */
  exportExtraOptions?: DataTableExportExtraOption[]
  /**
   * Načte PŮVODNÍ row objekty (typ `T`) VŠECH stránek pro export — použij
   * u `manualPagination` tabulek, kde `data` (a row model) drží jen načtenou
   * serverovou stránku a vestavěný export by jinak exportoval jen ji.
   * Passthrough do `DataTableExport` (prop `fetchAllRows`) — detail chování
   * (loading stav, extrakce hodnot, propagace chyb) viz tam. Bez tohoto
   * propu je chování exportu beze změny (BC). Pozor: PDF/tisk s desítkami
   * tisíc řádků je pomalý (jspdf-autotable) — zodpovědnost volajícího.
   */
  exportFetchAllRows?: () => Promise<T[]>

  // Empty state
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  /**
   * Prázdno kvůli filtru je jiná situace než prázdná data. Default: aktivní
   * `globalFilter` nebo sloupcový filtr nad neprázdnými daty. Filtry, které
   * dělá server, musí ohlásit stránka.
   */
  hasFilters?: boolean
  /** Titulek/popis prázdného stavu podle filtru (default `emptyTitle`/`emptyDescription`). */
  emptyFilteredTitle?: string
  emptyFilteredDescription?: string
  /** Tlačítko „Zrušit filtry" v prázdném stavu; bez něj se nabídne jen u sloupcových filtrů. */
  onClearFilters?: () => void

  /** Texty výběru, hustoty a prázdného stavu — pro konzumenty v jiném jazyce než čeština. */
  labels?: Partial<DataTableLabels>

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
  persistKey,
  persistOptions,
  manualSorting = false,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  manualPagination = false,
  pageCount: externalPageCount,
  totalCount,
  paginationState: externalPagination,
  onPaginationChange: externalOnPaginationChange,
  selectable = false,
  getRowId,
  rowSelection: externalRowSelection,
  onRowSelectionChange: externalOnRowSelectionChange,
  canSelectRow,
  selectionScope = 'filter',
  bulkSelectMenu = true,
  rangeSelect = true,
  allFilteredCount,
  onSelectAllFiltered,
  announceSelection = true,
  stickyHeader = false,
  maxBodyHeight = '60vh',
  density: externalDensity,
  onDensityChange,
  densityToggle = false,
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
  exportExtraOptions,
  exportFetchAllRows,
  emptyIcon,
  filterable = false,
  emptyTitle = 'Žádné záznamy',
  emptyDescription,
  hasFilters,
  emptyFilteredTitle,
  emptyFilteredDescription,
  onClearFilters,
  labels: labelOverrides,
  toolbar,
  tableRef,
}: DataTableProps<T>) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides }
  const [internalDensity, setInternalDensity] = useState<DataTableDensity>('normal')
  const density = externalDensity ?? internalDensity
  const setDensity = onDensityChange ?? setInternalDensity
  const cellPadding = DATA_TABLE_DENSITY_CLASS[density]
  // Kotva pro Shift + klik — id naposledy přepnutého řádku.
  const lastToggledRef = useRef<string | null>(null)

  // Auto-prepend select column if selectable
  const allColumns = selectable
    ? [
        {
          id: 'select',
          size: bulkSelectMenu ? 64 : 50,
          enableSorting: false,
          enableHiding: false,
          header: ({ table: t }: { table: Table<T> }) => {
            const pageRows = t.getRowModel().rows.filter(r => r.getCanSelect())
            const filteredRows = t.getFilteredRowModel().rows.filter(r => r.getCanSelect())
            const selectedTotal = Object.values(t.getState().rowSelection).filter(Boolean).length
            // Při serverovém stránkování zná řádky filtru jen stránka.
            const filterTotal = manualPagination ? (allFilteredCount ?? totalCount) : filteredRows.length
            const canSelectFiltered = !manualPagination || (!!onSelectAllFiltered && filterTotal !== undefined)
            const scope = selectionScope === 'filter' && canSelectFiltered ? 'filter' : 'page'
            const scopeTotal = scope === 'page' ? pageRows.length : (filterTotal ?? 0)
            const selectedInScope = scope === 'page'
              ? pageRows.filter(r => r.getIsSelected()).length
              : manualPagination ? selectedTotal : filteredRows.filter(r => r.getIsSelected()).length
            const allSelected = scopeTotal > 0 && selectedInScope >= scopeTotal

            const selectPage = () => t.toggleAllPageRowsSelected(true)
            const selectFiltered = () => (manualPagination ? onSelectAllFiltered?.() : t.toggleAllRowsSelected(true))
            const clear = () => t.setRowSelection({})

            if (!bulkSelectMenu) {
              return (
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && selectedInScope > 0}
                  disabled={scopeTotal === 0}
                  aria-label={scope === 'page' ? labels.selectPage : labels.selectFiltered}
                  onChange={() => (allSelected ? clear() : scope === 'page' ? selectPage() : selectFiltered())}
                />
              )
            }
            return (
              <DataTableBulkSelect
                checked={allSelected}
                indeterminate={!allSelected && selectedInScope > 0}
                disabled={scopeTotal === 0}
                pageCount={pageRows.length}
                filteredCount={canSelectFiltered ? filterTotal : undefined}
                selectedCount={selectedTotal}
                onToggle={scope === 'page' ? selectPage : selectFiltered}
                onSelectPage={selectPage}
                onSelectFiltered={canSelectFiltered ? selectFiltered : undefined}
                onClear={clear}
                labels={{
                  checkbox: scope === 'page' ? labels.selectPage : labels.selectFiltered,
                  options: labels.selectionOptions,
                  title: labels.selectionMenuTitle,
                  page: labels.selectionMenuPage,
                  filtered: labels.selectionMenuFiltered,
                  clear: labels.clearSelection,
                  count: labels.itemCount,
                }}
              />
            )
          },
          cell: ({ row, table: t }: { row: Row<T>; table: Table<T> }) => {
            const can = row.getCanSelect()
            return (
              // Zakázané tlačítko nevyvolá tooltip — vysvětlení nese obal.
              <span className="inline-flex" title={can ? undefined : labels.rowNotSelectable}>
                <Checkbox
                  checked={row.getIsSelected()}
                  disabled={!can}
                  aria-label={can ? labels.selectRow : labels.rowNotSelectable}
                  onChange={e => {
                    const from = lastToggledRef.current
                    lastToggledRef.current = row.id
                    const value = !row.getIsSelected()
                    const pageRows = t.getRowModel().rows
                    const a = from ? pageRows.findIndex(r => r.id === from) : -1
                    const b = pageRows.findIndex(r => r.id === row.id)
                    if (!rangeSelect || !e.shiftKey || a === -1 || a === b) {
                      row.toggleSelected(value)
                      return
                    }
                    // Shift + klik: celý rozsah od posledního přepnutého řádku dostane stejný stav.
                    const range = pageRows.slice(Math.min(a, b), Math.max(a, b) + 1)
                    t.setRowSelection(old => {
                      const next = { ...old }
                      range.forEach(r => {
                        if (!r.getCanSelect()) return
                        if (value) next[r.id] = true
                        else delete next[r.id]
                      })
                      return next
                    })
                  }}
                />
              </span>
            )
          },
        } as ColumnDef<T, unknown>,
        ...columns,
      ]
    : columns

  // Internal state — persistent hook doubles as plain state when persistKey
  // is undefined. Explicit controlled props always win over persistKey.
  // persistOptions apply only with persistKey; explicit fields win over the
  // internal defaults, `pageSize` prop stays the defaultPageSize fallback.
  const persistent = usePersistentTableState(
    persistKey,
    persistKey
      ? { ...persistOptions, defaultPageSize: persistOptions?.defaultPageSize ?? pageSize }
      : { defaultPageSize: pageSize },
  )
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({})
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [internalShowFilters, setInternalShowFilters] = useState(false)
  const [internalPagination, setInternalPagination] = useState<PaginationState>(() => ({
    pageIndex: 0,
    pageSize: persistent.pageSize,
  }))
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)

  const sortingState = externalSorting ?? persistent.sorting
  const handleSortingChange: OnChangeFn<SortingState> =
    externalOnSortingChange ?? persistent.onSortingChange
  const rowSelectionState = externalRowSelection ?? internalSelection
  const setRowSelection = externalOnRowSelectionChange ?? setInternalSelection
  const columnOrderState = externalColumnOrder ?? persistent.columnOrder
  const setColumnOrder = onColumnOrderChange ?? persistent.onColumnOrderChange
  // Legacy prop type is (order) => void — resolve TanStack updaters first
  const handleColumnOrderChange: OnChangeFn<ColumnOrderState> = updater => {
    const next = typeof updater === 'function' ? updater(columnOrderState) : updater
    setColumnOrder(next)
  }
  const columnVisibilityState = externalColumnVisibility ?? persistent.columnVisibility
  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> =
    onColumnVisibilityChange ?? persistent.onColumnVisibilityChange
  const columnFiltersState = externalColumnFilters ?? internalColumnFilters
  const setColumnFilters = onColumnFiltersChange ?? setInternalColumnFilters
  const paginationState = externalPagination ?? internalPagination
  const handlePaginationChange: OnChangeFn<PaginationState> = updater => {
    if (externalOnPaginationChange) {
      externalOnPaginationChange(updater)
      return
    }
    const next = typeof updater === 'function' ? updater(paginationState) : updater
    setInternalPagination(next)
    if (next.pageSize !== paginationState.pageSize) {
      persistent.onPageSizeChange(next.pageSize)
    }
  }
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
    state: {
      sorting: sortingState,
      globalFilter,
      pagination: paginationState,
      ...(selectable ? { rowSelection: rowSelectionState } : {}),
      ...(draggableColumns || persistKey ? { columnOrder: columnOrderState } : {}),
      columnVisibility: columnVisibilityState,
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
    manualSorting,
    ...(manualPagination
      ? {
          manualPagination: true,
          autoResetPageIndex: false,
          ...(externalPageCount !== undefined
            ? { pageCount: externalPageCount }
            : totalCount !== undefined
              ? { rowCount: totalCount }
              : { pageCount: -1 }),
        }
      : {}),
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: selectable ? setRowSelection : undefined,
    ...(getRowId ? { getRowId } : {}),
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnOrderChange: handleColumnOrderChange,
    onColumnFiltersChange: filterable ? setColumnFilters : undefined,
    enableRowSelection: selectable && canSelectRow ? row => canSelectRow(row.original) : selectable,
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

  // Footer (<tfoot>) renders only when at least one visible column defines
  // a `footer` — zero markup change for existing consumers otherwise.
  const hasFooter = table
    .getVisibleLeafColumns()
    .some(col => col.columnDef.footer != null)

  const tablePageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex
  const currentPageSize = table.getState().pagination.pageSize
  const filteredCount = table.getFilteredRowModel().rows.length
  const totalRows = manualPagination ? totalCount : filteredCount
  const showPagination = manualPagination
    ? tablePageCount > 1 || tablePageCount === -1
    : filteredCount > pageSize
  const isFiltered = hasFilters ?? (data.length > 0 && (!!globalFilter || hasActiveFilters))
  const clearFilters = onClearFilters ?? (hasActiveFilters && !globalFilter ? () => setColumnFilters([]) : undefined)
  const shownEmptyTitle = isFiltered ? (emptyFilteredTitle ?? emptyTitle) : emptyTitle
  const shownEmptyDescription = isFiltered ? (emptyFilteredDescription ?? emptyDescription) : emptyDescription
  const selectedCount = selectable ? Object.values(rowSelectionState).filter(Boolean).length : 0
  const selectableTotal = manualPagination
    ? (allFilteredCount ?? totalCount ?? table.getRowModel().rows.length)
    : table.getFilteredRowModel().rows.filter(r => r.getCanSelect()).length
  const rangeFrom = currentPage * currentPageSize + 1
  const rangeTo = manualPagination
    ? currentPage * currentPageSize + table.getRowModel().rows.length
    : Math.min((currentPage + 1) * currentPageSize, filteredCount)

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
      {(toolbar || exportable || filterable || columnToggle || densityToggle) && (
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
                <DataTableColumnsMenu table={table} className="hidden sm:block" />
              </>
            )}

            {densityToggle && (
              <>
                {(filterable || columnToggle) && (
                  <div className="hidden sm:block w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
                )}
                <DataTableDensityMenu value={density} onChange={setDensity} labels={labels.density} className="hidden sm:block" />
              </>
            )}

            {/* Export */}
            {exportable && (
              <>
                {(filterable || columnToggle || densityToggle) && (
                  <div className="hidden sm:block w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
                )}
                <DataTableExport
                  table={table}
                  filename={exportFilename}
                  title={exportTitle}
                  formats={exportFormats as ExportFormat[]}
                  extraOptions={exportExtraOptions}
                  fetchAllRows={exportFetchAllRows}
                />
              </>
            )}
        </div>
      )}

    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
      <div
        className={stickyHeader ? "overflow-auto" : "overflow-x-auto"}
        style={stickyHeader ? { maxHeight: maxBodyHeight } : undefined}
      >
        <table className="w-full" style={fixedLayout ? { tableLayout: 'fixed' } : undefined}>
          {/* Header */}
          {/* Lepivá je celá hlavička (i řádek filtrů); pozadí proto musí být neprůhledné. */}
          <thead className={clsx(stickyHeader && "sticky top-0 z-10 shadow-[0_1px_0_rgb(229_229_229)] dark:shadow-[0_1px_0_rgb(38_38_38)]")}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-neutral-100 dark:border-neutral-800">
                {headerGroup.headers.map(header => {
                  const canDrag = draggableColumns && header.column.id !== 'select' && header.column.id !== 'actions'
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                      className={clsx(
                        "px-4 py-3.5 text-left first:pl-6 last:pr-6 transition-all group",
                        stickyHeader ? "bg-neutral-50 dark:bg-neutral-800" : "bg-neutral-50/80 dark:bg-neutral-800/40",
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
              <tr className={clsx("border-b border-neutral-200 dark:border-neutral-800", stickyHeader ? "bg-amber-50 dark:bg-neutral-900" : "bg-amber-50/50 dark:bg-amber-950/20")}>
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
                <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    {emptyIcon && (
                      <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 text-neutral-400">
                        {emptyIcon}
                      </div>
                    )}
                    <p className="text-neutral-900 dark:text-white font-medium mb-1">{shownEmptyTitle}</p>
                    {shownEmptyDescription && (
                      <p className="text-sm text-neutral-500">{shownEmptyDescription}</p>
                    )}
                    {isFiltered && clearFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        {labels.clearFilters}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  // Klikací řádek musí jít otevřít i z klávesnice.
                  tabIndex={onRowClick ? 0 : undefined}
                  className={clsx(
                    "group transition-all duration-200",
                    onRowClick && "cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500",
                    selectable && row.getIsSelected()
                      ? "bg-brand-50 dark:bg-brand-950/40"
                      : onRowClick && "hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40",
                    index !== table.getRowModel().rows.length - 1 && "border-b border-neutral-100 dark:border-neutral-800/50",
                    rowClassName?.(row.original)
                  )}
                  onClick={(e) => {
                    if (isInteractiveTarget(e.target as HTMLElement)) return
                    onRowClick?.(row.original)
                  }}
                  onKeyDown={onRowClick ? (e) => {
                    if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return
                    e.preventDefault()
                    onRowClick(row.original)
                  } : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={clsx("px-4 first:pl-6 last:pr-6", cellPadding)}
                      style={fixedLayout ? { width: cell.column.getSize(), minWidth: cell.column.getSize() } : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {/* Footer (souhrnný řádek) */}
          {hasFooter && (
            <tfoot>
              {table.getFooterGroups().map(footerGroup =>
                footerGroup.headers.some(
                  header => !header.isPlaceholder && header.column.columnDef.footer != null
                ) ? (
                  <tr
                    key={footerGroup.id}
                    className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"
                  >
                    {footerGroup.headers.map(header => (
                      <td
                        key={header.id}
                        colSpan={header.colSpan}
                        className="px-4 py-4 first:pl-6 last:pr-6 font-medium text-neutral-700 dark:text-neutral-300"
                        style={fixedLayout ? { width: header.getSize(), minWidth: header.getSize() } : undefined}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.footer, header.getContext())}
                      </td>
                    ))}
                  </tr>
                ) : null
              )}
            </tfoot>
          )}
        </table>
      </div>

      {announceSelection && selectable && (
        <p className="sr-only" aria-live="polite">
          {selectedCount > 0 ? labels.selectionAnnouncement(selectedCount, selectableTotal) : null}
        </p>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {totalRows !== undefined ? (
              <span className="text-sm text-neutral-500">
                Zobrazeno{' '}
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {rangeFrom}–{rangeTo}
                </span>{' '}
                z <span className="font-medium text-neutral-700 dark:text-neutral-300">{totalRows}</span>
              </span>
            ) : (
              <span className="text-sm text-neutral-500">
                Stránka{' '}
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{currentPage + 1}</span>
                {tablePageCount > 0 && (
                  <>
                    {' '}z <span className="font-medium text-neutral-700 dark:text-neutral-300">{tablePageCount}</span>
                  </>
                )}
              </span>
            )}
            <select
              value={currentPageSize}
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
              {tablePageCount > 0 && Array.from({ length: Math.min(tablePageCount, 5) }, (_, i) => {
                let pageNum: number
                if (tablePageCount <= 5) {
                  pageNum = i
                } else if (currentPage < 3) {
                  pageNum = i
                } else if (currentPage > tablePageCount - 4) {
                  pageNum = tablePageCount - 5 + i
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
