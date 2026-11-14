import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { pageWindow } from './pagination-window'

export interface PaginationLabels {
  showing: string
  of: string
  perPage: (limit: number) => string
  previous: string
  next: string
  /** aria-label tlačítka stránky (jen se `showPageNumbers`). */
  page?: (page: number) => string
}

const pageLabel = (page: number) => `Stránka ${page}`

const DEFAULT_LABELS: PaginationLabels = {
  showing: 'Zobrazeno',
  of: 'z',
  perPage: (limit) => `${limit} položek`,
  previous: 'Předchozí stránka',
  next: 'Další stránka',
  page: pageLabel,
}

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  limitOptions?: number[]
  /** Texty komponenty; výchozí jsou česky. */
  labels?: Partial<PaginationLabels>
  /**
   * Tlačítka stránek mezi šipkami (první, poslední a okno kolem aktuální, mezery „…“)
   * místo textu „3 / 12“. Na mobilu zůstává text — sedm tlačítek by se nevešlo.
   */
  showPageNumbers?: boolean
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [20, 50, 100],
  labels,
  showPageNumbers = false,
}: PaginationProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  if (total === 0) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-500">
          {l.showing}{' '}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{from}–{to}</span>
          {' '}{l.of}{'\u00a0'}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{total}</span>
        </span>
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 pl-3 pr-8 text-sm bg-neutral-50 dark:bg-neutral-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-600 dark:text-neutral-400"
          >
            {limitOptions.map(opt => (
              <option key={opt} value={opt}>{l.perPage(opt)}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button type="button"
          aria-label={l.previous}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={clsx(
            'inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            page === 1
              ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className={clsx('px-3 text-sm text-neutral-600 dark:text-neutral-400 tabular-nums', showPageNumbers && 'sm:hidden')}>
          {page} / {totalPages}
        </span>
        {showPageNumbers && (
          <div className="hidden sm:flex items-center gap-1 mx-1">
            {pageWindow(page, totalPages).map(item =>
              typeof item === 'number' ? (
                <button type="button"
                  key={item}
                  aria-label={(l.page ?? pageLabel)(item)}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={() => item !== page && onPageChange(item)}
                  className={clsx(
                    'inline-flex items-center justify-center min-w-9 h-9 px-1 text-sm font-medium rounded-lg tabular-nums transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    item === page
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  {item}
                </button>
              ) : (
                <span key={item} aria-hidden className="inline-flex items-center justify-center w-9 h-9 text-sm text-neutral-400 dark:text-neutral-500">
                  …
                </span>
              )
            )}
          </div>
        )}
        <button type="button"
          aria-label={l.next}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={clsx(
            'inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
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
