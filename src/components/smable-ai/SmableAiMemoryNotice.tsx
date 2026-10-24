import { Brain } from 'lucide-react'
import { SmableButton } from '../SmableButton'

export type SmableAiMemoryNoticeState = 'idle' | 'undoing' | 'undone' | 'failed'

export interface SmableAiMemoryNoticeProps {
  /** „Uloženo do paměti: …“ — co se v tahu uložilo, upravilo nebo zapomnělo. */
  text: string
  /** `idle` = Zpět k dispozici, `undoing` = běží, `undone` = vráceno, `failed` = vrácení selhalo (Zpět znovu aktivní). */
  state: SmableAiMemoryNoticeState
  onUndo: () => void
  labels: { undo: string; undone: string; failed: string }
}

/** Řádek pod odpovědí Smable AI: změna paměti s tlačítkem Zpět, které ji opravdu vrátí. */
export function SmableAiMemoryNotice({ text, state, onUndo, labels }: SmableAiMemoryNoticeProps) {
  return (
    <div role="status" className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
      <Brain className="h-4 w-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1 line-clamp-2 text-[13px] leading-5">{text}</p>
      {state === 'undone' ? (
        <span className="shrink-0 text-[13px] text-neutral-400 dark:text-neutral-500">{labels.undone}</span>
      ) : (
        <>
          {state === 'failed' && (
            <span className="shrink-0 text-[13px] text-red-600 dark:text-red-400">{labels.failed}</span>
          )}
          <SmableButton
            variant="ghost"
            size="sm"
            className="shrink-0"
            loading={state === 'undoing'}
            onClick={onUndo}
          >
            {labels.undo}
          </SmableButton>
        </>
      )}
    </div>
  )
}
