import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowUp, Mic, Plus } from 'lucide-react'
import clsx from 'clsx'
import { SmableAiComposerMenu, type SmableAiMenuCloseFocus } from './SmableAiComposerMenu'
import { SmableAiSlashMenu } from './SmableAiSlashMenu'
import {
  SMABLE_AI_COUNTER_FROM,
  SMABLE_AI_MAX_CHARS,
  appendToken,
  charsLeft,
  composerButtons,
  filterSlashCommands,
  normalizeOutgoing,
  shouldSendOnKey,
  slashQuery,
} from './composer'
import type { SmableAiLabels, SmableAiMenuItem, SmableAiSlash, SmableAiSlashCommand } from './types'

export interface SmableAiComposerProps {
  value: string
  onChange: (value: string) => void
  /** Dostane text po `normalizeOutgoing`; prázdný text se neodesílá. */
  onSend: (text: string) => void
  /** Blokuje odeslání (tlačítko i Enter), psát lze dál — typicky během čekání na odpověď. */
  disabled?: boolean
  maxLength?: number
  labels: Pick<SmableAiLabels, 'placeholder' | 'send' | 'charsLeft' | 'dictate' | 'stopDictation' | 'listening' | 'menu' | 'back'>
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
  /** Položky nabídky „+“ před mikrofonem / Odeslat; bez nich (nebo prázdné) se „+“ nevykreslí. */
  menu?: SmableAiMenuItem[]
  /**
   * Dovednosti po „/“ na začátku zprávy: seznam nad polem se zužuje psaním, šipky vybírají, Enter
   * nebo Tab vloží `text` místo „/…“, Esc seznam zavře a text nechá. Dokud je seznam otevřený,
   * Enter neodešle. Bez propu se „/“ chová jako obyčejný znak.
   */
  slash?: SmableAiSlash
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
  menu,
  slash,
}: SmableAiComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const plusRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  // Po výběru z nabídky host mění `value` v témže tahu — fokus a kurzor na konec až po commitu.
  const [focusEnd, setFocusEnd] = useState(0)
  const hasMenu = Boolean(menu && menu.length > 0)
  const [focused, setFocused] = useState(false)
  const [slashDismissed, setSlashDismissed] = useState(false)
  const [slashActive, setSlashActive] = useState(0)
  const slashId = useId()
  const query = slash ? slashQuery(value) : null
  const matches = slash && query !== null ? filterSlashCommands(slash.commands, query) : []
  const slashOpen = query !== null && focused && !slashDismissed && !menuOpen
  const activeMatch = matches.length === 0 ? -1 : Math.min(slashActive, matches.length - 1)

  // Nový hledaný text vybere první dovednost; po smazání „/“ se Esc zapomene.
  useEffect(() => {
    setSlashActive(0)
    if (query === null) setSlashDismissed(false)
  }, [query])

  useEffect(() => {
    const el = ref.current
    if (focusEnd === 0 || !el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [focusEnd])

  const closeMenu = (focus: SmableAiMenuCloseFocus) => {
    setMenuOpen(false)
    if (focus === 'field') setFocusEnd((n) => n + 1)
    else if (focus === 'trigger') plusRef.current?.focus()
  }

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

  const pickSlash = (command: SmableAiSlashCommand) => {
    onChange(appendToken('', command.text, maxLength))
    setFocusEnd((n) => n + 1)
  }

  // Vrátí true, když klávesu spotřeboval seznam dovedností.
  const onSlashKey = (e: KeyboardEvent<HTMLTextAreaElement>): boolean => {
    if (!slashOpen || e.nativeEvent.isComposing) return false
    const n = matches.length
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && n > 0) {
      e.preventDefault()
      setSlashActive((activeMatch + (e.key === 'ArrowDown' ? 1 : -1) + n) % n)
      return true
    }
    if (e.key === 'Escape') {
      // Widget Esc s `defaultPrevented` ignoruje — zavře se jen seznam, ne lišta.
      e.preventDefault()
      setSlashDismissed(true)
      return true
    }
    const pick = (e.key === 'Enter' && !e.shiftKey) || (e.key === 'Tab' && !e.shiftKey && n > 0)
    if (!pick) return false
    e.preventDefault()
    if (activeMatch >= 0) pickSlash(matches[activeMatch])
    return true
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (onSlashKey(e)) return
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
        ref={rowRef}
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-autocomplete={slash ? 'list' : undefined}
          aria-controls={slashOpen ? slashId : undefined}
          aria-activedescendant={slashOpen && activeMatch >= 0 ? `${slashId}-${activeMatch}` : undefined}
          className={clsx(
            'min-w-0 flex-1 resize-none overflow-y-hidden bg-transparent p-0 text-[13px] leading-5 text-neutral-900',
            'focus:outline-none focus:ring-0 dark:text-neutral-50',
            recording ? 'placeholder:text-red-600 dark:placeholder:text-red-400' : 'placeholder:text-neutral-400',
            minRows === 1 && (bare ? 'my-1.5' : 'my-2')
          )}
        />
        {trailing}
        {hasMenu && (
          <button
            ref={plusRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={labels.menu}
            title={labels.menu}
            className={clsx(
              'flex shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors',
              'hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
              menuOpen && 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
              button,
              focusRing
            )}
          >
            <Plus className={clsx('h-4 w-4 transition-transform', menuOpen && 'rotate-45')} aria-hidden />
          </button>
        )}
        {menuOpen && menu && rowRef.current && (
          <SmableAiComposerMenu
            anchor={rowRef.current}
            trigger={plusRef}
            items={menu}
            label={labels.menu}
            backLabel={labels.back}
            onClose={closeMenu}
          />
        )}
        {slash && slashOpen && rowRef.current && (
          <SmableAiSlashMenu
            anchor={rowRef.current}
            id={slashId}
            commands={matches}
            active={activeMatch}
            label={slash.label}
            emptyLabel={slash.emptyLabel}
            onPick={pickSlash}
            onHover={setSlashActive}
          />
        )}
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
