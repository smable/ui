export type ColumnDropSide = 'before' | 'after'

/**
 * Where `draggedId` lands next to `targetId` when dropped on it: moving right
 * puts it after the target, moving left before — the same result as `moveColumn`.
 */
export function columnDropSide(order: string[], draggedId: string, targetId: string): ColumnDropSide {
  return order.indexOf(draggedId) < order.indexOf(targetId) ? 'after' : 'before'
}

/** New column order after dropping `draggedId` on `targetId`; unknown ids leave it unchanged. */
export function moveColumn(order: string[], draggedId: string, targetId: string): string[] {
  const from = order.indexOf(draggedId)
  const to = order.indexOf(targetId)
  if (from === -1 || to === -1 || from === to) return order
  const next = [...order]
  next.splice(from, 1)
  next.splice(to, 0, draggedId)
  return next
}
