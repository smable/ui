import type { ElementType, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import type { BadgeTone } from './Badge'
import { Delta } from './Delta'
import type { DeltaUnit } from './delta-format'
import { Skeleton } from './Skeleton'

export type HeroCardSize = 'lg' | 'sm'
export type HeroCardTone = 'default' | 'brand' | 'positive' | 'negative'
export type HeroCardValueTone = 'default' | 'positive' | 'negative' | 'warning'

export interface HeroCardChange {
  /** Změna; `null` = není s čím porovnat, řádek se nevykreslí. */
  value: number | null
  label?: string
  /** `%` (výchozí) nebo procentní body `pp`. */
  unit?: DeltaUnit
  /** Růst je špatná zpráva (náklady, storna). */
  invert?: boolean
  /**
   * @deprecated Barvu a znaménko určuje znaménko `value` (+ `invert`). Samotné `isPositive`
   * u velikosti `lg` vykreslí původní vzhled (bez šipky, „+12%“).
   */
  isPositive?: boolean
}

export interface HeroCardProps {
  title: string
  value: string | number
  change?: HeroCardChange
  subtitle?: ReactNode
  href?: string
  icon?: ElementType
  /** Barva ikony; u `sm` barva čtverce s ikonou. Bez ní se řídí `tone`. */
  iconTone?: BadgeTone
  isLoading?: boolean
  /** `lg` (výchozí) = velká karta dashboardu, `sm` = KPI dlaždice s ikonou ve čtverci vpravo. */
  size?: HeroCardSize
  /** Barva celé karty. */
  tone?: HeroCardTone
  /** Barva hodnoty nezávisle na `tone`. */
  valueTone?: HeroCardValueTone
  /** @deprecated Použij `tone="negative"` (stejný červený vzhled). */
  highlight?: boolean
  hrefLabel?: string
}

const CARD_TONE: Record<HeroCardTone, string> = {
  default: 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
  negative: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900',
  brand: 'bg-brand-50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-900',
  positive: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
}

const VALUE_BY_TONE: Record<HeroCardTone, string> = {
  default: 'text-neutral-900 dark:text-white',
  negative: 'text-red-600 dark:text-red-400',
  brand: 'text-brand-700 dark:text-brand-300',
  positive: 'text-emerald-700 dark:text-emerald-400',
}

const VALUE_TONE: Record<Exclude<HeroCardValueTone, 'default'>, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
}

const ICON_BY_TONE: Record<HeroCardTone, string> = {
  default: 'text-neutral-500',
  negative: 'text-red-600',
  brand: 'text-brand-600 dark:text-brand-400',
  positive: 'text-emerald-600 dark:text-emerald-400',
}

const ICON_TONE: Record<BadgeTone, string> = {
  neutral: 'text-neutral-500',
  blue: 'text-blue-600 dark:text-blue-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
  purple: 'text-purple-600 dark:text-purple-400',
  pink: 'text-pink-600 dark:text-pink-400',
  amber: 'text-amber-600 dark:text-amber-400',
  orange: 'text-orange-600 dark:text-orange-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  red: 'text-red-600 dark:text-red-400',
  brand: 'text-brand-600 dark:text-brand-400',
}

const ICON_SQUARE: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
  blue: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  cyan: 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400',
  purple: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
  pink: 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400',
  amber: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  orange: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  red: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  brand: 'bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400',
}

const SQUARE_BY_TONE: Record<HeroCardTone, BadgeTone> = {
  default: 'neutral',
  negative: 'red',
  brand: 'brand',
  positive: 'emerald',
}

const HOVER = 'hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer hover:shadow-md transition-shadow'

/** Původní `{ value, label, isPositive }` bez nových polí — vykreslí se beze změny. */
function isLegacyChange(change: HeroCardChange): change is HeroCardChange & { value: number; isPositive: boolean } {
  return change.isPositive !== undefined && change.unit === undefined && change.invert === undefined && change.value !== null
}

/** `isPositive` bez `invert`: barva podle `isPositive`, i když nesouhlasí se znaménkem. */
function deltaInvert(change: HeroCardChange): boolean {
  if (change.invert !== undefined) return change.invert
  if (change.isPositive === undefined || change.value === null) return false
  return change.value > 0 !== change.isPositive
}

export function HeroCard({
  title,
  value,
  change,
  subtitle,
  href,
  icon: Icon,
  iconTone,
  isLoading,
  size = 'lg',
  tone,
  valueTone,
  highlight,
  hrefLabel = 'Zobrazit detail',
}: HeroCardProps) {
  const cardTone: HeroCardTone = tone ?? (highlight ? 'negative' : 'default')
  const valueClass = valueTone && valueTone !== 'default' ? VALUE_TONE[valueTone] : VALUE_BY_TONE[cardTone]
  const SubtitleTag = typeof subtitle === 'string' || typeof subtitle === 'number' ? 'p' : 'div'

  const link = href && (
    <div className="flex items-center gap-1 mt-3 text-brand-600 dark:text-brand-400 text-sm font-medium">
      {hrefLabel}
      <ChevronRight className="w-4 h-4" />
    </div>
  )

  const cardContent = size === 'sm' ? (
    <div className={clsx('min-w-0 p-4 rounded-xl border transition-colors', CARD_TONE[cardTone], href && HOVER)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{title}</h3>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-24" />
          ) : (
            <p className={clsx('mt-1 truncate text-2xl font-bold tabular-nums', valueClass)} title={String(value)}>{value}</p>
          )}
          {change && change.value !== null && (
            <div className="mt-1 flex flex-wrap items-center gap-x-1">
              <Delta value={change.value} unit={change.unit} invert={deltaInvert(change)} />
              {change.label && (
                <span className="min-w-0 truncate text-xs text-neutral-500 dark:text-neutral-400">{change.label}</span>
              )}
            </div>
          )}
          {subtitle != null && subtitle !== false && subtitle !== '' && (
            <SubtitleTag className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</SubtitleTag>
          )}
        </div>
        {Icon && (
          <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', ICON_SQUARE[iconTone ?? SQUARE_BY_TONE[cardTone]])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
      {link}
    </div>
  ) : (
    <div className={clsx('p-6 rounded-xl border transition-colors', CARD_TONE[cardTone], href && HOVER)}>
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <Icon className={clsx('w-5 h-5', iconTone ? ICON_TONE[iconTone] : ICON_BY_TONE[cardTone])} />
        )}
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
      </div>

      {isLoading ? (
        <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2" />
      ) : (
        <p className={clsx('text-3xl font-bold mb-2', valueClass)}>
          {value}
        </p>
      )}

      {change && (isLegacyChange(change) ? (
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx(
            'text-sm font-medium',
            change.isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {change.isPositive ? '+' : ''}{change.value}%
          </span>
          <span className="text-xs text-neutral-500">{change.label}</span>
        </div>
      ) : change.value !== null && (
        <div className="flex items-center gap-2 mb-2">
          <Delta value={change.value} unit={change.unit} invert={deltaInvert(change)} size="sm" />
          {change.label && <span className="text-xs text-neutral-500">{change.label}</span>}
        </div>
      ))}

      {subtitle && (
        <SubtitleTag className="text-sm text-neutral-500">{subtitle}</SubtitleTag>
      )}

      {link}
    </div>
  )

  if (href) {
    return <a href={href} className={size === 'sm' ? 'block min-w-0' : undefined}>{cardContent}</a>
  }

  return cardContent
}
