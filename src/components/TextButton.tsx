import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

export type TextButtonTone = 'brand' | 'neutral' | 'danger'
export type TextButtonSize = 'xs' | 'sm' | 'inherit'

/**
 * Tlačítko vzhledu odkazu — inline text, „Zpět“, „Vymazat vše“. Akce, ne navigace:
 * pro přechod na jinou stránku patří `<a>` / router link.
 */
export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Výchozí `brand`. */
  tone?: TextButtonTone
  /** `inherit` (výchozí) převezme velikost písma z okolního textu. */
  size?: TextButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  /** Výchozí `hover`. */
  underline?: 'hover' | 'always' | 'none'
}

// Hover jen na povoleném tlačítku — zakázané nesmí vypadat klikací.
const TONE: Record<TextButtonTone, string> = {
  brand: 'text-brand-600 dark:text-brand-400 enabled:hover:text-brand-700 dark:enabled:hover:text-brand-300',
  neutral: 'text-neutral-600 dark:text-neutral-400 enabled:hover:text-neutral-900 dark:enabled:hover:text-white',
  danger: 'text-red-600 dark:text-red-400 enabled:hover:text-red-700 dark:enabled:hover:text-red-300',
}

const SIZE: Record<TextButtonSize, string> = {
  xs: 'text-xs gap-1',
  sm: 'text-sm gap-1.5',
  inherit: 'gap-1.5',
}

const UNDERLINE = {
  hover: 'enabled:hover:underline',
  always: 'underline',
  none: '',
} as const

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(function TextButton(
  { tone = 'brand', size = 'inherit', icon, iconRight, underline = 'hover', type = 'button', className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'inline-flex items-center font-medium underline-offset-2 rounded-sm transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        TONE[tone],
        SIZE[size],
        UNDERLINE[underline],
        className
      )}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
})
