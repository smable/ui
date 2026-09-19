import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface PosSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Tlačítka dole (zůstávají vidět, tělo se posouvá). */
  footer?: ReactNode
  /** aria-label křížku. */
  closeLabel?: string
}

/**
 * Spodní panel pro dotykové podoby na výšku (účet, detail položky, jiná částka).
 * Na širokých obrazovkách patří místo něj SmableDrawer.
 */
export function PosSheet({ open, onClose, title, children, footer, closeLabel = 'Zavřít' }: PosSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  // Fokus, zámek posunu i Esc se nastavují jen při otevření/zavření. Kdyby efekt závisel na `onClose`
  // (konzumenti ho píší inline), každé překreslení rodiče by vzalo fokus z pole uvnitř panelu.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) {
      setShown(false)
      return
    }
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = requestAnimationFrame(() => {
      setShown(true)
      panelRef.current?.focus()
    })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      if (previous && document.contains(previous)) previous.focus()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end">
      <div aria-hidden onClick={onClose} className={`absolute inset-0 bg-neutral-950/50 transition-opacity duration-200 ${shown ? 'opacity-100' : 'opacity-0'}`} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative flex max-h-[92%] w-full flex-col rounded-t-2xl bg-white shadow-2xl outline-none transition-transform duration-200 ease-out ${shown ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex shrink-0 justify-center pt-2">
          <span aria-hidden className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>
        {title && (
          <div className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-1">
            <h2 className="min-w-0 flex-1 truncate text-[17px] font-bold text-neutral-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className={`min-h-0 flex-1 overflow-y-auto px-4 ${footer ? 'pb-4' : 'pb-[max(1rem,env(safe-area-inset-bottom))]'}`}>{children}</div>
        {footer && <div className="shrink-0 border-t border-neutral-200 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
