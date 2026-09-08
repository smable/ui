import { useId } from 'react'
import clsx from 'clsx'

interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Toggle({ label, description, checked, onChange }: ToggleProps) {
  const autoId = useId()
  const labelId = `toggle-${autoId}-label`
  const descId = description ? `toggle-${autoId}-desc` : undefined

  return (
    <div
      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      onClick={() => onChange(!checked)}
    >
      <div>
        <span id={labelId} className="text-sm font-medium text-neutral-900 dark:text-white">{label}</span>
        {description && (
          <p id={descId} className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descId}
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900",
          "dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900",
          checked ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"
        )}
        // stopPropagation sám o sobě přepínač jen umrtvil — klik na něj nebublal
        // k řádku a zároveň nic nepřepnul. Musí přepnout a teprve pak zastavit,
        // jinak by řádek přepnul podruhé zpátky.
        onClick={e => {
          e.stopPropagation()
          onChange(!checked)
        }}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  )
}
