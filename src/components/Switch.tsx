import { forwardRef } from 'react'
import clsx from 'clsx'

export type SwitchSize = 'sm' | 'md'
export type SwitchTone = 'green' | 'brand'

/**
 * Switch — samotný přepínač (`role="switch"`). S popiskem a řádkem kolem je to `Toggle`.
 * Bez viditelného popisku předej `aria-label` nebo `aria-labelledby`.
 *
 * Klik nezastavuje propagaci — rodič, který reaguje na klik sám (řádek `Toggle`), musí
 * kliky z přepínače ignorovat, jinak by hodnota přepnula dvakrát.
 */
export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  /** `md` (výchozí) 44 × 24 px, `sm` 36 × 20 px. */
  size?: SwitchSize
  /** Barva zapnutého stavu, výchozí `green` (dosavadní barva `Toggle`). */
  tone?: SwitchTone
  id?: string
  className?: string
  title?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

const TRACK: Record<SwitchSize, string> = { md: 'h-6 w-11', sm: 'h-5 w-9' }
const KNOB: Record<SwitchSize, string> = { md: 'h-4 w-4', sm: 'h-3 w-3' }
const KNOB_ON: Record<SwitchSize, string> = { md: 'translate-x-6', sm: 'translate-x-5' }
const TONE_ON: Record<SwitchTone, string> = { green: 'bg-green-500', brand: 'bg-brand-500' }

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onChange, disabled, size = 'md', tone = 'green', className, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex flex-shrink-0 items-center rounded-full transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900',
        'dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        TRACK[size],
        checked ? TONE_ON[tone] : 'bg-neutral-300 dark:bg-neutral-600',
        className
      )}
      {...rest}
    >
      <span
        className={clsx(
          'inline-block transform rounded-full bg-white transition-transform shadow-sm',
          KNOB[size],
          checked ? KNOB_ON[size] : 'translate-x-1'
        )}
      />
    </button>
  )
})
