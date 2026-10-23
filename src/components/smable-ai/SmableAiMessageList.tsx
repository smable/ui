import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { SmableAiMessage, type SmableAiMessageProps } from './SmableAiMessage'
import { liveAnnouncement } from './messages'
import type { SmableAiLabels, SmableAiMessageData } from './types'

export interface SmableAiMessageListProps {
  messages: SmableAiMessageData[]
  /** Čeká se na odpověď — na konci seznamu běží „Hledám v datech…“. */
  pending: boolean
  labels: SmableAiLabels
  renderContent: SmableAiMessageProps['renderContent']
  onFeedback?: SmableAiMessageProps['onFeedback']
  onRetry?: SmableAiMessageProps['onRetry']
  /** Slot nahoře — „Nová konverzace“ nebo kontext stránky. */
  header?: ReactNode
  className?: string
}

export function SmableAiMessageList({
  messages,
  pending,
  labels,
  renderContent,
  onFeedback,
  onRetry,
  header,
  className,
}: SmableAiMessageListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const last = messages[messages.length - 1]
  const lastId = last?.id

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, lastId, pending])

  // Živá oblast pro čtečky: oznámení se váže na přechod `pending`, ne na další překreslení —
  // kdyby efekt závisel i na `labels` (konzumenti je píší inline), smazal by „odpovězeno“
  // hned v dalším renderu a čtečka by ho nestihla přečíst.
  const prevPending = useRef(pending)
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => {
    setAnnouncement(liveAnnouncement(prevPending.current, pending, last, labels))
    prevPending.current = pending
  }, [pending])

  return (
    <div ref={ref} className={clsx('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto', className)}>
      {header}
      {messages.map((message, i) => (
        <SmableAiMessage
          key={message.id}
          message={message}
          labels={labels}
          renderContent={renderContent}
          onFeedback={onFeedback}
          onRetry={onRetry}
          isLast={!pending && i === messages.length - 1}
        />
      ))}
      {pending && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <Sparkles className="h-4 w-4 shrink-0 animate-pulse-soft text-brand-600" aria-hidden />
          <span>{labels.pending}</span>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
