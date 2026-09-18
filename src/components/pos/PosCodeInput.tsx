export interface PosCodeInputProps {
  length: number
  value: string
  /** PIN — místo číslic tečky. */
  mask?: boolean
  /** Zvýrazní políčko, do kterého se bude psát. */
  focused?: boolean
  label?: string
}

export function PosCodeInput({ length, value, mask = false, focused = true, label }: PosCodeInputProps) {
  const chars = value.slice(0, length).split('')
  return (
    <div role="group" aria-label={label} className="flex gap-3">
      {Array.from({ length }, (_, i) => {
        const filled = i < chars.length
        const active = focused && i === chars.length
        const border = active ? 'border-2 border-brand-500' : filled ? 'border-[1.5px] border-brand-500' : 'border border-neutral-200'
        return (
          <span key={i} className={`flex h-16 w-[54px] items-center justify-center rounded-[10px] bg-white text-2xl font-semibold text-neutral-900 ${border}`}>
            {filled ? (mask ? '•' : chars[i]) : ''}
          </span>
        )
      })}
    </div>
  )
}
