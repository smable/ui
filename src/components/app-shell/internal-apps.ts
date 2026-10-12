import { BarChart3, KanbanSquare, LifeBuoy, ListTodo, Mail, Users } from 'lucide-react'
import type { ElementType } from 'react'
import type { AppRailApp } from './types'

export type InternalAppId = 'board' | 'crm' | 'helpdesk' | 'marketing' | 'mailbox' | 'workstation'

export interface InternalApp {
  id: InternalAppId
  label: string
  icon: ElementType
  url: string
  /** Roles that api-v3 lets in — mirrors api-v3 `PortalRoles` / `V3AuthController`. */
  roles: readonly string[]
  /** Deployed and reachable; apps that are not live show only inside themselves. */
  live: boolean
}

const ALL_STAFF = ['ceo', 'admin', 'support', 'developer', 'sales', 'helpdesk'] as const

/**
 * Interní nástroje Smable v pořadí railu. Role zrcadlí api-v3
 * (`Domain/Admin/PortalRoles`, `V3AuthController::MAILBOX_ALLOWED_ROLES`, board = člen boardu);
 * přístup hlídá api-v3, tady jde jen o to, co rail ukáže. Workstation scope v api-v3
 * zatím není — role se potvrdí při nasazení spolu s `live: true`.
 */
export const INTERNAL_APPS: readonly InternalApp[] = [
  { id: 'board', label: 'Board', icon: KanbanSquare, url: 'https://board.smable.cloud', roles: ALL_STAFF, live: true },
  { id: 'crm', label: 'CRM', icon: Users, url: 'https://crm.smable.cloud', roles: ['ceo', 'admin', 'sales'], live: true },
  {
    id: 'helpdesk',
    label: 'Helpdesk',
    icon: LifeBuoy,
    url: 'https://helpdesk.smable.cloud',
    roles: ['ceo', 'admin', 'support', 'developer', 'helpdesk'],
    live: true,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: BarChart3,
    url: 'https://marketing.smable.cloud',
    roles: ['ceo', 'admin', 'sales'],
    live: true,
  },
  { id: 'mailbox', label: 'Mailbox', icon: Mail, url: 'https://mailbox.smable.cz', roles: ['ceo', 'admin'], live: true },
  {
    id: 'workstation',
    label: 'Workstation',
    icon: ListTodo,
    url: 'https://workstation.smable.cloud',
    roles: ALL_STAFF,
    live: false,
  },
]

/** Rail entries for `current` as seen by a user with `role`; `current` is always included. */
export function internalRailApps(current: InternalAppId, role: string | null | undefined): AppRailApp[] {
  return INTERNAL_APPS.filter(
    (app) => app.id === current || (app.live && role != null && app.roles.includes(role))
  ).map((app) => ({
    id: app.id,
    label: app.label,
    icon: app.icon,
    href: app.id === current ? '/' : app.url,
    isActive: app.id === current,
  }))
}
