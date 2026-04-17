import { forwardRef, useId } from 'react'
import clsx from 'clsx'

/**
 * SmableTextarea — floating-label textarea matching SmableInput styling.
 * Height is 2–3× that of SmableInput (large = h-40, medium = h-32).
 *
 * Usage:
 *   <SmableTextarea label="Poznámka" value={x} onChange={...} />
 */
export interface SmableTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder' | 'size'> {
  label: string
  error?: string
  size?: 'medium' | 'large'
}

export const SmableTextarea = forwardRef<HTMLTextAreaElement, SmableTextareaProps>(
  function SmableTextarea(
    { label, error, size = 'large', className, id, rows, ...rest },
    ref
  ) {
    const autoId = useId()
    const textareaId = id ?? `smable-textarea-${autoId}`

    const sizeClasses =
      size === 'large'
        ? 'min-h-40 pt-7 pb-3 text-base'
        : 'min-h-32 pt-6 pb-2 text-sm'

    const hasError = Boolean(error)

    return (
      <div>
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            placeholder=" "
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${textareaId}-error` : undefined}
            className={clsx(
              'peer block w-full px-4',
              'text-neutral-900 dark:text-white',
              'bg-white dark:bg-neutral-900',
              'border rounded-xl appearance-none transition-colors resize-y',
              'focus:outline-none focus:ring-0',
              sizeClasses,
              hasError
                ? 'border-red-500 focus:border-red-500'
                : 'border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white',
              className
            )}
            {...rest}
          />
          <label
            htmlFor={textareaId}
            className={clsx(
              'absolute left-4 top-2 text-xs font-medium transition-all duration-150 pointer-events-none',
              // Empty + not focused: float down to starting line area
              'peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal',
              // Focused: pin up, small, bold
              'peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium',
              hasError
                ? 'text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600'
                : 'text-neutral-500 dark:text-neutral-400 peer-placeholder-shown:text-neutral-400 dark:peer-placeholder-shown:text-neutral-500 peer-focus:text-neutral-900 dark:peer-focus:text-white'
            )}
          >
            {label}
          </label>
        </div>
        {hasError && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)
