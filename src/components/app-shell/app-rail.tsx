import React from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import clsx from 'clsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import { useSidebar } from './sidebar-context'
import type { AppRailApp, ShellLink } from './types'
import { DefaultShellLink } from './link'

/** Pin / collapse toggle for the desktop sidebar. */
export function SidebarPinToggle() {
  const { isCollapsed, toggleCollapsed } = useSidebar()
  return (
    <button
      onClick={toggleCollapsed}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
      aria-label={isCollapsed ? 'Pin menu' : 'Collapse menu'}
      title={isCollapsed ? 'Pin menu' : 'Collapse menu'}
    >
      {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
    </button>
  )
}

/**
 * Far-left application rail (icon column) — the top tier of the two-tier shell.
 * `apps` drives the switcher; `brand`, `footer`, `account` are consumer slots.
 * Desktop only — on mobile the switcher lives inside the sidebar drawer.
 */
export function AppRail({
  apps,
  pathname,
  linkComponent: Link = DefaultShellLink,
  brand,
  footer,
  account,
}: {
  apps: AppRailApp[]
  pathname: string
  linkComponent?: ShellLink
  brand?: React.ReactNode
  footer?: React.ReactNode
  account?: React.ReactNode
}) {
  const { isCollapsed, isHovered, setHovered } = useSidebar()
  void pathname // active state for apps comes from app.isActive

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={clsx(
        'hidden lg:flex fixed left-3 top-3 bottom-3 z-50 w-16 flex-col items-center bg-brand-dark text-white shadow-xl transition-[border-radius] duration-0',
        isCollapsed && !isHovered ? 'rounded-2xl delay-300' : 'rounded-l-2xl delay-0'
      )}
    >
      {/* Brand mark slot */}
      {brand && <div className="flex h-16 w-full items-center justify-center">{brand}</div>}

      <TooltipProvider delayDuration={0}>
        {/* App switcher */}
        <nav className="flex flex-1 flex-col items-center gap-2 py-4">
          {apps.map((app) => {
            const Icon = app.icon
            return (
              <Tooltip key={app.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={app.href}
                    className={clsx(
                      'relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                      app.isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{app.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        {/* Shared footer slot (apps / settings / docs) */}
        {footer && <div className="flex flex-col items-center gap-2 py-4">{footer}</div>}
      </TooltipProvider>

      {/* Account slot (notifications + pin + avatar). */}
      <div className="flex w-full flex-col items-center gap-2 py-4">{account}</div>
    </aside>
  )
}
