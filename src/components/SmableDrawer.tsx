import { useEffect, type ReactNode, type RefObject } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

/**
 * SmableDrawer — slide-in side panel (40% on desktop, fullscreen on mobile).
 *
 * Header layout: close button (X) on left, title/subtitle center, action slot
 * on right (typically Save button). Body scrolls; header/footer stay fixed.
 */
export interface SmableDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  titleHidden?: boolean
  rightAction?: ReactNode
  footer?: ReactNode
  children: ReactNode
  widthClass?: string
  bodyRef?: RefObject<HTMLDivElement>
}

export function SmableDrawer({
  open,
  onClose,
  title,
  subtitle,
  titleHidden,
  rightAction,
  footer,
  children,
  widthClass = 'md:w-[40%] md:min-w-[520px] md:max-w-[760px]',
  bodyRef,
}: SmableDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex',
        !open && 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={clsx(
          'absolute inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative ml-auto h-full w-full flex flex-col',
          widthClass,
          'bg-white dark:bg-neutral-950 shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-4 sm:px-5 h-16 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít"
            className="-ml-1.5 p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {(title || subtitle) ? (
            <div
              className={clsx(
                'flex-1 min-w-0 transition-opacity duration-200',
                titleHidden && 'opacity-0 pointer-events-none'
              )}
            >
              {title && (
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-neutral-500 truncate">{subtitle}</p>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}
          {rightAction && (
            <div className="flex items-center gap-2 flex-shrink-0">{rightAction}</div>
          )}
        </div>

        <div ref={bodyRef} className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 px-4 sm:px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
