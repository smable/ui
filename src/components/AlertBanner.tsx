import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import clsx from 'clsx'

export type AlertBannerType = 'success' | 'warning' | 'error' | 'info'

export interface AlertBannerAction {
  label: string
  onClick: () => void
}

export interface AlertBannerProps {
  type: AlertBannerType
  message: ReactNode
  /** Tučný řádek nad zprávou. */
  title?: string
  href?: string
  /** Tlačítko v banneru („Zkusit znovu“). Nekombinuj s `href` — tlačítko uvnitř odkazu není platné HTML. */
  action?: AlertBannerAction
  onDismiss?: () => void
  dismissible?: boolean
  dismissLabel?: string
  /** Třídy banneru. Bez nich má banner `mb-6`; předané třídy ho nahradí (např. `mb-0`). */
  className?: string
}

const TYPE_CLASSES: Record<AlertBannerType, string> = {
  success:
    'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200',
  warning:
    'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-200',
  error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200',
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200',
}

const ICON_CLASSES: Record<AlertBannerType, string> = {
  success: 'text-emerald-500',
  warning: 'text-orange-500',
  error: 'text-red-500',
  info: 'text-blue-500',
}

const ICONS: Record<AlertBannerType, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
}

export function AlertBanner({
  type,
  message,
  title,
  href,
  action,
  onDismiss,
  dismissible = false,
  dismissLabel = 'Zavřít upozornění',
  className,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const Icon = ICONS[type]

  const content = (
    <div
      role={type === 'error' ? 'alert' : undefined}
      className={clsx(
        'flex gap-3 p-4 rounded-lg border',
        title ? 'items-start' : 'items-center',
        TYPE_CLASSES[type],
        className ?? 'mb-6'
      )}
    >
      <Icon aria-hidden className={clsx('w-5 h-5 flex-shrink-0', ICON_CLASSES[type], title && 'mt-0.5')} />
      <div className="flex-1 min-w-0 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5' : 'font-medium'}>{message}</div>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex-shrink-0 rounded-md px-2 py-1 text-sm font-semibold underline underline-offset-2 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button type="button"
          aria-label={dismissLabel}
          onClick={handleDismiss}
          className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  if (href) {
    return <a href={href}>{content}</a>
  }

  return content
}
