import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useOverlay } from './overlay'
import { FieldVariantProvider } from './FieldVariantContext'

export type DialogSize = 'sm' | 'md' | 'lg'

export const DIALOG_SIZE: Record<DialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
}

interface DialogFrameProps {
  open: boolean
  onClose: () => void
  /** false = Esc ani klik na pozadí nezavřou. */
  dismissible: boolean
  role: 'dialog' | 'alertdialog'
  labelledBy: string
  describedBy?: string
  initialFocusRef?: RefObject<HTMLElement>
  /** Šířka a pozadí panelu. */
  className: string
  children: ReactNode
}

/**
 * Společný rám SmableDialog a ConfirmDialog (interní, ven se neexportuje): portál, pozadí,
 * vycentrovaný panel, Esc, zámek posunu, fokus dovnitř a zpět.
 *
 * Pole uvnitř mají výchozí variantu, i když se dialog otevře z draweru — kontext
 * FieldVariantProvider prochází portálem a z draweru by jinak zdědila floating.
 */
export function DialogFrame({
  open,
  onClose,
  dismissible,
  role,
  labelledBy,
  describedBy,
  initialFocusRef,
  className,
  children,
}: DialogFrameProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useOverlay(open, { onEscape: dismissible ? onClose : undefined })

  // Jen při otevření — závislost na refu nebo callbacku by brala fokus z polí při překreslení rodiče.
  useEffect(() => {
    if (open) (initialFocusRef?.current ?? panelRef.current)?.focus()
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={dismissible ? onClose : undefined}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={clsx(
          'relative flex max-h-[85vh] w-full flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl outline-none',
          className
        )}
      >
        <FieldVariantProvider variant="default">{children}</FieldVariantProvider>
      </div>
    </div>,
    document.body
  )
}
