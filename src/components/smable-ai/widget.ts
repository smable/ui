export type SmableAiWidgetPlacement = 'float' | 'panel'
export type SmableAiWidgetEscape = 'closeHistory' | 'collapse' | 'none'
/** `panel` = připnout vpravo a rozbalit, `expand` = jen rozbalit (celá obrazovka pod `lg`, jinak karta). */
export type SmableAiWidgetExpand = 'panel' | 'expand' | 'none'

/** Šířka panelu od `lg` v px — host o ni zúží obsah (`padding-right`), aby panel nic nepřekrýval. */
export const SMABLE_AI_PANEL_WIDTH = 420

/** Breakpoint `lg` (Tailwind) — od něj se konverzace otevírá v panelu. */
export const SMABLE_AI_DESKTOP_QUERY = '(min-width: 1024px)'

/** Panel je vždy rozbalený, i když host pošle `expanded=false`. */
export function isWidgetExpanded(placement: SmableAiWidgetPlacement, expanded: boolean): boolean {
  return placement === 'panel' || expanded
}

/** Rozbalení ze sbalené lišty (odeslání, avatar): od `lg` do panelu, jinak jen rozbalit. */
export function widgetExpandAction(state: {
  placement: SmableAiWidgetPlacement
  expanded: boolean
  isDesktop: boolean
  hasPlacementCallback: boolean
}): SmableAiWidgetExpand {
  if (isWidgetExpanded(state.placement, state.expanded)) return 'none'
  return state.isDesktop && state.hasPlacementCallback ? 'panel' : 'expand'
}

/** Esc s fokusem ve widgetu: nejdřív zavře historii, potom sbalí plovoucí kartu; panel ani lištu nesbalí. */
export function widgetEscapeAction(state: {
  placement: SmableAiWidgetPlacement
  expanded: boolean
  historyOpen: boolean
}): SmableAiWidgetEscape {
  if (!isWidgetExpanded(state.placement, state.expanded)) return 'none'
  if (state.historyOpen) return 'closeHistory'
  return state.placement === 'float' ? 'collapse' : 'none'
}
