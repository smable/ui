import clsx from 'clsx'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SectionTitleProps {
  children: React.ReactNode
  collapsible?: boolean
  isOpen?: boolean
  onToggle?: () => void
  className?: string
  /** Jen u `collapsible`: id obsahu, který tlačítko rozbaluje (`aria-controls` + `aria-expanded`). */
  controlsId?: string
}

const baseClass = "text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"

export function SectionTitle({ children, collapsible, isOpen, onToggle, className, controlsId }: SectionTitleProps) {
  if (collapsible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-controls={controlsId}
        aria-expanded={controlsId ? Boolean(isOpen) : undefined}
        className={clsx(baseClass, "flex w-full items-center justify-between", className)}
      >
        {children}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <h3 className={clsx(baseClass, className)}>
      {children}
    </h3>
  )
}
