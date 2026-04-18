import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface BulkActionsBarProps {
  count: number
  label?: (count: number) => string
  children: ReactNode
  onClear: () => void
}

function defaultLabel(count: number): string {
  if (count === 1) return '1 položka vybrána'
  if (count < 5) return `${count} položky vybrány`
  return `${count} položek vybráno`
}

export function BulkActionsBar({ count, label = defaultLabel, children, onClear }: BulkActionsBarProps) {
  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl shadow-2xl">
      <span className="text-sm font-medium">{label(count)}</span>
      <div className="w-px h-5 bg-neutral-700 dark:bg-neutral-300" />
      {children}
      <button
        onClick={onClear}
        className="p-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
