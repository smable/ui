import type { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

/**
 * Badge — UI primitive pro stage / status / score / severity chips.
 *
 * Tone = barevný kontext, ne business význam. Konzumenti (CRM lead stage,
 * helpdesk ticket status, …) si mapují business hodnoty na tone v thin
 * wrapperu na své straně.
 *
 * @example
 *   <Badge tone="emerald">Vyhráno</Badge>
 *   <Badge tone="red" size="sm" icon={<AlertOctagon className="w-3 h-3" />}>
 *     Kritické
 *   </Badge>
 *   <Badge tone="emerald" dot="pulse">Online</Badge>
 *   <Badge tone="red" variant="solid" title="3 nepřečtené">3</Badge>
 */
export type BadgeTone =
  | 'neutral'
  | 'blue'
  | 'cyan'
  | 'purple'
  | 'pink'
  | 'amber'
  | 'orange'
  | 'emerald'
  | 'red'
  | 'brand'

export type BadgeSize = 'sm' | 'md'

export type BadgeVariant = 'soft' | 'solid'

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  tone?: BadgeTone
  size?: BadgeSize
  /** `soft` (výchozí) = světlé pozadí, `solid` = plná barva tónu a bílý text. */
  variant?: BadgeVariant
  /** Tečka před textem v barvě tónu; `pulse` = živý stav (pulzuje). */
  dot?: boolean | 'pulse'
  icon?: ReactNode
  children: ReactNode
}

const toneClass: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
  blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300',
  purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
  pink: 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300',
  amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  orange: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
  red: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300',
  brand: 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300',
}

// Nejsvětlejší odstín, na kterém má bílý text-xs kontrast aspoň 4,5:1 (hlídá badge-contrast.test.mjs).
const solidClass: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-500 text-white',
  blue: 'bg-blue-600 text-white',
  cyan: 'bg-cyan-700 text-white',
  purple: 'bg-purple-600 text-white',
  pink: 'bg-pink-600 text-white',
  amber: 'bg-amber-700 text-white',
  orange: 'bg-orange-700 text-white',
  emerald: 'bg-emerald-700 text-white',
  red: 'bg-red-600 text-white',
  brand: 'bg-brand-700 text-white',
}

const dotClass: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-500',
  blue: 'bg-blue-500',
  cyan: 'bg-cyan-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
  red: 'bg-red-500',
  brand: 'bg-brand-500',
}

const sizeClass: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-2xs gap-0.5',
  md: 'px-2 py-0.5 text-xs gap-1',
}

export function Badge({
  tone = 'neutral',
  size = 'md',
  variant = 'soft',
  dot,
  icon,
  children,
  className,
  ...rest
}: BadgeProps) {
  const dotColor = variant === 'solid' ? 'bg-white' : dotClass[tone]
  return (
    <span
      {...rest}
      className={clsx(
        'inline-flex items-center font-medium rounded-md whitespace-nowrap',
        variant === 'solid' ? solidClass[tone] : toneClass[tone],
        sizeClass[size],
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
          {dot === 'pulse' && (
            <span className={clsx('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping motion-reduce:animate-none', dotColor)} />
          )}
          <span className={clsx('relative inline-flex h-1.5 w-1.5 rounded-full', dotColor)} />
        </span>
      )}
      {icon}
      {children}
    </span>
  )
}
