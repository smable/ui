import { useId, type ReactNode, type RefObject } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { DIALOG_SIZE, DialogFrame, type DialogSize } from './dialog-frame'

export type SmableDialogSize = DialogSize

/**
 * SmableDialog — vycentrovaný modál (formulář, výběrové okno, detail).
 *
 * Hlavička nese nadpis, podtitulek a křížek vpravo; tělo se posouvá, patička zůstává vidět.
 * Esc, klik na pozadí i křížek zavírají — s `dismissible={false}` nic z toho (během requestu).
 * Fokus jde po otevření na `initialFocusRef`, jinak na panel; po zavření se vrátí, odkud přišel.
 *
 * Popisky se předávají, nemají výchozí hodnotu: konzumenti jsou vícejazyční.
 */
export interface SmableDialogProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  children: ReactNode
  /** Tlačítka zarovnaná vpravo. Zrušit (secondary) patří vlevo od primárního. */
  footer?: ReactNode
  /** sm = max-w-md, md = max-w-xl, lg = max-w-2xl. */
  size?: SmableDialogSize
  /** aria-label křížku. */
  closeLabel: string
  /** false = Esc, klik na pozadí a křížek nic nedělají (běžící request). */
  dismissible?: boolean
  /** Tělo bez odsazení — výběrová okna: SearchBar přilepený nahoře + seznam. */
  bodyFlush?: boolean
  initialFocusRef?: RefObject<HTMLElement>
}

export function SmableDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeLabel,
  dismissible = true,
  bodyFlush = false,
  initialFocusRef,
}: SmableDialogProps) {
  const titleId = useId()
  const subtitleId = useId()
  const hasBody = children !== null && children !== undefined && children !== false

  return (
    <DialogFrame
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      role="dialog"
      labelledBy={titleId}
      describedBy={subtitle ? subtitleId : undefined}
      initialFocusRef={initialFocusRef}
      className={clsx('bg-white dark:bg-neutral-900', DIALOG_SIZE[size])}
    >
      <div className={clsx('flex flex-shrink-0 items-start gap-3 px-5 pt-5', hasBody ? 'pb-4' : 'pb-5')}>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-base font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <div id={subtitleId} className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {subtitle}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={!dismissible}
          aria-label={closeLabel}
          className="-mr-2 -mt-1.5 flex-shrink-0 rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
      </div>

      {hasBody && (
        <div className={clsx('min-h-0 flex-1 overflow-y-auto', !bodyFlush && 'px-5 pb-5')}>{children}</div>
      )}

      {footer && (
        <div className="flex flex-shrink-0 justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800 px-5 py-3">
          {footer}
        </div>
      )}
    </DialogFrame>
  )
}
