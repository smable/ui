import type { ReactNode } from 'react'

export interface PosPanelProps {
  title?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/** Bílá karta se záhlavím (uzávěrka, detail účtenky, nastavení). */
export function PosPanel({ title, actions, children, className = '' }: PosPanelProps) {
  return (
    <section className={`overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
          {title && <h2 className="text-[16px] font-semibold text-neutral-900">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
