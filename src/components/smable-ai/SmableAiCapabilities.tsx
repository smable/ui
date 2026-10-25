import type { ReactNode } from 'react'
import { Eye, SquarePen } from 'lucide-react'

export interface SmableAiCapabilitySection {
  /** `read` = Eye (jen čte), `write` = SquarePen (zapisuje). */
  icon: 'read' | 'write'
  title: string
  items: string[]
}

export interface SmableAiCapabilitiesProps {
  title: string
  sections: SmableAiCapabilitySection[]
  /** Poznámka pod kartou („Asistent pracuje jen s daty provozovny…“). */
  note?: ReactNode
  /** Slot na konci karty (např. odkaz do nápovědy). */
  footer?: ReactNode
}

const ICONS = { read: Eye, write: SquarePen } as const

export function SmableAiCapabilities({ title, sections, note, footer }: SmableAiCapabilitiesProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
        {sections.map((section) => {
          const Icon = ICONS[section.icon]
          return (
            <div key={section.title} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {section.title}
                </h3>
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-neutral-700 dark:text-neutral-300">
                {section.items.map((item) => (
                  <li key={item}>
                    <span aria-hidden>· </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {footer}
      </div>
      {note && <div className="text-xs text-neutral-600 dark:text-neutral-400">{note}</div>}
    </div>
  )
}
