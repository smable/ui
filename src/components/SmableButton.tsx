import { forwardRef, type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

export type SmableButtonVariant = 'primary' | 'secondary' | 'ghost'
export type SmableButtonSize = 'sm' | 'md' | 'lg'

export interface SmableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SmableButtonVariant
  size?: SmableButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const VARIANT: Record<SmableButtonVariant, string> = {
  primary:
    'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100',
  secondary:
    'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800',
  ghost:
    'bg-transparent text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800',
}

const SIZE: Record<SmableButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
}

const SPINNER: Record<SmableButtonVariant, string> = {
  primary: 'border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900',
  secondary: 'border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white',
  ghost: 'border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white',
}

export const SmableButton = forwardRef<HTMLButtonElement, SmableButtonProps>(
  function SmableButton(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      type = 'button',
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          fullWidth && 'w-full',
          VARIANT[variant],
          SIZE[size],
          className
        )}
        {...rest}
      >
        {loading ? (
          <span className={clsx('w-4 h-4 border-2 rounded-full animate-spin', SPINNER[variant])} />
        ) : null}
        {children}
      </button>
    )
  }
)
