import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { PosKbd } from './PosKbd'

export type PosActionVariant = 'primary' | 'outline' | 'danger'

export interface PosActionButtonProps {
  variant: PosActionVariant
  children: ReactNode
  /** Klávesová zkratka zobrazená v tlačítku („Enter“, „Esc“, „F4“). */
  hint?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  className?: string
}

const VARIANT: Record<PosActionVariant, string> = {
  primary: 'h-[58px] bg-brand-500 text-[18px] text-white hover:bg-brand-600',
  outline: 'h-[49px] border-[1.5px] border-brand-500 text-[16px] text-brand-600 hover:bg-brand-50',
  danger: 'h-[49px] border-[1.5px] border-red-500 text-[16px] text-red-500 hover:bg-red-50',
}

/** Velké akce pokladny (Zaplatit / Uložit / Storno / Nová účtenka). */
export function PosActionButton({ variant, children, hint, onClick, disabled, loading, type = 'button', className = '' }: PosActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2.5 rounded-lg px-4 font-semibold transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 ${VARIANT[variant]} ${className}`}
    >
      {loading && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
      {children}
      {hint && !loading && <PosKbd tone={variant === 'primary' ? 'brand' : 'light'}>{hint}</PosKbd>}
    </button>
  )
}
