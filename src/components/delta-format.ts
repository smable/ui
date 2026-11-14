export type DeltaUnit = '%' | 'pp'
export type DeltaDirection = 'up' | 'down' | 'flat'
export type DeltaSentiment = 'positive' | 'negative' | 'neutral'

export interface DeltaFormatOptions {
  unit?: DeltaUnit
  /** Text jednotky místo výchozího (`%` → „%“, `pp` → „p. b.“). */
  unitLabel?: string
  invert?: boolean
  locale?: string
  fractionDigits?: number
}

export interface DeltaParts {
  /** Číslo se znaménkem bez jednotky, např. „+12,3“ nebo „−4,5“ (typografické minus U+2212). */
  number: string
  /** Číslo s jednotkou oddělenou pevnou mezerou, např. „+12,3 %“. */
  text: string
  direction: DeltaDirection
  sentiment: DeltaSentiment
}

export const DELTA_UNIT_LABELS: Record<DeltaUnit, string> = { '%': '%', pp: 'p. b.' }

/**
 * Rozloží změnu na text a směr. Směr se určuje až po zaokrouhlení, takže 0,04 s jedním
 * desetinným místem je „0“ bez šipky a neutrální. `invert` prohodí barvu (pokles nákladů
 * je dobrá zpráva), šipka dál ukazuje skutečný směr. `null` a nečíselné hodnoty vrací `null`.
 * Záporné číslo má typografické minus U+2212 („−4,5 %“), ne spojovník — v každém locale.
 */
export function formatDelta(value: number | null | undefined, options: DeltaFormatOptions = {}): DeltaParts | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  const { unit = '%', unitLabel, invert = false, locale = 'cs-CZ', fractionDigits = 1 } = options

  const factor = 10 ** fractionDigits
  const rounded = Math.round(Math.abs(value) * factor) / factor
  const signed = rounded === 0 ? 0 : Math.sign(value) * rounded
  const direction: DeltaDirection = signed > 0 ? 'up' : signed < 0 ? 'down' : 'flat'
  const sentiment: DeltaSentiment =
    direction === 'flat' ? 'neutral' : (direction === 'up') !== invert ? 'positive' : 'negative'

  const number = new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
    signDisplay: 'exceptZero',
  }).format(signed).replace(/-/g, '\u2212')

  return { number, text: `${number} ${unitLabel ?? DELTA_UNIT_LABELS[unit]}`, direction, sentiment }
}
