/**
 * Zámek posunu stránky sdílený všemi vrstvami (drawer, dialog, sheet).
 *
 * Každá vrstva dřív ukládala a vracela `overflow` sama. Když se nad drawerem otevřel dialog
 * a drawer mezitím přespustil efekt, uložil si `hidden` od dialogu a po zavření ho vrátil —
 * stránka zůstala bez posuvníku. Počítadlo drží původní hodnotu jen jednou: první vrstva ji
 * uloží, poslední ji vrátí, pořadí zavírání nehraje roli.
 */
export interface ScrollLockTarget {
  style: { overflow: string }
}

export function createScrollLock(getTarget: () => ScrollLockTarget | null) {
  let count = 0
  let saved = ''

  return {
    acquire() {
      const target = getTarget()
      if (!target) return
      if (count === 0) {
        saved = target.style.overflow
        target.style.overflow = 'hidden'
      }
      count++
    },
    release() {
      const target = getTarget()
      if (!target || count === 0) return
      count--
      if (count === 0) target.style.overflow = saved
    },
    get count() {
      return count
    },
  }
}

export const scrollLock = createScrollLock(() => (typeof document === 'undefined' ? null : document.body))
