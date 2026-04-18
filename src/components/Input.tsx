import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

const inputBase = "w-full h-10 px-3 text-sm bg-white dark:bg-neutral-800 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
const inputNormal = "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
const inputError = "border-red-400 dark:border-red-600"
const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
const errorClass = "mt-1.5 text-xs text-red-600 dark:text-red-400"

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string
  labelAction?: React.ReactNode
  error?: string
  required?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelAction, error, required, prefix, suffix, className, ...props }, ref) => {
    const wrapped = prefix || suffix
    return (
      <div>
        {(label || labelAction) && (
          <div className="flex items-center justify-between mb-1.5">
            {label ? (
              <label className={clsx(labelClass, 'mb-0')}>
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
            className={clsx(
              inputBase,
              error ? inputError : inputNormal,
              prefix && "pl-9",
              suffix && "pr-12",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className={errorClass}>{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
