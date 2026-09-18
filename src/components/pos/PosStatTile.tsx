export interface PosStatTileProps {
  label: string
  value: string
  tone?: 'default' | 'brand'
}

export function PosStatTile({ label, value, tone = 'default' }: PosStatTileProps) {
  const toneClass = tone === 'brand' ? 'bg-brand-500 text-white' : 'border border-neutral-200 bg-neutral-50 text-neutral-900'
  return (
    <div className={`flex flex-col gap-1 rounded-xl px-5 py-[18px] ${toneClass}`}>
      <span className={`text-[13px] ${tone === 'brand' ? 'text-white/90' : 'text-neutral-600'}`}>{label}</span>
      <span className="text-[28px] font-bold leading-8">{value}</span>
    </div>
  )
}
