import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { SmableButton } from './SmableButton'

/**
 * ConfirmDialog — potvrzení akce, kterou nejde vzít zpět.
 *
 * Nahrazuje nativní `confirm()`: drží vzhled suite, unese vysvětlující text,
 * umí rozpracovaný stav (`busy`) a chybu ze serveru (`error`), takže se dialog
 * nemusí zavřít dřív, než je jasné, že akce prošla.
 *
 * Fokus jde po otevření na Zrušit, ne na potvrzení — u destruktivní akce nemá
 * Enter omylem potvrdit. Escape a klik na pozadí ruší; během `busy` obojí drží,
 * aby se dialog nezavřel uprostřed requestu.
 *
 * Popisky se předávají, nemají výchozí hodnotu: konzumenti jsou vícejazyční
 * a natvrdo psaná čeština by se do anglického UI protekla.
 */
export type ConfirmDialogTone = 'danger' | 'default'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  /** Co se stane a co to znamená. U nevratné akce sem patří i to slovo. */
  description?: ReactNode
  confirmLabel: string
  cancelLabel: string
  tone?: ConfirmDialogTone
  /** Akce běží — tlačítka zamrznou, dialog nejde zavřít. */
  busy?: boolean
  /** Chyba z posledního pokusu. Dialog zůstane otevřený a ukáže ji. */
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  busy = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, busy, onCancel])

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        onClick={() => !busy && onCancel()}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="smable-confirm-title"
        aria-describedby={description ? 'smable-confirm-description' : undefined}
        className="relative w-full max-w-md rounded-xl bg-white dark:bg-neutral-950 shadow-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex gap-3.5 p-5">
          {tone === 'danger' && (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2
              id="smable-confirm-title"
              className="text-base font-semibold text-neutral-900 dark:text-white"
            >
              {title}
            </h2>
            {description && (
              <div
                id="smable-confirm-description"
                className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400"
              >
                {description}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <div
          className={clsx(
            'flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800 px-5 py-3',
            !error && 'mt-0'
          )}
        >
          <SmableButton
            ref={cancelRef}
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </SmableButton>
          <SmableButton
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={busy}
          >
            {confirmLabel}
          </SmableButton>
        </div>
      </div>
    </div>,
    document.body
  )
}
