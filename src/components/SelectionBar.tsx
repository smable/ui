import type { ReactNode } from 'react'
import clsx from 'clsx'
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

export interface SelectionActionProps {
  icon?: ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
  /** Pod `sm` jen ikona, `label` zůstane jako aria-label. */
  iconOnlyOnMobile?: boolean
}

/** Standardní tlačítko do tmavé lišty hromadných akcí (SelectionBar / BulkActionsBar). */
export function SelectionAction({ icon, label, onClick, danger, disabled, iconOnlyOnMobile }: SelectionActionProps) {
  return (
    <button type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={iconOnlyOnMobile ? label : undefined}
      className={clsx(
        'inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-lg transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-800 dark:hover:bg-neutral-200',
        danger && 'text-red-400 dark:text-red-600'
      )}
    >
      {icon}
      {iconOnlyOnMobile ? <span className="hidden sm:inline">{label}</span> : label}
    </button>
  )
}
