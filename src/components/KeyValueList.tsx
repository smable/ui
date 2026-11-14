import { createContext, useContext, type ElementType, type ReactNode } from 'react'
import clsx from 'clsx'

export type KeyValueEmphasis = 'default' | 'strong' | 'positive' | 'negative' | 'muted'
export type KeyValueLayout = 'inline' | 'stacked'
export type KeyValueListTone = 'plain' | 'muted'
export type KeyValueListSize = 'sm' | 'md'

interface ListContext {
  size: KeyValueListSize
  divided: boolean
}

const KeyValueListContext = createContext<ListContext>({ size: 'md', divided: false })

/**
 * KeyValueList — seznam „popisek → hodnota“ jako `<dl>`. Řádky jsou `KeyValueRow`
 * (vždy uvnitř `KeyValueList`, jinak `<dt>`/`<dd>` nejsou platné HTML).
 *
 * `columns` 2–3 skládá řádky do mřížky (hodí se k `layout="stacked"`); v mřížce se `divided` neuplatní.
 *
 * @example
 *   <KeyValueList divided>
 *     <KeyValueRow label="Mezisoučet" value="1 200 Kč" />
 *     <KeyValueRow label="Sleva" value="−100 Kč" emphasis="negative" />
 *     <KeyValueRow label="Celkem" value="1 100 Kč" emphasis="strong" />
 *   </KeyValueList>
 *   <KeyValueList columns={2}>
 *     <KeyValueRow layout="stacked" icon={Mail} label="E-mail" value={email} href={`mailto:${email}`} />
 *   </KeyValueList>
 */
export interface KeyValueListProps {
  children: ReactNode
  /** Čáry mezi řádky. */
  divided?: boolean
  /** `muted` = šedý box (souhrn v draweru). */
  tone?: KeyValueListTone
  /** `sm` = text-xs, `md` = text-sm (výchozí). */
  size?: KeyValueListSize
  columns?: 1 | 2 | 3
  className?: string
}

const LIST_SIZE: Record<KeyValueListSize, string> = { sm: 'text-xs', md: 'text-sm' }
const COLUMNS: Record<2 | 3, string> = {
  2: 'grid grid-cols-1 content-start gap-x-6 gap-y-3 sm:grid-cols-2',
  3: 'grid grid-cols-1 content-start gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3',
}

export function KeyValueList({ children, divided = false, tone = 'plain', size = 'md', columns = 1, className }: KeyValueListProps) {
  const grid = columns > 1
  const rowsDivided = divided && !grid
  return (
    <KeyValueListContext.Provider value={{ size, divided: rowsDivided }}>
      <dl
        className={clsx(
          LIST_SIZE[size],
          tone === 'muted' && clsx('rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-4', rowsDivided ? 'py-1' : 'py-3'),
          grid
            ? COLUMNS[columns as 2 | 3]
            : rowsDivided
              ? 'divide-y divide-neutral-100 dark:divide-neutral-800'
              : size === 'sm' ? 'space-y-1.5' : 'space-y-2',
          className,
        )}
      >
        {children}
      </dl>
    </KeyValueListContext.Provider>
  )
}

export interface KeyValueRowProps {
  label: ReactNode
  value: ReactNode
  /** `strong` = součet, `positive`/`negative` = barevná hodnota, `muted` = šedá hodnota. */
  emphasis?: KeyValueEmphasis
  /** `inline` (výchozí) = popisek vlevo, hodnota vpravo; `stacked` = popisek nad hodnotou. */
  layout?: KeyValueLayout
  icon?: ElementType
  /** Hodnota jako odkaz (`mailto:`, `tel:`, URL). */
  href?: string
  /** Neproporcionální písmo (VS, ID, kódy). */
  mono?: boolean
  className?: string
}

const VALUE: Record<KeyValueEmphasis, string> = {
  default: 'text-neutral-900 dark:text-neutral-100',
  strong: 'font-semibold text-neutral-900 dark:text-white',
  positive: 'font-medium text-emerald-600 dark:text-emerald-400',
  negative: 'font-medium text-red-600 dark:text-red-400',
  muted: 'text-neutral-500 dark:text-neutral-400',
}

export function KeyValueRow({ label, value, emphasis = 'default', layout = 'inline', icon: Icon, href, mono, className }: KeyValueRowProps) {
  const { size, divided } = useContext(KeyValueListContext)
  const icon = Icon && (
    <Icon className={clsx('shrink-0 text-neutral-400', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} aria-hidden="true" />
  )
  const content = href ? (
    <a href={href} className="text-brand-600 hover:underline dark:text-brand-400">{value}</a>
  ) : value
  const pad = divided && (size === 'sm' ? 'py-1.5' : 'py-2')

  if (layout === 'stacked') {
    return (
      <div className={clsx('min-w-0', pad, className)}>
        <dt className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {icon}
          {label}
        </dt>
        <dd className={clsx('mt-0.5 break-words', VALUE[emphasis], mono && 'font-mono')}>{content}</dd>
      </div>
    )
  }

  return (
    <div className={clsx('flex items-start justify-between gap-4', pad, className)}>
      <dt className={clsx(
        'flex min-w-0 items-center gap-1.5',
        emphasis === 'strong' ? 'font-semibold text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400',
      )}>
        {icon}
        {label}
      </dt>
      <dd className={clsx('min-w-0 text-right tabular-nums break-words', VALUE[emphasis], mono && 'font-mono')}>{content}</dd>
    </div>
  )
}
