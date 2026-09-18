import type { ReactNode } from 'react'

export type PosStatus = 'ok' | 'warning' | 'error'

export interface PosStatusBadgeProps {
  status: PosStatus
  children: ReactNode
  /** Klikatelný odznak (např. tiskárna → nastavení). */
  onClick?: () => void
}

const DOT: Record<PosStatus, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
}

export function PosStatusBadge({ status, children, onClick }: PosStatusBadgeProps) {
  const className =
    'inline-flex items-center gap-1.5 rounded-full bg-neutral-200 px-2.5 py-1.5 text-[13px] font-semibold text-neutral-700 whitespace-nowrap'
  const content = (
    <>
      <span aria-hidden className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      {children}
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} className={`${className} hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}>
      {content}
    </button>
  ) : (
    <span className={className}>{content}</span>
  )
}
