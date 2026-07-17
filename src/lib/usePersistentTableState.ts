/**
 * usePersistentTableState — persistence stavu TanStack tabulky do localStorage.
 *
 * Klíč: `smable:table:{persistKey}`. Persistuje sorting, columnVisibility,
 * columnOrder a pageSize. Hydratace je lazy (useState initializer — žádný
 * flash defaultního stavu), SSR-safe (guard na `typeof window`) a odolná
 * proti rozbitému JSON i quota chybám (private mode).
 *
 * Drift: uložený stav může odkazovat na sloupce, které už neexistují.
 * TanStack Table neznámá column id v sorting/columnOrder/columnVisibility
 * sám tiše ignoruje; pokud chceš uložený stav navíc pročistit už při
 * hydrataci, předej `knownColumnIds`. Payload nese `v: 1` pro budoucí
 * invalidaci formátu (jiná verze = stav se zahodí).
 *
 * Použití v DataTable: prop `persistKey` (hook se použije interně).
 * Standalone (vlastní TanStack instance, např. ItemList):
 *
 *   const persisted = usePersistentTableState('items', { defaultPageSize: 50 })
 *   const table = useReactTable({
 *     state: {
 *       sorting: persisted.sorting,
 *       columnVisibility: persisted.columnVisibility,
 *       columnOrder: persisted.columnOrder,
 *       pagination,
 *     },
 *     onSortingChange: persisted.onSortingChange,
 *     onColumnVisibilityChange: persisted.onColumnVisibilityChange,
 *     onColumnOrderChange: persisted.onColumnOrderChange,
 *     ...
 *   })
 *   // pageSize: inicializuj pagination z persisted.pageSize a při změně
 *   // velikosti stránky zavolej persisted.onPageSizeChange(next.pageSize)
 *
 * `persistKey` musí být stabilní po celý život komponenty (změna za běhu
 * nerehydratuje). `persistKey === undefined` → hook funguje jako obyčejný
 * state bez persistence.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  ColumnOrderState,
  OnChangeFn,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

const STORAGE_PREFIX = 'smable:table:'
const STORAGE_VERSION = 1
const DEFAULT_PAGE_SIZE = 20

export interface UsePersistentTableStateOptions {
  defaultSorting?: SortingState
  defaultColumnVisibility?: VisibilityState
  defaultColumnOrder?: ColumnOrderState
  /** Výchozí velikost stránky (default 20). */
  defaultPageSize?: number
  /**
   * Pokud je zadáno, uložené položky odkazující na jiná column id se při
   * hydrataci zahodí. Bez toho se stale id nechávají na TanStack Table,
   * který je ignoruje sám.
   */
  knownColumnIds?: string[]
}

export interface UsePersistentTableStateResult {
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  columnVisibility: VisibilityState
  onColumnVisibilityChange: OnChangeFn<VisibilityState>
  columnOrder: ColumnOrderState
  onColumnOrderChange: OnChangeFn<ColumnOrderState>
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
  /** Smaže persistovaný záznam a vrátí stav na defaulty. */
  reset: () => void
}

interface PersistedSnapshot {
  sorting: SortingState | null
  columnVisibility: VisibilityState | null
  columnOrder: ColumnOrderState | null
  pageSize: number | null
}

function sanitizeSorting(value: unknown, knownIds?: string[]): SortingState | null {
  if (!Array.isArray(value)) return null
  const entries: SortingState = []
  for (const e of value) {
    if (!e || typeof e !== 'object') continue
    const { id, desc } = e as { id?: unknown; desc?: unknown }
    if (typeof id !== 'string' || typeof desc !== 'boolean') continue
    if (knownIds && !knownIds.includes(id)) continue
    entries.push({ id, desc })
  }
  return entries
}

function sanitizeVisibility(value: unknown, knownIds?: string[]): VisibilityState | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const out: VisibilityState = {}
  for (const [id, visible] of Object.entries(value as Record<string, unknown>)) {
    if (typeof visible !== 'boolean') continue
    if (knownIds && !knownIds.includes(id)) continue
    out[id] = visible
  }
  return out
}

function sanitizeOrder(value: unknown, knownIds?: string[]): ColumnOrderState | null {
  if (!Array.isArray(value)) return null
  const ids = value.filter((id): id is string => typeof id === 'string')
  return knownIds ? ids.filter(id => knownIds.includes(id)) : ids
}

function sanitizePageSize(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : null
}

function readPersistedState(
  storageKey: string | undefined,
  knownIds?: string[],
): PersistedSnapshot | null {
  if (!storageKey || typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if ((parsed as { v?: unknown }).v !== STORAGE_VERSION) return null
    const p = parsed as Record<string, unknown>
    return {
      sorting: sanitizeSorting(p.sorting, knownIds),
      columnVisibility: sanitizeVisibility(p.columnVisibility, knownIds),
      columnOrder: sanitizeOrder(p.columnOrder, knownIds),
      pageSize: sanitizePageSize(p.pageSize),
    }
  } catch {
    return null
  }
}

export function usePersistentTableState(
  persistKey: string | undefined,
  options: UsePersistentTableStateOptions = {},
): UsePersistentTableStateResult {
  // Options are read once (hydration + reset defaults); persistKey must be stable.
  const optionsRef = useRef(options)
  const storageKey = persistKey ? STORAGE_PREFIX + persistKey : undefined

  const [initial] = useState(() =>
    readPersistedState(storageKey, optionsRef.current.knownColumnIds),
  )

  const [sorting, setSorting] = useState<SortingState>(
    () => initial?.sorting ?? optionsRef.current.defaultSorting ?? [],
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => initial?.columnVisibility ?? optionsRef.current.defaultColumnVisibility ?? {},
  )
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    () => initial?.columnOrder ?? optionsRef.current.defaultColumnOrder ?? [],
  )
  const [pageSize, setPageSize] = useState<number>(
    () => initial?.pageSize ?? optionsRef.current.defaultPageSize ?? DEFAULT_PAGE_SIZE,
  )

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ v: STORAGE_VERSION, sorting, columnVisibility, columnOrder, pageSize }),
      )
    } catch {
      // quota exceeded / private mode — persistence is best-effort
    }
  }, [storageKey, sorting, columnVisibility, columnOrder, pageSize])

  const reset = useCallback(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(storageKey)
      } catch {
        // ignore
      }
    }
    const o = optionsRef.current
    setSorting(o.defaultSorting ?? [])
    setColumnVisibility(o.defaultColumnVisibility ?? {})
    setColumnOrder(o.defaultColumnOrder ?? [])
    setPageSize(o.defaultPageSize ?? DEFAULT_PAGE_SIZE)
  }, [storageKey])

  return {
    sorting,
    onSortingChange: setSorting,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    columnOrder,
    onColumnOrderChange: setColumnOrder,
    pageSize,
    onPageSizeChange: setPageSize,
    reset,
  }
}
