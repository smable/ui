// Čistá logika rozložení DataTable — bez importů, aby šla testovat přímo v node.
// Třídy jsou celé řetězce: Tailwind konzumenta je hledá v dist/.

export type DataTableAlign = 'left' | 'center' | 'right'

/** Šířka obsahu, pod kterou DataTable s `mobileRow` kreslí místo tabulky seznam. */
export type DataTableMobileBreakpoint = 'sm' | 'md'

const HEADER_TEXT: Record<DataTableAlign, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }
const CELL_TEXT: Record<DataTableAlign, string | undefined> = { left: undefined, center: 'text-center', right: 'text-right' }
const HEADER_JUSTIFY: Record<DataTableAlign, string | undefined> = { left: undefined, center: 'justify-center', right: 'justify-end' }
const SKELETON_BAR: Record<DataTableAlign, string | undefined> = { left: undefined, center: 'mx-auto', right: 'ml-auto' }

/** Zarovnání textu `<th>` hlavičky (výchozí `text-left`). */
export function headerAlignClass(align: DataTableAlign | undefined): string {
  return HEADER_TEXT[align ?? 'left'] ?? HEADER_TEXT.left
}

/** Zarovnání buňky těla, patičky a řádku filtrů; vlevo bez třídy (jako dosud). */
export function cellAlignClass(align: DataTableAlign | undefined): string | undefined {
  return align ? CELL_TEXT[align] : undefined
}

/** Zarovnání flexu uvnitř hlavičky (název + šipka řazení). */
export function headerJustifyClass(align: DataTableAlign | undefined): string | undefined {
  return align ? HEADER_JUSTIFY[align] : undefined
}

/** Posun skeletonového pruhu ke straně, kam se zarovnává obsah sloupce. */
export function skeletonAlignClass(align: DataTableAlign | undefined): string | undefined {
  return align ? SKELETON_BAR[align] : undefined
}

/**
 * Inline šířka buňky. `header` = `<th>` hlavičky, `cell` = buňka těla, skeletonu, patičky
 * a řádku filtrů. Ve `fixedLayout` mají šířku všechny buňky, jinak jen hlavička s nevýchozí
 * velikostí (TanStack default 150). `fill` šířku nedá nikde — sloupec vyplní zbytek tabulky.
 */
export function columnWidthStyle(
  size: number,
  options: { fixedLayout: boolean; fill?: boolean; kind: 'header' | 'cell' },
): { width: number; minWidth?: number } | undefined {
  if (options.fill) return undefined
  if (options.fixedLayout) return { width: size, minWidth: size }
  return options.kind === 'header' && size !== 150 ? { width: size } : undefined
}

export interface DataTablePagerInput {
  manual: boolean
  /** Celkový počet záznamů na serveru (jen `manual`). */
  totalCount?: number
  /** Počet řádků po filtru (klientské stránkování). */
  filteredCount: number
  pageIndex: number
  pageSize: number
  /** `table.getPageCount()`; -1 = neznámý. */
  pageCount: number
}

export interface DataTablePagerState {
  /** Stránka od 1. */
  page: number
  totalPages: number
  total: number
  /** Stránkování je vidět, kdykoli je aspoň jeden záznam (i na jediné stránce — kvůli výběru počtu). */
  visible: boolean
}

/**
 * Props pro knihovní `Pagination` uvnitř DataTable. `null`, když celkový počet není znám
 * (serverové stránkování bez `totalCount`) — pak DataTable použije vestavěné stránkování,
 * které umí „Stránka X z Y“ bez celkového počtu.
 */
export function dataTablePagerState(input: DataTablePagerInput): DataTablePagerState | null {
  const total = input.manual ? input.totalCount : input.filteredCount
  if (total === undefined || !Number.isFinite(total)) return null
  const safeTotal = Math.max(0, Math.floor(total))
  const size = input.pageSize > 0 ? input.pageSize : 1
  const totalPages = input.pageCount > 0 ? input.pageCount : Math.max(1, Math.ceil(safeTotal / size))
  return {
    page: Math.max(0, Math.floor(input.pageIndex)) + 1,
    totalPages,
    total: safeTotal,
    visible: safeTotal > 0,
  }
}

const MOBILE_CLASSES: Record<DataTableMobileBreakpoint, { list: string; table: string }> = {
  sm: { list: 'sm:hidden', table: 'hidden sm:block' },
  md: { list: 'md:hidden', table: 'hidden md:block' },
}

/** Třídy mobilního seznamu (`list`) a obalu tabulky (`table`) pro daný breakpoint. */
export function mobileViewClasses(breakpoint: DataTableMobileBreakpoint | undefined): { list: string; table: string } {
  return MOBILE_CLASSES[breakpoint ?? 'md'] ?? MOBILE_CLASSES.md
}
