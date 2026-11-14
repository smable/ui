export type PageWindowItem = number | 'ellipsis-start' | 'ellipsis-end'

/** Počet míst (čísla + výpustky). Stálý, aby tlačítka Předchozí / Další při listování neposkakovala. */
export const PAGE_WINDOW_SLOTS = 7

/**
 * Čísla stránek pro stránkování: první a poslední stránka vždy, okno 5 stránek u kraje,
 * uprostřed aktuální ± 1, mezery jako výpustka. Do 7 stránek se ukážou všechny.
 *
 *   pageWindow(1, 20)  → [1, 2, 3, 4, 5, 'ellipsis-end', 20]
 *   pageWindow(10, 20) → [1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20]
 *   pageWindow(20, 20) → [1, 'ellipsis-start', 16, 17, 18, 19, 20]
 */
export function pageWindow(page: number, totalPages: number): PageWindowItem[] {
  const total = Number.isFinite(totalPages) ? Math.max(0, Math.floor(totalPages)) : 0
  if (total === 0) return []
  const current = Math.min(total, Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)))
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

  if (total <= PAGE_WINDOW_SLOTS) return range(1, total)

  // Okno u kraje: 5 stránek + výpustka + krajní stránka = 7 míst.
  const edge = PAGE_WINDOW_SLOTS - 2
  if (current < edge) return [...range(1, edge), 'ellipsis-end', total]
  if (current > total - edge + 1) return [1, 'ellipsis-start', ...range(total - edge + 1, total)]
  return [1, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total]
}
