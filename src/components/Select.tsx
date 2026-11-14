import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useFieldVariant } from './FieldVariantContext'
import { fieldMessages, hintClass } from './field-messages'

/**
 * Select — unified `<select>` with two visual variants.
 *
 * `variant="default"` (default): label-above, h-10, rounded-lg; `size="small"` h-9 (buňky tabulek,
 *   bez `variant` vždy default varianta).
 * `variant="floating"`: Square-style floating label at top-left.
 *
 * Breaking change: replaces former `SmableSelect` (@smable/ui <= 0.2.0).
 * Migration: `<SmableSelect .../>` → `<Select variant="floating" .../>`.
 */

interface BaseSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  /** Text chyby pod polem; `true` = jen červený okraj bez textu. */
  error?: string | boolean
  /** Nápověda pod polem (`aria-describedby`). Když se ukazuje text chyby, skryje se. */
  hint?: ReactNode
  required?: boolean
  children: ReactNode
  /** Default: `small` h-9 px-2, jinak h-10. Floating: `large` h-16 (výchozí), jinak h-12. */
  size?: 'small' | 'medium' | 'large'
}

interface DefaultSelectProps extends BaseSelectProps {
  variant?: 'default'
}

interface FloatingSelectProps extends BaseSelectProps {
  variant: 'floating'
  label: string
}

export type SelectProps = DefaultSelectProps | FloatingSelectProps

// `bg-none`: @tailwindcss/forms kreslí na každý <select> šipku jako background-image,
// vedle vlastní ChevronDown by byly v poli dvě.
const defaultSize = { small: "h-9 px-2 pr-9", medium: "h-10 px-3 pr-10" }
const defaultBase = "text-sm bg-white bg-none dark:bg-neutral-800 border"
const defaultNormal = "border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600"
const defaultError = "border-red-400 dark:border-red-600 rounded-lg"
const defaultTail = "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
const defaultLabel = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
const errorMsgClass = "mt-1.5 text-xs text-red-600 dark:text-red-400"

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  const contextVariant = useFieldVariant()
  const resolvedVariant = props.variant ?? (props.size === 'small' ? 'default' : contextVariant)
  const autoId = useId()
  if (resolvedVariant === 'floating') {
    const floatingProps = props as FloatingSelectProps
    const { label, error, hint, size = 'large', className, id, required, children, variant: _v, ...rest } = floatingProps
    const selectId = id ?? `select-${autoId}`
    const { hasError, errorMessage, showHint, describedBy } = fieldMessages(selectId, error, hint)
    const sizeClasses = size === 'large' ? 'h-16 pt-6 pb-2 text-base' : 'h-12 pt-5 pb-1 text-sm'

    return (
      <div>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={clsx(
              'peer block w-full px-4 pr-10',
              'text-neutral-900 dark:text-white',
              'bg-white bg-none dark:bg-neutral-900',
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
              // Kontrast jako floating Input: neutral-500 na bílé propadal WCAG AA,
              // chyba neměla tmavou obdobu (red-600 na neutral-900 je 3,71:1).
              hasError
                ? 'text-red-600 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-400'
                : 'text-neutral-600 dark:text-neutral-400 peer-focus:text-neutral-900 dark:peer-focus:text-white'
            )}
          >
            {label}{required && <span className="text-red-500"> *</span>}
          </label>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
        {errorMessage && (
          <p id={`${selectId}-error`} className={errorMsgClass}>{errorMessage}</p>
        )}
        {showHint && <p id={`${selectId}-hint`} className={hintClass}>{hint}</p>}
      </div>
    )
  }

  const defaultProps = props as DefaultSelectProps
  const { label, error, hint, required, className, id, variant: _v, size, children, ...rest } = defaultProps
  const selectId = id ?? `select-${autoId}`
  const { hasError, errorMessage, showHint, describedBy } = fieldMessages(selectId, error, hint)
  return (
    <div>
      {label && (
        <label htmlFor={selectId} className={defaultLabel}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={clsx(
            "w-full",
            size === 'small' ? defaultSize.small : defaultSize.medium,
            defaultBase,
            hasError ? defaultError : defaultNormal,
            defaultTail,
            className
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
      {errorMessage && <p id={`${selectId}-error`} className={errorMsgClass}>{errorMessage}</p>}
      {showHint && <p id={`${selectId}-hint`} className={hintClass}>{hint}</p>}
    </div>
  )
})
