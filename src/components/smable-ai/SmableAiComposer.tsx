import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowUp, Mic } from 'lucide-react'
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
  labels: Pick<SmableAiLabels, 'placeholder' | 'send' | 'charsLeft' | 'dictate' | 'stopDictation' | 'listening'>
  autoFocus?: boolean
  /** Slot před polem (budoucí příloha). */
  leading?: ReactNode
  /** Slot mezi polem a tlačítkem Odeslat. */
  trailing?: ReactNode
  /** Poznámka pod polem (disclaimer). */
  hint?: ReactNode
  /** Bez rámečku, pozadí a ringu, menší tlačítka — chrome dodá obal (sbalená lišta widgetu). */
  bare?: boolean
  /** Výška pole v řádcích, než začne růst s textem (max 6). */
  minRows?: number
  /** Běží nahrávání — tlačítko mikrofonu ukáže stop, pole „Poslouchám…“. Do pole se nic nevkládá. */
  recording?: boolean
  /** S callbackem se před Odeslat vykreslí mikrofon, klik přepne `recording`. */
  onRecordingChange?: (recording: boolean) => void
}

const LINE_HEIGHT = 20
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
  bare = false,
  minRows = 2,
  recording = false,
  onRecordingChange,
}: SmableAiComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const max = LINE_HEIGHT * MAX_ROWS
    el.style.height = '0px'
    const content = el.scrollHeight
    el.style.height = `${Math.max(LINE_HEIGHT * minRows, Math.min(content, max))}px`
    el.style.overflowY = content > max ? 'auto' : 'hidden'
  }, [value, minRows])

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
  const button = bare ? 'h-8 w-8' : 'h-9 w-9'
  const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={clsx(
          'flex w-full items-end gap-2',
          bare
            ? 'pl-1.5'
            : clsx(
                'rounded-full border border-neutral-200 bg-white py-1.5 pl-4 pr-1.5 transition-shadow',
                'has-[textarea:focus]:ring-2 has-[textarea:focus]:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-900'
              )
        )}
      >
        {leading}
        <textarea
          ref={ref}
          rows={minRows}
          value={value}
          maxLength={maxLength}
          autoFocus={autoFocus}
          aria-label={labels.placeholder}
          placeholder={recording ? labels.listening : labels.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className={clsx(
            'min-w-0 flex-1 resize-none overflow-y-hidden bg-transparent p-0 text-[13px] leading-5 text-neutral-900',
            'placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-neutral-50',
            bare && 'my-1.5'
          )}
        />
        {trailing}
        {onRecordingChange && (
          <button
            type="button"
            onClick={() => onRecordingChange(!recording)}
            aria-pressed={recording}
            aria-label={recording ? labels.stopDictation : labels.dictate}
            className={clsx(
              'flex shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors',
              'hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
              button,
              focusRing
            )}
          >
            {recording ? (
              <span className="h-3 w-3 rounded-sm bg-red-600 motion-safe:animate-pulse" aria-hidden />
            ) : (
              <Mic className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={send}
          disabled={disabled}
          aria-label={labels.send}
          className={clsx(
            'flex shrink-0 items-center justify-center rounded-full transition-colors',
            'bg-brand-600 text-white hover:bg-brand-700',
            'disabled:bg-neutral-300 disabled:text-neutral-300 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-700',
            button,
            focusRing
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
