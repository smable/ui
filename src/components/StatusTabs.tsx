import clsx from 'clsx'

interface Tab<T extends string> {
  key: T
  label: string
  count: number
  badgeColor?: string
}

interface StatusTabsProps<T extends string> {
  tabs: Tab<T>[]
  value: T
  onChange: (value: T) => void
}

export function StatusTabs<T extends string>({ tabs, value, onChange }: StatusTabsProps<T>) {
  return (
    <div className="flex items-center gap-1 mb-4 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-md transition-all",
            value === tab.key
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          )}
        >
          {tab.label}
          <span className={clsx(
            "ml-2 px-1.5 py-0.5 text-xs rounded-full",
            value === tab.key && tab.badgeColor
              ? tab.badgeColor
              : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
          )}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}
