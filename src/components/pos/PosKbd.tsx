import type { ReactNode } from 'react'

export interface PosKbdProps {
  children: ReactNode
  /** `brand` = na teal tlačítku (Zaplatit). */
  tone?: 'light' | 'brand'
}

/** Nápověda klávesové zkratky — pokladna jde ovládat i klávesnicí. */
export function PosKbd({ children, tone = 'light' }: PosKbdProps) {
  const toneClass = tone === 'brand' ? 'border-white/60 text-white/80' : 'border-neutral-300 text-neutral-400'
  return (
    <kbd className={`inline-flex items-center rounded border px-1.5 font-sans text-[11px] font-semibold leading-4 ${toneClass}`}>
      {children}
    </kbd>
  )
}
