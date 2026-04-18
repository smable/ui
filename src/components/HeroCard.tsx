import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export interface HeroCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    isPositive: boolean
  }
  subtitle?: string
  href?: string
  icon: React.ElementType
  isLoading?: boolean
  highlight?: boolean
}

export function HeroCard({
  title,
  value,
  change,
  subtitle,
  href,
  icon: Icon,
  isLoading,
  highlight
}: HeroCardProps) {
  const cardContent = (
    <div className={clsx(
      'p-6 rounded-lg border transition-colors',
      highlight
        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
      href && 'hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer hover:shadow-md transition-shadow'
    )}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={clsx(
          'w-5 h-5',
          highlight ? 'text-red-600' : 'text-neutral-500'
        )} />
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
      </div>

      {isLoading ? (
        <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2" />
      ) : (
        <p className={clsx(
          'text-3xl font-bold mb-2',
          highlight
            ? 'text-red-600 dark:text-red-400'
            : 'text-neutral-900 dark:text-white'
        )}>
          {value}
        </p>
      )}

      {change && (
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx(
            'text-sm font-medium',
            change.isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {change.isPositive ? '+' : ''}{change.value}%
          </span>
          <span className="text-xs text-neutral-500">{change.label}</span>
        </div>
      )}

      {subtitle && (
        <p className="text-sm text-neutral-500">{subtitle}</p>
      )}

      {href && (
        <div className="flex items-center gap-1 mt-3 text-brand-600 dark:text-brand-400 text-sm font-medium">
          Zobrazit detail
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  )

  if (href) {
    return <a href={href}>{cardContent}</a>
  }

  return cardContent
}