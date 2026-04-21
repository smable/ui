import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'
import { useFieldVariant } from './FieldVariantContext'

/**
 * Textarea — unified multiline input with two visual variants.
 *
 * `variant="default"` (default): label-above, resize-none, rounded-lg.
 * `variant="floating"`: Square-style floating label, resize-y, h-40 (large) / h-32 (medium).
 *
 * Breaking change: replaces former `SmableTextarea` (@smable/ui <= 0.2.0).
 * Migration: `<SmableTextarea .../>` → `<Textarea variant="floating" .../>`.
 */

interface BaseTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  label?: string
  error?: string
  required?: boolean
  size?: 'medium' | 'large'
}

interface DefaultTextareaProps extends BaseTextareaProps {
  variant?: 'default'
  placeholder?: string
}

interface FloatingTextareaProps extends BaseTextareaProps {
  variant: 'floating'
  label: string
}

export type TextareaProps = DefaultTextareaProps | FloatingTextareaProps

const defaultBase = "w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
const defaultLabel = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
const errorMsgClass = "mt-1.5 text-xs text-red-600 dark:text-red-400"

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const contextVariant = useFieldVariant()
  const resolvedVariant = props.variant ?? contextVariant
  if (resolvedVariant === 'floating') {
    const floatingProps = props as FloatingTextareaProps & { placeholder?: undefined }
    const { label, error, size = 'large', className, id, required, rows, variant: _v, ...rest } = floatingProps
    const autoId = useId()
    const textareaId = id ?? `textarea-${autoId}`
    const hasError = Boolean(error)
    const sizeClasses = size === 'large' ? 'min-h-40 pt-7 pb-3 text-base' : 'min-h-32 pt-6 pb-2 text-sm'

    return (
      <div>
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            required={required}
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
              'peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal',
              'peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium',
              hasError
                ? 'text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600'
                : 'text-neutral-500 dark:text-neutral-400 peer-placeholder-shown:text-neutral-400 dark:peer-placeholder-shown:text-neutral-500 peer-focus:text-neutral-900 dark:peer-focus:text-white'
            )}
          >
            {label}{required && <span className="text-red-500"> *</span>}
          </label>
        </div>
        {hasError && (
          <p id={`${textareaId}-error`} className={errorMsgClass}>{error}</p>
        )}
      </div>
    )
  }

  const defaultProps = props as DefaultTextareaProps
  const { label, error, required, className, variant: _v, size: _size, ...rest } = defaultProps
  return (
    <div>
      {label && (
        <label className={defaultLabel}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea ref={ref} required={required} className={clsx(defaultBase, className)} {...rest} />
      {error && <p className={errorMsgClass}>{error}</p>}
    </div>
  )
})
