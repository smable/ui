import { LayoutGrid, List } from 'lucide-react'
import clsx from 'clsx'

type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
      <button
        onClick={() => onChange('grid')}
        className={clsx(
          'rounded-md p-2 transition-all',
          value === 'grid'
            ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
        )}
        title="Karty"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={clsx(
          'rounded-md p-2 transition-all',
          value === 'list'
            ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
        )}
        title="Tabulka"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}
