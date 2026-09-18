export interface PosCartRowProps {
  qty: string
  name: string
  /** Cena řádku po slevě, naformátovaná. */
  price: string
  /** Sleva na řádku („−8,90“); bez ní se druhý řádek nekreslí. */
  discount?: string
  onIncrement: () => void
  onDecrement: () => void
  /** Klik na název (detail řádku). */
  onClick?: () => void
}

export function PosCartRow({ qty, name, price, discount, onIncrement, onDecrement, onClick }: PosCartRowProps) {
  const step = 'flex h-[42px] w-[42px] items-center justify-center rounded-md text-[17px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
  return (
    <div className="flex items-center gap-2.5 border-b border-neutral-200 px-4 py-1.5">
      <div className="flex items-center">
        <button type="button" aria-label={`Ubrat ${name}`} onClick={onDecrement} className={`${step} text-neutral-600 hover:bg-neutral-100`}>−</button>
        <span className="w-6 text-center text-[15px] font-semibold text-neutral-900">{qty}</span>
        <button type="button" aria-label={`Přidat ${name}`} onClick={onIncrement} className={`${step} text-brand-500 hover:bg-brand-50`}>+</button>
      </div>
      <button type="button" onClick={onClick} disabled={!onClick} className="min-w-0 flex-1 truncate text-left text-[15px] font-semibold text-neutral-900 disabled:cursor-default">
        {name}
      </button>
      <div className="flex flex-col items-end">
        <span className="text-[15px] font-semibold text-neutral-900">{price}</span>
        {discount && <span className="text-[11px] text-red-500">{discount}</span>}
      </div>
    </div>
  )
}
