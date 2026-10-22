import type { ReactNode } from 'react'
import { BulkActionsBar } from './BulkActionsBar'

interface SelectionBarProps {
  count: number
  label?: string
  children: ReactNode
  onClear: () => void
}

/**
 * Hromadné akce nad vybranými řádky — plovoucí lišta dole, stejná jako
 * `BulkActionsBar`. Dřív to byl pruh nad tabulkou: odsouval tabulku dolů
 * a při rolování nebyl vidět. `label` je text za počtem („3 vybráno“).
 */
export function SelectionBar({ count, label = 'vybráno', children, onClear }: SelectionBarProps) {
  return (
    <BulkActionsBar count={count} label={(n) => `${n} ${label}`} onClear={onClear}>
      <div className="flex items-center gap-1">{children}</div>
    </BulkActionsBar>
  )
}

/** Standardní tlačítko do tmavé lišty hromadných akcí (SelectionBar / BulkActionsBar). */
export function SelectionAction({ icon, label, onClick, danger }: {
  icon: ReactNode; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-lg transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200 ${
        danger ? 'text-red-400 dark:text-red-600' : ''
      }`}
    >
      {icon}{label}
    </button>
  )
}
