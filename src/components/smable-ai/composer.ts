export const SMABLE_AI_MAX_CHARS = 2000
/** Počítadlo znaků se ukáže, když zbývá nejvýš tolik znaků. */
export const SMABLE_AI_COUNTER_FROM = 200

/** Enter odešle, Shift+Enter nový řádek, během skládání znaků (IME) nic. */
export function shouldSendOnKey(e: { key: string; shiftKey: boolean; isComposing: boolean }): boolean {
  return e.key === 'Enter' && !e.shiftKey && !e.isComposing
}

export function normalizeOutgoing(text: string): string {
  return text.replace(/\r\n?/g, '\n').trim()
}

export function charsLeft(text: string, max: number): number {
  return max - text.length
}

/**
 * Další aktivní položka nabídky od `from` ve směru `delta`, dokola; -1, když žádná aktivní není.
 * `from` -1 = nic vybráno: dolů začne první, nahoru poslední položkou.
 */
export function nextEnabledIndex(items: readonly { disabled?: boolean }[], from: number, delta: 1 | -1): number {
  const n = items.length
  const start = from < 0 && delta < 0 ? n : from
  for (let step = 1; step <= n; step++) {
    const i = (((start + delta * step) % n) + n) % n
    if (!items[i].disabled) return i
  }
  return -1
}

/** Jeden řádek: bílé znaky sloučí a text zkrátí na `max` znaků včetně „…“. */
export function clipText(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  // Po celých znacích (emoji jsou dvě UTF-16 jednotky), délka v jednotkách jako `maxLength` pole.
  const budget = max <= 1 ? max : max - 1
  let out = ''
  for (const ch of flat) {
    if (out.length + ch.length > budget) break
    out += ch
  }
  return max <= 1 ? out : `${out.trimEnd()}…`
}

/**
 * Připojí token (zmínku, zadání, označený řádek) za text pole: jedna mezera před ním, jedna za ním.
 * Celé se vejde do `maxLength` — token se případně zkrátí; když není místo ani na znak, pole zůstane.
 */
export function appendToken(value: string, token: string, maxLength: number = SMABLE_AI_MAX_CHARS): string {
  const base = value.replace(/\s+$/, '')
  const sep = base === '' ? '' : ' '
  const room = maxLength - base.length - sep.length - 1
  if (room < 1) return value
  return `${base}${sep}${clipText(token, room)} `
}

/** S mikrofonem: prázdné pole ukáže mikrofon místo Odeslat, text ukáže Odeslat; nahrávání nechá stop vidět vždy. */
export function composerButtons(o: { hasMic: boolean; recording: boolean; value: string }): { mic: boolean; send: boolean } {
  if (!o.hasMic) return { mic: false, send: true }
  const empty = normalizeOutgoing(o.value) === ''
  return { mic: o.recording || empty, send: !empty }
}
