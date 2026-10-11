import { useLayoutEffect, useState, type RefObject } from 'react'

const GUTTER = 8

export type MenuAlign = 'left' | 'right'

/**
 * Ke které hraně spouštěcího tlačítka zarovnat rozbalovací menu, aby nevyjelo
 * z okna. Výchozí je pravá hrana (menu roste doleva); u tlačítka blízko levého
 * okraje — typicky na mobilu — se menu přepne na levou hranu.
 */
export function useMenuAlign(open: boolean, anchorRef: RefObject<HTMLElement | null>, menuWidth: number): MenuAlign {
  const [align, setAlign] = useState<MenuAlign>('right')

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const roomLeftOfRightEdge = rect.right - GUTTER
    const roomRightOfLeftEdge = window.innerWidth - rect.left - GUTTER
    if (roomLeftOfRightEdge >= menuWidth) setAlign('right')
    else if (roomRightOfLeftEdge >= menuWidth) setAlign('left')
    else setAlign(roomRightOfLeftEdge > roomLeftOfRightEdge ? 'left' : 'right')
  }, [open, anchorRef, menuWidth])

  return align
}
