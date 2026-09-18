/**
 * Barva dlaždice přichází z backoffice (`buttons.display.button_color`, hex).
 * Text musí zůstat čitelný i na žluté nebo bílé — rozhoduje relativní jas
 * (WCAG vzorec), práh 0.55 odpovídá mockům Airu (žlutá #fde68a → tmavý text).
 */
export function readableTextClass(hex: string | null | undefined): 'text-white' | 'text-neutral-900' {
  if (!hex) return 'text-white'
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 'text-white'
  const n = parseInt(m[1], 16)
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const lum = 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  return lum > 0.55 ? 'text-neutral-900' : 'text-white'
}
