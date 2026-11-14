import type { ReactNode } from 'react'

export const hintClass = 'mt-1.5 text-xs text-neutral-500 dark:text-neutral-400'

/**
 * Společné pro Input / Select / Textarea / Combobox: text chyby jen z neprázdného řetězce
 * (`error={true}` = jen červený okraj), nápověda se skryje, když je vidět chyba,
 * a `aria-describedby` míří na to, co je opravdu vykreslené.
 */
export function fieldMessages(id: string, error: string | boolean | undefined, hint: ReactNode) {
  const errorMessage = typeof error === 'string' && error !== '' ? error : undefined
  const showHint = !errorMessage && hint !== undefined && hint !== null && hint !== false && hint !== ''
  const describedBy = errorMessage ? `${id}-error` : showHint ? `${id}-hint` : undefined
  return { hasError: Boolean(error), errorMessage, showHint, describedBy }
}
