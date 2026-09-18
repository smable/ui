import type { ReactNode } from 'react'

export interface PosKeyValueRowProps {
  label: ReactNode
  value: ReactNode
  emphasis?: 'default' | 'strong' | 'negative'
}

export function PosKeyValueRow({ label, value, emphasis = 'default' }: PosKeyValueRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-2.5 text-[14px] last:border-b-0">
      <span className={emphasis === 'strong' ? 'font-semibold text-neutral-900' : 'text-neutral-600'}>{label}</span>
      <span className={`font-semibold ${emphasis === 'negative' ? 'text-red-500' : 'text-neutral-900'}`}>{value}</span>
    </div>
  )
}
