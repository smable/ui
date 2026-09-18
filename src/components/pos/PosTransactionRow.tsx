export interface PosTransactionRowProps {
  amount: string
  method: string
  /** Souhrn položek („Cappuccino × 2, Croissant…“). */
  items: string
  time: string
  number: string
  selected: boolean
  onClick: () => void
}

export function PosTransactionRow({ amount, method, items, time, number, selected, onClick }: PosTransactionRowProps) {
  return (
    <button
      type="button"
      aria-current={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        selected ? 'rounded-[10px] bg-neutral-900 text-white' : 'border-b border-neutral-200 text-neutral-900 hover:bg-neutral-100'
      }`}
    >
      <span aria-hidden className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-brand-900' : 'bg-brand-50'}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className="text-[16px] font-bold">{amount}</span>
          <span className={`text-[12px] ${selected ? 'text-white/75' : 'text-neutral-600'}`}>{method}</span>
        </span>
        <span className={`truncate text-[13px] ${selected ? 'text-white/75' : 'text-neutral-600'}`}>{items}</span>
      </span>
      <span className="flex flex-col items-end gap-0.5">
        <span className={`text-[13px] font-semibold ${selected ? '' : 'text-neutral-600'}`}>{time}</span>
        <span className={`text-[11px] ${selected ? 'text-white/75' : 'text-neutral-400'}`}>{number}</span>
      </span>
    </button>
  )
}
