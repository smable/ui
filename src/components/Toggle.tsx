import { useId, useRef, type MouseEvent } from 'react'
import clsx from 'clsx'
import { Switch, type SwitchTone } from './Switch'

export interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  /** Barva zapnutého přepínače, výchozí `green`. */
  tone?: SwitchTone
}

export function Toggle({ label, description, checked, onChange, disabled, tone }: ToggleProps) {
  const autoId = useId()
  const labelId = `toggle-${autoId}-label`
  const descId = description ? `toggle-${autoId}-desc` : undefined
  const switchRef = useRef<HTMLButtonElement>(null)

  // Klik na přepínač přepne Switch sám; řádek ho proto ignoruje, jinak by se hodnota
  // přepnula dvakrát (zpátky). Žádné stopPropagation — to přepínač kdysi umrtvilo.
  const onRowClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || switchRef.current?.contains(e.target as Node)) return
    onChange(!checked)
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg transition-colors',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800'
      )}
      onClick={onRowClick}
    >
      <div className={disabled ? 'opacity-60' : undefined}>
        <span id={labelId} className="text-sm font-medium text-neutral-900 dark:text-white">{label}</span>
        {description && (
          <p id={descId} className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        ref={switchRef}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        tone={tone}
        aria-labelledby={labelId}
        aria-describedby={descId}
      />
    </div>
  )
}
