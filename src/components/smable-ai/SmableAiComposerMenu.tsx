import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { nextEnabledIndex } from './composer'
import type { SmableAiMenuItem } from './types'

/** Kam po zavření nabídky: do pole (po výběru), na „+“ (Esc, Tab) nebo nikam (klik jinam). */
export type SmableAiMenuCloseFocus = 'field' | 'trigger' | 'none'

export interface SmableAiComposerMenuProps {
  /** Řádek pole dotazu — nabídka se otevře nad ním, zarovnaná k jeho levému okraji. */
  anchor: HTMLElement
  /** Tlačítko „+“ — klik na něj nabídku zavírá sám, ne jako klik mimo. */
  trigger: RefObject<HTMLElement | null>
  items: SmableAiMenuItem[]
  label: string
  backLabel: string
  onClose: (focus: SmableAiMenuCloseFocus) => void
}

const WIDTH = 288
const GAP = 8
const EDGE = 8

const ROW =
  'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] leading-5 text-neutral-800 outline-none dark:text-neutral-100'
const ROW_ACTIVE = 'hover:bg-neutral-100 focus-visible:bg-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800'
const ICON = 'flex h-5 w-5 shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-400 [&>svg]:h-4 [&>svg]:w-4'
const META = 'ml-auto shrink-0 pl-2 text-2xs text-neutral-500 dark:text-neutral-400'

const isDisabled = (item: SmableAiMenuItem) => item.disabledHint !== undefined

/**
 * Nabídka „+“ pole dotazu. Kreslí se portálem do `body` s pevnou pozicí — lišta, karta i panel widgetu
 * ořezávají přetečení. `data-smable-ai-popover` říká widgetu, že klik sem není klik mimo něj.
 * Hlavní nabídka a podnabídka bez hledání jsou `menu`; podnabídka s hledáním je combobox + listbox.
 */
export function SmableAiComposerMenu({ anchor, trigger, items, label, backLabel, onClose }: SmableAiComposerMenuProps) {
  const [subId, setSubId] = useState<string | null>(null)
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState<{ left: number; bottom: number; width: number } | null>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const parent = subId === null ? null : items.find((i) => i.id === subId) ?? null
  const submenu = parent?.submenu ?? null
  const rows = submenu ? submenu.items : items
  const searching = Boolean(submenu?.search)
  const latest = useRef({ rows, onClose, searching, parentIndex: -1 })
  latest.current = { rows, onClose, searching, parentIndex: subId === null ? -1 : items.findIndex((i) => i.id === subId) }

  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.getBoundingClientRect()
      const width = Math.min(WIDTH, window.innerWidth - 2 * EDGE)
      const left = Math.max(EDGE, Math.min(r.left, window.innerWidth - width - EDGE))
      setPos({ left, bottom: window.innerHeight - r.top + GAP, width })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [anchor])

  // Po otevření nabídky i podnabídky: hledání dostane fokus, jinak první aktivní položka.
  useLayoutEffect(() => {
    if (searching) {
      setActive(-1)
      searchRef.current?.focus()
      return
    }
    const first = nextEnabledIndex(rows.map((r) => ({ disabled: isDisabled(r) })), -1, 1)
    const back = subId === null ? latest.current.parentIndex : -1
    setActive(first)
    rowRefs.current[back >= 0 ? back : first]?.focus()
    // Jen při změně úrovně — ne s každou novou sadou položek od hosta.
  }, [subId])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (popRef.current?.contains(t) || trigger.current?.contains(t)) return
      latest.current.onClose('none')
    }
    // Capture: Esc nabídky má přednost před Esc widgetu (ten se `defaultPrevented` nechá zastavit).
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (subId !== null) setSubId(null)
        else latest.current.onClose('trigger')
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        latest.current.onClose('trigger')
        return
      }
      if (latest.current.searching) return
      const { rows: list } = latest.current
      const flags = list.map((r) => ({ disabled: isDisabled(r) }))
      const move = (to: number) => {
        e.preventDefault()
        if (to < 0) return
        setActive(to)
        rowRefs.current[to]?.focus()
      }
      const focused = rowRefs.current.findIndex((el) => el === document.activeElement)
      if (e.key === 'ArrowDown') move(nextEnabledIndex(flags, focused, 1))
      else if (e.key === 'ArrowUp') move(nextEnabledIndex(flags, focused, -1))
      else if (e.key === 'Home') move(nextEnabledIndex(flags, -1, 1))
      else if (e.key === 'End') move(nextEnabledIndex(flags, -1, -1))
      else if (e.key === 'ArrowRight' && subId === null && focused >= 0 && list[focused].submenu && !isDisabled(list[focused])) {
        e.preventDefault()
        list[focused].submenu?.onOpen?.()
        setSubId(list[focused].id)
      } else if (e.key === 'ArrowLeft' && subId !== null) {
        e.preventDefault()
        setSubId(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [subId, trigger])

  const choose = (item: SmableAiMenuItem) => {
    if (isDisabled(item)) return
    if (item.submenu && subId === null) {
      item.submenu.onOpen?.()
      setSubId(item.id)
      return
    }
    item.onSelect?.()
    onClose('field')
  }

  const onSearchKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const flags = rows.map((r) => ({ disabled: isDisabled(r) }))
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => nextEnabledIndex(flags, a, e.key === 'ArrowDown' ? 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && rows[active]) choose(rows[active])
    }
  }

  if (!pos) return null

  const content = (item: SmableAiMenuItem, sub: boolean) => (
    <>
      {item.icon && <span className={ICON}>{item.icon}</span>}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {(item.disabledHint ?? item.meta) && <span className={META}>{item.disabledHint ?? item.meta}</span>}
      {!sub && item.submenu && <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />}
    </>
  )

  const state = submenu?.loading ? (
    <div className="flex justify-center py-3 text-neutral-400" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
    </div>
  ) : rows.length === 0 && submenu?.emptyLabel ? (
    <p className="px-2.5 py-2 text-[13px] text-neutral-500 dark:text-neutral-400">{submenu.emptyLabel}</p>
  ) : null

  return createPortal(
    <div
      ref={popRef}
      data-smable-ai-popover=""
      style={{ left: pos.left, bottom: pos.bottom, width: pos.width }}
      className="fixed z-50 flex max-h-[min(360px,60vh)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      {parent && (
        <button
          type="button"
          onClick={() => setSubId(null)}
          aria-label={`${backLabel}: ${parent.label}`}
          className={clsx(ROW, ROW_ACTIVE, 'font-medium')}
        >
          <ChevronLeft className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
          <span className="truncate">{parent.label}</span>
        </button>
      )}
      {submenu?.search && (
        <input
          ref={searchRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          aria-label={submenu.search.placeholder}
          placeholder={submenu.search.placeholder}
          value={submenu.search.value}
          onChange={(e) => {
            submenu.search?.onChange(e.target.value)
            setActive(-1)
          }}
          onKeyDown={onSearchKey}
          className="mx-1 my-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
        />
      )}
      <div className="min-h-0 overflow-y-auto">
        {searching ? (
          <ul id={listId} role="listbox" aria-label={parent?.label} aria-busy={submenu?.loading || undefined}>
            {!submenu?.loading &&
              rows.map((item, i) => (
                <li
                  key={item.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={isDisabled(item) || undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => !isDisabled(item) && setActive(i)}
                  onClick={() => choose(item)}
                  className={clsx(
                    ROW,
                    isDisabled(item) ? 'cursor-default opacity-60' : 'cursor-pointer',
                    i === active && 'bg-neutral-100 dark:bg-neutral-800'
                  )}
                >
                  {content(item, true)}
                </li>
              ))}
            {state && <li role="presentation">{state}</li>}
          </ul>
        ) : (
          <div role="menu" aria-label={parent?.label ?? label}>
            {rows.map((item, i) => (
              <Fragment key={item.id}>
                {item.separatorBefore && <div role="separator" className="mx-2 my-1 h-px bg-neutral-200 dark:bg-neutral-800" />}
                <button
                  ref={(el) => {
                    rowRefs.current[i] = el
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={i === active ? 0 : -1}
                  aria-disabled={isDisabled(item) || undefined}
                  aria-haspopup={item.submenu && !parent ? 'menu' : undefined}
                  onClick={() => choose(item)}
                  className={clsx(ROW, isDisabled(item) ? 'cursor-default opacity-60' : ROW_ACTIVE)}
                >
                  {content(item, Boolean(parent))}
                </button>
              </Fragment>
            ))}
            {state}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
