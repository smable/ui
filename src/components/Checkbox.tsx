import { useId, type MouseEvent, type ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'
import clsx from 'clsx'

export interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  onChange?: (e: MouseEvent<HTMLButtonElement>) => void
  /** Nová hodnota po kliknutí (z `indeterminate` vede klik na `true`). Volá se vedle `onChange`. */
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  title?: string
  'aria-label'?: string
  /** Bez `label` patří na samotné zaškrtávátko, s `label` na celý řádek. */
  className?: string
  /** Popisek vpravo; klik na něj přepne stejně jako na zaškrtávátko. */
  label?: ReactNode
  /** Druhý řádek pod popiskem (jen s `label`). */
  description?: ReactNode
  /** Vzhled karty s okrajem, vybraná má okraj brand (jen s `label`). */
  bordered?: boolean
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  onCheckedChange,
  disabled,
  title,
  'aria-label': ariaLabel,
  className,
  label,
  description,
  bordered,
}: CheckboxProps) {
  const autoId = useId()
  const on = checked || indeterminate
  const hasLabel = label !== undefined && label !== null && label !== false
  const descId = hasLabel && description ? `checkbox-${autoId}-desc` : undefined

  const box = (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate && !checked ? 'mixed' : !!checked}
      aria-label={ariaLabel}
      aria-describedby={descId}
      title={title}
      disabled={disabled}
      onClick={e => {
        e.stopPropagation()
        onChange?.(e)
        onCheckedChange?.(!checked)
      }}
      className={clsx(
        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-900",
        // Zakázaný stav nestačí ztlumit průhledností — v tmavém režimu by prázdné
        // pole vypadalo stejně jako aktivní. Mění se proto okraj i výplň.
        disabled
          ? clsx(
              "cursor-not-allowed border-neutral-200 dark:border-neutral-700",
              on ? "bg-neutral-300 dark:bg-neutral-600" : "bg-neutral-100 dark:bg-neutral-800"
            )
          : on
            ? "bg-brand-500 border-brand-500"
            : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500",
        !hasLabel && className
      )}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
      {!checked && indeterminate && <Minus className="w-3 h-3 text-white" />}
    </button>
  )

  if (!hasLabel) return box

  // <label> předá klik na textu zaškrtávátku (button je labelable) a dá mu přístupný název.
  // Vlastní klik labelu nebublá dál — zaškrtávátko propagaci zastavuje taky (řádky tabulek).
  return (
    <label
      onClick={e => e.stopPropagation()}
      className={clsx(
        'flex items-start gap-3',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        bordered && clsx(
          'p-3 rounded-xl border transition-colors',
          on
            ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20'
            : clsx(
                'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900',
                !disabled && 'hover:border-neutral-300 dark:hover:border-neutral-700'
              )
        ),
        className
      )}
    >
      {box}
      <span className={clsx('min-w-0', disabled && 'opacity-60')}>
        <span className="block text-sm font-medium text-neutral-900 dark:text-white">{label}</span>
        {description && (
          <span id={descId} className="block mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{description}</span>
        )}
      </span>
    </label>
  )
}
