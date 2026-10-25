import clsx from 'clsx'

export interface SmableAiSuggestionsProps {
  items: string[]
  onPick: (question: string) => void
  /** Popisek nad chipy („Zkuste třeba“). */
  label?: string
}

export function SmableAiSuggestions({ items, onPick, label }: SmableAiSuggestionsProps) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            className={clsx(
              'max-w-full rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-left text-sm font-medium text-brand-600 transition-colors',
              'hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-brand-400 dark:hover:bg-neutral-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
