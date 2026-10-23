export type SmableAiRole = 'user' | 'assistant'
export type SmableAiFeedback = 'up' | 'down' | null
export type SmableAiErrorKind = 'forbidden' | 'rateLimited' | 'unavailable' | 'generic'

export interface SmableAiSource {
  tool: string
  label: string
}

export interface SmableAiHelpLink {
  title: string
  url: string
}

export interface SmableAiMessageData {
  id: string | number
  role: SmableAiRole
  content: string
  sources?: SmableAiSource[]
  help?: SmableAiHelpLink[]
  feedback?: SmableAiFeedback
  /** Chybová bublina místo odpovědi. */
  error?: SmableAiErrorKind
}

export interface SmableAiConversationData {
  id: string | number
  title: string
  /**
   * ISO 8601 s posunem, např. `2026-10-23T09:15:00+02:00` — parsuje se přes `new Date()`.
   * Jiný tvar nebo neplatné datum spadne v `groupConversations` do skupiny „Starší“.
   */
  updatedAt: string
}

/** Stav akce, kterou asistent připravil ke schválení (zrcadlí serverový stav). */
export type SmableAiActionStatus = 'pending' | 'confirming' | 'executed' | 'cancelled' | 'expired' | 'stale' | 'failed'

/** Řádek náhledu změny: položka, původní hodnota (bez ní jen nová, např. nová položka) → nová. */
export interface SmableAiActionRow {
  label: string
  before?: string
  after: string
}

export interface SmableAiActionLabels {
  confirm: string
  cancel: string
  /** Štítek stavu; `pending` se ukáže jen u karty bez `onConfirm` i `onCancel`. */
  statuses: Record<SmableAiActionStatus, string>
}

export interface SmableAiLabels {
  assistant: string
  pending: string
  /** Oznámení čtečce obrazovky, že odpověď dorazila (živá oblast v `SmableAiMessageList`). */
  answered: string
  sourcesPrefix: string
  helpLabel: string
  feedbackUp: string
  feedbackDown: string
  retry: string
  placeholder: string
  send: string
  charsLeft: (n: number) => string
  newConversation: string
  conversations: string
  deleteConversation: string
  expand: string
  close: string
  /** Sbalit konverzaci zpět do lišty (widget). */
  collapse: string
  /** Připnout jako panel vpravo (widget). */
  dock: string
  /** Avatar ve sbalené liště rozbalí konverzaci (widget). */
  openConversation: string
  /** Mikrofon v poli dotazu. */
  dictate: string
  stopDictation: string
  /** Placeholder pole během nahrávání. */
  listening: string
  errors: Record<SmableAiErrorKind, string>
}
