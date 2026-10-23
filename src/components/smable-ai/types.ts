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
  updatedAt: string
}

export interface SmableAiLabels {
  assistant: string
  pending: string
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
  errors: Record<SmableAiErrorKind, string>
}
