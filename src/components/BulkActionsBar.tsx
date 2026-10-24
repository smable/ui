import { X } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

interface BulkActionsBarProps {
  count: number
  label?: (count: number) => string
  children: ReactNode
  onClear: () => void
}

function defaultLabel(count: number): string {
  if (count === 1) return '1 položka vybrána'
  if (count < 5) return `${count} položky vybrány`
  return `${count} položek vybráno`
}

/**
 * Nad lištou Smable AI a uprostřed obsahu: host nastaví `--smable-ai-bar-reserve` (místo pro lištu),
 * `--smable-ai-inset-left` / `--smable-ai-inset-right` (postranní menu / připnutý panel). Bez nich
 * `bottom: 1.5rem` a `left: 50%` jako dřív. Šířka nepřeteče obsah, mezi okraji drží 1rem.
 */
const POSITION = {
  bottom: 'calc(1.5rem + var(--smable-ai-bar-reserve, 0px))',
  left: 'calc(var(--smable-ai-inset-left, 0px) + (100% - var(--smable-ai-inset-left, 0px) - var(--smable-ai-inset-right, 0px)) / 2)',
  maxWidth: 'calc(100% - var(--smable-ai-inset-left, 0px) - var(--smable-ai-inset-right, 0px) - 2rem)',
} satisfies CSSProperties

export function BulkActionsBar({ count, label = defaultLabel, children, onClear }: BulkActionsBarProps) {
  if (count === 0) return null

  return (
    <div style={POSITION} className="fixed -translate-x-1/2 z-30 flex flex-wrap justify-center items-center gap-3 px-5 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl shadow-2xl">
      <span className="text-sm font-medium">{label(count)}</span>
      <div className="w-px h-5 bg-neutral-700 dark:bg-neutral-300" />
      {children}
      <button type="button"
        aria-label="Zrušit výběr"
        onClick={onClear}
        className="p-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
