import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowUp, Mic } from 'lucide-react'
import clsx from 'clsx'
import {
  SMABLE_AI_COUNTER_FROM,
  SMABLE_AI_MAX_CHARS,
  charsLeft,
  composerButtons,
  normalizeOutgoing,
  shouldSendOnKey,
} from './composer'
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
  /** Bez rámečku, pozadí, ringu a počítadla, menší tlačítka — chrome dodá obal (sbalená lišta widgetu). */
  bare?: boolean
  /** Výška pole v řádcích, než začne růst s textem (max 6). Jeden řádek je svisle na středu tlačítek. */
  minRows?: number
  /** Běží nahrávání — tlačítko mikrofonu ukáže stop, pole „Poslouchám…“. Do pole se nic nevkládá. */
  recording?: boolean
  /** S callbackem se u prázdného pole místo Odeslat vykreslí mikrofon (s textem Odeslat), klik přepne `recording`. */
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
  minRows = 1,
  recording = false,
  onRecordingChange,
}: SmableAiComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const autosize = () => {
    const el = ref.current
    if (!el) return
    const max = LINE_HEIGHT * MAX_ROWS
    el.style.height = '0px'
    const content = el.scrollHeight
    el.style.height = `${Math.max(LINE_HEIGHT * minRows, Math.min(content, max))}px`
    el.style.overflowY = content > max ? 'auto' : 'hidden'
  }

  useLayoutEffect(autosize, [value, minRows])

  // Jiná šířka (karta → panel, okno, skryté pole na telefonu) zalomí text jinak — změřit znovu.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let width = -1
    let frame = 0
    // Měření až v dalším snímku — změna výšky uvnitř callbacku by vyvolala „ResizeObserver loop…“.
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return
      width = entry.contentRect.width
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(autosize)
    })
    observer.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [minRows])

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

  const buttons = composerButtons({ hasMic: Boolean(onRecordingChange), recording, value })
  const left = charsLeft(value, maxLength)
  const showCounter = !bare && left <= SMABLE_AI_COUNTER_FROM
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
            'focus:outline-none focus:ring-0 dark:text-neutral-50',
            recording ? 'placeholder:text-red-600 dark:placeholder:text-red-400' : 'placeholder:text-neutral-400',
            minRows === 1 && (bare ? 'my-1.5' : 'my-2')
          )}
        />
        {trailing}
        {onRecordingChange && buttons.mic && (
          <button
            type="button"
            onClick={() => onRecordingChange(!recording)}
            aria-pressed={recording}
            aria-label={labels.dictate}
            title={recording ? labels.stopDictation : labels.dictate}
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
        {buttons.send && (
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
        )}
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
