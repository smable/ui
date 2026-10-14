import { useState } from 'react'
import { readableTextClass } from './color'
import { type StockLevel, type TileSize, TILE_SIZE, nbspUnits, stockPillClass } from './itemTile'

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2'
const SCRIM = 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.35) 65%, rgba(0,0,0,0) 100%)'

export interface ItemTileV2Props {
  name: string
  price: string
  color?: string | null
  onClick: () => void
  disabled?: boolean
  image?: string | null
  imageFit: 'cover' | 'contain'
  showPrice: boolean
  stock: string | null
  stockLevel: StockLevel
  size: TileSize
}

function Pill({ text, level, surface, cls }: { text: string; level: StockLevel; surface: 'photo' | 'dark' | 'light'; cls: string }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-1 rounded-full py-0.5 font-semibold ${cls} ${stockPillClass(level, surface)}`}>
      {level !== 'ok' && <span aria-hidden className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" />}
      <span className="truncate">{text}</span>
    </span>
  )
}

/** Dlaždice v2 (Figma 4g): fotka přes celou plochu s gradientem, packshot na bílé kartě, barevná dlaždice; štítek skladu se stavem. */
export function ItemTileV2({ name, price, color, onClick, disabled, image, imageFit, showPrice, stock, stockLevel, size }: ItemTileV2Props) {
  const [broken, setBroken] = useState<string | null>(null)
  const m = TILE_SIZE[size]
  const label = nbspUnits(name)
  const hasStock = stock !== null && stock !== ''
  const showP = showPrice && price !== ''
  const withImage = !!image && broken !== image
  const base = `relative flex w-full flex-col overflow-hidden rounded-xl text-left transition active:scale-[0.98] disabled:opacity-40 ${FOCUS} ${m.height}`
  const img = (cls: string) => (
    <img src={image ?? undefined} alt="" loading="lazy" decoding="async" onError={() => setBroken(image ?? null)} className={cls} />
  )

  if (withImage && imageFit === 'cover') {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={`${base} justify-end bg-neutral-800 text-white`}>
        {img('absolute inset-0 h-full w-full object-cover')}
        {hasStock && (
          <span className="absolute left-1.5 top-1.5">
            <Pill text={stock} level={stockLevel} surface="photo" cls={m.pill} />
          </span>
        )}
        <span className={`relative flex flex-col gap-0.5 pt-[34px] ${m.padX} pb-2`} style={{ backgroundImage: SCRIM }}>
          <span className={`line-clamp-2 font-semibold ${m.name}`}>{label}</span>
          {showP && <span className={`self-end whitespace-nowrap font-bold ${m.price}`}>{price}</span>}
        </span>
      </button>
    )
  }

  if (withImage) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={`${base} border border-neutral-200 bg-white text-neutral-900`}>
        <span aria-hidden style={color ? { backgroundColor: color } : undefined} className={`h-1 w-full shrink-0 ${color ? '' : 'bg-brand-500'}`} />
        {img(`min-h-0 w-full flex-1 object-contain ${m.padX} pt-1.5`)}
        <span className={`flex flex-col gap-0.5 ${m.padX} pb-2 pt-1`}>
          <span className={`line-clamp-2 font-semibold ${m.name}`}>{label}</span>
          {(hasStock || showP) && (
            <span className="flex items-center justify-between gap-1.5">
              {hasStock ? <Pill text={stock} level={stockLevel} surface="light" cls={m.pill} /> : <span />}
              {showP && <span className={`shrink-0 whitespace-nowrap font-bold ${m.price}`}>{price}</span>}
            </span>
          )}
        </span>
      </button>
    )
  }

  const textClass = color ? readableTextClass(color) : 'text-white'
  const surface = textClass === 'text-white' ? 'dark' : 'light'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={color ? { backgroundColor: color } : undefined}
      className={`${base} justify-between ${m.pad} ${color ? '' : 'bg-brand-500 hover:bg-brand-600'} ${textClass}`}
    >
      <span className={`line-clamp-3 font-semibold ${m.name}`}>{label}</span>
      {(hasStock || showP) && (
        <span className="flex items-center justify-between gap-1.5">
          {hasStock ? <Pill text={stock} level={stockLevel} surface={surface} cls={m.pill} /> : <span />}
          {showP && <span className={`shrink-0 whitespace-nowrap font-bold ${m.price}`}>{price}</span>}
        </span>
      )}
    </button>
  )
}
