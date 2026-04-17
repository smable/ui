import { forwardRef, useId, type ReactNode } from 'react'
import clsx from 'clsx'

/**
 * SmableInput — floating-label text input inspired by Square's
 * `market-field` + `smable-input-text` web components.
 *
 * Behavior:
 *  - When empty and unfocused, the label acts as a placeholder,
 *    vertically centered inside the input at base font size.
 *  - On focus (or when the input has a value), the label shrinks
 *    and floats to the top-left in small font.
 *
 * Implementation: uses Tailwind `peer` + `placeholder-shown` pattern.
 * The `placeholder=" "` (single space) on the input is REQUIRED so
 * `:placeholder-shown` can detect empty state.
 *
 * Usage:
 *   <SmableInput
 *     type="email"
 *     label="Email"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *     autoComplete="email"
 *   />
 */
export interface SmableInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder' | 'size'> {
  /** Floating label text — shown as placeholder when empty, shrinks on focus */
  label: string
  /** Error message — shown below the input and applies red styling */
  error?: string
  /** Optional element rendered inside the right edge of the input (e.g. password eye toggle) */
  trailing?: ReactNode
  /** Input height. Default 'large' matches Square's size="large" (64px). */
  size?: 'medium' | 'large'
}

export const SmableInput = forwardRef<HTMLInputElement, SmableInputProps>(
  function SmableInput(
    { label, error, trailing, size = 'large', className, id, ...rest },
    ref
  ) {
    const autoId = useId()
    const inputId = id ?? `smable-input-${autoId}`

    // Large = h-16 (64px), Medium = h-12 (48px)
    const sizeClasses =
      size === 'large'
        ? 'h-16 pt-6 pb-2 text-base'
        : 'h-12 pt-5 pb-1 text-sm'

    const hasError = Boolean(error)

    return (
      <div>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            className={clsx(
              'peer block w-full px-4',
              'text-neutral-900 dark:text-white',
              'bg-white dark:bg-neutral-900',
              'border rounded-xl appearance-none transition-colors',
              'focus:outline-none focus:ring-0',
              sizeClasses,
              trailing && 'pr-12',
              hasError
                ? 'border-red-500 focus:border-red-500'
                : 'border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white',
              className
            )}
            {...rest}
          />
          <label
            htmlFor={inputId}
            className={clsx(
              'absolute left-4 top-2 text-xs font-medium transition-all duration-150 pointer-events-none',
              // Empty + not focused: float down, bigger, lighter
              'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal',
              // Focused: pin up, small, bold
              'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium',
              hasError
                ? 'text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600'
                : 'text-neutral-500 dark:text-neutral-400 peer-placeholder-shown:text-neutral-400 dark:peer-placeholder-shown:text-neutral-500 peer-focus:text-neutral-900 dark:peer-focus:text-white'
            )}
          >
            {label}
          </label>
          {trailing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {trailing}
            </div>
          )}
        </div>
        {hasError && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)
