import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Hourglass,
  Loader2,
  Pencil,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { SmableButton } from '../SmableButton'
import { actionButtonsVisible } from './actions'
import type { SmableAiActionLabels, SmableAiActionRow, SmableAiActionStatus } from './types'

export interface SmableAiActionCardProps {
  title: string
  /** Náhled změny: položka, před → po. Prázdné pole tabulku nevykreslí. */
  rows: SmableAiActionRow[]
  /** Poznámka pod tabulkou („Změna se projeví na všech pokladnách…“). */
  note?: ReactNode
  /** Oranžové upozornění nad poznámkou. */
  warning?: ReactNode
  status: SmableAiActionStatus
  /** Text chyby, ukáže se jen u `failed`. */
  error?: string
  labels: SmableAiActionLabels
  /** Bez callbacku se tlačítko nevykreslí; bez obou ukáže `pending` štítek `labels.statuses.pending`. */
  onConfirm?: () => void
  onCancel?: () => void
  /**
   * Běží požadavek: u `pending` točí jmenované tlačítko a obě vypne, u `confirming` točí ikonu stavu.
   * Konzument ho drží sám, takže spinner sedí i po znovupřipojení karty (zavřený a otevřený widget).
   */
  busy?: 'confirm' | 'cancel'
}

const MUTED = 'text-neutral-500 dark:text-neutral-400'

const STATUS_ICON: Record<SmableAiActionStatus, { icon: LucideIcon; className: string }> = {
  pending: { icon: Hourglass, className: MUTED },
  confirming: { icon: Hourglass, className: MUTED },
  executed: { icon: CheckCircle2, className: 'text-brand-600' },
  cancelled: { icon: Ban, className: MUTED },
  expired: { icon: Clock, className: MUTED },
  stale: { icon: RefreshCw, className: MUTED },
  failed: { icon: AlertCircle, className: 'text-red-600 dark:text-red-400' },
}

export function SmableAiActionCard({
  title,
  rows,
  note,
  warning,
  status,
  error,
  labels,
  onConfirm,
  onCancel,
  busy,
}: SmableAiActionCardProps) {
  const [clicked, setClicked] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const buttons = actionButtonsVisible(status) && (!!onConfirm || !!onCancel)

  // Po kliknutí tlačítko zmizí a fokus by spadl na <body> — přesune se na štítek stavu.
  const hadButtons = useRef(buttons)
  useEffect(() => {
    const lost = hadButtons.current && !buttons && clicked
    hadButtons.current = buttons
    if (!lost) return
    const active = document.activeElement
    if (!active || active === document.body || cardRef.current?.contains(active)) {
      statusRef.current?.focus({ preventScroll: true })
    }
  }, [buttons, clicked])

  // Nepovedený pokus (busy zhasl, akce pořád čeká) — pozdější refetch na expired/stale nesmí brát fokus.
  const prevBusy = useRef(busy)
  useEffect(() => {
    if (prevBusy.current && !busy && status === 'pending') setClicked(false)
    prevBusy.current = busy
  }, [busy, status])

  // Zámek proti rychlému dvojkliku, než konzument nastaví `busy`; uvolní ho `busy` nebo změna stavu.
  const lock = useRef(false)
  useEffect(() => {
    lock.current = false
  }, [busy, status])

  const press = (handler: () => void) => {
    if (lock.current || busy) return
    lock.current = true
    setClicked(true)
    handler()
  }

  const live = status === 'pending' || status === 'confirming'
  const { icon: StatusIcon, className: statusIconClass } = STATUS_ICON[status]
  const spinning = !!busy && status === 'confirming'

  return (
    <div
      ref={cardRef}
      role="group"
      aria-label={title}
      aria-busy={busy ? true : undefined}
      className={clsx(
        'relative flex flex-col gap-3.5 rounded-lg border bg-white p-5 dark:bg-neutral-900',
        live ? 'border-brand-200 dark:border-brand-900' : 'border-neutral-200 dark:border-neutral-800'
      )}
    >
      <div className="flex items-center gap-2">
        <Pencil className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <p className="min-w-0 flex-1 break-words text-base font-semibold text-neutral-900 dark:text-neutral-50">
          {title}
        </p>
      </div>

      {rows.length > 0 && (
        <ul className="flex flex-col">
          {rows.map((row, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b border-neutral-100 px-3 py-2.5 text-sm dark:border-neutral-800"
            >
              <span className="min-w-0 flex-1 basis-32 break-words font-medium text-neutral-900 dark:text-neutral-50">
                {row.label}
              </span>
              <span className="flex w-48 flex-none flex-wrap items-center gap-x-1.5">
                {row.before !== undefined && (
                  <>
                    <span className="min-w-0 break-words text-neutral-700 dark:text-neutral-300">{row.before}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-600 dark:text-neutral-400" aria-hidden />
                    <span className="sr-only">→</span>
                  </>
                )}
                <span className="min-w-0 break-words font-semibold text-neutral-900 dark:text-neutral-50">{row.after}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {warning && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-800 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
          <div className="min-w-0 flex-1 break-words">{warning}</div>
        </div>
      )}

      {note && <div className="text-xs text-neutral-600 dark:text-neutral-400">{note}</div>}

      {/* Živá oblast: přechod z tlačítek na štítek („Hotovo“, chyba) se přečte; stav z historie při mountu ne. */}
      <div aria-live="polite" className="flex flex-col gap-1">
        {buttons ? (
          <div className="flex flex-wrap gap-2">
            {onConfirm && (
              <SmableButton
                variant="primary"
                loading={busy === 'confirm'}
                disabled={!!busy}
                onClick={() => press(onConfirm)}
              >
                {busy !== 'confirm' && <Check className="h-4 w-4" aria-hidden />}
                {labels.confirm}
              </SmableButton>
            )}
            {onCancel && (
              <SmableButton
                variant="ghost"
                loading={busy === 'cancel'}
                disabled={!!busy}
                onClick={() => press(onCancel)}
              >
                {labels.cancel}
              </SmableButton>
            )}
          </div>
        ) : (
          <>
            <p
              ref={statusRef}
              tabIndex={-1}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 focus:outline-none dark:text-neutral-300"
            >
              {spinning ? (
                <Loader2 className={clsx('h-4 w-4 shrink-0 animate-spin', MUTED)} aria-hidden />
              ) : (
                <StatusIcon className={clsx('h-4 w-4 shrink-0', statusIconClass)} aria-hidden />
              )}
              <span className="min-w-0 break-words">{labels.statuses[status]}</span>
            </p>
            {status === 'failed' && error && (
              <p className="break-words text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
