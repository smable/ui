import { ChevronRight, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { SmableAiSuggestions } from './SmableAiSuggestions'

export interface SmableAiEmptyStateProps {
  title: string
  lead: string
  /** Popisek nad otázkami („Zkus třeba“). */
  suggestionsLabel?: string
  suggestions: string[]
  onPick: (question: string) => void
  /** `rows` = stránka (řádky s šipkou), `chips` = widget (zarovnané na střed, chipy). */
  variant?: 'rows' | 'chips'
}

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'

export function SmableAiEmptyState({
  title,
  lead,
  suggestionsLabel,
  suggestions,
  onPick,
  variant = 'rows',
}: SmableAiEmptyStateProps) {
  if (variant === 'chips') {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
            <Sparkles className="h-6 w-6 text-brand-600" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{lead}</p>
        </div>
        <SmableAiSuggestions items={suggestions} onPick={onPick} label={suggestionsLabel} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950">
        <Sparkles className="h-6 w-6 text-brand-600" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{lead}</p>
      {suggestions.length > 0 && (
        <>
          {suggestionsLabel && (
            <p className="text-2xs font-medium text-neutral-500 dark:text-neutral-400">{suggestionsLabel}</p>
          )}
          <div className="flex flex-col gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPick(item)}
                className={clsx(
                  'flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm text-neutral-700 transition-colors',
                  'hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800',
                  FOCUS
                )}
              >
                <span className="min-w-0 flex-1 break-words">{item}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
