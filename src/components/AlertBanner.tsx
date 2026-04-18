import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

export interface AlertBannerProps {
  type: 'warning' | 'error' | 'info'
  message: string
  href?: string
  onDismiss?: () => void
  dismissible?: boolean
}

export function AlertBanner({
  type,
  message,
  href,
  onDismiss,
  dismissible = false
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const baseClasses = "flex items-center gap-3 p-4 rounded-lg border mb-6"
  const typeClasses = {
    warning: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-200",
    error: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200",
    info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200"
  }

  const iconClasses = {
    warning: "text-orange-500",
    error: "text-red-500",
    info: "text-blue-500"
  }

  const content = (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <AlertTriangle className={`w-5 h-5 ${iconClasses[type]}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {dismissible && (
        <button
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