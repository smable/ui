import { useId, useRef, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { SmableButton } from './SmableButton'
import { DIALOG_SIZE, DialogFrame } from './dialog-frame'
import type { SmableDialogSize } from './SmableDialog'

/**
 * ConfirmDialog — potvrzení akce, kterou nejde vzít zpět.
 *
 * Nahrazuje nativní `confirm()`: drží vzhled suite, unese vysvětlující text,
 * umí rozpracovaný stav (`busy`) a chybu ze serveru (`error`), takže se dialog
 * nemusí zavřít dřív, než je jasné, že akce prošla.
 *
 * Fokus jde po otevření na Zrušit, ne na potvrzení — u destruktivní akce nemá
 * Enter omylem potvrdit. Escape a klik na pozadí ruší; během `busy` obojí drží,
 * aby se dialog nezavřel uprostřed requestu. Po zavření se fokus vrátí, odkud přišel.
 *
 * Stojí na stejném rámu jako SmableDialog (Esc jen u nejvrchnějšího dialogu,
 * zámek posunu, portál), vlastní hlavičku s ikonou si ale drží a křížek nemá.
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
  /** Obsah pod popisem — např. pole „opiš název“ nebo výběr důvodu. */
  children?: ReactNode
  confirmLabel: string
  cancelLabel: string
  tone?: ConfirmDialogTone
  /** Akce běží — tlačítka zamrznou, dialog nejde zavřít. */
  busy?: boolean
  /** Chyba z posledního pokusu. Dialog zůstane otevřený a ukáže ji. */
  error?: string | null
  /** Potvrzení zatím nejde (nevyplněné pole v `children`). */
  confirmDisabled?: boolean
  /** Šířka jako u SmableDialog; výchozí sm (max-w-md) jako dřív. */
  size?: SmableDialogSize
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  busy = false,
  error = null,
  confirmDisabled = false,
  size = 'sm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const hasChildren = children !== null && children !== undefined && children !== false

  return (
    <DialogFrame
      open={open}
      onClose={onCancel}
      dismissible={!busy}
      role="alertdialog"
      labelledBy={titleId}
      describedBy={description ? descriptionId : undefined}
      initialFocusRef={cancelRef}
      className={clsx('bg-white dark:bg-neutral-950', DIALOG_SIZE[size])}
    >
      <div className="flex min-h-0 flex-1 gap-3.5 overflow-y-auto p-5">
        {tone === 'danger' && (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-base font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <div id={descriptionId} className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </div>
          )}
          {hasChildren && <div className="mt-4">{children}</div>}
        </div>
      </div>

      {error && (
        <div role="alert" className="mx-5 mb-4 flex-shrink-0 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-shrink-0 justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800 px-5 py-3">
        <SmableButton ref={cancelRef} variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </SmableButton>
        <SmableButton
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={busy}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </SmableButton>
      </div>
    </DialogFrame>
  )
}
