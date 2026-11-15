import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DayPicker, type DateRange, type Matcher } from 'react-day-picker'
import { cs } from 'date-fns/locale'
import { format, isValid, parse } from 'date-fns'
import { Calendar, X } from 'lucide-react'
import clsx from 'clsx'
import { fieldMessages, hintClass } from './field-messages'
import 'react-day-picker/dist/style.css'

/**
 * SmableDatePicker — universal date picker matching SmableInput visuals.
 *
 * Modes:
 *   - 'date'      single date (output: Date | null)
 *   - 'datetime'  single date + HH:mm time (output: Date | null)
 *   - 'range'     date range (output: { from: Date | null; to: Date | null })
 *
 * Variants:
 *   - 'floating' (výchozí) plovoucí popisek v poli, rounded-xl, výška 64 / 48 px
 *   - 'default'  popisek nad polem, h-10 (`size="small"` h-9), rounded-lg, `hint` —
 *                stejný vzhled jako `Input variant="default"`
 * Varianta se nebere z `FieldVariantContext`: bez `variant` je pole vždy floating (i mimo drawer).
 *
 * Popover with DayPicker (react-day-picker). Closes on outside click, Escape or
 * after a complete selection. Czech locale, Monday-first week.
 *
 * Usage:
 *   <SmableDatePicker label="Datum" mode="date" value={d} onChange={setD} />
 *   <SmableDatePicker label="Termín" mode="datetime" value={d} onChange={setD} />
 *   <SmableDatePicker label="Období" mode="range" value={r} onChange={setR} />
 *   <SmableDatePicker variant="default" label="Platnost od" value={d} onChange={setD} hint="Včetně" />
 *   <SmableDatePicker variant="default" size="small" prefix="Od" value={d} onChange={setD} />  (filtr)
 */

type DateValue = Date | null
type RangeValue = { from: Date | null; to: Date | null }

type ModeProps =
  | {
      mode?: 'date'
      value: DateValue
      onChange: (value: DateValue) => void
    }
  | {
      mode: 'datetime'
      value: DateValue
      onChange: (value: DateValue) => void
    }
  | {
      mode: 'range'
      value: RangeValue
      onChange: (value: RangeValue) => void
    }

export interface SmableDatePickerLabels {
  /** aria-label křížku. */
  clear: string
  /** Popisek pole času (`datetime`). */
  time: string
  /** Tlačítko, které zavře výběr (`datetime`). */
  done: string
}

const DEFAULT_LABELS: SmableDatePickerLabels = { clear: 'Vymazat', time: 'Čas', done: 'Hotovo' }

type VariantProps =
  | {
      /** `floating` (výchozí): plovoucí popisek v poli. */
      variant?: 'floating'
      label: string
      error?: string
      /** `large` (výchozí) 64 px, `medium` 48 px. */
      size?: 'medium' | 'large'
      /** Nápovědu pod polem umí jen `variant="default"`. */
      hint?: never
      prefix?: never
    }
  | {
      /** `default`: popisek nad polem jako `Input variant="default"`. */
      variant: 'default'
      /** Bez viditelného popisku předej `aria-label`. */
      label?: string
      'aria-label'?: string
      /** Text chyby pod polem; `true` = jen červený okraj bez textu. */
      error?: string | boolean
      /** Nápověda pod polem (`aria-describedby`); při chybě se skryje. */
      hint?: ReactNode
      /** `medium` (výchozí) h-10, `small` h-9 (filtry, buňky tabulek). */
      size?: 'small' | 'medium'
      /**
       * Krátký popisek uvnitř pole před hodnotou (filtr „Od“ / „Do“). Je součástí textu tlačítka,
       * a tedy i jeho přístupného názvu — `aria-label` vedle něj nepředávej, přebil by i hodnotu.
       */
      prefix?: ReactNode
    }

type CommonProps = {
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  labels?: Partial<SmableDatePickerLabels>
}

export type SmableDatePickerProps = CommonProps & ModeProps & VariantProps

type DefaultVariantProps = Extract<VariantProps, { variant: 'default' }>

const DATE_FMT = 'd. M. yyyy'
const TIME_FMT = 'HH:mm'
const DATETIME_FMT = `${DATE_FMT} HH:mm`

function formatDisplay(
  mode: 'date' | 'datetime' | 'range',
  value: DateValue | RangeValue
): string {
  if (!value) return ''
  if (mode === 'range') {
    const r = value as RangeValue
    if (!r.from) return ''
    const left = format(r.from, DATE_FMT, { locale: cs })
    const right = r.to ? format(r.to, DATE_FMT, { locale: cs }) : '…'
    return `${left} – ${right}`
  }
  const d = value as DateValue
  if (!d || !isValid(d)) return ''
  return format(d, mode === 'datetime' ? DATETIME_FMT : DATE_FMT, { locale: cs })
}

export function SmableDatePicker(props: SmableDatePickerProps) {
  const {
    label,
    error,
    disabled,
    required,
    clearable = true,
    placeholder,
    minDate,
    maxDate,
    className,
  } = props
  const size = props.size ?? (props.variant === 'default' ? 'medium' : 'large')
  const mode = props.mode ?? 'date'
  const l = { ...DEFAULT_LABELS, ...props.labels }

  const autoId = useId()
  const inputId = `smable-date-${autoId}`
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  // Kalendář roste doprava od levé hrany pole; u pole vpravo na úzkém displeji se zarovná k pravé hraně.
  const [alignRight, setAlignRight] = useState(false)
  const [timeText, setTimeText] = useState<string>(() =>
    mode === 'datetime' && props.value ? format(props.value as Date, TIME_FMT) : ''
  )

  const display = useMemo(
    () => formatDisplay(mode, (props as ModeProps).value),
    [mode, props]
  )

  const hasValue = Boolean(display)
  const hasError = Boolean(error)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    // Ve fázi capture a s preventDefault: Esc zavře jen výběr, ne drawer / dialog kolem (useOverlay).
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open) {
      setAlignRight(false)
      return
    }
    const anchor = wrapperRef.current?.getBoundingClientRect()
    const width = popoverRef.current?.offsetWidth
    if (!anchor || !width) return
    setAlignRight(anchor.left + width > window.innerWidth - 8 && anchor.right - width >= 8)
  }, [open])

  // Sync time text when datetime value changes externally
  useEffect(() => {
    if (mode !== 'datetime') return
    const v = (props as Extract<ModeProps, { mode: 'datetime' }>).value
    if (v && isValid(v)) setTimeText(format(v, TIME_FMT))
  }, [mode, props])

  const sizeClasses =
    size === 'large'
      ? 'h-16 pt-6 pb-2 text-base'
      : 'h-12 pt-5 pb-1 text-sm'

  const disabledDays = useMemo<Matcher[] | undefined>(() => {
    const out: Matcher[] = []
    if (minDate) out.push({ before: minDate })
    if (maxDate) out.push({ after: maxDate })
    return out.length ? out : undefined
  }, [minDate, maxDate])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mode === 'range') {
      ;(props as Extract<ModeProps, { mode: 'range' }>).onChange({ from: null, to: null })
    } else {
      ;(props as Extract<ModeProps, { mode: 'date' | 'datetime' | undefined }>).onChange(null)
      setTimeText('')
    }
  }

  const handleSelectDate = (d: Date | undefined) => {
    if (mode === 'datetime') {
      const existing = (props as Extract<ModeProps, { mode: 'datetime' }>).value
      if (!d) {
        ;(props as Extract<ModeProps, { mode: 'datetime' }>).onChange(null)
        return
      }
      // Preserve existing HH:mm if we had one
      const merged = new Date(d)
      if (existing && isValid(existing)) {
        merged.setHours(existing.getHours(), existing.getMinutes(), 0, 0)
      } else {
        merged.setHours(0, 0, 0, 0)
      }
      ;(props as Extract<ModeProps, { mode: 'datetime' }>).onChange(merged)
    } else {
      ;(props.onChange as (v: DateValue) => void)(d ?? null)
      setOpen(false)
    }
  }

  const handleSelectRange = (r: DateRange | undefined) => {
    const next: RangeValue = { from: r?.from ?? null, to: r?.to ?? null }
    ;(props as Extract<ModeProps, { mode: 'range' }>).onChange(next)
    if (next.from && next.to) setOpen(false)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setTimeText(raw)
    if (mode !== 'datetime') return
    const parsed = parse(raw, TIME_FMT, new Date())
    if (!isValid(parsed)) return
    const current = (props as Extract<ModeProps, { mode: 'datetime' }>).value
    const base = current && isValid(current) ? new Date(current) : new Date()
    base.setHours(parsed.getHours(), parsed.getMinutes(), 0, 0)
    ;(props as Extract<ModeProps, { mode: 'datetime' }>).onChange(base)
  }

  const toggle = () => !disabled && setOpen((o) => !o)

  // Křížek + kalendář zabírají 56 px od pravé hrany; text hodnoty pod ně nesmí zajet.
  // Filtr s `prefix` (úzké pole) místo toho při vyplněné hodnotě ukáže jen křížek.
  const showClear = clearable && hasValue && !disabled
  const compact = props.variant === 'default' && props.prefix != null
  const iconPad = showClear && !compact ? 'pr-16' : 'pr-10'

  const icons = (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          tabIndex={-1}
          aria-label={l.clear}
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {!(compact && showClear) && <Calendar className="w-4 h-4 text-neutral-400 pointer-events-none" />}
    </div>
  )

  const popover = open && !disabled && (
    <div
      ref={popoverRef}
      role="dialog"
      className={clsx(
        'absolute top-[calc(100%+6px)] z-50 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl',
        alignRight ? 'right-0' : 'left-0'
      )}
    >
      {mode === 'range' ? (
        <DayPicker
          mode="range"
          selected={{
            from: (props as Extract<ModeProps, { mode: 'range' }>).value.from ?? undefined,
            to: (props as Extract<ModeProps, { mode: 'range' }>).value.to ?? undefined,
          }}
          onSelect={handleSelectRange}
          numberOfMonths={2}
          locale={cs}
          weekStartsOn={1}
          disabled={disabledDays}
          showOutsideDays
          className="p-3"
        />
      ) : (
        <>
          <DayPicker
            mode="single"
            selected={
              (props as Extract<ModeProps, { mode: 'date' | 'datetime' | undefined }>).value ??
              undefined
            }
            onSelect={handleSelectDate}
            locale={cs}
            weekStartsOn={1}
            disabled={disabledDays}
            showOutsideDays
            className="p-3"
          />
          {mode === 'datetime' && (
            <div className="px-3 pb-3 pt-1 flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-500">{l.time}</span>
              <input
                type="time"
                value={timeText}
                onChange={handleTimeChange}
                step={60}
                className="flex-1 h-9 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-3 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-lg transition-colors"
              >
                {l.done}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )

  if (props.variant === 'default') {
    const { hint, prefix, 'aria-label': ariaLabel } = props as DefaultVariantProps
    const { errorMessage, showHint, describedBy } = fieldMessages(inputId, error, hint)
    const valueNode = hasValue ? (
      <span className="block min-w-0 truncate">{display}</span>
    ) : (
      <span className="block min-w-0 truncate text-neutral-400 dark:text-neutral-500">{placeholder}</span>
    )
    return (
      <div ref={wrapperRef}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            id={inputId}
            disabled={disabled}
            onClick={toggle}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-label={ariaLabel}
            className={clsx(
              'block w-full text-left',
              iconPad,
              size === 'small' ? 'h-9 px-2' : 'h-10 px-3',
              'text-sm text-neutral-900 dark:text-white bg-white dark:bg-neutral-800',
              'border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              hasError
                ? 'border-red-400 dark:border-red-600'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            {prefix ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{prefix}</span>
                {valueNode}
              </span>
            ) : (
              valueNode
            )}
          </button>
          {icons}
          {popover}
        </div>
        {errorMessage && <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>}
        {showHint && <p id={`${inputId}-hint`} className={hintClass}>{hint}</p>}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={hasError || undefined}
        className={clsx(
          'peer block w-full text-left px-4',
          iconPad,
          'text-neutral-900 dark:text-white',
          'bg-white dark:bg-neutral-900',
          'border rounded-xl transition-colors',
          'focus:outline-none focus:ring-0',
          sizeClasses,
          disabled && 'opacity-50 cursor-not-allowed',
          hasError
            ? 'border-red-500 focus:border-red-500'
            : 'border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white',
          className
        )}
      >
        <span className={clsx(!hasValue && 'invisible')}>{display || 'placeholder'}</span>
        {placeholder && !hasValue && (
          <span className="absolute left-4 bottom-2 text-base text-neutral-400 dark:text-neutral-500">
            {placeholder}
          </span>
        )}
      </button>

      <label
        htmlFor={inputId}
        className={clsx(
          'absolute left-4 top-2 text-xs font-medium transition-colors pointer-events-none',
          hasError
            ? 'text-red-600'
            : open
            ? 'text-neutral-900 dark:text-white'
            : 'text-neutral-500 dark:text-neutral-400'
        )}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {icons}

      {hasError && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {popover}
    </div>
  )
}

export function SmableDatePickerSlot({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}
