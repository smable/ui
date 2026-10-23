export type SmableAiConversationGroup = 'today' | 'thisWeek' | 'older'

const GROUPS: readonly SmableAiConversationGroup[] = ['today', 'thisWeek', 'older']

/** Půlnoc místního dne, o `daysBack` dní zpět — přes konstruktor, aby přechod na zimní čas neposunul hranici. */
function localMidnight(now: Date, daysBack = 0): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack).getTime()
}

/**
 * Rozdělí konverzace na Dnes / Tento týden / Starší podle místního kalendáře k okamžiku `now`.
 * Prázdné skupiny vynechá, pořadí uvnitř skupiny zachová; neplatné datum spadne do „starší“.
 */
export function groupConversations<T extends { updatedAt: string }>(
  items: T[],
  now: Date,
  weekStartsMonday = true
): Array<{ group: SmableAiConversationGroup; items: T[] }> {
  const day = now.getDay()
  const todayStart = localMidnight(now)
  const weekStart = localMidnight(now, weekStartsMonday ? (day + 6) % 7 : day)

  const buckets: Record<SmableAiConversationGroup, T[]> = { today: [], thisWeek: [], older: [] }
  for (const item of items) {
    const t = new Date(item.updatedAt).getTime()
    const group: SmableAiConversationGroup = t >= todayStart ? 'today' : t >= weekStart ? 'thisWeek' : 'older'
    buckets[group].push(item)
  }

  return GROUPS.filter((group) => buckets[group].length > 0).map((group) => ({ group, items: buckets[group] }))
}
