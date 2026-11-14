// Čistá logika Comboboxu — bez importů, aby šla testovat přímo v node (normalize se předává).

type Normalize = (value: string) => string

/** Dokud text odpovídá vybrané hodnotě, nabízí se vše — filtruje se až po přepsání. */
export function comboboxQuery(text: string, selectedLabel: string | undefined): string {
  return selectedLabel !== undefined && text === selectedLabel ? '' : text
}

/** Nabídnout „Vytvořit …“: dotaz není prázdný a žádná volba se nejmenuje stejně (bez diakritiky a velikosti). */
export function canCreateOption(options: { label: string }[], query: string, normalize: Normalize): boolean {
  const q = normalize(query.trim())
  if (q === '') return false
  return !options.some((o) => normalize(o.label.trim()) === q)
}

/** První povolená položka, `-1` když žádná není. */
export function firstEnabled(count: number, isDisabled: (index: number) => boolean): number {
  for (let i = 0; i < count; i++) if (!isDisabled(i)) return i
  return -1
}

/**
 * Další povolená položka ve směru šipky. Na kraji seznamu zůstává (bez přetočení),
 * zakázané přeskakuje. Z `-1` (nic aktivního) vede šipka dolů na první povolenou.
 */
export function stepActive(count: number, from: number, dir: 1 | -1, isDisabled: (index: number) => boolean): number {
  if (count === 0) return -1
  for (let i = from + dir; i >= 0 && i < count; i += dir) if (!isDisabled(i)) return i
  return from >= 0 && from < count && !isDisabled(from) ? from : firstEnabled(count, isDisabled)
}

/**
 * Rozsah `[start, end)` zvýraznění dotazu v textu (bez diakritiky a velikosti), nebo `null`.
 * Normalizace musí zachovat délku textu, jinak by indexy neseděly — pak se nezvýrazní nic.
 */
export function highlightRange(text: string, query: string, normalize: Normalize): [number, number] | null {
  const q = normalize(query.trim())
  if (q === '') return null
  const haystack = normalize(text)
  if (haystack.length !== text.length) return null
  const start = haystack.indexOf(q)
  return start < 0 ? null : [start, start + q.length]
}

export interface ComboboxTextMode {
  clearOnSelect: boolean
  freeSolo: boolean
}

/**
 * Opuštění pole: `clear-value` (text vymazaný, hodnota se zruší), `revert` (text zpět na vybranou
 * hodnotu, prázdný bez hodnoty), `none`. S `freeSolo` rozepsaný text zůstává, s `clearOnSelect` vždy.
 */
export function comboboxBlurAction(text: string, hasValue: boolean, mode: ComboboxTextMode): 'none' | 'clear-value' | 'revert' {
  if (mode.clearOnSelect) return 'none'
  if (text.trim() === '' && hasValue) return 'clear-value'
  return mode.freeSolo ? 'none' : 'revert'
}

/** Esc u otevřeného seznamu vrátí text vybrané hodnoty — kromě `clearOnSelect` a `freeSolo`. */
export function comboboxEscapeReverts(mode: ComboboxTextMode): boolean {
  return !mode.clearOnSelect && !mode.freeSolo
}

/** Enter: vybrat aktivní položku otevřeného seznamu, otevřít zavřený (`openOnEnter`), jinak nic (formulář se odešle). */
export function comboboxEnterAction(open: boolean, activeEnabled: boolean, openOnEnter: boolean): 'choose' | 'open' | 'none' {
  if (open) return activeEnabled ? 'choose' : 'none'
  return openOnEnter ? 'open' : 'none'
}
