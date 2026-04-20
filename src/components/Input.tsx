import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import { useFieldVariant } from './FieldVariantContext'

/**
 * Input — unified text input with two visual variants.
 *
 * `variant="default"` (default): label-above, h-10, rounded-lg.
 *   Supports prefix/suffix/labelAction. Used in compact forms, filters.
 *
 * `variant="floating"`: Square-style floating label. Label acts as
 *   placeholder when empty and floats up on focus/value. Used in
 *   branded forms (auth, onboarding, primary CTAs).
 *
 * Breaking change: replaces former `SmableInput` (@smable/ui <= 0.2.0).
 * Migration: `<SmableInput .../>` → `<Input variant="floating" .../>`.
 */

interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'placeholder'> {
  label?: string
  error?: string
  required?: boolean
}

interface DefaultInputProps extends BaseInputProps {
  variant?: 'default'
  labelAction?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  placeholder?: string
}

interface FloatingInputProps extends BaseInputProps {
  variant: 'floating'
  label: string
  trailing?: ReactNode
  size?: 'medium' | 'large'
}

export type InputProps = DefaultInputProps | FloatingInputProps

const defaultBase = "w-full h-10 px-3 text-sm bg-white dark:bg-neutral-800 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
const defaultNormal = "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
const defaultError = "border-red-400 dark:border-red-600"
const defaultLabel = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
const errorMsgClass = "mt-1.5 text-xs text-red-600 dark:text-red-400"

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const contextVariant = useFieldVariant()
  const resolvedVariant = props.variant ?? contextVariant
  if (resolvedVariant === 'floating') {
    const floatingProps = props as FloatingInputProps & { placeholder?: undefined }
    const { label, error, trailing, size = 'large', className, id, required, variant: _v, ...rest } = floatingProps
    const autoId = useId()
    const inputId = id ?? `input-${autoId}`
    const hasError = Boolean(error)
    const sizeClasses = size === 'large' ? 'h-16 pt-6 pb-2 text-base' : 'h-12 pt-5 pb-1 text-sm'

    return (
      <div>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            required={required}
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
              'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal',
              'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium',
              hasError
                ? 'text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600'
                : 'text-neutral-500 dark:text-neutral-400 peer-placeholder-shown:text-neutral-400 dark:peer-placeholder-shown:text-neutral-500 peer-focus:text-neutral-900 dark:peer-focus:text-white'
            )}
          >
            {label}{required && <span className="text-red-500"> *</span>}
          </label>
          {trailing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {trailing}
            </div>
          )}
        </div>
        {hasError && (
          <p id={`${inputId}-error`} className={errorMsgClass}>{error}</p>
        )}
      </div>
    )
  }

  const defaultProps = props as DefaultInputProps
  const { label, labelAction, error, required, prefix, suffix, className, variant: _v, ...rest } = defaultProps
  const wrapped = prefix || suffix
  return (
    <div>
      {(label || labelAction) && (
        <div className="flex items-center justify-between mb-1.5">
          {label ? (
            <label className={clsx(defaultLabel, 'mb-0')}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          ) : <span />}
          {labelAction}
        </div>
      )}
      <div className={wrapped ? "relative" : undefined}>
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          required={required}
          className={clsx(
            defaultBase,
            error ? defaultError : defaultNormal,
            prefix && "pl-9",
            suffix && "pr-12",
            className
          )}
          {...rest}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className={errorMsgClass}>{error}</p>}
    </div>
  )
})
