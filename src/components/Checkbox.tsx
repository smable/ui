import { Check, Minus } from 'lucide-react'
import clsx from 'clsx'

interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  onChange?: () => void
}

export function Checkbox({ checked, indeterminate, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange?.() }}
      className={clsx(
        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
        checked || indeterminate
          ? "bg-brand-500 border-brand-500"
          : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
      )}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
      {!checked && indeterminate && <Minus className="w-3 h-3 text-white" />}
    </button>
  )
}
