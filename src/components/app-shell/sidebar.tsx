import React from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { useSidebar } from './sidebar-context'
import { SidebarNav } from './sidebar-nav'
import type { AppRailApp, NavItem, ShellLink } from './types'
import { DefaultShellLink } from './link'

/**
 * Second-tier navigation panel. Desktop: anchored right of the rail, revealed
 * by width; collapsed peeks on hover as an overlay (no content reflow). Mobile:
 * a full drawer that includes the brand, app switcher, and a richer footer.
 */
export function Sidebar({
  title,
  items,
  pathname,
  linkComponent = DefaultShellLink,
  apps = [],
  brand,
  top,
  footer,
  mobileFooter,
}: {
  title: string
  items: NavItem[]
  pathname: string
  linkComponent?: ShellLink
  apps?: AppRailApp[]
  brand?: React.ReactNode
  top?: React.ReactNode
  footer?: React.ReactNode
  mobileFooter?: React.ReactNode
}) {
  const { isCollapsed, isMobileOpen, isHovered, setHovered, closeMobile } = useSidebar()
  const Link = linkComponent

  // Collapsed = only the rail; hovering reveals the full second level as an
  // overlay (content padding stays collapsed -> no reflow).
  const effectiveCollapsed = isCollapsed && !isHovered

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobile} />
      )}

      {/* Desktop sidebar — sits to the right of the app rail */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          'hidden lg:block fixed left-[76px] top-3 bottom-3 z-40 overflow-hidden rounded-r-2xl transition-all duration-300',
          effectiveCollapsed ? 'w-0 pointer-events-none' : 'w-60 shadow-xl'
        )}
      >
        <div className="flex h-full w-60 flex-col bg-brand text-white">
          {/* Active app header */}
          <div className={clsx('h-16 flex items-center shrink-0', effectiveCollapsed ? 'justify-center px-2' : 'px-4')}>
            {!effectiveCollapsed && (
              <span className="text-base font-bold text-white truncate">{title}</span>
            )}
          </div>

          {/* Top slot (e.g. onboarding) */}
          {top && <div className={clsx(effectiveCollapsed ? 'px-2 py-2' : 'px-4 py-2')}>{top}</div>}

          {/* Navigation */}
          <nav className={clsx('flex-1 overflow-y-auto space-y-1', effectiveCollapsed ? 'p-2' : 'p-4')}>
            <SidebarNav
              items={items}
              isCollapsed={effectiveCollapsed}
              pathname={pathname}
              linkComponent={Link}
            />
          </nav>

          {/* Footer slot (account name / logout) */}
          {footer && <div className={clsx('shrink-0', effectiveCollapsed ? 'p-2' : 'p-4')}>{footer}</div>}
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 h-[100dvh] w-[280px] bg-brand text-white flex flex-col transition-transform duration-300 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center px-4 shrink-0">
          {brand}
          <button onClick={closeMobile} className="ml-auto p-2 hover:bg-white/10 rounded-lg" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* App switcher (mobile) */}
        {apps.length > 1 && (
          <div className="flex gap-2 p-3">
            {apps.map((app) => {
              const Icon = app.icon
              return (
                <Link
                  key={app.id}
                  href={app.href}
                  onClick={closeMobile}
                  className={clsx(
                    'flex-1 flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors',
                    app.isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </div>
        )}

        {/* Top slot (mobile) */}
        {top && <div className="px-4 py-2">{top}</div>}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <SidebarNav
            items={items}
            isCollapsed={false}
            pathname={pathname}
            linkComponent={Link}
            onNavigate={closeMobile}
          />
        </nav>

        {/* Mobile footer slot (apps + docs + account) */}
        {mobileFooter && <div className="p-4 shrink-0 space-y-1">{mobileFooter}</div>}
      </aside>
    </>
  )
}
