import { createContext, useContext, type ReactNode } from 'react'

export type FieldVariant = 'default' | 'floating'

const FieldVariantContext = createContext<FieldVariant>('default')

export interface FieldVariantProviderProps {
  variant: FieldVariant
  children: ReactNode
}

export function FieldVariantProvider({ variant, children }: FieldVariantProviderProps) {
  return (
    <FieldVariantContext.Provider value={variant}>{children}</FieldVariantContext.Provider>
  )
}

export function useFieldVariant(): FieldVariant {
  return useContext(FieldVariantContext)
}
