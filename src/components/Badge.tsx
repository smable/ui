import type { ReactNode } from 'react'

/**
 * Badge — UI primitive pro stage / status / score / severity chips.
 *
 * Tone = barevný kontext, ne business význam. Konzumenti (CRM lead stage,
 * helpdesk ticket status, …) si mapují business hodnoty na tone v thin
 * wrapperu na své straně.
 *
 * @example
 *   <Badge tone="emerald">Vyhráno</Badge>
 *   <Badge tone="red" size="sm" icon={<AlertOctagon className="w-3 h-3" />}>
 *     Kritické
 *   </Badge>
 */
export type BadgeTone =
  | 'neutral'
  | 'blue'
  | 'cyan'
  | 'purple'
  | 'pink'
  | 'amber'
  | 'orange'
  | 'emerald'
  | 'red'
  | 'brand'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  tone?: BadgeTone
  size?: BadgeSize
  icon?: ReactNode
  children: ReactNode
}

const toneClass: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
  blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300',
  purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
  pink: 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300',
  amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  orange: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
  red: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300',
  brand: 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300',
}

const sizeClass: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-2xs gap-0.5',
  md: 'px-2 py-0.5 text-xs gap-1',
}

export function Badge({ tone = 'neutral', size = 'md', icon, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-md ${toneClass[tone]} ${sizeClass[size]}`}
    >
      {icon}
      {children}
    </span>
  )
}
