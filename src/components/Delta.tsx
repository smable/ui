import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import { formatDelta, type DeltaSentiment, type DeltaUnit } from './delta-format'

export type { DeltaUnit } from './delta-format'
export { formatDelta, type DeltaParts, type DeltaFormatOptions } from './delta-format'

/**
 * Delta — změna oproti předchozímu období: šipka a barevné číslo.
 * Růst je zelený, pokles červený, `invert` barvy prohodí (náklady, storna). `null` nevykreslí nic,
 * nula (i po zaokrouhlení) je šedá bez šipky.
 *
 * @example
 *   <Delta value={12.3} suffix="vs. minulý týden" />
 *   <Delta value={-1.2} unit="pp" />
 *   <Delta value={8} invert />
 */
export interface DeltaProps {
  value: number | null
  /** `%` (výchozí) nebo procentní body `pp`. */
  unit?: DeltaUnit
  /** Prohodí barvy — růst je špatná zpráva. Šipka dál ukazuje skutečný směr. */
  invert?: boolean
  /** Text za číslem (např. „vs. minulý týden“), šedý. */
  suffix?: ReactNode
  /** Text jednotky, výchozí „%“ a pro `pp` „p. b.“. */
  unitLabel?: string
  /** Výchozí `cs-CZ`. */
  locale?: string
  /** Počet desetinných míst (maximum), výchozí 1. */
  fractionDigits?: number
  /** `xs` (výchozí, tabulky a malé KPI) nebo `sm` (velké KPI). */
  size?: 'xs' | 'sm'
  className?: string
}

const SENTIMENT: Record<DeltaSentiment, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-neutral-500 dark:text-neutral-400',
}

export function Delta({ value, unit, invert, suffix, unitLabel, locale, fractionDigits, size = 'xs', className }: DeltaProps) {
  const parts = formatDelta(value, { unit, invert, unitLabel, locale, fractionDigits })
  if (!parts) return null
  const Arrow = parts.direction === 'up' ? ArrowUpRight : parts.direction === 'down' ? ArrowDownRight : null

  return (
    <span className={clsx('inline-flex items-center gap-1 font-medium tabular-nums', size === 'sm' ? 'text-sm' : 'text-xs', className)}>
      <span className={clsx('inline-flex items-center gap-0.5', SENTIMENT[parts.sentiment])}>
        {Arrow && <Arrow className={clsx('shrink-0', size === 'sm' ? 'h-3.5 w-3.5' : 'h-3 w-3')} aria-hidden="true" />}
        {parts.text}
      </span>
      {suffix != null && suffix !== false && (
        <span className="font-normal text-neutral-500 dark:text-neutral-400">{suffix}</span>
      )}
    </span>
  )
}
