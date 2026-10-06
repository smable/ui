import type { MouseEvent } from 'react'
import { Check, Minus } from 'lucide-react'
import clsx from 'clsx'

interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  onChange?: (e: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  title?: string
  'aria-label'?: string
  className?: string
}

export function Checkbox({ checked, indeterminate, onChange, disabled, title, 'aria-label': ariaLabel, className }: CheckboxProps) {
  const on = checked || indeterminate
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate && !checked ? 'mixed' : !!checked}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={e => { e.stopPropagation(); onChange?.(e) }}
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
        className
      )}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
      {!checked && indeterminate && <Minus className="w-3 h-3 text-white" />}
    </button>
  )
}
