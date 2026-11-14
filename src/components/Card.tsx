import type { ElementType, MouseEvent, ReactNode } from 'react'
import clsx from 'clsx'
import type { ShellLink } from './app-shell/types'
import { DefaultShellLink } from './app-shell/link'

export type CardHeaderStyle = 'inline' | 'bar'
export type CardPadding = 'none' | 'md' | 'lg'
export type CardTone = 'default' | 'muted'

/**
 * Card — rámeček obsahu: rounded-xl, okraj neutral-200/800, bílé/neutral-900 pozadí, bez stínu.
 *
 * Záhlaví vznikne z `title` / `description` / `icon` / `actions`:
 * - `header="inline"` (výchozí): ikona ve čtverci 9×9, nadpis a popis, akce vpravo (karty nastavení),
 * - `header="bar"`: šedý pruh s nadpisem velkými písmeny nad obsahem (detail objednávky, zákazníka).
 *
 * S `onClick` je celá karta `<button>`, s `href` odkaz (`linkComponent` = router link). Klikací
 * karta nesmí uvnitř mít další ovládací prvky — do `actions` a `children` patří jen text,
 * odznaky a ikony. `selected` (výběr kartami) = okraj brand-500 a pozadí brand-50, u tlačítka
 * `aria-pressed`.
 *
 * @example
 *   <Card icon={Receipt} title="Účtenka" description="Co se tiskne na účtence" actions={<Toggle … />}>…</Card>
 *   <Card header="bar" title="Zákazník" padding="none"><KeyValueList divided>…</KeyValueList></Card>
 *   <Card selected={plan === 'pro'} onClick={() => setPlan('pro')} title="Pro" description="…" />
 */
export interface CardProps {
  title?: ReactNode
  description?: ReactNode
  icon?: ElementType
  /** Pravá strana záhlaví. */
  actions?: ReactNode
  /** Výchozí `inline`. */
  header?: CardHeaderStyle
  /** `none` / `md` = p-4 (výchozí) / `lg` = p-6. U `header="bar"` platí pro obsah pod pruhem. */
  padding?: CardPadding
  /** `muted` = šedé pozadí neutral-50. */
  tone?: CardTone
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  href?: string
  linkComponent?: ShellLink
  selected?: boolean
  disabled?: boolean
  className?: string
  children?: ReactNode
  'aria-label'?: string
}

const PADDING: Record<CardPadding, string> = { none: '', md: 'p-4', lg: 'p-6' }
const BAR_PX: Record<CardPadding, string> = { none: 'px-4', md: 'px-4', lg: 'px-6' }

const SURFACE: Record<CardTone, string> = {
  default: 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
  muted: 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800',
}
const SELECTED = 'bg-brand-50 dark:bg-brand-950/30 border-brand-500 dark:border-brand-500'
const HOVER = 'hover:border-neutral-300 dark:hover:border-neutral-700'
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-900'

export function Card({
  title,
  description,
  icon: Icon,
  actions,
  header = 'inline',
  padding = 'md',
  tone = 'default',
  onClick,
  href,
  linkComponent,
  selected,
  disabled,
  className,
  children,
  'aria-label': ariaLabel,
}: CardProps) {
  const asButton = !!onClick
  const asLink = !asButton && !!href && !disabled
  const interactive = asButton || asLink
  // V <button> smí být jen frázový obsah — bloky se kreslí jako span.block.
  const Box = asButton ? 'span' : 'div'
  const Title = asButton ? 'span' : 'h3'
  const Text = asButton ? 'span' : 'p'
  const hasHeader = title != null || description != null || Icon != null || actions != null
  const isBar = header === 'bar' && hasHeader

  const head = hasHeader && (isBar ? (
    <Box className={clsx(
      'flex items-center gap-3 border-b border-neutral-100 bg-neutral-50 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/30',
      BAR_PX[padding],
    )}>
      {Icon && <Icon className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />}
      <Box className="block min-w-0 flex-1">
        {title != null && (
          <Title className="block text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">{title}</Title>
        )}
        {description != null && (
          <Text className="block mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{description}</Text>
        )}
      </Box>
      {actions != null && <Box className="flex shrink-0 items-center gap-2">{actions}</Box>}
    </Box>
  ) : (
    <Box className={clsx('flex items-start gap-3', children != null && 'mb-4')}>
      {Icon && (
        <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <Icon className="h-4 w-4 text-neutral-700 dark:text-neutral-300" aria-hidden="true" />
        </Box>
      )}
      <Box className="block min-w-0 flex-1">
        {title != null && (
          <Title className="block text-sm font-semibold text-neutral-900 dark:text-white">{title}</Title>
        )}
        {description != null && (
          <Text className="block mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{description}</Text>
        )}
      </Box>
      {actions != null && <Box className="flex shrink-0 items-center gap-2">{actions}</Box>}
    </Box>
  ))

  const body = isBar ? (
    <>
      {head}
      {children != null && <Box className={clsx('block', PADDING[padding])}>{children}</Box>}
    </>
  ) : (
    <>
      {head}
      {children}
    </>
  )

  const rootClass = clsx(
    'rounded-xl border',
    selected ? SELECTED : SURFACE[tone],
    !isBar && PADDING[padding],
    isBar && 'overflow-hidden',
    interactive && clsx('block w-full text-left transition-colors', FOCUS, !selected && !disabled && HOVER),
    disabled && 'opacity-50 cursor-not-allowed',
    className,
  )

  if (asButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected === undefined ? undefined : selected}
        aria-label={ariaLabel}
        className={rootClass}
      >
        {body}
      </button>
    )
  }

  if (asLink && href) {
    const Link = linkComponent ?? DefaultShellLink
    return (
      <Link href={href} className={rootClass} aria-label={ariaLabel}>
        {body}
      </Link>
    )
  }

  return (
    <div className={rootClass}>
      {body}
    </div>
  )
}
