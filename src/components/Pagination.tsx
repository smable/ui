import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  limitOptions?: number[]
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [20, 50, 100],
}: PaginationProps) {
  if (total === 0) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-500">
          Zobrazeno{' '}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{from}–{to}</span>
          {' '}z{' '}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{total}</span>
        </span>
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-600 dark:text-neutral-400"
          >
            {limitOptions.map(opt => (
              <option key={opt} value={opt}>{opt} položek</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={clsx(
            'inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors',
            page === 1
              ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="px-3 text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={clsx(
            'inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors',
            page === totalPages
              ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
