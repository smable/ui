// Čistá logika skeletonu DataTable — bez importů, aby šla testovat přímo v node.

/**
 * Počet skeletonových řádků při `loading`: výslovný `requested`, jinak tolik, kolik řádků je
 * právě na stránce (při načítání další stránky tabulka neposkočí), jinak 5 (nejvýš velikost stránky).
 */
export function skeletonRowCount(requested: number | undefined, pageRows: number, pageSize: number): number {
  if (requested !== undefined && Number.isFinite(requested)) return Math.max(1, Math.floor(requested))
  if (pageRows > 0) return pageRows
  return Math.max(1, Math.min(5, pageSize))
}

const WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6'] as const

/** Šířka pruhu v buňce — střídá se po řádcích i sloupcích, aby skeleton nevypadal jako mřížka. */
export function skeletonBarWidth(row: number, column: number): string {
  return WIDTHS[(row + column) % WIDTHS.length]
}
