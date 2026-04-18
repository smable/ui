import { useMemo, useState, type ReactNode } from 'react'
import clsx from 'clsx'

export interface KanbanColumn {
  key: string
  label: string
  /** Tailwind color class for accent dot and count. e.g. 'bg-brand-500 text-brand-600' */
  accent?: string
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumn[]
  items: T[]
  getColumn: (item: T) => string
  getId: (item: T) => string | number
  renderCard: (item: T) => ReactNode
  emptyColumnLabel?: string
  /** Enable drag-and-drop between columns. Calls onMove when a card is dropped into a new column. */
  onMove?: (itemId: string | number, toColumn: string) => void
  /** Optional action area rendered below the header of each column */
  renderColumnHeaderActions?: (column: KanbanColumn) => ReactNode
}

export function KanbanBoard<T>({
  columns,
  items,
  getColumn,
  getId,
  renderCard,
  emptyColumnLabel = 'Žádné položky',
  onMove,
  renderColumnHeaderActions,
}: KanbanBoardProps<T>) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, T[]>()
    columns.forEach((c) => map.set(c.key, []))
    items.forEach((it) => {
      const col = getColumn(it)
      if (map.has(col)) map.get(col)!.push(it)
    })
    return map
  }, [columns, items, getColumn])

  const handleDragStart = (e: React.DragEvent, id: string | number) => {
    e.dataTransfer.setData('text/plain', String(id))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    if (!onMove) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colKey) setDragOverCol(colKey)
  }

  const handleDragLeave = (colKey: string) => {
    if (dragOverCol === colKey) setDragOverCol(null)
  }

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    if (!onMove) return
    e.preventDefault()
    setDragOverCol(null)
    const raw = e.dataTransfer.getData('text/plain')
    if (!raw) return
    const id = /^\d+$/.test(raw) ? Number(raw) : raw
    onMove(id, colKey)
  }

  return (
    <div className="overflow-x-auto -mx-5 px-5 pb-3">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(280px, 1fr))` }}
      >
        {columns.map((col) => {
          const colItems = grouped.get(col.key) ?? []
          const isDropTarget = dragOverCol === col.key
          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={() => handleDragLeave(col.key)}
              onDrop={(e) => handleDrop(e, col.key)}
              className={clsx(
                'flex flex-col rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-transparent transition-colors',
                isDropTarget && 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
              )}
            >
              <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className={clsx('w-2 h-2 rounded-full', col.accent?.split(' ')[0] ?? 'bg-neutral-400')} />
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">{col.label}</span>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-2xs font-medium rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 tabular-nums">
                    {colItems.length}
                  </span>
                </div>
                {renderColumnHeaderActions?.(col)}
              </div>

              <div className="flex-1 p-3 space-y-2 min-h-[120px]">
                {colItems.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-neutral-400 dark:text-neutral-600 text-center">
                    {emptyColumnLabel}
                  </div>
                ) : (
                  colItems.map((it) => {
                    const id = getId(it)
                    return (
                      <div
                        key={id}
                        draggable={!!onMove}
                        onDragStart={(e) => handleDragStart(e, id)}
                        className={clsx(
                          'rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/70 p-3 shadow-sm',
                          onMove && 'cursor-grab active:cursor-grabbing hover:border-brand-300 dark:hover:border-brand-700 transition-colors'
                        )}
                      >
                        {renderCard(it)}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
