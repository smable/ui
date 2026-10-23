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

/** S mikrofonem: prázdné pole ukáže mikrofon místo Odeslat, text ukáže Odeslat; nahrávání nechá stop vidět vždy. */
export function composerButtons(o: { hasMic: boolean; recording: boolean; value: string }): { mic: boolean; send: boolean } {
  if (!o.hasMic) return { mic: false, send: true }
  const empty = normalizeOutgoing(o.value) === ''
  return { mic: o.recording || empty, send: !empty }
}
