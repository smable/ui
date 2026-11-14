import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import type { BadgeTone } from './Badge'

export type ChipSize = 'sm' | 'md'

/**
 * Chip — interaktivní pill: filtr, volba, odebíratelný aktivní filtr.
 * `Badge` zůstává neinteraktivní štítek.
 *
 * @example
 *   <Chip selected={status === 'open'} count={12} onClick={() => setStatus('open')}>Otevřené</Chip>
 *   <Chip selected tone="neutral" onRemove={clearWarehouse} removeLabel="Odebrat filtr Sklad">Sklad: Hlavní</Chip>
 */
export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  /** Vybraný stav — `aria-pressed` a barva podle `tone`. */
  selected?: boolean
  /** Barva vybraného stavu (výchozí `brand`). Nevybraný chip je vždy neutrální. */
  tone?: BadgeTone
  /** Počet za textem „(n)“. Při 0 a nevybraném stavu je chip zakázaný. */
  count?: number
  icon?: ReactNode
  /** Vykreslí × vedle textu (aktivní filtr). Bez `onClick` je text jen popisek. */
  onRemove?: () => void
  /** aria-label křížku, výchozí „Odebrat“. */
  removeLabel?: string
  /** `sm` h-7, `md` h-8 (výchozí). */
  size?: ChipSize
}

const SELECTED: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900',
  blue: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300',
  purple: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  pink: 'bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300',
  amber: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  orange: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  red: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  brand: 'bg-brand-50 dark:bg-brand-950/50 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300',
}

const IDLE = 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
const IDLE_HOVER = 'enabled:hover:bg-neutral-50 dark:enabled:hover:bg-neutral-800 enabled:hover:border-neutral-300 dark:enabled:hover:border-neutral-600'

const SIZE: Record<ChipSize, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1',
  md: 'h-8 px-3 text-sm gap-1.5',
}

const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-900'

export function Chip({
  children,
  selected,
  tone = 'brand',
  count,
  icon,
  onRemove,
  removeLabel = 'Odebrat',
  size = 'md',
  disabled,
  className,
  type = 'button',
  onClick,
  ...rest
}: ChipProps) {
  const isDisabled = disabled || (count === 0 && !selected)
  const colors = selected ? SELECTED[tone] : IDLE
  const content = (
    <>
      {icon}
      <span className="truncate">{children}</span>
      {count !== undefined && <span className="tabular-nums opacity-70">({count})</span>}
    </>
  )

  if (!onRemove) {
    return (
      <button
        type={type}
        aria-pressed={selected}
        disabled={isDisabled}
        onClick={onClick}
        className={clsx(
          'inline-flex items-center max-w-full rounded-full border font-medium whitespace-nowrap transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          FOCUS,
          SIZE[size],
          colors,
          !selected && IDLE_HOVER,
          className
        )}
        {...rest}
      >
        {content}
      </button>
    )
  }

  // Křížek nesmí být uvnitř tlačítka chipu (vnořená tlačítka) — dvě sourozenecká tlačítka v obalu.
  return (
    <span
      className={clsx(
        'inline-flex items-center max-w-full rounded-full border font-medium whitespace-nowrap',
        SIZE[size],
        size === 'sm' ? 'pr-1' : 'pr-1.5',
        colors,
        isDisabled && 'opacity-50',
        className
      )}
    >
      {onClick ? (
        <button
          type={type}
          aria-pressed={selected}
          disabled={isDisabled}
          onClick={onClick}
          className={clsx('inline-flex min-w-0 items-center gap-[inherit] rounded-full disabled:cursor-not-allowed', FOCUS)}
          {...rest}
        >
          {content}
        </button>
      ) : (
        <span className="inline-flex min-w-0 items-center gap-[inherit]">{content}</span>
      )}
      <button
        type="button"
        aria-label={removeLabel}
        disabled={disabled}
        onClick={onRemove}
        className={clsx(
          'inline-flex flex-shrink-0 items-center justify-center rounded-full opacity-70 transition-opacity',
          'enabled:hover:opacity-100 enabled:hover:bg-black/5 dark:enabled:hover:bg-white/10 disabled:cursor-not-allowed',
          size === 'sm' ? 'h-5 w-5' : 'h-6 w-6',
          FOCUS
        )}
      >
        <X aria-hidden className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </button>
    </span>
  )
}
