import { useEffect, useReducer } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { POPOVER, ROW, placeAbove } from './SmableAiComposerMenu'
import type { SmableAiSlashCommand } from './types'

export interface SmableAiSlashMenuProps {
  /** Řádek pole dotazu — seznam se otevře nad ním. */
  anchor: HTMLElement
  /** `id` seznamu; řádky mají `${id}-${index}` (pro `aria-activedescendant` pole). */
  id: string
  commands: SmableAiSlashCommand[]
  active: number
  label: string
  emptyLabel: string
  onPick: (command: SmableAiSlashCommand) => void
  onHover: (index: number) => void
}

/**
 * Seznam dovedností po „/“ na začátku zprávy. Fokus zůstává v poli (vybírá se šipkami přes
 * `aria-activedescendant`), proto řádky nesmí fokus brát — `onMouseDown` ho v poli nechá.
 * Portál a `data-smable-ai-popover` jako nabídka „+“: lišta ani panel ho neořízne a klik do něj
 * widget nesbalí.
 */
export function SmableAiSlashMenu({ anchor, id, commands, active, label, emptyLabel, onPick, onHover }: SmableAiSlashMenuProps) {
  const [, relayout] = useReducer((n: number) => n + 1, 0)
  const pos = placeAbove(anchor)

  useEffect(() => {
    window.addEventListener('resize', relayout)
    return () => window.removeEventListener('resize', relayout)
  }, [])

  useEffect(() => {
    if (active >= 0) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [id, active])

  return createPortal(
    <div data-smable-ai-popover="" style={{ left: pos.left, bottom: pos.bottom, width: pos.width }} className={POPOVER}>
      <ul id={id} role="listbox" aria-label={label} className="min-h-0 overflow-y-auto">
        {commands.map((command, i) => (
          <li
            key={command.id}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => onHover(i)}
            onClick={() => onPick(command)}
            className={clsx(ROW, 'cursor-pointer', i === active && 'bg-neutral-100 dark:bg-neutral-800')}
          >
            <span className="min-w-0 flex-1 truncate">{command.label}</span>
          </li>
        ))}
        {commands.length === 0 && (
          <li role="presentation" className="px-2.5 py-2 text-[13px] text-neutral-500 dark:text-neutral-400">
            {emptyLabel}
          </li>
        )}
      </ul>
    </div>,
    document.body
  )
}
