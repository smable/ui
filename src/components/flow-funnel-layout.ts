export type FlowFunnelTone = 'primary' | 'neutral'

export interface FlowFunnelNode {
  id: string
  label: string
  value: number
  tone?: FlowFunnelTone
  hint?: string
  children?: FlowFunnelNode[]
}

export interface FlowFunnelLayoutInput {
  root: FlowFunnelNode
  side?: FlowFunnelNode[]
  base?: number
}

export interface FlowFunnelSize {
  width: number
  height: number
}

export type FlowFunnelLabelPlacement = 'inside' | 'after' | 'above'

export interface FlowFunnelBand {
  id: string
  label: string
  value: number
  tone: FlowFunnelTone
  hint?: string
  depth: number
  ratio: number
  x: number
  y: number
  w: number
  h: number
  placement: FlowFunnelLabelPlacement
  labelX: number
  labelY: number
  dotX: number
  dotY: number
}

export interface FlowFunnelRibbon {
  from: string
  to: string
  d: string
  tone: FlowFunnelTone | 'fade'
  x1: number
  x2: number
}

export interface FlowFunnelSideItem {
  id: string
  label: string
  value: number
  ratio: number
  hint?: string
  x: number
  y: number
}

export interface FlowFunnelLayout {
  empty: boolean
  base: number
  bands: FlowFunnelBand[]
  ribbons: FlowFunnelRibbon[]
  side: FlowFunnelSideItem[]
}

export const FLOW_FUNNEL_MIN_BAND = 3

const PAD_X = 24
const PAD_Y = 24
const LABEL_SPACE = 240
const ROOT_SHARE = 0.4
const STACK_GAP = 16
const SIDE_ROW = 52
const INSIDE_MIN = 40
/** Výška bloku popisku (název + procento) a řádku s poznámkou — minimální rozestup středů sousedů. */
const LABEL_H = 36
const HINT_H = 15

const r2 = (v: number): number => Math.round(v * 100) / 100
const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), Math.max(lo, hi))
const toneOf = (n: FlowFunnelNode): FlowFunnelTone => n.tone ?? 'neutral'

function depthOf(n: FlowFunnelNode, d = 0): number {
  return (n.children ?? []).reduce((m, c) => Math.max(m, depthOf(c, d + 1)), d)
}

/** Neutrální děti nad primárními (šedá větev nahoru, konverze dolů), jinak v pořadí vstupu. */
function ordered(children: FlowFunnelNode[]): FlowFunnelNode[] {
  return children
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (toneOf(a.c) === toneOf(b.c) ? a.i - b.i : toneOf(a.c) === 'neutral' ? -1 : 1))
    .map((x) => x.c)
}

/** Pás z výřezu rodiče (s0–s1 na x1) do dítěte (t0–t1 na x2), kubické Bézierovy hrany. */
export function ribbonPath(x1: number, s0: number, s1: number, x2: number, t0: number, t1: number): string {
  const xm = r2((x1 + x2) / 2)
  const [a, b, c, d, e, f] = [x1, s0, s1, x2, t0, t1].map(r2)
  return `M${a} ${b} C${xm} ${b} ${xm} ${e} ${d} ${e} L${d} ${f} C${xm} ${f} ${xm} ${c} ${a} ${c} Z`
}

export function layoutFlowFunnel(input: FlowFunnelLayoutInput, size: FlowFunnelSize): FlowFunnelLayout {
  const sideNodes = input.side ?? []
  const base = input.base ?? input.root.value + sideNodes.reduce((s, n) => s + n.value, 0)
  if (!(base > 0)) {
    return { empty: true, base: 0, bands: [], ribbons: [], side: [] }
  }

  const depth = depthOf(input.root)
  const seg = (size.width - 2 * PAD_X - LABEL_SPACE) / (2 * depth + 1)
  const colX = (d: number): number => PAD_X + d * 2 * seg
  const top = PAD_Y
  const bottom = size.height - PAD_Y
  const innerH = bottom - top
  const rootH = input.root.value > 0 ? innerH * ROOT_SHARE : FLOW_FUNNEL_MIN_BAND
  const k = input.root.value > 0 ? rootH / input.root.value : 0
  const thick = (v: number): number => Math.max(FLOW_FUNNEL_MIN_BAND, v * k)

  const bands: FlowFunnelBand[] = []
  const ribbons: FlowFunnelRibbon[] = []

  const childYs = (nodes: FlowFunnelNode[], hs: number[], py: number, ph: number, d: number): number[] => {
    const sum = hs.reduce((s, h) => s + h, 0)
    if (hs.length === 1) {
      return [clamp(py + (ph - hs[0]) / 2, top, bottom - hs[0])]
    }
    const evenGap = (innerH - sum) / (hs.length + 1)
    if (d === 0 && evenGap >= STACK_GAP) {
      let cur = top + evenGap
      return hs.map((h) => {
        const y = cur
        cur += h + evenGap
        return y
      })
    }
    // Tenké sousední větve: středy aspoň o výšku popisku od sebe, jinak se popisky překryjí.
    const gaps = hs.slice(1).map((h, i) => Math.max(STACK_GAP, LABEL_H + (nodes[i].hint ? HINT_H : 0) - (hs[i] + h) / 2))
    const block = sum + gaps.reduce((s, g) => s + g, 0)
    let cur = clamp(py + ph / 2 - block / 2, top, bottom - block)
    return hs.map((h, i) => {
      const y = cur
      cur += h + (gaps[i] ?? 0)
      return y
    })
  }

  const place = (node: FlowFunnelNode, d: number, y: number, h: number, ratio: number): FlowFunnelBand => {
    const children = ordered(node.children ?? [])
    const x = colX(d)
    const placement: FlowFunnelLabelPlacement = children.length === 0 ? 'after' : h >= INSIDE_MIN ? 'inside' : 'above'
    const cy = y + h / 2
    const band: FlowFunnelBand = {
      id: node.id,
      label: node.label,
      value: node.value,
      tone: toneOf(node),
      hint: node.hint,
      depth: d,
      ratio,
      x: r2(x),
      y: r2(y),
      w: r2(seg),
      h: r2(h),
      placement,
      dotX: r2(placement === 'after' ? x + seg : x + 14),
      dotY: r2(placement === 'above' ? y - 22 : cy),
      labelX: r2(placement === 'after' ? x + seg + 16 : x + 28),
      labelY: r2(placement === 'above' ? y - 22 : cy),
    }
    bands.push(band)
    if (children.length === 0) {
      return band
    }
    const hs = children.map((c) => thick(c.value))
    const ys = childYs(children, hs, y, h, d)
    const total = Math.max(node.value, children.reduce((s, c) => s + c.value, 0))
    const x1 = x + seg
    const x2 = colX(d + 1)
    let cursor = y
    children.forEach((c, i) => {
      const slice = total > 0 ? (h * c.value) / total : h / children.length
      const child = place(c, d + 1, ys[i], hs[i], node.value > 0 ? c.value / node.value : 0)
      ribbons.push({
        from: node.id,
        to: c.id,
        d: ribbonPath(x1, cursor, cursor + slice, x2, child.y, child.y + child.h),
        tone: band.tone === 'primary' ? (child.tone === 'primary' ? 'primary' : 'fade') : 'neutral',
        x1: r2(x1),
        x2: r2(x2),
      })
      cursor += slice
    })
    return band
  }

  const side: FlowFunnelSideItem[] = sideNodes.map((n, i) => ({
    id: n.id,
    label: n.label,
    value: n.value,
    hint: n.hint,
    ratio: n.value / base,
    x: PAD_X,
    y: r2(top + i * SIDE_ROW),
  }))
  const rootY = clamp(
    top + (innerH - rootH) / 2 + (sideNodes.length > 0 ? SIDE_ROW / 2 : 0),
    top + sideNodes.length * SIDE_ROW,
    bottom - rootH,
  )
  place(input.root, 0, rootY, rootH, input.root.value / base)

  return { empty: false, base, bands, ribbons, side }
}
