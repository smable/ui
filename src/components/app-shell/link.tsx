import { forwardRef, type ComponentProps } from 'react'
import type { ShellLink } from './types'

/**
 * Fallback link when the consumer does not inject a router-aware component.
 * Forwards its ref: `AppRail` wraps it in a Radix `TooltipTrigger asChild`, which anchors the tooltip by ref.
 */
export const DefaultShellLink: ShellLink = forwardRef<HTMLAnchorElement, ComponentProps<ShellLink>>(
  ({ href, children, ...rest }, ref) => (
    <a ref={ref} href={href} {...rest}>
      {children}
    </a>
  ),
)
DefaultShellLink.displayName = 'DefaultShellLink'
