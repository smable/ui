import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

interface ListPageHeaderProps {
  title: string
  subtitle?: string
  onAdd?: () => void
  addLabel?: string
  actions?: ReactNode
}

export function ListPageHeader({ title, subtitle, onAdd, addLabel = 'Přidat', actions }: ListPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all hover:shadow-lg hover:shadow-neutral-900/10 dark:hover:shadow-white/10 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}
