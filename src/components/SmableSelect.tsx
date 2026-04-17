import { forwardRef, useId, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

/**
 * SmableSelect — floating-label `<select>` matching SmableInput visually.
 * Label stays pinned at the top (selects don't have a true "empty" state).
 *
 * Usage:
 *   <SmableSelect label="Segment" value={segment} onChange={...}>
 *     <option value="">Neurčeno</option>
 *     <option value="gastro">Gastro</option>
 *   </SmableSelect>
 */
export interface SmableSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string
  error?: string
  size?: 'medium' | 'large'
  children: ReactNode
}

export const SmableSelect = forwardRef<HTMLSelectElement, SmableSelectProps>(
  function SmableSelect(
    { label, error, size = 'large', className, id, children, ...rest },
    ref
  ) {
    const autoId = useId()
    const selectId = id ?? `smable-select-${autoId}`

    const sizeClasses =
      size === 'large'
        ? 'h-16 pt-6 pb-2 text-base'
        : 'h-12 pt-5 pb-1 text-sm'

    const hasError = Boolean(error)

    return (
      <div>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${selectId}-error` : undefined}
            className={clsx(
              'peer block w-full px-4 pr-10',
              'text-neutral-900 dark:text-white',
              'bg-white dark:bg-neutral-900',
              'border rounded-xl appearance-none transition-colors cursor-pointer',
              'focus:outline-none focus:ring-0',
              sizeClasses,
              hasError
                ? 'border-red-500 focus:border-red-500'
                : 'border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white',
              className
            )}
            {...rest}
          >
            {children}
          </select>
          <label
            htmlFor={selectId}
            className={clsx(
              'absolute left-4 top-2 text-xs font-medium transition-colors pointer-events-none',
              hasError
                ? 'text-red-600 peer-focus:text-red-600'
                : 'text-neutral-500 dark:text-neutral-400 peer-focus:text-neutral-900 dark:peer-focus:text-white'
            )}
          >
            {label}
          </label>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
        {hasError && (
          <p id={`${selectId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)
