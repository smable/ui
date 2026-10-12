import { useId, type ReactNode } from 'react'
import clsx from 'clsx'
import { layoutFlowFunnel, type FlowFunnelBand, type FlowFunnelNode, type FlowFunnelTone } from './flow-funnel-layout'

export { layoutFlowFunnel, FLOW_FUNNEL_MIN_BAND } from './flow-funnel-layout'
export type {
  FlowFunnelNode,
  FlowFunnelTone,
  FlowFunnelLayout,
  FlowFunnelBand,
  FlowFunnelRibbon,
  FlowFunnelSideItem,
} from './flow-funnel-layout'

export interface FlowFunnelProps {
  title: string
  /** Vpravo nahoře, např. „226 prokliků · Google Ads“. */
  caption?: string
  /** Hlavní pás. */
  root: FlowFunnelNode
  /** Samostatné uzly bez pásu (vlevo nahoře). */
  side?: FlowFunnelNode[]
  /** Jmenovatel procent pro root a side; výchozí root.value + součet side. */
  base?: number
  emptyText?: string
  formatValue?: (n: number) => string
  formatPercent?: (ratio: number) => string
  footer?: ReactNode
  className?: string
}

const WIDTH = 1000
const HEIGHT = 420
const intFormat = new Intl.NumberFormat('cs-CZ')
const pctFormat = new Intl.NumberFormat('cs-CZ', { style: 'percent', maximumFractionDigits: 1 })

const FILL: Record<FlowFunnelTone, string> = {
  primary: 'fill-brand-500',
  neutral: 'fill-neutral-200 dark:fill-neutral-700',
}

function NodeLabel({ x, y, label, percent, value, hint, onBand }: {
  x: number
  y: number
  label: string
  percent: string
  value: string
  hint?: string
  onBand: boolean
}) {
  const muted = onBand ? 'fill-white/80' : 'fill-neutral-500 dark:fill-neutral-400'
  const strong = onBand ? 'fill-white' : 'fill-neutral-900 dark:fill-white'
  return (
    <text x={x} y={y} className="text-[12px]">
      <tspan x={x} dy="-0.35em" className={muted}>{label}</tspan>
      <tspan x={x} dy="1.4em" className={clsx(strong, 'text-[14px] font-semibold')}>{percent}</tspan>
      <tspan dx="6" className={muted}>{value}</tspan>
      {hint && <tspan x={x} dy="1.35em" className={clsx(muted, 'text-[11px]')}>{hint}</tspan>}
    </text>
  )
}

function Dot({ b }: { b: FlowFunnelBand }) {
  if (b.placement === 'after') {
    return (
      <circle
        cx={b.dotX}
        cy={b.dotY}
        r={6}
        strokeWidth={3}
        className={clsx('fill-white dark:fill-neutral-900', b.tone === 'primary' ? 'stroke-brand-500' : 'stroke-neutral-400 dark:stroke-neutral-500')}
      />
    )
  }
  const fill = b.placement === 'inside'
    ? (b.tone === 'primary' ? 'fill-white' : 'fill-neutral-500 dark:fill-neutral-300')
    : (b.tone === 'primary' ? 'fill-brand-500' : 'fill-neutral-400')
  return <circle cx={b.dotX} cy={b.dotY} r={4} className={fill} />
}

/** Tok ve stylu Sankey: hlavní pás se dělí na větve, procenta vždy k nadřazenému uzlu. */
export function FlowFunnel({
  title,
  caption,
  root,
  side,
  base,
  emptyText = 'Žádná data za vybrané období',
  formatValue = (n) => intFormat.format(n),
  formatPercent = (r) => pctFormat.format(r),
  footer,
  className,
}: FlowFunnelProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const layout = layoutFlowFunnel({ root, side, base }, { width: WIDTH, height: HEIGHT })

  return (
    <section className={clsx('rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5', className)}>
      <header className="flex items-baseline justify-between gap-4 mb-3">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {caption && <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">{caption}</span>}
      </header>
      {layout.empty ? (
        <p className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">{emptyText}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="w-full min-w-[640px] h-auto">
              <defs>
                {layout.ribbons.filter((r) => r.tone === 'fade').map((r) => (
                  <linearGradient key={r.to} id={`${uid}-${r.to}`} gradientUnits="userSpaceOnUse" x1={r.x1} y1={0} x2={r.x2} y2={0}>
                    <stop offset="0" stopColor="currentColor" className="text-brand-500" />
                    <stop offset="1" stopColor="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                  </linearGradient>
                ))}
              </defs>
              {layout.ribbons.map((r) =>
                r.tone === 'fade'
                  ? <path key={`${r.from}-${r.to}`} d={r.d} fill={`url(#${uid}-${r.to})`} />
                  : <path key={`${r.from}-${r.to}`} d={r.d} className={FILL[r.tone]} />,
              )}
              {layout.bands.map((b) => (
                <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} className={FILL[b.tone]} />
              ))}
              {layout.bands.map((b) => (
                <g key={`label-${b.id}`}>
                  <Dot b={b} />
                  <NodeLabel
                    x={b.labelX}
                    y={b.labelY}
                    label={b.label}
                    percent={formatPercent(b.ratio)}
                    value={formatValue(b.value)}
                    hint={b.hint}
                    onBand={b.placement === 'inside' && b.tone === 'primary'}
                  />
                </g>
              ))}
              {layout.side.map((s) => (
                <g key={`side-${s.id}`}>
                  <circle cx={s.x + 8} cy={s.y + 12} r={8} className="fill-neutral-300 dark:fill-neutral-600" />
                  <NodeLabel x={s.x + 24} y={s.y + 12} label={s.label} percent={formatPercent(s.ratio)} value={formatValue(s.value)} hint={s.hint} onBand={false} />
                </g>
              ))}
            </svg>
          </div>
          <ul className="sr-only">
            {layout.side.map((s) => (
              <li key={`sr-side-${s.id}`}>{s.label}: {formatPercent(s.ratio)} ({formatValue(s.value)})</li>
            ))}
            {layout.bands.map((b) => (
              <li key={`sr-${b.id}`}>{b.label}: {formatPercent(b.ratio)} ({formatValue(b.value)})</li>
            ))}
          </ul>
        </>
      )}
      {footer && <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">{footer}</div>}
    </section>
  )
}
