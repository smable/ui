import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useFieldVariant } from './FieldVariantContext'

/**
 * Select — unified `<select>` with two visual variants.
 *
 * `variant="default"` (default): label-above, h-10, rounded-lg.
 * `variant="floating"`: Square-style floating label at top-left.
 *
 * Breaking change: replaces former `SmableSelect` (@smable/ui <= 0.2.0).
 * Migration: `<SmableSelect .../>` → `<Select variant="floating" .../>`.
 */

interface BaseSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  required?: boolean
  children: ReactNode
  size?: 'medium' | 'large'
}

interface DefaultSelectProps extends BaseSelectProps {
  variant?: 'default'
}

interface FloatingSelectProps extends BaseSelectProps {
  variant: 'floating'
  label: string
}

export type SelectProps = DefaultSelectProps | FloatingSelectProps

const defaultBase = "w-full h-10 px-3 pr-10 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
const defaultLabel = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
const errorMsgClass = "mt-1.5 text-xs text-red-600 dark:text-red-400"

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  const contextVariant = useFieldVariant()
  const resolvedVariant = props.variant ?? contextVariant
  if (resolvedVariant === 'floating') {
    const floatingProps = props as FloatingSelectProps
    const { label, error, size = 'large', className, id, required, children, variant: _v, ...rest } = floatingProps
    const autoId = useId()
    const selectId = id ?? `select-${autoId}`
    const hasError = Boolean(error)
    const sizeClasses = size === 'large' ? 'h-16 pt-6 pb-2 text-base' : 'h-12 pt-5 pb-1 text-sm'

    return (
      <div>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
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
            {label}{required && <span className="text-red-500"> *</span>}
          </label>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
        {hasError && (
          <p id={`${selectId}-error`} className={errorMsgClass}>{error}</p>
        )}
      </div>
    )
  }

  const defaultProps = props as DefaultSelectProps
  const { label, error, required, className, variant: _v, size: _size, children, ...rest } = defaultProps
  return (
    <div>
      {label && (
        <label className={defaultLabel}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select ref={ref} required={required} className={clsx(defaultBase, className)} {...rest}>
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
      {error && <p className={errorMsgClass}>{error}</p>}
    </div>
  )
})
