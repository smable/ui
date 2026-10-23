import type { SmableAiErrorKind, SmableAiLabels, SmableAiMessageData } from './types'

const NO_RETRY: ReadonlySet<SmableAiErrorKind> = new Set<SmableAiErrorKind>(['forbidden', 'rateLimited'])

/** „Zkusit znovu“ jen u poslední zprávy, jen když neběží další pokus, a ne u zákazu či limitu. */
export function canRetry(kind: SmableAiErrorKind, isLast: boolean, pending = false): boolean {
  return isLast && !pending && !NO_RETRY.has(kind)
}

/**
 * Text živé oblasti pro čtečky: během čekání `labels.pending`; jakmile čekání skončí a poslední
 * zpráva je od asistenta, `labels.answered` (u chybové bubliny její text). Jinak nic — obsah
 * odpovědi se nikdy nezrcadlí, čtečka by předčítala markdown.
 */
export function liveAnnouncement(
  prevPending: boolean,
  pending: boolean,
  lastMessage: Pick<SmableAiMessageData, 'role' | 'error'> | undefined,
  labels: Pick<SmableAiLabels, 'pending' | 'answered' | 'errors'>
): string {
  if (pending) return labels.pending
  if (!prevPending || lastMessage?.role !== 'assistant') return ''
  return lastMessage.error ? labels.errors[lastMessage.error] : labels.answered
}
