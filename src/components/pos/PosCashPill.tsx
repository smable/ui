import type { ReactNode } from 'react'

export interface PosCashPillProps {
  tone: 'brand' | 'neutral'
  children: ReactNode
  onClick: () => void
}

/** Rychlá bankovka / „Jiná částka" u platby hotově. */
export function PosCashPill({ tone, children, onClick }: PosCashPillProps) {
  const toneClass = tone === 'brand' ? 'bg-brand-50 text-brand-600 hover:bg-brand-100' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
  return (
    <button type="button" onClick={onClick} className={`rounded-full px-4 py-3 text-[15px] font-semibold leading-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${toneClass}`}>
      {children}
    </button>
  )
}
