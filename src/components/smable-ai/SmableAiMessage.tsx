import type { ReactNode } from 'react'
import { BookOpen, CheckCircle2, ChevronRight, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import clsx from 'clsx'
import { SmableButton } from '../SmableButton'
import { canRetry } from './messages'
import type { SmableAiFeedback, SmableAiLabels, SmableAiMessageData } from './types'

export interface SmableAiMessageProps {
  message: SmableAiMessageData
  labels: SmableAiLabels
  /** Obsah odpovědi (markdown renderer zůstává v konzumentovi). */
  renderContent: (content: string) => ReactNode
  /** Klik na aktivní palec posílá `null`. Bez callbacku se palce nevykreslí. */
  onFeedback?: (id: SmableAiMessageData['id'], feedback: SmableAiFeedback) => void
  onRetry?: () => void
  /** „Zkusit znovu“ se nabízí jen u poslední zprávy (seznam ho během čekání na odpověď vypne). */
  isLast: boolean
  /** Obsah pod odpovědí asistenta (např. `SmableAiActionCard`); ne u otázky ani u chybové bubliny. */
  renderMessageExtra?: (message: SmableAiMessageData) => ReactNode
}

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'

export function SmableAiMessage({
  message,
  labels,
  renderContent,
  onFeedback,
  onRetry,
  isLast,
  renderMessageExtra,
}: SmableAiMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[61%] rounded-2xl rounded-br bg-brand-600 px-4 py-3 text-base text-white whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.error) {
    const retry = !!onRetry && canRetry(message.error, isLast)
    return (
      <div className="flex flex-col gap-2">
        <AssistantRow label={labels.assistant} />
        <div className="flex flex-col items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          <p>{labels.errors[message.error]}</p>
          {retry && (
            <SmableButton variant="secondary" size="sm" onClick={onRetry}>
              {labels.retry}
            </SmableButton>
          )}
        </div>
      </div>
    )
  }

  const sources = message.sources ?? []
  const help = (message.help ?? []).filter((h) => h.url.startsWith('https://'))

  return (
    <div className="flex flex-col gap-2">
      <AssistantRow label={labels.assistant} />
      {sources.length > 0 && (
        <div className="flex items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1 break-words">
            <span className="sr-only">{labels.sourcesPrefix} </span>
            {sources.map((s) => s.label).join(' · ')}
          </p>
        </div>
      )}
      <div className="min-w-0 text-base text-neutral-900 dark:text-neutral-50">{renderContent(message.content)}</div>
      {renderMessageExtra?.(message)}
      {help.length > 0 && (
        <div className="flex flex-col gap-2">
          {help.map((h) => (
            <a
              key={h.url}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 transition-colors',
                'hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800',
                FOCUS
              )}
            >
              <BookOpen className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-2xs text-neutral-500 dark:text-neutral-400">{labels.helpLabel}</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{h.title}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
            </a>
          ))}
        </div>
      )}
      {onFeedback && (
        <div className="flex items-center gap-3.5">
          <FeedbackButton
            active={message.feedback === 'up'}
            label={labels.feedbackUp}
            onClick={() => onFeedback(message.id, message.feedback === 'up' ? null : 'up')}
          >
            <ThumbsUp className="h-4 w-4" aria-hidden />
          </FeedbackButton>
          <FeedbackButton
            active={message.feedback === 'down'}
            label={labels.feedbackDown}
            onClick={() => onFeedback(message.id, message.feedback === 'down' ? null : 'down')}
          >
            <ThumbsDown className="h-4 w-4" aria-hidden />
          </FeedbackButton>
        </div>
      )}
    </div>
  )
}

function AssistantRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
      <Sparkles className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
      <span>{label}</span>
    </div>
  )
}

function FeedbackButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={clsx(
        '-m-1.5 rounded-md p-1.5 transition-colors',
        active
          ? 'text-brand-600'
          : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
        FOCUS
      )}
    >
      {children}
    </button>
  )
}
