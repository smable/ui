import type React from 'react'

/** A single navigation entry. `label` is already translated by the consumer. */
export interface NavItem {
  label: string
  href: string
  /** Optional — sub-items are commonly text-only. */
  icon?: React.ElementType
  badge?: string | number
  /**
   * Highlight only on an exact path match (like react-router `end`). Default: `true` for leaf
   * items, `false` for items with children. Set `exact: false` on a leaf to keep it highlighted
   * on its sub-pages (e.g. `/leads` on `/leads/42`).
   */
  exact?: boolean
  children?: NavItem[]
}

/** An application entry shown in the app rail (and the mobile app switcher). */
export interface AppRailApp {
  id: string
  /** Tooltip label, already translated. */
  label: string
  icon: React.ElementType
  href: string
  isActive: boolean
}

/**
 * Link component injected by the consumer (e.g. react-router `Link` or Next.js
 * `Link`). Keeps the package free of any router dependency. Defaults to a plain
 * `<a>` (see `DefaultShellLink`).
 */
export type ShellLink = React.ComponentType<{
  href: string
  className?: string
  onClick?: () => void
  children: React.ReactNode
  'aria-label'?: string
}>

/** Whether `href` should be highlighted as active for the current `pathname`. */
export function isNavItemActive(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
}

/** Whether a sidebar item is highlighted — honours `item.exact`, see its default per item kind. */
export function isNavItemSelected(pathname: string, item: NavItem): boolean {
  const hasChildren = !!item.children && item.children.length > 0
  return isNavItemActive(pathname, item.href, item.exact ?? !hasChildren)
}
