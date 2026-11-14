import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react'
import clsx from 'clsx'
import { ChevronDown, Loader2, Plus, X } from 'lucide-react'
import { normalize, smartFilter } from '../lib/search'
import { useFieldVariant, type FieldVariant } from './FieldVariantContext'
import { fieldMessages, hintClass } from './field-messages'
import {
  canCreateOption,
  comboboxBlurAction,
  comboboxEnterAction,
  comboboxEscapeReverts,
  comboboxQuery,
  firstEnabled,
  highlightRange,
  stepActive,
} from './combobox-logic'

export interface ComboboxOption<T = unknown> {
  value: string | number
  label: string
  description?: string
  data?: T
}

export interface ComboboxLabels {
  /** aria-label křížku. */
  clear: string
  loading: string
  noResults: string
  /** Text položky „vytvořit“ (s `onCreate`). */
  create: (query: string) => string
  /** Hláška, dokud dotaz nemá `minChars` znaků. */
  minChars: (n: number) => string
}

const DEFAULT_LABELS: ComboboxLabels = {
  clear: 'Vymazat',
  loading: 'Načítání…',
  noResults: 'Žádné výsledky',
  create: (query) => `Vytvořit „${query}“`,
  minChars: (n) => `Zadejte alespoň ${n} ${n === 1 ? 'znak' : n < 5 ? 'znaky' : 'znaků'}`,
}

/**
 * Proč se text pole změnil: `input` psaní, `select` výběr (a vytvoření s `clearOnSelect`),
 * `clear` křížek, `reset` návrat textu vybrané hodnoty při blur / Esc.
 */
export type ComboboxInputChangeReason = 'input' | 'select' | 'clear' | 'reset'

export interface ComboboxOptionState {
  active: boolean
  selected: boolean
  query: string
}

export interface ComboboxProps<T = unknown> {
  label?: string
  /** Přístupný název bez viditelného `label` (buňka tabulky). */
  'aria-label'?: string
  value: ComboboxOption<T> | null
  onChange: (option: ComboboxOption<T> | null) => void
  /**
   * Řízený text pole, nezávislý na `value`. Bez něj drží text Combobox sám a při změně `value`
   * ho přepíše na její název; v řízeném režimu text mění jen rodič (přes `onInputChange`).
   */
  inputValue?: string
  /**
   * Každá změna textu z pole (v řízeném i neřízeném režimu), ne změna `value` zvenku.
   * Při výběru se volá až po `onChange`.
   */
  onInputChange?: (text: string, reason: ComboboxInputChangeReason) => void
  /** Volný text: blur ani Esc ho nevrací na vybranou hodnotu (vymazané pole dál zruší `value`). */
  freeSolo?: boolean
  /** Otevřít seznam při fokusu, výchozí `true`. Klik ho otevře vždy. */
  openOnFocus?: boolean
  /** Enter u zavřeného seznamu ho otevře (a neodešle formulář). Výchozí `false`. */
  openOnEnter?: boolean
  /** Křížek u vybrané hodnoty, výchozí `true`. S `false` je vpravo vždy `suffix` (šipka). */
  clearable?: boolean
  /**
   * Volá se před obsluhou Comboboxu, `e.preventDefault()` ji přeskočí.
   * Otevřený seznam pozná podle `e.currentTarget.getAttribute('aria-expanded') === 'true'`.
   */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  /** Lokální zdroj — filtruje se přes `filter` (výchozí `smartFilter` nad label + description). */
  options?: ComboboxOption<T>[]
  /** Serverový zdroj — volá se s debounce, starší dotazy se ruší přes signal. */
  loadOptions?: (query: string, signal: AbortSignal) => Promise<ComboboxOption<T>[]>
  /** Výchozí 250 ms. */
  debounceMs?: number
  /** Strop vykreslených návrhů u lokálního zdroje, výchozí 50. */
  limit?: number
  /** Návrhy (a dotaz na server) až od tolika znaků, výchozí 0. */
  minChars?: number
  filter?: (options: ComboboxOption<T>[], query: string) => ComboboxOption<T>[]
  renderOption?: (option: ComboboxOption<T>, state: ComboboxOptionState) => ReactNode
  /** Přidá na konec položku „Vytvořit …“, když se žádná volba nejmenuje jako dotaz. */
  onCreate?: (query: string) => void
  /** Po výběru vyprázdní pole (najdi a přidej) — `value` pak typicky zůstává `null`. */
  clearOnSelect?: boolean
  getOptionDisabled?: (option: ComboboxOption<T>) => boolean
  /** Jen výchozí varianta (ikona vlevo v poli). */
  prefix?: ReactNode
  /** Místo šipky vpravo; křížek a načítání mají přednost. */
  suffix?: ReactNode
  inputRef?: Ref<HTMLInputElement>
  /** Text chyby pod polem; `true` = jen červený okraj. */
  error?: string | boolean
  hint?: ReactNode
  disabled?: boolean
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
  /** Zvýraznit shodu v názvu volby, výchozí `true`. */
  highlight?: boolean
  /** Zkratka pro `labels.noResults` (dřívější prop v app). */
  emptyText?: string
  labels?: Partial<ComboboxLabels>
  /** Bez něj podle `FieldVariantContext` (v SmableDrawer floating), jako `Input`. */
  variant?: FieldVariant
  /**
   * Default: `small` h-9 (buňky tabulek), jinak h-10. Floating: `large` h-16 (výchozí), jinak h-12.
   * `small` bez `variant` vždy vykreslí default variantu.
   */
  size?: 'small' | 'medium' | 'large'
  id?: string
  name?: string
  className?: string
}

const defaultLabelClass = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5'
const errorMsgClass = 'mt-1.5 text-xs text-red-600 dark:text-red-400'

function setRef<V>(ref: Ref<V> | undefined, value: V) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as MutableRefObject<V>).current = value
}

function highlightMatch(text: string, query: string): ReactNode {
  const range = highlightRange(text, query, normalize)
  if (!range) return text
  const [start, end] = range
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-transparent font-semibold text-neutral-900 dark:text-white">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  )
}

type Item<T> = { kind: 'option'; option: ComboboxOption<T>; disabled: boolean } | { kind: 'create' }

/**
 * Výběr z nabídky s hledáním. Lokální (`options`) i serverový (`loadOptions`) zdroj.
 *
 * Volný text, ze kterého vzniká nová položka (příjemka v app), = `inputValue` + `onInputChange` + `freeSolo`.
 * Lokální `ElementCombobox` (app, `pages/Inventory/receipt/ReceiptLinesTable.tsx`) se nahradí takto,
 * `paired = matched || newElement`:
 * - `inputValue={line.itemName}`, `onInputChange={(text, reason) => reason === 'input' && onChange({ itemName: text,
 *   matchedElementId: null, ...(newElement ? { newElement: { ...newElement, name: text } } : {}) })}` — psaní ruší
 *   spárování; text po výběru nastaví `pick` sám, proto se `select` / `reset` ignorují.
 * - `value={matched ? volba karty : null}` (label = název karty = `itemName`), `onChange={(o) => o && pick(o.data)}`.
 * - `freeSolo` — blur ani Esc text nevrátí, zůstane jako název nové karty.
 * - `onCreate={create}`, `labels={{ create: (q) => t.receive.newElement.create.replace('{name}', q) }}`,
 *   `emptyText={t.common.noResults}`.
 * - `filter={(opts, q) => …}` — přesná shoda EAN / kódu napřed, pak název; `q` ořízni (limit 50 je výchozí).
 * - `clearable={false}` + `suffix={matched ? <Check /> : newElement ? <Plus /> : <Search />}` — ✓ / + místo křížku.
 * - `openOnFocus={!paired}` — spárovaný řádek seznam při fokusu neotevře, klikem ano.
 * - `openOnEnter` + `onKeyDown={(e) => { if (e.key === 'Enter' && paired && e.currentTarget.getAttribute('aria-expanded')
 *   !== 'true') { e.preventDefault(); onPicked() } }}` — Enter otevře seznam, ze spárovaného řádku skočí na množství.
 * - `renderOption` (název, EAN / kód · jednotka, cena), `disabled={readOnly}`, `inputRef`, `placeholder`, `aria-label`.
 * - Řádek stavu (spárováno / nová karta / Zpět) zůstává v app pod Comboboxem, ne v `hint` (byl by `<p>` v `<p>`).
 *
 * Rozdíly proti ElementComboboxu: „Vytvořit …“ se nenabídne, když se volba jmenuje stejně bez ohledu na diakritiku
 * („kava“ / „Káva“) — `filter` proto porovnávej přes `normalize`, ať se „Káva“ najde; šipka dolů u zavřeného seznamu
 * ho jen otevře (ElementCombobox zároveň posunul výběr na druhou položku).
 */
export function Combobox<T = unknown>({
  label,
  'aria-label': ariaLabel,
  value,
  onChange,
  inputValue,
  onInputChange,
  freeSolo = false,
  openOnFocus = true,
  openOnEnter = false,
  clearable = true,
  onKeyDown,
  options,
  loadOptions,
  debounceMs = 250,
  limit = 50,
  minChars = 0,
  filter,
  renderOption,
  onCreate,
  clearOnSelect = false,
  getOptionDisabled,
  prefix,
  suffix,
  inputRef,
  error,
  hint,
  disabled,
  placeholder,
  required,
  autoFocus,
  highlight = true,
  emptyText,
  labels,
  variant: variantProp,
  size,
  id,
  name,
  className,
}: ComboboxProps<T>) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const contextVariant = useFieldVariant()
  const variant = variantProp ?? (size === 'small' ? 'default' : contextVariant)
  const autoId = useId()
  const inputId = id ?? `combobox-${autoId}`
  const listId = `${inputId}-list`
  const innerRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedLabel = clearOnSelect ? undefined : value?.label
  const controlled = inputValue !== undefined
  const [innerText, setInnerText] = useState(selectedLabel ?? '')
  const text = controlled ? inputValue : innerText
  const mode = { clearOnSelect, freeSolo }
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [remote, setRemote] = useState<ComboboxOption<T>[]>([])
  const [loading, setLoading] = useState(false)

  // Jen při skutečné změně hodnoty — nový objekt se stejnou hodnotou nesmí přepsat rozepsaný text.
  // Řízený text drží rodič, ten se tu nepřepisuje.
  useEffect(() => {
    if (!controlled && !clearOnSelect) setInnerText(value?.label ?? '')
  }, [value?.value, value?.label, clearOnSelect, controlled])

  const setText = (next: string, reason: ComboboxInputChangeReason) => {
    if (!controlled) setInnerText(next)
    if (next !== text) onInputChange?.(next, reason)
  }

  const query = comboboxQuery(text, selectedLabel)
  const belowMin = minChars > 0 && query.trim().length < minChars

  const localResults = useMemo(() => {
    if (!options || belowMin) return []
    const filtered = filter
      ? filter(options, query)
      : smartFilter(options, query, (o) => `${o.label} ${o.description ?? ''}`)
    return filtered.slice(0, limit)
  }, [options, query, limit, filter, belowMin])

  useEffect(() => {
    if (!loadOptions || !open) return
    if (belowMin) {
      setRemote([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    const timer = window.setTimeout(() => {
      loadOptions(query, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setRemote(result)
        })
        .catch(() => {
          if (!controller.signal.aborted) setRemote([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, debounceMs)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [loadOptions, query, open, debounceMs, belowMin])

  const results = loadOptions ? remote : localResults
  const showCreate =
    Boolean(onCreate) && !belowMin && !(loadOptions && loading) && canCreateOption(options ?? remote, query, normalize)

  const items = useMemo<Item<T>[]>(() => {
    const list: Item<T>[] = results.map((option) => ({
      kind: 'option',
      option,
      disabled: getOptionDisabled ? getOptionDisabled(option) : false,
    }))
    if (showCreate) list.push({ kind: 'create' })
    return list
  }, [results, showCreate, getOptionDisabled])

  const isDisabled = (i: number) => {
    const item = items[i]
    return !item || (item.kind === 'option' && item.disabled)
  }

  // Podpis obsahu místo identity pole: inline `filter` / `getOptionDisabled` dávají nové pole
  // při každém překreslení a šipky by se pořád vracely na začátek.
  const itemsKey = items
    .map((item) => (item.kind === 'create' ? '+' : `${item.option.value}${item.disabled ? '!' : ''}`))
    .join('|')

  useEffect(() => {
    setActive(firstEnabled(items.length, isDisabled))
  }, [query, open, itemsKey])

  useEffect(() => {
    if (!open || active < 0) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    el?.scrollIntoView?.({ block: 'nearest' })
  }, [active, open])

  const setInputRef = useCallback(
    (el: HTMLInputElement | null) => {
      innerRef.current = el
      setRef(inputRef, el)
    },
    [inputRef]
  )

  const select = (option: ComboboxOption<T>) => {
    onChange(option)
    setText(clearOnSelect ? '' : option.label, 'select')
    setOpen(false)
  }

  const create = () => {
    onCreate?.(query.trim())
    if (clearOnSelect) setText('', 'select')
    setOpen(false)
  }

  const choose = (index: number) => {
    const item = items[index]
    if (!item || isDisabled(index)) return
    if (item.kind === 'create') create()
    else select(item.option)
  }

  const clear = () => {
    onChange(null)
    setText('', 'clear')
    setOpen(true)
    innerRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented || e.nativeEvent.isComposing) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      else setActive((i) => stepActive(items.length, i, 1, isDisabled))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (open) setActive((i) => stepActive(items.length, i, -1, isDisabled))
    } else if (e.key === 'Enter') {
      const action = comboboxEnterAction(open, active >= 0 && !isDisabled(active), openOnEnter)
      if (action === 'choose') {
        e.preventDefault()
        choose(active)
      } else if (action === 'open') {
        e.preventDefault()
        setOpen(true)
      }
    } else if (e.key === 'Escape') {
      if (open) {
        // Zpracovaný Esc nezavře ani drawer / dialog kolem (ty kontrolují defaultPrevented).
        e.preventDefault()
        e.stopPropagation()
        setOpen(false)
        if (comboboxEscapeReverts(mode)) setText(value?.label ?? '', 'reset')
      }
    }
  }

  const handleBlur = () => {
    setOpen(false)
    const action = comboboxBlurAction(text, Boolean(value), mode)
    if (action === 'clear-value') onChange(null)
    else if (action === 'revert') setText(value?.label ?? '', 'reset')
  }

  const { hasError, errorMessage, showHint, describedBy } = fieldMessages(inputId, error, hint)
  const listVisible = open && !disabled && items.length > 0
  const message = belowMin
    ? l.minChars(minChars)
    : items.length === 0
      ? loading
        ? l.loading
        : emptyText ?? l.noResults
      : null
  const activeId = listVisible && active >= 0 ? `${listId}-${active}` : undefined
  const floating = variant === 'floating'
  const hasPlaceholder = typeof placeholder === 'string' && placeholder.trim() !== ''

  const input = (
    <input
      ref={setInputRef}
      id={inputId}
      name={name}
      type="text"
      role="combobox"
      aria-expanded={listVisible}
      aria-controls={listVisible ? listId : undefined}
      aria-autocomplete="list"
      aria-activedescendant={activeId}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      aria-label={ariaLabel}
      autoComplete="off"
      autoFocus={autoFocus}
      disabled={disabled}
      required={required}
      value={text}
      placeholder={floating ? (hasPlaceholder ? placeholder : ' ') : placeholder}
      onChange={(e) => {
        setText(e.target.value, 'input')
        setOpen(true)
      }}
      onFocus={() => openOnFocus && setOpen(true)}
      onClick={() => setOpen(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={
        floating
          ? clsx(
              'peer block w-full pl-4 pr-12',
              'text-neutral-900 dark:text-white bg-white dark:bg-neutral-900',
              'border rounded-xl appearance-none transition-colors focus:outline-none focus:ring-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              size === 'large' || size === undefined ? 'h-16 pt-6 pb-2 text-base' : 'h-12 pt-5 pb-1 text-sm',
              hasError
                ? 'border-red-500 focus:border-red-500'
                : 'border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white'
            )
          : clsx(
              // Stejné třídy jako výchozí Input.
              'w-full',
              size === 'small' ? 'h-9 px-2' : 'h-10 px-3',
              'text-sm bg-white dark:bg-neutral-800 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              hasError
                ? 'border-red-400 dark:border-red-600'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',
              prefix && 'pl-9',
              'pr-10'
            )
      }
    />
  )

  const trailing = (
    <div className={clsx('absolute top-1/2 -translate-y-1/2 flex items-center text-neutral-400', floating ? 'right-3' : 'right-2.5')}>
      {loading && open ? (
        <Loader2 aria-hidden className="w-4 h-4 animate-spin" />
      ) : value && clearable && !disabled && !clearOnSelect ? (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
          aria-label={l.clear}
          className="p-1 rounded-md hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        suffix ?? <ChevronDown aria-hidden className="w-4 h-4 pointer-events-none" />
      )}
    </div>
  )

  const popup = open && !disabled && (listVisible || message) && (
    // mousedown na seznamu (i na posuvníku) nesmí vzít poli fokus — blur by seznam zavřel.
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={clsx(
        'absolute z-30 mt-1 w-full max-h-72 overflow-y-auto border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg py-1',
        floating ? 'rounded-xl' : 'rounded-lg'
      )}
    >
      {listVisible && (
        <ul ref={listRef} id={listId} role="listbox" aria-label={label ?? ariaLabel}>
          {items.map((item, i) => {
            const isActive = i === active
            if (item.kind === 'create') {
              return (
                <li
                  key="__create"
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={false}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer text-brand-600 dark:text-brand-400',
                    isActive && 'bg-neutral-100 dark:bg-neutral-800',
                    i > 0 && 'border-t border-neutral-100 dark:border-neutral-800'
                  )}
                >
                  <Plus aria-hidden className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0 truncate">{l.create(query.trim())}</span>
                </li>
              )
            }
            const { option, disabled: optionDisabled } = item
            const selected = value?.value === option.value
            return (
              <li
                key={option.value}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                aria-disabled={optionDisabled || undefined}
                onMouseEnter={() => !optionDisabled && setActive(i)}
                onClick={() => choose(i)}
                className={clsx(
                  'flex items-center justify-between gap-3 px-4 py-2 text-sm',
                  optionDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                  isActive && 'bg-neutral-100 dark:bg-neutral-800',
                  selected && 'font-medium'
                )}
              >
                {renderOption ? (
                  renderOption(option, { active: isActive, selected, query })
                ) : (
                  <>
                    <span className="min-w-0 truncate text-neutral-700 dark:text-neutral-200">
                      {highlight ? highlightMatch(option.label, query) : option.label}
                    </span>
                    {option.description && (
                      <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {option.description}
                      </span>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {message && <p className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>}
    </div>
  )

  const messages = (
    <>
      {errorMessage && <p id={`${inputId}-error`} className={errorMsgClass}>{errorMessage}</p>}
      {showHint && <p id={`${inputId}-hint`} className={hintClass}>{hint}</p>}
    </>
  )

  if (floating) {
    return (
      <div className={className}>
        <div className="relative">
          {input}
          {label && (
            <label
              htmlFor={inputId}
              className={clsx(
                'absolute left-4 top-2 text-xs font-medium transition-all duration-150 pointer-events-none',
                !hasPlaceholder &&
                  'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal',
                'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium',
                // Kontrast jako floating Input (WCAG AA v obou režimech).
                hasError
                  ? clsx(
                      'text-red-600 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-400',
                      !hasPlaceholder && 'peer-placeholder-shown:text-red-600 dark:peer-placeholder-shown:text-red-400'
                    )
                  : clsx(
                      'text-neutral-600 dark:text-neutral-400 peer-focus:text-neutral-900 dark:peer-focus:text-white',
                      !hasPlaceholder && 'peer-placeholder-shown:text-neutral-600 dark:peer-placeholder-shown:text-neutral-400'
                    )
              )}
            >
              {label}
              {required && <span className="text-red-500"> *</span>}
            </label>
          )}
          {trailing}
          {popup}
        </div>
        {messages}
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className={defaultLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center">
            {prefix}
          </div>
        )}
        {input}
        {trailing}
        {popup}
      </div>
      {messages}
    </div>
  )
}
