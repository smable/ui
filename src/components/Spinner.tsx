import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'
export type SpinnerTone = 'current' | 'neutral' | 'brand'

/**
 * Spinner — malý ukazatel načítání (otáčející se oblouk lucide `Loader2`).
 * Pro nový kód místo ručního `<Loader2 className="animate-spin" />`; celostránkové načítání dál
 * `LoadingOverlay`, tlačítko `SmableButton loading`.
 *
 * Bez `label` je dekorativní (`aria-hidden`) — vedle textu „Nahrávání…“ apod.
 * S `label` se ohlásí čtečce (`role="status"` + skrytý text).
 *
 * @example
 *   <Spinner />                                  // 16 px, barva okolního textu
 *   <Spinner size="xs" tone="neutral" />         // 12 px, šedý (v poli, v řádku tabulky)
 *   <Spinner size="lg" tone="brand" label="Načítání…" />
 */
export interface SpinnerProps {
  /** `xs` 12 px, `sm` 14 px, `md` 16 px (výchozí), `lg` 24 px. */
  size?: SpinnerSize
  /** `current` (výchozí) = barva okolního textu, `neutral` = neutral-400, `brand` = brand-500. */
  tone?: SpinnerTone
  /** Text pro čtečku; bez něj je spinner skrytý před asistivními technologiemi. */
  label?: string
  className?: string
}

const SIZE: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
}

const TONE: Record<SpinnerTone, string> = {
  current: '',
  neutral: 'text-neutral-400',
  brand: 'text-brand-500 dark:text-brand-400',
}

export function Spinner({ size = 'md', tone = 'current', label, className }: SpinnerProps) {
  const icon = (
    <Loader2
      className={clsx('shrink-0 animate-spin', SIZE[size], TONE[tone], !label && className)}
      aria-hidden="true"
    />
  )
  if (!label) return icon
  return (
    <span role="status" className={clsx('inline-flex', className)}>
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  )
}
