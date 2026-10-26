/**
 * DOM pomůcky odolné vůči Shadow DOM. V shadow rootu vrací `document.activeElement` hostitele a nativní
 * listenery na `document` vidí `event.target` přesměrovaný na hostitele — `contains(e.target)` pak lže.
 */

/** Skutečně fokusovaný prvek: sestupuje přes `shadowRoot.activeElement`, dokud to jde. */
export function deepActiveElement(root: Document | ShadowRoot = document): Element | null {
  let el = root.activeElement
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el
}

/** Událost vznikla uvnitř `el` — i přes hranici shadow rootu (`target` je tam hostitel). */
export function isEventInside(event: Event, el: Element | null): boolean {
  return el !== null && event.composedPath().includes(el)
}

/** Událost vznikla v nabídce Smable AI (portál mimo widget, ale patří k němu). */
export function isEventInPopover(event: Event): boolean {
  return event.composedPath().some((n) => (n as Element).hasAttribute?.('data-smable-ai-popover'))
}

/** Kontejner pro portály: předaný z provideru, jinak `body`; bez DOMu (SSR) `null`. */
export function resolvePortalContainer(ctx: HTMLElement | null, doc: Document | undefined): HTMLElement | null {
  return ctx ?? doc?.body ?? null
}

/** Kořen, ve kterém uzel žije (`Document` nebo `ShadowRoot`); jinak `document`. */
export function rootOf(node: Node | null): Document | ShadowRoot {
  const root = node?.getRootNode()
  return root && 'getElementById' in root ? (root as Document | ShadowRoot) : document
}
