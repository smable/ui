import { forwardRef } from 'react'
import { Search } from 'lucide-react'
import { PosKbd } from './PosKbd'

export interface PosSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Zkratka, která pole zaměří (zobrazí se vpravo). */
  hint?: string
  /** Enter v poli — čtečka čárových kódů posílá kód zakončený Enterem. */
  onEnter?: () => void
}

/** Vyhledávání a zároveň pole pro čtečku. `ref` = zaměření zkratkou (F2). */
export const PosSearchInput = forwardRef<HTMLInputElement, PosSearchInputProps>(function PosSearchInput(
  { value, onChange, placeholder = 'Hledat', hint, onEnter },
  ref,
) {
  return (
    <label className="flex h-[42px] w-full items-center gap-2 rounded-[10px] bg-neutral-200 px-3.5 focus-within:ring-2 focus-within:ring-brand-500">
      <Search aria-hidden className="h-[18px] w-[18px] shrink-0 text-neutral-400" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) {
            e.preventDefault()
            onEnter()
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
      />
      {hint && <PosKbd>{hint}</PosKbd>}
    </label>
  )
})
