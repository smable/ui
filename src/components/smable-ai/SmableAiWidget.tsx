import {
  createContext,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Maximize2, PanelRight, Sparkles, SquarePen, X } from 'lucide-react'
import clsx from 'clsx'
import { SmableAiConversationList, type SmableAiConversationListProps } from './SmableAiConversationList'
import {
  SMABLE_AI_DESKTOP_QUERY,
  SMABLE_AI_PANEL_WIDTH,
  isWidgetExpanded,
  widgetEscapeAction,
  widgetExpandAction,
  type SmableAiWidgetPlacement,
} from './widget'
import type { SmableAiConversationData, SmableAiLabels } from './types'

export type { SmableAiWidgetPlacement } from './widget'

/**
 * Smable AI jako plovoucí lišta (Shopify Sidekick). Sbalená lišta je dole uprostřed obsahu, píše se
 * rovnou do ní. Odeslání, avatar nebo připnutí otevře konverzaci od `lg` v panelu vpravo
 * (`placement='panel'`, host o `SMABLE_AI_PANEL_WIDTH` zúží obsah); bez `onPlacementChange` nebo
 * s `expanded=true` od hosta se lišta rozbalí v kartu, která roste nahoru.
 * Pod `lg` je sbalený stav kulatá ikona vpravo dole a rozbalený stav celá obrazovka.
 *
 * Pole dotazu je ve všech stavech stejný uzel `textarea`: widget je pořád v portálu, mění jen třídy
 * a podmíněné části mají stabilní pozice — text, kurzor, fokus i IME přežijí sbalení i připnutí.
 */
export interface SmableAiWidgetProps {
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** Výchozí `float`; panel je vždy rozbalený. */
  placement?: SmableAiWidgetPlacement
  /** Bez callbacku se tlačítko připnutí nevykreslí. */
  onPlacementChange?: (placement: SmableAiWidgetPlacement) => void
  /** Klik mimo rozbalenou plovoucí kartu ji sbalí (fokus neposouvá). */
  collapseOnOutsideClick?: boolean
  /** Název konverzace (první otázka) nebo „Smable AI“. */
  title: string
  /** Historie — rozbalovací název se vykreslí jen s `conversations` a `groupLabels`. */
  conversations?: SmableAiConversationData[]
  activeConversationId?: SmableAiConversationData['id']
  onSelectConversation?: (id: SmableAiConversationData['id']) => void
  onDeleteConversation?: (id: SmableAiConversationData['id']) => void
  onNewConversation: () => void
  /** Celá stránka — bez callbacku se tlačítko nevykreslí. */
  onExpand?: () => void
  labels: Pick<
    SmableAiLabels,
    | 'assistant'
    | 'newConversation'
    | 'conversations'
    | 'deleteConversation'
    | 'expand'
    | 'close'
    | 'collapse'
    | 'dock'
    | 'openConversation'
  >
  groupLabels?: SmableAiConversationListProps['groupLabels']
  /** Tělo — typicky `SmableAiChat`, který ve sbaleném stavu vykreslí jen pole dotazu. */
  children: ReactNode
  className?: string
}

export interface SmableAiWidgetContextValue {
  /** Sbalená lišta — `SmableAiChat` vykreslí jen pole dotazu. */
  collapsed: boolean
  /** Rozbalí lištu; v rozbaleném stavu nic nedělá. */
  expand: () => void
}

export const SmableAiWidgetContext = createContext<SmableAiWidgetContextValue | null>(null)

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'

const ICON_BUTTON_BASE = clsx(
  'h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors',
  'hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  FOCUS
)

const ICON_BUTTON = clsx('flex', ICON_BUTTON_BASE)

const TITLE = 'min-w-0 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50'

const FOCUSABLE =
  'textarea:not([disabled]), input:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

/**
 * Centrování na obsah: host nastaví `--smable-ai-inset-left` (šířku postranního menu) na `:root`/`body`.
 * `100%` místo `100vw`: u `fixed` je to šířka okna bez posuvníku. Levý okraj se počítá bez transformace,
 * aby lišta nebyla containing block pro `fixed` potomky (nabídky hosta).
 */
const ROOT_STYLE = {
  '--smable-ai-panel-width': `${SMABLE_AI_PANEL_WIDTH}px`,
  '--smable-ai-center': 'calc(var(--smable-ai-inset-left, 0px) + (100% - var(--smable-ai-inset-left, 0px)) / 2)',
  '--smable-ai-bar-width': 'min(480px, calc(100% - var(--smable-ai-inset-left, 0px) - 2rem))',
  '--smable-ai-card-width': 'min(560px, calc(100% - var(--smable-ai-inset-left, 0px) - 2rem))',
  '--smable-ai-bar-left': 'calc(var(--smable-ai-center) - var(--smable-ai-bar-width) / 2)',
  '--smable-ai-card-left': 'calc(var(--smable-ai-center) - var(--smable-ai-card-width) / 2)',
} as CSSProperties

const ROOT = 'fixed z-40 flex bg-white outline-none dark:bg-neutral-900'

const BAR = clsx(
  'bottom-4 right-4 items-end rounded-full shadow-lg',
  'has-[textarea:focus]:ring-2 has-[textarea:focus]:ring-brand-500',
  'lg:right-auto lg:left-[var(--smable-ai-bar-left)] lg:w-[var(--smable-ai-bar-width)]',
  'lg:gap-1 lg:rounded-[22px] lg:border lg:border-neutral-200 lg:px-1.5 lg:py-[5px] dark:lg:border-neutral-800'
)

const CARD = clsx(
  'inset-0 flex-col overflow-hidden',
  'lg:inset-auto lg:bottom-4 lg:left-[var(--smable-ai-card-left)] lg:h-[min(640px,calc(100dvh-2rem))] lg:w-[var(--smable-ai-card-width)]',
  'lg:rounded-3xl lg:border lg:border-neutral-200 lg:shadow-xl dark:lg:border-neutral-800'
)

const PANEL = clsx(
  'inset-0 flex-col overflow-hidden',
  'lg:left-auto lg:w-[var(--smable-ai-panel-width)] lg:border-l lg:border-neutral-200 dark:lg:border-neutral-800'
)

/** Od `lg` se konverzace otevírá v panelu; rozhoduje se v okamžiku akce. */
function isDesktop(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(SMABLE_AI_DESKTOP_QUERY).matches)
}

/** Fokus do těla: přednostně pole dotazu (v prázdném stavu mu v DOM předcházejí chipy). */
function focusBody(body: HTMLElement | null): boolean {
  if (!body) return false
  const target =
    body.querySelector<HTMLElement>('textarea:not([disabled])') ?? body.querySelector<HTMLElement>(FOCUSABLE)
  target?.focus()
  return target != null && document.activeElement === target
}

/** Fokus jen na vykreslený prvek — skryté pole (ikona na telefonu, `className` hosta) přeskočí. */
function focusIfVisible(el: HTMLElement | null | undefined): boolean {
  if (!el || el.getClientRects().length === 0) return false
  el.focus()
  return document.activeElement === el
}

export function SmableAiWidget(props: SmableAiWidgetProps) {
  if (typeof document === 'undefined') return null
  return createPortal(<WidgetRoot {...props} />, document.body)
}

function WidgetRoot({
  expanded,
  onExpandedChange,
  placement = 'float',
  onPlacementChange,
  collapseOnOutsideClick = false,
  title,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onExpand,
  labels,
  groupLabels,
  children,
  className,
}: SmableAiWidgetProps) {
  const panel = placement === 'panel'
  const open = isWidgetExpanded(placement, expanded)
  const [historyOpen, setHistoryOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const hasHistory = Boolean(conversations && groupLabels)

  const latest = useRef({ placement, expanded, onExpandedChange, onPlacementChange })
  useLayoutEffect(() => {
    latest.current = { placement, expanded, onExpandedChange, onPlacementChange }
  })

  const expand = useCallback(() => {
    const { placement, expanded, onExpandedChange, onPlacementChange } = latest.current
    const action = widgetExpandAction({
      placement,
      expanded,
      isDesktop: isDesktop(),
      hasPlacementCallback: Boolean(onPlacementChange),
    })
    if (action === 'panel') onPlacementChange?.('panel')
    if (action !== 'none') onExpandedChange(true)
  }, [])
  const context = useMemo(() => ({ collapsed: !open, expand }), [open, expand])

  // Fokus po změně stavu: tlačítko, které stav přepnulo, z DOM zmizí. Kam fokus jde, se rozhoduje
  // až po commitu — host stav řídí, takže nový layout v klik handleru ještě neexistuje.
  const focusOnCollapse = useRef(true)
  const returnFocus = useRef<HTMLElement | null>(null)
  const prev = useRef({ open, placement })
  useLayoutEffect(() => {
    const before = prev.current
    prev.current = { open, placement }
    if (before.open === open && before.placement === placement) return
    const restore = focusOnCollapse.current
    focusOnCollapse.current = true
    const active = document.activeElement
    const lost = !active || active === document.body
    const inside = !lost && Boolean(rootRef.current?.contains(active))

    if (open) {
      if (inside) return
      if (!before.open && !lost && active instanceof HTMLElement) returnFocus.current = active
      if (lost || !before.open) focusBody(bodyRef.current)
      return
    }

    setHistoryOpen(false)
    const back = returnFocus.current
    returnFocus.current = null
    if (!restore || (!inside && !lost)) return
    const textarea = bodyRef.current?.querySelector('textarea')
    if (focusIfVisible(textarea) || focusIfVisible(avatarRef.current)) return
    if (back?.isConnected) back.focus()
  }, [open, placement])

  // Esc jen s fokusem ve widgetu; kořen má tabIndex -1, aby klik do textu odpovědi fokus neposlal na body.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return
      if (!rootRef.current?.contains(document.activeElement)) return
      const action = widgetEscapeAction({ placement, expanded, historyOpen })
      if (action === 'none') return
      e.preventDefault()
      if (action === 'closeHistory') {
        setHistoryOpen(false)
        toggleRef.current?.focus()
      } else {
        latest.current.onExpandedChange(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [placement, expanded, historyOpen])

  useEffect(() => {
    if (!historyOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || toggleRef.current?.contains(t)) return
      setHistoryOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [historyOpen])

  useEffect(() => {
    if (!collapseOnOutsideClick || panel || !expanded) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      focusOnCollapse.current = false
      latest.current.onExpandedChange(false)
      // Host sbalení může odmítnout — příznak nesmí přežít do dalšího (šipka, Esc) sbalení.
      // Sbalení od hosta se commitne v mikroúloze, takže timeout ho už najde spotřebovaný.
      window.setTimeout(() => {
        focusOnCollapse.current = true
      }, 0)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [collapseOnOutsideClick, panel, expanded])

  const dock = () => {
    if (isDesktop()) onPlacementChange?.('panel')
    if (!expanded) onExpandedChange(true)
  }

  const closePanel = () => {
    onPlacementChange?.('float')
    onExpandedChange(false)
  }

  const newConversationFromHeader = () => {
    setHistoryOpen(false)
    onNewConversation()
  }

  const newConversationFromPanel = () => {
    setHistoryOpen(false)
    onNewConversation()
    if (!focusBody(bodyRef.current)) toggleRef.current?.focus()
  }

  const selectConversation = (id: SmableAiConversationData['id']) => {
    setHistoryOpen(false)
    toggleRef.current?.focus()
    onSelectConversation?.(id)
  }

  // Pozice dětí kořene jsou pevné ve všech stavech: hlavička, historie, avatar, tělo, oddělovač, připnutí.
  // Tělo (a s ním pole dotazu) je tak pořád čtvrté dítě stejného `div` a React ho nikdy nepřipojí znovu.
  return (
    <SmableAiWidgetContext.Provider value={context}>
      <div
        ref={rootRef}
        role="region"
        aria-label={labels.assistant}
        tabIndex={-1}
        style={ROOT_STYLE}
        className={clsx(ROOT, !open ? BAR : panel ? PANEL : CARD, className)}
      >
        {open && (
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-100 pl-4 pr-3 dark:border-neutral-800">
            {hasHistory ? (
              <button
                ref={toggleRef}
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                aria-expanded={historyOpen}
                aria-controls={historyOpen ? panelId : undefined}
                className={clsx(
                  'flex min-w-0 items-center gap-1 rounded-md py-1.5 pl-2 pr-1.5 transition-colors',
                  'hover:bg-neutral-50 dark:hover:bg-neutral-800',
                  FOCUS
                )}
              >
                <span className={TITLE}>{title}</span>
                <ChevronDown
                  className={clsx('h-4 w-4 shrink-0 text-neutral-500 transition-transform', historyOpen && 'rotate-180')}
                  aria-hidden
                />
              </button>
            ) : (
              <h2 className={clsx(TITLE, 'py-1.5 pl-2')}>{title}</h2>
            )}
            <div className="ml-auto flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={newConversationFromHeader}
                aria-label={labels.newConversation}
                className={ICON_BUTTON}
              >
                <SquarePen className="h-4.5 w-4.5" aria-hidden />
              </button>
              {!panel && onPlacementChange && (
                <button
                  type="button"
                  onClick={dock}
                  aria-label={labels.dock}
                  className={clsx('hidden lg:flex', ICON_BUTTON_BASE)}
                >
                  <PanelRight className="h-4.5 w-4.5" aria-hidden />
                </button>
              )}
              {onExpand && (
                <button type="button" onClick={onExpand} aria-label={labels.expand} className={ICON_BUTTON}>
                  <Maximize2 className="h-4.5 w-4.5" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={panel ? closePanel : () => onExpandedChange(false)}
                aria-label={panel ? labels.close : labels.collapse}
                className={ICON_BUTTON}
              >
                {panel ? <X className="h-4.5 w-4.5" aria-hidden /> : <ChevronDown className="h-4.5 w-4.5" aria-hidden />}
              </button>
            </div>
          </div>
        )}

        {open && historyOpen && conversations && groupLabels && (
          <div
            ref={panelRef}
            id={panelId}
            className={clsx(
              'absolute inset-x-0 top-14 z-10 max-h-[calc(100%-3.5rem)] overflow-y-auto rounded-b-2xl border-b border-neutral-200 bg-white p-2 shadow-lg',
              'dark:border-neutral-800 dark:bg-neutral-900'
            )}
          >
            <SmableAiConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={selectConversation}
              onDelete={onDeleteConversation}
              onNew={newConversationFromPanel}
              labels={labels}
              groupLabels={groupLabels}
            />
          </div>
        )}

        {!open && (
          <button
            ref={avatarRef}
            type="button"
            onClick={expand}
            aria-expanded={false}
            aria-label={labels.openConversation}
            className={clsx(
              'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700',
              'lg:h-8 lg:w-8 lg:bg-brand-50 lg:text-brand-600 lg:hover:bg-brand-100',
              'dark:lg:bg-brand-950 dark:lg:text-brand-300 dark:lg:hover:bg-brand-900',
              FOCUS
            )}
          >
            <Sparkles className="h-6 w-6 lg:h-4 lg:w-4" aria-hidden />
          </button>
        )}

        <div ref={bodyRef} className={open ? 'min-h-0 flex-1 p-4' : 'hidden min-w-0 flex-1 lg:block'}>
          {children}
        </div>

        {!open && onPlacementChange && (
          <span aria-hidden className="mx-1 mb-1.5 hidden h-5 w-px shrink-0 bg-neutral-200 lg:block dark:bg-neutral-800" />
        )}
        {!open && onPlacementChange && (
          <button
            type="button"
            onClick={dock}
            aria-label={labels.dock}
            className={clsx(
              'hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors lg:flex',
              'hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
              FOCUS
            )}
          >
            <PanelRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </SmableAiWidgetContext.Provider>
  )
}
