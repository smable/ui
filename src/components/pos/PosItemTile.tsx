import { useState } from 'react'
import { readableTextClass } from './color'
import { tileFooter } from './itemTile'

export interface PosItemTileProps {
  name: string
  /** Už naformátovaná cena („49,00“). */
  price: string
  /** Hex z backoffice; bez barvy = brand. */
  color?: string | null
  onClick: () => void
  disabled?: boolean
  /** Obrázek tlačítka (URL). Nenačte-li se, dlaždice je jako bez něj. */
  image?: string | null
  /** `cover` = oříznout na výplň (výchozí), `contain` = celý obrázek (gitpos image_screen_type 1). */
  imageFit?: 'cover' | 'contain'
  /** Výchozí true. Gitpos u obrázků ukazuje cenu jen s volbou okruhu „cena na tlačítku“. */
  showPrice?: boolean
  /** Řádek skladu vlevo dole: null = vypnutý, '' = zapnutý bez hodnoty (položka bez suroviny). */
  stock?: string | null
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2'

/** Dlaždice položky — rozměr a typografie podle Airu (120 px, název vlevo nahoře, cena vpravo dole). */
export function PosItemTile({ name, price, color, onClick, disabled, image, imageFit = 'cover', showPrice = true, stock = null }: PosItemTileProps) {
  const [broken, setBroken] = useState<string | null>(null)
  const textClass = color ? readableTextClass(color) : 'text-white'
  const footer = tileFooter({ price, showPrice, stock })
  const withImage = !!image && broken !== image

  if (!withImage) {
    if (stock === null && showPrice) {
      return (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          style={color ? { backgroundColor: color } : undefined}
          className={`flex h-[120px] w-full flex-col justify-between rounded-lg p-3 text-left transition active:scale-[0.98] disabled:opacity-40 ${FOCUS} ${
            color ? '' : 'bg-brand-500 hover:bg-brand-600'
          } ${textClass}`}
        >
          <span className="line-clamp-3 text-[14px] font-semibold leading-[17px]">{name}</span>
          <span className="self-end text-[13px] leading-4">{price}</span>
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={color ? { backgroundColor: color } : undefined}
        className={`flex h-[120px] w-full flex-col justify-between rounded-lg p-3 text-left transition active:scale-[0.98] disabled:opacity-40 ${FOCUS} ${
          color ? '' : 'bg-brand-500 hover:bg-brand-600'
        } ${textClass}`}
      >
        <span className="line-clamp-3 text-[14px] font-semibold leading-[17px]">{name}</span>
        <span className="flex min-h-4 items-end justify-between gap-2 text-[13px] leading-4">
          <span className="min-w-0 truncate">{footer.left}</span>
          {footer.right !== null && <span className="shrink-0">{footer.right}</span>}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={color ? { backgroundColor: color } : undefined}
      className={`relative flex h-[120px] w-full flex-col justify-end overflow-hidden rounded-lg text-left transition active:scale-[0.98] disabled:opacity-40 ${FOCUS} ${
        color ? '' : 'bg-brand-500 hover:bg-brand-600'
      } ${textClass}`}
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setBroken(image)}
        className={`absolute inset-0 h-full w-full ${imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
      />
      <span
        style={color ? { backgroundColor: color } : undefined}
        className={`relative flex flex-col gap-0.5 px-2 py-1.5 ${color ? '' : 'bg-brand-500'}`}
      >
        <span className="line-clamp-2 text-[14px] font-semibold leading-[17px]">{name}</span>
        {(footer.left !== null || footer.right !== null) && (
          <span className="flex min-h-4 items-end justify-between gap-2 text-[13px] leading-4">
            <span className="min-w-0 truncate">{footer.left}</span>
            {footer.right !== null && <span className="shrink-0">{footer.right}</span>}
          </span>
        )}
      </span>
    </button>
  )
}
