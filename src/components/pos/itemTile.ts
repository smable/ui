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
