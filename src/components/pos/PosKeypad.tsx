import { Delete } from 'lucide-react'

export type PosKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | ',' | 'backspace'

export interface PosKeypadProps {
  onKey: (key: PosKey) => void
  /** false = PIN / kód (bez desetinné čárky). */
  decimal?: boolean
  /** Na šířku rodiče a nižší klávesy na nízkých displejích (telefon na výšku). Bez něj 300 px jako v 0.14. */
  fluid?: boolean
}

const ROWS: PosKey[][] = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], [',', '0', 'backspace']]

const KEY_BASE =
  'flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-2xl text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

/** Numerická klávesnice jako v Airu (7-8-9 nahoře). Klávesy počítače řeší konzument. */
export function PosKeypad({ onKey, decimal = true, fluid = false }: PosKeypadProps) {
  return (
    <div className={fluid ? 'grid w-full grid-cols-3 gap-2' : 'grid w-[300px] grid-cols-3 gap-2'}>
      {ROWS.flat().map((key) => {
        if (key === ',' && !decimal) return <span key={key} aria-hidden />
        return (
          <button
            key={key}
            type="button"
            aria-label={key === 'backspace' ? 'Smazat' : key}
            onClick={() => onKey(key)}
            className={`${KEY_BASE} ${fluid ? 'h-[clamp(56px,10vh,84px)]' : 'h-[84px]'}`}
          >
            {key === 'backspace' ? <Delete aria-hidden className="h-6 w-6" /> : key}
          </button>
        )
      })}
    </div>
  )
}
