import { type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const selectBase = "w-full h-10 px-3 pr-10 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
}

export function Select({ label, required, children, className, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className={labelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select className={clsx(selectBase, className)} {...props}>
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  )
}
