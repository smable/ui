import React from 'react'
import clsx from 'clsx'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { AppRail } from './app-rail'
import { Sidebar } from './sidebar'
import type { AppRailApp, NavItem, ShellLink } from './types'

export interface AppShellProps {
  pathname: string
  linkComponent?: ShellLink
  apps: AppRailApp[]
  /** Active app name shown as the sidebar header. */
  appTitle: string
  /** Pre-filtered, pre-translated nav items for the active app. */
  items: NavItem[]
  /** Page content (toolbar, banners, route children). */
  children: React.ReactNode
  /** localStorage key for the collapsed state. */
  storageKey?: string
  // Slots
  brand?: React.ReactNode // rail brand mark (icon)
  mobileBrand?: React.ReactNode // mobile drawer header (defaults to `brand`)
  railFooter?: React.ReactNode // rail shared links (apps/settings/docs)
  railAccount?: React.ReactNode // rail bottom (notifications + pin + avatar)
  sidebarTop?: React.ReactNode // above nav (e.g. onboarding)
  sidebarFooter?: React.ReactNode // desktop sidebar footer (account)
  mobileFooter?: React.ReactNode // mobile drawer footer (defaults to `sidebarFooter`)
}

function AppShellInner({
  pathname,
  linkComponent,
  apps,
  appTitle,
  items,
  children,
  brand,
  mobileBrand,
  railFooter,
  railAccount,
  sidebarTop,
  sidebarFooter,
  mobileFooter,
}: Omit<AppShellProps, 'storageKey'>) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <AppRail
        apps={apps}
        pathname={pathname}
        linkComponent={linkComponent}
        brand={brand}
        footer={railFooter}
        account={railAccount}
      />
      <Sidebar
        title={appTitle}
        items={items}
        pathname={pathname}
        linkComponent={linkComponent}
        apps={apps}
        brand={mobileBrand ?? brand}
        top={sidebarTop}
        footer={sidebarFooter}
        mobileFooter={mobileFooter ?? sidebarFooter}
      />
      <div
        className={clsx(
          'transition-all duration-300',
          // Expanded: 12 margin + rail 64 + sidebar 240 + 12 gap. Collapsed: rail
          // only (sidebar peeks on hover as an overlay, so no extra padding).
          isCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[328px]'
        )}
      >
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

/**
 * Two-tier application shell: app rail + sidebar + a padded content area.
 * Owns its own SidebarProvider — do not wrap it in another one.
 */
export function AppShell({ storageKey, ...rest }: AppShellProps) {
  return (
    <SidebarProvider storageKey={storageKey}>
      <AppShellInner {...rest} />
    </SidebarProvider>
  )
}
