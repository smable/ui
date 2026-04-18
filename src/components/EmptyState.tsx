import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  onAdd?: () => void
  addLabel?: string
}

export function EmptyState({ icon, title, description, onAdd, addLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-neutral-300 dark:text-neutral-600">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-medium text-neutral-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
      {onAdd && addLabel && (
        <button
          onClick={onAdd}
          className="mt-4 inline-flex items-center justify-center gap-2 h-10 px-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      )}
    </div>
  )
}
