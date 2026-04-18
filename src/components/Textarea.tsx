import { type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

const textareaBase = "w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <textarea className={clsx(textareaBase, className)} {...props} />
    </div>
  )
}
