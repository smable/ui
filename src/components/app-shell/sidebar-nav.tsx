import React from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import type { NavItem, ShellLink } from './types'
import { isNavItemActive } from './types'
import { DefaultShellLink } from './link'

function NavItemRow({
  item,
  level = 0,
  isCollapsed,
  pathname,
  linkComponent: Link = DefaultShellLink,
  onNavigate,
}: {
  item: NavItem
  level?: number
  isCollapsed: boolean
  pathname: string
  linkComponent?: ShellLink
  onNavigate?: () => void
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isActive = isNavItemActive(pathname, item.href)
  const isExactActive = pathname === item.href
  const hasChildren = !!item.children && item.children.length > 0

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (hasChildren && item.children?.some((child) => isNavItemActive(pathname, child.href))) {
      setIsOpen(true)
    }
  }, [pathname, hasChildren, item.children])

  const Icon = item.icon

  // Collapsed mode (top level only) — tooltip with optional children fly-out
  if (isCollapsed && level === 0) {
    if (hasChildren) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                  'w-full flex items-center justify-center p-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex flex-col gap-1 p-0" sideOffset={10}>
              <div className="px-3 py-2 font-medium border-b border-neutral-200 dark:border-neutral-800">
                {item.label}
              </div>
              {item.children?.map((child) => {
                const ChildIcon = child.icon
                const childIsActive = pathname === child.href
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      childIsActive && 'text-brand bg-brand/5'
                    )}
                  >
                    {ChildIcon && <ChildIcon className="h-4 w-4" />}
                    {child.label}
                  </Link>
                )
              })}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                'flex items-center justify-center p-3 rounded-lg transition-colors relative',
                isExactActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.badge && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-bold bg-white text-brand rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Expanded mode — group with children
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          )}
        >
          {Icon && <Icon className="h-5 w-5 shrink-0" />}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={clsx('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>
        {isOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-white/15 space-y-1">
            {item.children?.map((child) => (
              <NavItemRow
                key={child.href}
                item={child}
                level={level + 1}
                isCollapsed={false}
                pathname={pathname}
                linkComponent={Link}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Expanded mode — leaf link
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isExactActive
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="px-2 py-0.5 text-xs font-semibold bg-white text-brand rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

/** Renders a list of nav items (recursive). */
export function SidebarNav({
  items,
  isCollapsed,
  pathname,
  linkComponent,
  onNavigate,
}: {
  items: NavItem[]
  isCollapsed: boolean
  pathname: string
  linkComponent?: ShellLink
  onNavigate?: () => void
}) {
  return (
    <>
      {items.map((item) => (
        <NavItemRow
          key={item.href}
          item={item}
          isCollapsed={isCollapsed}
          pathname={pathname}
          linkComponent={linkComponent}
          onNavigate={onNavigate}
        />
      ))}
    </>
  )
}
