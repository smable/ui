import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowUp } from 'lucide-react'
import clsx from 'clsx'
import { SMABLE_AI_COUNTER_FROM, SMABLE_AI_MAX_CHARS, charsLeft, normalizeOutgoing, shouldSendOnKey } from './composer'
import type { SmableAiLabels } from './types'

export interface SmableAiComposerProps {
  value: string
  onChange: (value: string) => void
  /** Dostane text po `normalizeOutgoing`; prázdný text se neodesílá. */
  onSend: (text: string) => void
  /** Blokuje odeslání (tlačítko i Enter), psát lze dál — typicky během čekání na odpověď. */
  disabled?: boolean
  maxLength?: number
  labels: Pick<SmableAiLabels, 'placeholder' | 'send' | 'charsLeft'>
  autoFocus?: boolean
  /** Slot před polem (budoucí příloha). */
  leading?: ReactNode
  /** Slot mezi polem a tlačítkem Odeslat. */
  trailing?: ReactNode
  /** Poznámka pod polem (disclaimer). */
  hint?: ReactNode
}

const LINE_HEIGHT = 24
const MAX_ROWS = 6

export function SmableAiComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  maxLength = SMABLE_AI_MAX_CHARS,
  labels,
  autoFocus,
  leading,
  trailing,
  hint,
}: SmableAiComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, LINE_HEIGHT * MAX_ROWS)}px`
  }, [value])

  const send = () => {
    if (disabled) return
    const text = normalizeOutgoing(value)
    if (text === '') return
    onSend(text)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!shouldSendOnKey({ key: e.key, shiftKey: e.shiftKey, isComposing: e.nativeEvent.isComposing })) return
    e.preventDefault()
    send()
  }

  const left = charsLeft(value, maxLength)
  const showCounter = left <= SMABLE_AI_COUNTER_FROM

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={clsx(
          'flex w-full items-end gap-2 rounded-full border border-neutral-200 bg-white py-1.5 pl-4 pr-1.5 transition-shadow',
          'has-[textarea:focus]:ring-2 has-[textarea:focus]:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-900'
        )}
      >
        {leading}
        <textarea
          ref={ref}
          rows={1}
          value={value}
          maxLength={maxLength}
          autoFocus={autoFocus}
          aria-label={labels.placeholder}
          placeholder={labels.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className={clsx(
            'my-1.5 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent p-0 text-base text-neutral-900',
            'placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-neutral-50'
          )}
        />
        {trailing}
        <button
          type="button"
          onClick={send}
          disabled={disabled}
          aria-label={labels.send}
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
            'bg-brand-600 text-white hover:bg-brand-700',
            'disabled:bg-neutral-300 disabled:text-neutral-300 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-700',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'
          )}
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {(hint || showCounter) && (
        <div className="flex items-start justify-between gap-3 text-2xs text-neutral-600 dark:text-neutral-400">
          <div className="min-w-0 flex-1">{hint}</div>
          {showCounter && <span className="shrink-0 tabular-nums">{labels.charsLeft(left)}</span>}
        </div>
      )}
    </div>
  )
}
