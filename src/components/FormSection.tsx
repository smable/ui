import { useId, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { SectionTitle } from './SectionTitle'

/**
 * FormSection — skupina polí ve formuláři (drawer, nastavení): nadpis `SectionTitle`,
 * vpravo volitelná akce, pod ním pole s mezerou 16 px.
 *
 * `collapsible` udělá z nadpisu přepínač. Sbalený obsah zůstává v DOM (`hidden`),
 * takže nevyplněná pole neztratí rozepsanou hodnotu.
 */
export interface FormSectionProps {
  title?: ReactNode
  /** Popis pod nadpisem. */
  description?: ReactNode
  /** Pravá strana záhlaví (odkaz, Toggle…). */
  action?: ReactNode
  children: ReactNode
  className?: string
  /** Sbalitelná sekce (jen s `title`). */
  collapsible?: boolean
  /** Řízený stav rozbalení. */
  open?: boolean
  /** Výchozí stav bez `open`, výchozí rozbaleno. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FormSection({
  title,
  description,
  action,
  children,
  className,
  collapsible = false,
  open,
  defaultOpen = true,
  onOpenChange,
}: FormSectionProps) {
  const contentId = `form-section-${useId()}`
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const canCollapse = collapsible && Boolean(title)
  const isOpen = !canCollapse || (open ?? innerOpen)

  const toggle = () => {
    const next = !isOpen
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  const heading = title ? (
    canCollapse ? (
      <SectionTitle collapsible isOpen={isOpen} onToggle={toggle} controlsId={contentId} className={action ? 'flex-1' : undefined}>
        {title}
      </SectionTitle>
    ) : (
      <SectionTitle>{title}</SectionTitle>
    )
  ) : null

  const titleRow = heading && (action ? (
    <div className="flex items-center justify-between gap-3">
      {heading}
      {action}
    </div>
  ) : heading)

  return (
    <section className={clsx('space-y-4', className)}>
      {description && titleRow ? (
        <div>
          {titleRow}
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
      ) : (
        <>
          {titleRow}
          {description && <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
        </>
      )}
      {canCollapse ? (
        <div id={contentId} hidden={!isOpen} className="space-y-4">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  )
}
