export interface PosCodeInputProps {
  length: number
  value: string
  /** PIN — místo číslic tečky. */
  mask?: boolean
  /** Zvýrazní políčko, do kterého se bude psát. */
  focused?: boolean
  label?: string
  /** Políčka se zúží podle šířky rodiče (6 políček se vejde i na 320 px). Bez něj 54 px jako v 0.14. */
  fluid?: boolean
}

export function PosCodeInput({ length, value, mask = false, focused = true, label, fluid = false }: PosCodeInputProps) {
  const chars = value.slice(0, length).split('')
  return (
    <div role="group" aria-label={label} className={fluid ? 'flex w-full justify-center gap-2' : 'flex gap-3'}>
      {Array.from({ length }, (_, i) => {
        const filled = i < chars.length
        const active = focused && i === chars.length
        const border = active ? 'border-2 border-brand-500' : filled ? 'border-[1.5px] border-brand-500' : 'border border-neutral-200'
        const size = fluid ? 'min-w-0 max-w-[64px] flex-1' : 'w-[54px]'
        return (
          <span key={i} className={`flex h-16 items-center justify-center rounded-[10px] bg-white text-2xl font-semibold text-neutral-900 ${size} ${border}`}>
            {filled ? (mask ? '•' : chars[i]) : ''}
          </span>
        )
      })}
    </div>
  )
}
