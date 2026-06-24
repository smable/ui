import type { ShellLink } from './types'

/** Fallback link when the consumer does not inject a router-aware component. */
export const DefaultShellLink: ShellLink = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
)
