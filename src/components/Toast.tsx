import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import clsx from 'clsx'
import { addToast, removeToast, toastDuration, type ToastEntry, type ToastOptions, type ToastTone } from './toast-queue'

export type { ToastAction, ToastOptions, ToastTone } from './toast-queue'

/**
 * Krátké hlášky („Uloženo“, „Export se nepovedl“), výchozí vpravo nahoře.
 *
 * Tvar `show` / `success` / `error` / `info` je shodný s lokálními Toast.tsx v crm, helpdesku
 * a partneru — přechod na knihovnu je změna importu a `closeLabel` u provideru.
 *
 * Chyby mají `role="alert"` a drží 8 s, ostatní `role="status"` a 4 s; `duration: null` drží,
 * dokud je někdo nezavře. Najetí myší nebo fokus časovač pozastaví. Vidět je nejvýš `max`
 * hlášek — nad limit se vytlačí nejstarší běžná, chyby a hlášky bez časovače až nakonec.
 */
export interface ToastApi {
  show(tone: ToastTone, message: string, options?: ToastOptions): void
  success(message: string, options?: ToastOptions): void
  error(message: string, options?: ToastOptions): void
  info(message: string, options?: ToastOptions): void
}

export interface ToastProviderProps {
  children: ReactNode
  /** aria-label křížku u hlášky. */
  closeLabel: string
  /** Kolik hlášek je vidět najednou. Výchozí 3. */
  max?: number
  /**
   * Umístění, výchozí `top-right`. Vpravo nahoře mohou hlášky zakrýt Uložit v hlavičce
   * draweru — tam se hodí `bottom-*`; spodní pozice respektují `--smable-ai-bar-reserve`.
   */
  position?: ToastPosition
}

export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'

const POSITION: Record<ToastPosition, string> = {
  'top-right': 'right-4 top-4',
  'top-center': 'left-1/2 top-4 -translate-x-1/2',
  'bottom-right': 'right-4',
  'bottom-center': 'left-1/2 -translate-x-1/2',
}

const BOTTOM_STYLE: CSSProperties = { bottom: 'calc(1rem + var(--smable-ai-bar-reserve, 0px))' }

const ToastContext = createContext<ToastApi | null>(null)

const TONE: Record<ToastTone, { icon: typeof Info; box: string; iconColor: string }> = {
  success: {
    icon: CheckCircle2,
    box: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    box: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300',
    iconColor: 'text-red-500',
  },
  info: {
    icon: Info,
    box: 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200',
    iconColor: 'text-brand-500',
  },
}

export function ToastProvider({ children, closeLabel, max = 3, position = 'top-right' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((queue) => removeToast(queue, id))
  }, [])

  const show = useCallback(
    (tone: ToastTone, message: string, options?: ToastOptions) => {
      const entry: ToastEntry = {
        id: nextId.current++,
        tone,
        message,
        duration: toastDuration(tone, options?.duration),
        action: options?.action,
      }
      setToasts((queue) => addToast(queue, entry, max))
    },
    [max]
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      info: (message, options) => show('info', message, options),
    }),
    [show]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        style={position.startsWith('bottom') ? BOTTOM_STYLE : undefined}
        className={clsx('pointer-events-none fixed z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2', POSITION[position])}
      >
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} closeLabel={closeLabel} onDismiss={dismiss} fromBottom={position.startsWith('bottom')} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastView({
  toast,
  closeLabel,
  onDismiss,
  fromBottom,
}: {
  toast: ToastEntry
  closeLabel: string
  onDismiss: (id: number) => void
  fromBottom: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const remaining = useRef(toast.duration)
  const paused = hovered || focused

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Časovač běží jen bez pauzy; při pauze (i odpojení) si odečte, kolik už uběhlo.
  useEffect(() => {
    const ms = remaining.current
    if (ms === null || paused) return
    const started = Date.now()
    const timer = setTimeout(() => onDismiss(toast.id), ms)
    return () => {
      clearTimeout(timer)
      remaining.current = Math.max(0, ms - (Date.now() - started))
    }
  }, [paused, onDismiss, toast.id])

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
  }

  const { icon: Icon, box, iconColor } = TONE[toast.tone]
  const action = toast.action

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      className={clsx(
        'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-md transition-all duration-200 motion-reduce:transition-none',
        box,
        visible ? 'translate-y-0 opacity-100' : fromBottom ? 'translate-y-2 opacity-0' : '-translate-y-2 opacity-0'
      )}
    >
      <Icon aria-hidden className={clsx('mt-0.5 h-5 w-5 flex-shrink-0', iconColor)} />
      <p role={toast.tone === 'error' ? 'alert' : 'status'} className="min-w-0 flex-1 text-sm font-medium">
        {toast.message}
      </p>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick()
            onDismiss(toast.id)
          }}
          className="-my-1 flex-shrink-0 rounded-md px-2 py-1 text-sm font-semibold underline underline-offset-2 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={closeLabel}
        className="flex-shrink-0 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
