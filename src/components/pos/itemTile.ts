/**
 * Spodní řádek dlaždice: sklad vlevo, cena vpravo (gitpos ButtonsTabletAdapter).
 * stock: null = řádek skladu vypnutý, '' = zapnutý, ale položka nemá surovinu.
 */
export function tileFooter({ price, showPrice, stock }: { price: string; showPrice: boolean; stock: string | null }): {
  left: string | null
  right: string | null
} {
  return {
    left: stock ?? null,
    right: showPrice && price !== '' ? price : null,
  }
}

export type TileSize = 'xs' | 's' | 'l'
export type StockLevel = 'ok' | 'low' | 'out'

/** Dlaždice v2 (Figma 4g): výška a typografie podle velikosti okruhu (gitpos size_of_item 126 / 157 / 210). Třídy celé kvůli Tailwindu. */
export const TILE_SIZE: Record<TileSize, { height: string; pad: string; padX: string; name: string; price: string; pill: string }> = {
  xs: { height: 'h-[96px]', pad: 'p-2', padX: 'px-2', name: 'text-[12px] leading-[15px]', price: 'text-[12px] leading-[15px]', pill: 'text-[10px] leading-[13px] px-[5px]' },
  s: { height: 'h-[120px]', pad: 'p-2.5', padX: 'px-2.5', name: 'text-[14px] leading-[17px]', price: 'text-[13px] leading-4', pill: 'text-[11px] leading-[14px] px-[7px]' },
  l: { height: 'h-[148px]', pad: 'p-3', padX: 'px-3', name: 'text-[15px] leading-[19px]', price: 'text-[15px] leading-[19px]', pill: 'text-[12px] leading-[15px] px-[7px]' },
}

/** Štítek skladu: málo / vyprodáno mají vlastní barvu, běžný stav se přizpůsobí podkladu. */
export function stockPillClass(level: StockLevel, surface: 'photo' | 'dark' | 'light'): string {
  if (level === 'low') return 'bg-[#fef3c7] text-[#92400e]'
  if (level === 'out') return 'bg-[#fee2e2] text-[#991b1b]'
  if (surface === 'photo') return 'bg-white/90 text-neutral-800'
  return surface === 'dark' ? 'bg-white/20 text-white' : 'bg-black/10 text-neutral-800'
}

/** „0,33 l“ se nesmí rozdělit na dva řádky — pevná mezera mezi číslem a jednotkou. */
export function nbspUnits(name: string): string {
  return name.replace(/(\d) (ml|cl|dl|l|kg|g|ks)(?=$|[\s,.;)/!?-])/gi, '$1\u00a0$2')
}
