import { Plus, Package, TruckIcon, UserPlus } from 'lucide-react'

interface QuickAction {
  label: string
  href: string
  icon: React.ElementType
  variant?: 'primary' | 'secondary'
}

const actions: QuickAction[] = [
  {
    label: 'Přidat položku',
    href: '/items/new',
    icon: Plus,
    variant: 'primary'
  },
  {
    label: 'Příjem zboží',
    href: '/inventory/receive',
    icon: TruckIcon,
    variant: 'secondary'
  },
  {
    label: 'Nový zákazník',
    href: '/customers/new',
    icon: UserPlus,
    variant: 'secondary'
  },
  {
    label: 'Skladové hlášení',
    href: '/inventory',
    icon: Package,
    variant: 'secondary'
  }
]

export interface QuickActionsProps {
  isLoading?: boolean
}

export function QuickActions({ isLoading }: QuickActionsProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
        <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 animate-pulse" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
        Rychlé akce
      </h3>
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon
          const isPrimary = action.variant === 'primary'

          return (
            <a
              key={action.label}
              href={action.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPrimary
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}