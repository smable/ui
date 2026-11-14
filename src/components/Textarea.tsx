import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'
import { useFieldVariant } from './FieldVariantContext'
import { fieldMessages, hintClass } from './field-messages'

/**
 * Textarea — unified multiline input with two visual variants.
 *
 * `variant="default"` (default): label-above, resize-none, rounded-lg; `size="small"` px-2 py-1.5
 *   (buňky tabulek, bez `variant` vždy default varianta).
 * `variant="floating"`: Square-style floating label, resize-y, h-40 (large) / h-32 (medium).
 *
 * Breaking change: replaces former `SmableTextarea` (@smable/ui <= 0.2.0).
 * Migration: `<SmableTextarea .../>` → `<Textarea variant="floating" .../>`.
 */

interface BaseTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  label?: string
  /** Text chyby pod polem; `true` = jen červený okraj bez textu. */
  error?: string | boolean
  /** Nápověda pod polem (`aria-describedby`). Když se ukazuje text chyby, skryje se. */
  hint?: ReactNode
  required?: boolean
  /** Default: `small` px-2 py-1.5, jinak px-3 py-2. Floating: `large` min-h-40 (výchozí), jinak min-h-32. */
  size?: 'small' | 'medium' | 'large'
}

interface DefaultTextareaProps extends BaseTextareaProps {
  variant?: 'default'
  placeholder?: string
}

interface FloatingTextareaProps extends BaseTextareaProps {
  variant: 'floating'
  label: string
  /**
   * Nápověda uvnitř pole. Když je vyplněná, label zůstane trvale
   * nahoře — jinak by oba texty seděly na stejném místě a překryly se.
   */
  placeholder?: string
}

export type TextareaProps = DefaultTextareaProps | FloatingTextareaProps

const defaultSize = { small: "px-2 py-1.5", medium: "px-3 py-2" }
const defaultBase = "text-sm bg-white dark:bg-neutral-800 border"
const defaultNormal = "border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600"
const defaultError = "border-red-400 dark:border-red-600 rounded-lg"
const defaultTail = "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
const defaultLabel = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
const errorMsgClass = "mt-1.5 text-xs text-red-600 dark:text-red-400"

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const contextVariant = useFieldVariant()
  const resolvedVariant = props.variant ?? (props.size === 'small' ? 'default' : contextVariant)
  const autoId = useId()
  if (resolvedVariant === 'floating') {
    const floatingProps = props as FloatingTextareaProps
    const { label, error, hint, size = 'large', className, id, required, rows, placeholder, variant: _v, ...rest } = floatingProps
    const textareaId = id ?? `textarea-${autoId}`
    const { hasError, errorMessage, showHint, describedBy } = fieldMessages(textareaId, error, hint)
    // Viz Input.tsx — se skutečným placeholderem platí `:placeholder-shown`
    // i u prázdného pole, takže by label spadl přesně na jeho text.
    const hasPlaceholder = typeof placeholder === 'string' && placeholder.trim() !== ''
    const sizeClasses = size === 'large' ? 'min-h-40 pt-7 pb-3 text-base' : 'min-h-32 pt-6 pb-2 text-sm'

    return (
      <div>
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            required={required}
            placeholder={hasPlaceholder ? placeholder : ' '}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={clsx(
              'peer block w-full px-4',
              'text-neutral-900 dark:text-white',
              'bg-white dark:bg-neutral-900',
              'border rounded-xl appearance-none transition-colors resize-y',
              'focus:outline-none focus:ring-0',
              sizeClasses,
              hasError
                ? 'border-red-500 focus:border-red-500'
                : 'border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white',
              className
            )}
            {...rest}
          />
          <label
            htmlFor={textareaId}
            className={clsx(
              'absolute left-4 top-2 text-xs font-medium transition-all duration-150 pointer-events-none',
              !hasPlaceholder &&
                'peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal',
              'peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium',
              // Kontrast jako floating Input (viz Input.tsx): klidový label neutral-600 / tmavý 400,
              // chyba red-600 / tmavá red-400 — dřívější neutral-400 a red-400 na bílé propadaly WCAG AA.
              hasError
                ? clsx(
                    'text-red-600 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-400',
                    !hasPlaceholder && 'peer-placeholder-shown:text-red-600 dark:peer-placeholder-shown:text-red-400'
                  )
                : clsx(
                    'text-neutral-600 dark:text-neutral-400 peer-focus:text-neutral-900 dark:peer-focus:text-white',
                    !hasPlaceholder && 'peer-placeholder-shown:text-neutral-600 dark:peer-placeholder-shown:text-neutral-400'
                  )
            )}
          >
            {label}{required && <span className="text-red-500"> *</span>}
          </label>
        </div>
        {errorMessage && (
          <p id={`${textareaId}-error`} className={errorMsgClass}>{errorMessage}</p>
        )}
        {showHint && <p id={`${textareaId}-hint`} className={hintClass}>{hint}</p>}
      </div>
    )
  }

  const defaultProps = props as DefaultTextareaProps
  const { label, error, hint, required, className, id, variant: _v, size, ...rest } = defaultProps
  const textareaId = id ?? `textarea-${autoId}`
  const { hasError, errorMessage, showHint, describedBy } = fieldMessages(textareaId, error, hint)
  return (
    <div>
      {label && (
        <label htmlFor={textareaId} className={defaultLabel}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={clsx(
          "w-full",
          size === 'small' ? defaultSize.small : defaultSize.medium,
          defaultBase,
          hasError ? defaultError : defaultNormal,
          defaultTail,
          className
        )}
        {...rest}
      />
      {errorMessage && <p id={`${textareaId}-error`} className={errorMsgClass}>{errorMessage}</p>}
      {showHint && <p id={`${textareaId}-hint`} className={hintClass}>{hint}</p>}
    </div>
  )
})
