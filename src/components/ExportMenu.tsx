import { useState } from 'react'
import { Download, ChevronDown, FileSpreadsheet, Printer } from 'lucide-react'
import clsx from 'clsx'

export interface ExportOption {
  key: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

interface ExportMenuProps {
  options?: ExportOption[]
}

const defaultOptions: ExportOption[] = [
  { key: 'csv', label: 'Export do CSV', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />, onClick: () => {} },
  { key: 'excel', label: 'Export do Excel', icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />, onClick: () => {} },
  { key: 'report', label: 'Souhrnný report', icon: <Printer className="w-4 h-4 text-neutral-500" />, onClick: () => {} },
]

export function ExportMenu({ options = defaultOptions }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 py-1 z-50">
            {options.map((option, i) => (
              <div key={option.key}>
                {i > 0 && i === options.length - 1 && options.length > 2 && (
                  <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                )}
                <button
                  onClick={() => { option.onClick(); setIsOpen(false) }}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300"
                >
                  {option.icon}
                  {option.label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
