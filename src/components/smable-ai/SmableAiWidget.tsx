import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, Maximize2, SquarePen, X } from 'lucide-react'
import clsx from 'clsx'
import { SmableAiConversationList, type SmableAiConversationListProps } from './SmableAiConversationList'
import type { SmableAiConversationData, SmableAiLabels } from './types'

/**
 * Plovoucí karta Smable AI (Shopify Sidekick). Pod `lg` zabírá celou obrazovku, od `lg` je
 * karta 400 px vpravo dole nad spouštěčem a tlačítkem nápovědy. Bez backdropu a bez pasti na
 * fokus — stránka pod kartou zůstává klikatelná. Esc zavře nejdřív historii, potom widget.
 *
 * Nerenderuje se přes portál: konzument ji vkládá mimo transformované předky (fixed).
 */
export interface SmableAiWidgetProps {
  open: boolean
  onClose: () => void
  /** Název konverzace (první otázka) nebo „Smable AI“. */
  title: string
  /** Historie — rozbalovací název se vykreslí jen s `conversations` a `groupLabels`. */
  conversations?: SmableAiConversationData[]
  activeConversationId?: SmableAiConversationData['id']
  onSelectConversation?: (id: SmableAiConversationData['id']) => void
  onDeleteConversation?: (id: SmableAiConversationData['id']) => void
  onNewConversation: () => void
  /** Rozbalit na stránku — bez callbacku se tlačítko nevykreslí. */
  onExpand?: () => void
  labels: Pick<SmableAiLabels, 'newConversation' | 'conversations' | 'deleteConversation' | 'expand' | 'close'>
  groupLabels?: SmableAiConversationListProps['groupLabels']
  /** Tělo — typicky `SmableAiChat`. */
  children: ReactNode
  className?: string
}

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'

const ICON_BUTTON = clsx(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors',
  'hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  FOCUS
)

const TITLE = 'min-w-0 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50'

const FOCUSABLE =
  'textarea:not([disabled]), input:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

/** Fokus do těla: přednostně pole dotazu (v prázdném stavu mu v DOM předcházejí chipy). */
function focusBody(body: HTMLElement | null): boolean {
  if (!body) return false
  const target =
    body.querySelector<HTMLElement>('textarea:not([disabled])') ?? body.querySelector<HTMLElement>(FOCUSABLE)
  target?.focus()
  return target != null
}

export function SmableAiWidget(props: SmableAiWidgetProps) {
  if (!props.open) return null
  return <WidgetCard {...props} />
}

function WidgetCard({
  onClose,
  title,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onExpand,
  labels,
  groupLabels,
  children,
  className,
}: SmableAiWidgetProps) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const hasHistory = Boolean(conversations && groupLabels)

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    focusBody(bodyRef.current)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (historyOpen) {
        setHistoryOpen(false)
        toggleRef.current?.focus()
      } else {
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [historyOpen])

  useEffect(() => {
    if (!historyOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || toggleRef.current?.contains(t)) return
      setHistoryOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [historyOpen])

  const newConversationFromHeader = () => {
    setHistoryOpen(false)
    onNewConversation()
  }

  const newConversationFromPanel = () => {
    setHistoryOpen(false)
    onNewConversation()
    if (!focusBody(bodyRef.current)) toggleRef.current?.focus()
  }

  const selectConversation = (id: SmableAiConversationData['id']) => {
    setHistoryOpen(false)
    toggleRef.current?.focus()
    onSelectConversation?.(id)
  }

  return (
    <div
      role="dialog"
      aria-label={labels.conversations}
      className={clsx(
        'fixed inset-0 z-40 flex flex-col overflow-hidden bg-white dark:bg-neutral-900',
        'lg:inset-auto lg:bottom-[72px] lg:right-5 lg:h-[min(720px,calc(100dvh-92px))] lg:w-[400px]',
        'lg:rounded-3xl lg:border lg:border-neutral-200 lg:shadow-xl dark:lg:border-neutral-800',
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-100 pl-4 pr-3 dark:border-neutral-800">
        {hasHistory ? (
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-expanded={historyOpen}
            aria-controls={historyOpen ? panelId : undefined}
            className={clsx(
              'flex min-w-0 items-center gap-1 rounded-md py-1.5 pl-2 pr-1.5 transition-colors',
              'hover:bg-neutral-50 dark:hover:bg-neutral-800',
              FOCUS
            )}
          >
            <span className={TITLE}>{title}</span>
            <ChevronDown
              className={clsx('h-4 w-4 shrink-0 text-neutral-500 transition-transform', historyOpen && 'rotate-180')}
              aria-hidden
            />
          </button>
        ) : (
          <h2 className={clsx(TITLE, 'py-1.5 pl-2')}>{title}</h2>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={newConversationFromHeader}
            aria-label={labels.newConversation}
            className={ICON_BUTTON}
          >
            <SquarePen className="h-4.5 w-4.5" aria-hidden />
          </button>
          {onExpand && (
            <button type="button" onClick={onExpand} aria-label={labels.expand} className={ICON_BUTTON}>
              <Maximize2 className="h-4.5 w-4.5" aria-hidden />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label={labels.close} className={ICON_BUTTON}>
            <X className="h-4.5 w-4.5" aria-hidden />
          </button>
        </div>
      </div>

      {historyOpen && conversations && groupLabels && (
        <div
          ref={panelRef}
          id={panelId}
          className={clsx(
            'absolute inset-x-0 top-14 z-10 max-h-[calc(100%-3.5rem)] overflow-y-auto rounded-b-2xl border-b border-neutral-200 bg-white p-2 shadow-lg',
            'dark:border-neutral-800 dark:bg-neutral-900'
          )}
        >
          <SmableAiConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={selectConversation}
            onDelete={onDeleteConversation}
            onNew={newConversationFromPanel}
            labels={labels}
            groupLabels={groupLabels}
          />
        </div>
      )}

      <div ref={bodyRef} className="min-h-0 flex-1 p-4">
        {children}
      </div>
    </div>
  )
}
