import { forwardRef, type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

export type SmableButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost'
export type SmableButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface SmableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SmableButtonVariant
  size?: SmableButtonSize
  loading?: boolean
  fullWidth?: boolean
  /**
   * Čtvercové tlačítko jen s ikonou (xs 32, sm 36, md 40, lg 44 px).
   * **Vždy předej `aria-label`** (nebo `aria-labelledby`) — bez textu nemá tlačítko jiný název.
   */
  iconOnly?: boolean
  /** Přepínač v toolbaru: nastaví `aria-pressed` a u secondary / ghost / danger-ghost aktivní vzhled. */
  pressed?: boolean
}

const VARIANT: Record<SmableButtonVariant, string> = {
  primary:
    'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100',
  secondary:
    'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800',
  ghost:
    'bg-transparent text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
  'danger-ghost':
    'bg-transparent text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30',
}

// Stisknutý stav nahrazuje třídy varianty celé — dvě pozadí v jednom seznamu by rozhodlo
// pořadí v CSS, ne pořadí tříd. Primary a danger zůstávají, dostanou jen aria-pressed.
const PRESSED: Partial<Record<SmableButtonVariant, string>> = {
  secondary:
    'bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700',
  ghost:
    'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700',
  'danger-ghost':
    'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50',
}

const SIZE: Record<SmableButtonSize, string> = {
  xs: 'h-8 px-2.5 text-xs',
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
}

const ICON_SIZE: Record<SmableButtonSize, string> = {
  xs: 'h-8 w-8 px-0 text-xs',
  sm: 'h-9 w-9 px-0 text-xs',
  md: 'h-10 w-10 px-0 text-sm',
  lg: 'h-11 w-11 px-0 text-sm',
}

const SPINNER: Record<SmableButtonVariant, string> = {
  primary: 'border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900',
  secondary: 'border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white',
  ghost: 'border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white',
  danger: 'border-white/30 border-t-white',
  'danger-ghost': 'border-red-200 dark:border-red-900 border-t-red-600 dark:border-t-red-400',
}

export const SmableButton = forwardRef<HTMLButtonElement, SmableButtonProps>(
  function SmableButton(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      iconOnly = false,
      pressed,
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
        aria-pressed={pressed}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          fullWidth && 'w-full',
          iconOnly && 'flex-shrink-0',
          (pressed && PRESSED[variant]) || VARIANT[variant],
          iconOnly ? ICON_SIZE[size] : SIZE[size],
          className
        )}
        {...rest}
      >
        {loading ? (
          <span className={clsx('w-4 h-4 border-2 rounded-full animate-spin', SPINNER[variant])} />
        ) : null}
        {/* Ve čtverci se spinner a ikona nevejdou vedle sebe — při načítání zůstane jen spinner. */}
        {iconOnly && loading ? null : children}
      </button>
    )
  }
)
