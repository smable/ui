import { readableTextClass } from './color'

export interface PosItemTileProps {
  name: string
  /** Už naformátovaná cena („49,00"). */
  price: string
  /** Hex z backoffice; bez barvy = brand. */
  color?: string | null
  onClick: () => void
  disabled?: boolean
}

/** Dlaždice položky — rozměr a typografie podle Airu (120 px, název vlevo nahoře, cena vpravo dole). */
export function PosItemTile({ name, price, color, onClick, disabled }: PosItemTileProps) {
  const textClass = color ? readableTextClass(color) : 'text-white'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={color ? { backgroundColor: color } : undefined}
      className={`flex h-[120px] w-full flex-col justify-between rounded-lg p-3 text-left transition active:scale-[0.98] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 ${
        color ? '' : 'bg-brand-500 hover:bg-brand-600'
      } ${textClass}`}
    >
      <span className="line-clamp-3 text-[14px] font-semibold leading-[17px]">{name}</span>
      <span className="self-end text-[13px] leading-4">{price}</span>
    </button>
  )
}
