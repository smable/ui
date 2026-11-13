import { useEffect, useRef } from 'react'

export interface UseOverlayOptions {
  /** Esc nad nejvrchnějším otevřeným overlayem. Bez handleru Esc nic nedělá. */
  onEscape?: () => void
  lockScroll?: boolean
  restoreFocus?: boolean
}

// Otevřené overlaye v pořadí otevření. Esc patří jen poslednímu — ConfirmDialog nad SmableDialogem
// nesmí zavřít oba najednou.
const stack: object[] = []

/**
 * Společné chování modálních vrstev: Esc, zámek posunu stránky a návrat fokusu po zavření.
 *
 * Efekt běží jen při otevření a zavření. `onEscape` se čte přes ref — konzumenti ho píší inline
 * a efekt závislý na něm by při každém překreslení rodiče vzal fokus z pole uvnitř vrstvy.
 */
export function useOverlay(
  open: boolean,
  { onEscape, lockScroll = true, restoreFocus = true }: UseOverlayOptions = {},
) {
  const onEscapeRef = useRef(onEscape)
  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!open || typeof document === 'undefined') return
    const token = {}
    stack.push(token)
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return
      if (stack[stack.length - 1] !== token) return
      const handler = onEscapeRef.current
      if (!handler) return
      e.preventDefault()
      handler()
    }
    document.addEventListener('keydown', onKey)

    const overflow = document.body.style.overflow
    if (lockScroll) document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      const i = stack.indexOf(token)
      if (i !== -1) stack.splice(i, 1)
      if (lockScroll) document.body.style.overflow = overflow
      if (restoreFocus && previous && document.contains(previous)) previous.focus()
    }
  }, [open, lockScroll, restoreFocus])
}
