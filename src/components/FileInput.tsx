import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ElementType,
  type ReactNode,
} from 'react'
import { FileText, Upload } from 'lucide-react'
import clsx from 'clsx'
import { SmableButton } from './SmableButton'
import { Spinner } from './Spinner'
import { fieldMessages, hintClass } from './field-messages'
import { matchesAccept } from './file-accept'

export { matchesAccept, type FileLike } from './file-accept'

/**
 * FileInput — výběr jednoho souboru.
 *
 * `variant="dropzone"` (výchozí): čárkovaná plocha s ikonou, nadpisem a nápovědou; soubor jde vybrat
 * kliknutím i přetažením (při přetažení se plocha zvýrazní).
 * `variant="button"`: tlačítko vzhledu `SmableButton variant="secondary"`, nápověda a chyba pod ním.
 *
 * Soubor, který neodpovídá `accept` (přetažený, nebo vybraný přes „Všechny soubory“), se nepředá do
 * `onFile`: zavolá se `onReject` a pod polem se ukáže `labels.rejected`. Po každém výběru se hodnota
 * `<input>` vynuluje, takže jde vybrat stejný soubor znovu (např. po chybě nahrávání).
 *
 * @example
 *   <FileInput accept=".xlsx,.xls,.csv" icon={FileSpreadsheet} label="Vyberte soubor" hint="Excel nebo CSV" onFile={importFile} />
 *   <FileInput variant="button" accept="image/jpeg,image/png" loading={uploading} onFile={upload} />
 *   <FileInput variant="button" accept=".gpc,.abo" fileName={file?.name} onFile={setFile} />
 */
export type FileInputVariant = 'dropzone' | 'button'

export interface FileInputLabels {
  /** Text tlačítka (`button`), když chybí `label`. */
  pick: string
  /** Nadpis dropzóny, když chybí `label`. */
  drop: string
  /** Text místo popisku během `loading`. */
  loading: string
  /** Chyba, když soubor neodpovídá `accept`. */
  rejected: string
}

const DEFAULT_LABELS: FileInputLabels = {
  pick: 'Vybrat soubor',
  drop: 'Vyberte soubor nebo ho přetáhněte sem',
  loading: 'Nahrávání…',
  rejected: 'Tento typ souboru nepodporujeme. Vyberte jiný.',
}

export interface FileInputHandle {
  /** Otevře systémový výběr souboru (ne během `disabled` / `loading`). */
  open: () => void
}

export interface FileInputProps {
  onFile: (file: File) => void
  /** Stejný formát jako HTML `accept`: přípony (`.csv`), MIME (`image/png`) a skupiny (`image/*`). */
  accept?: string
  variant?: FileInputVariant
  /** Text tlačítka / nadpis dropzóny. */
  label?: ReactNode
  /** Dropzóna: druhý řádek uvnitř plochy. Tlačítko: text pod ním. */
  hint?: ReactNode
  /** Ikona (komponenta, např. `FileSpreadsheet`), výchozí `Upload`. */
  icon?: ElementType
  disabled?: boolean
  /** Místo ikony spinner a `labels.loading`; výběr ani přetažení nejde. */
  loading?: boolean
  /** Text chyby pod polem; `true` = jen červený okraj dropzóny. */
  error?: string | boolean
  /** Název vybraného souboru (dropzóna pod nápovědou, tlačítko vedle). Pro formuláře, které soubor odešlou až později. */
  fileName?: string
  /** Soubor neodpovídá `accept`. */
  onReject?: (file: File) => void
  labels?: Partial<FileInputLabels>
  id?: string
  name?: string
  className?: string
}

const errorMsgClass = 'mt-1.5 text-xs text-red-600 dark:text-red-400'

function hasFiles(e: DragEvent) {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files')
}

export const FileInput = forwardRef<FileInputHandle, FileInputProps>(function FileInput(
  {
    onFile,
    accept,
    variant = 'dropzone',
    label,
    hint,
    icon: Icon = Upload,
    disabled,
    loading,
    error,
    fileName,
    onReject,
    labels,
    id,
    name,
    className,
  },
  ref,
) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const autoId = useId()
  const inputId = id ?? `file-input-${autoId}`
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [rejected, setRejected] = useState(false)
  const inactive = Boolean(disabled || loading)

  const open = () => {
    if (!inactive) inputRef.current?.click()
  }
  useImperativeHandle(ref, () => ({ open }))

  const take = (file: File | undefined) => {
    if (!file) return
    if (!matchesAccept(file, accept)) {
      setRejected(true)
      onReject?.(file)
      return
    }
    setRejected(false)
    onFile(file)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    take(file)
  }

  const shownError = typeof error === 'string' && error !== '' ? error : rejected ? l.rejected : error
  const { hasError, errorMessage, showHint, describedBy } = fieldMessages(inputId, shownError, hint)
  const errorNode = errorMessage && (
    <p id={`${inputId}-error`} className={errorMsgClass}>{errorMessage}</p>
  )
  const input = (
    <input ref={inputRef} id={inputId} name={name} type="file" accept={accept} hidden tabIndex={-1} onChange={onChange} />
  )
  const nameNode = fileName && (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300" title={fileName}>
      <FileText className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
      <span className="truncate">{fileName}</span>
    </span>
  )

  if (variant === 'button') {
    return (
      <div className={className}>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <SmableButton
            variant="secondary"
            onClick={open}
            disabled={disabled}
            loading={loading}
            aria-describedby={describedBy}
          >
            {!loading && <Icon className="h-4 w-4" aria-hidden="true" />}
            {loading ? l.loading : label ?? l.pick}
          </SmableButton>
          {nameNode}
        </div>
        {input}
        {errorNode}
        {showHint && <p id={`${inputId}-hint`} className={hintClass}>{hint}</p>}
      </div>
    )
  }

  const highlight = dragging && !inactive

  const onDragEnter = (e: DragEvent<HTMLButtonElement>) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    if (inactive) return
    dragDepth.current += 1
    setDragging(true)
  }
  const onDragOver = (e: DragEvent<HTMLButtonElement>) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = inactive ? 'none' : 'copy'
  }
  const onDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    if (!hasFiles(e)) return
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }
  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    if (!inactive) take(e.dataTransfer.files[0])
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={open}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-disabled={inactive || undefined}
        aria-busy={loading || undefined}
        aria-describedby={errorMessage ? `${inputId}-error` : undefined}
        className={clsx(
          'flex w-full flex-col items-center rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
          highlight
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
            : hasError
              ? 'border-red-400 dark:border-red-600'
              : 'border-neutral-300 dark:border-neutral-700',
          inactive ? 'cursor-not-allowed' : !highlight && !hasError && 'hover:border-brand-400',
          disabled && 'opacity-50',
        )}
      >
        {loading ? (
          <Spinner size="lg" tone="neutral" />
        ) : (
          <Icon className="h-6 w-6 text-neutral-400" aria-hidden="true" />
        )}
        <span className="mt-3 text-sm font-medium text-neutral-900 dark:text-white">
          {loading ? l.loading : label ?? l.drop}
        </span>
        {hint != null && hint !== false && hint !== '' && (
          <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</span>
        )}
        {nameNode && <span className="mt-3 flex max-w-full justify-center">{nameNode}</span>}
      </button>
      {input}
      {errorNode}
    </div>
  )
})
