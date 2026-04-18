import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface SelectionBarProps {
  count: number
  label?: string
  children: ReactNode
  onClear: () => void
}

export function SelectionBar({ count, label = 'vybráno', children, onClear }: SelectionBarProps) {
  if (count === 0) return null

  return (
    <div className="mb-4 p-3 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-xl flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 text-white text-sm font-bold">
          {count}
        </span>
        <span className="text-sm font-medium text-brand-900 dark:text-brand-100">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {children}
        <button
          onClick={onClear}
          className="p-2 text-brand-500 hover:text-brand-700 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/** Standardní action button pro SelectionBar */
export function SelectionAction({ icon, label, onClick, danger }: {
  icon: ReactNode; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium bg-white dark:bg-brand-900 rounded-lg hover:bg-neutral-50 dark:hover:bg-brand-800 transition-colors shadow-sm ${
        danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-neutral-700 dark:text-brand-100'
      }`}
    >
      {icon}{label}
    </button>
  )
}
