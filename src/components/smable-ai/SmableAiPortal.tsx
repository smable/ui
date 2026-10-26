import { createContext, useContext, type ReactNode } from 'react'
import { resolvePortalContainer } from './dom'

const PortalContainerContext = createContext<HTMLElement | null>(null)

/**
 * Kam Smable AI vykreslí portály (lišta, nabídka „+“, seznam dovedností). Výchozí je `document.body`;
 * v Shadow DOMu je nutné předat prvek uvnitř shadow rootu, jinak portály skončí mimo něj bez stylů.
 */
export function SmableAiPortalProvider({ container, children }: { container: HTMLElement; children: ReactNode }) {
  return <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>
}

/** Bez DOMu (SSR) vrací `null` — místa s portálem se pak nevykreslí. */
export function useSmableAiPortalContainer(): HTMLElement | null {
  return resolvePortalContainer(useContext(PortalContainerContext), typeof document === 'undefined' ? undefined : document)
}
