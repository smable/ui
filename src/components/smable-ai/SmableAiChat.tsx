import { useContext, type ReactNode } from 'react'
import clsx from 'clsx'
import { SmableAiComposer, type SmableAiComposerProps } from './SmableAiComposer'
import { SmableAiMessageList, type SmableAiMessageListProps } from './SmableAiMessageList'
import { SmableAiSuggestions } from './SmableAiSuggestions'
import { SmableAiWidgetContext } from './SmableAiWidget'
import type { SmableAiLabels, SmableAiMessageData } from './types'

export interface SmableAiChatProps {
  messages: SmableAiMessageData[]
  pending: boolean
  labels: SmableAiLabels
  renderContent: SmableAiMessageListProps['renderContent']
  composer: Pick<
    SmableAiComposerProps,
    'value' | 'onChange' | 'onSend' | 'disabled' | 'hint' | 'leading' | 'trailing' | 'recording' | 'onRecordingChange' | 'menu'
  >
  /** Místo seznamu zpráv, dokud je konverzace prázdná. */
  emptyState?: ReactNode
  onFeedback?: SmableAiMessageListProps['onFeedback']
  onRetry?: SmableAiMessageListProps['onRetry']
  /** Obsah pod odpovědí asistenta — např. karty `SmableAiActionCard` ke schválení. */
  renderMessageExtra?: SmableAiMessageListProps['renderMessageExtra']
  /** Slot nad seznamem zpráv — neroluje s konverzací. */
  header?: ReactNode
  /** Chipy nad polem dotazu, jen dokud je konverzace prázdná (widget). Bez `onPickSuggestion` se nevykreslí. */
  suggestions?: string[]
  onPickSuggestion?: (question: string) => void
  className?: string
}

/**
 * Ve `SmableAiWidget` čte jeho kontext: ve sbalené liště vykreslí jen pole dotazu (bez rámečku, jeden
 * řádek) a odeslání lištu rozbalí. Děti mají ve všech stavech stejné pozice, takže pole dotazu
 * zůstává stejný uzel. Mimo widget (stránka) kontext nečte a pole dotazu má jeden řádek jako dosud.
 */
export function SmableAiChat({
  messages,
  pending,
  labels,
  renderContent,
  composer,
  emptyState,
  onFeedback,
  onRetry,
  renderMessageExtra,
  header,
  suggestions,
  onPickSuggestion,
  className,
}: SmableAiChatProps) {
  const widget = useContext(SmableAiWidgetContext)
  const collapsed = widget?.collapsed ?? false
  const empty = messages.length === 0 && !pending

  const onSend = widget
    ? (text: string) => {
        widget.expand()
        composer.onSend(text)
      }
    : composer.onSend

  return (
    <div className={clsx('flex h-full flex-col gap-4', className)}>
      {!collapsed && header}
      {!collapsed &&
        (empty && emptyState ? (
          <div className="min-h-0 flex-1 overflow-y-auto">{emptyState}</div>
        ) : (
          <SmableAiMessageList
            messages={messages}
            pending={pending}
            labels={labels}
            renderContent={renderContent}
            onFeedback={onFeedback}
            onRetry={onRetry}
            renderMessageExtra={renderMessageExtra}
          />
        ))}
      {!collapsed && empty && suggestions && suggestions.length > 0 && onPickSuggestion && (
        <SmableAiSuggestions items={suggestions} onPick={onPickSuggestion} />
      )}
      <SmableAiComposer
        {...composer}
        onSend={onSend}
        hint={collapsed ? undefined : composer.hint}
        bare={collapsed}
        minRows={widget ? (collapsed ? 1 : 2) : 1}
        labels={labels}
      />
    </div>
  )
}
