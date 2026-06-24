import type React from 'react'

/** A single navigation entry. `label` is already translated by the consumer. */
export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string | number
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
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
}
