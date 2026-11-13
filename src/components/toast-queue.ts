export type ToastTone = 'success' | 'error' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** ms do zavření. `null` (i 0) = drží, dokud ho někdo nezavře. Výchozí 4 s, chyby 8 s. */
  duration?: number | null
  /** Tlačítko v hlášce („Vrátit“, „Zkusit znovu“). Klik ho spustí a hlášku zavře. */
  action?: ToastAction
}

export interface ToastEntry {
  id: number
  tone: ToastTone
  message: string
  duration: number | null
  action?: ToastAction
}

export const TOAST_DURATION = 4000
export const TOAST_ERROR_DURATION = 8000
// Delší prodleva setTimeout přeteče a hláška by zmizela hned.
const MAX_TIMEOUT = 2147483647

export function toastDuration(tone: ToastTone, duration?: number | null): number | null {
  if (duration === undefined) return tone === 'error' ? TOAST_ERROR_DURATION : TOAST_DURATION
  if (duration === null || !Number.isFinite(duration) || duration <= 0) return null
  return Math.min(duration, MAX_TIMEOUT)
}

// Chyby a hlášky bez časovače by po vytlačení už nikdo neviděl — jdou ven až jako poslední.
function isProtected(toast: ToastEntry): boolean {
  return toast.tone === 'error' || toast.duration === null
}

/**
 * Přidá hlášku na konec. Nad `max` vytlačí nejstarší běžnou (ne chybu, ne bez časovače);
 * když jsou všechny chráněné, nejstarší vůbec. Nová hláška se ukáže vždy.
 */
export function addToast(queue: readonly ToastEntry[], toast: ToastEntry, max: number): ToastEntry[] {
  const limit = Number.isFinite(max) ? Math.max(1, Math.floor(max)) : Infinity
  const next = [...queue, toast]
  while (next.length > limit) {
    const i = next.findIndex((t) => t !== toast && !isProtected(t))
    next.splice(i === -1 ? 0 : i, 1)
  }
  return next
}

export function removeToast(queue: ToastEntry[], id: number): ToastEntry[] {
  return queue.some((t) => t.id === id) ? queue.filter((t) => t.id !== id) : queue
}
