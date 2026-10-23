import { SquarePen, X } from 'lucide-react'
import clsx from 'clsx'
import { groupConversations, type SmableAiConversationGroup } from './conversations'
import type { SmableAiConversationData, SmableAiLabels } from './types'

export interface SmableAiConversationListProps {
  conversations: SmableAiConversationData[]
  activeId?: SmableAiConversationData['id']
  onSelect: (id: SmableAiConversationData['id']) => void
  /** Křížek u položky (při hoveru/fokusu). Bez callbacku se nevykreslí. */
  onDelete?: (id: SmableAiConversationData['id']) => void
  onNew: () => void
  labels: Pick<SmableAiLabels, 'newConversation' | 'conversations' | 'deleteConversation'>
  groupLabels: Record<SmableAiConversationGroup, string>
  /** Okamžik, ke kterému se počítá Dnes / Tento týden; výchozí je čas vykreslení. */
  now?: Date
}

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'

export function SmableAiConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew,
  labels,
  groupLabels,
  now,
}: SmableAiConversationListProps) {
  const groups = groupConversations(conversations, now ?? new Date())

  return (
    <nav aria-label={labels.conversations} className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={onNew}
        className={clsx(
          'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-brand-600 transition-colors',
          'hover:bg-neutral-50 dark:text-brand-400 dark:hover:bg-neutral-800',
          FOCUS
        )}
      >
        <SquarePen className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{labels.newConversation}</span>
      </button>
      {groups.map(({ group, items }) => (
        <div key={group} className="flex flex-col gap-0.5">
          <p className="px-2.5 pb-0.5 pt-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {groupLabels[group]}
          </p>
          <ul className="flex flex-col gap-0.5">
            {items.map((conversation) => {
              const active = conversation.id === activeId
              return (
                <li key={conversation.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={active ? 'true' : undefined}
                    className={clsx(
                      'flex w-full items-center rounded-md py-2 pl-2.5 text-left text-sm transition-colors',
                      onDelete ? 'pr-8' : 'pr-2',
                      active
                        ? 'bg-brand-50 font-medium text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                        : 'text-neutral-900 group-hover:bg-neutral-50 dark:text-neutral-50 dark:group-hover:bg-neutral-800',
                      FOCUS
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(conversation.id)}
                      aria-label={`${labels.deleteConversation}: ${conversation.title}`}
                      className={clsx(
                        'absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-neutral-500 opacity-0 transition-opacity',
                        'hover:text-neutral-900 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100',
                        'dark:text-neutral-400 dark:hover:text-neutral-100',
                        FOCUS
                      )}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
