import clsx from 'clsx'

/**
 * LoadingOverlay — centered spinner without background dimming.
 * Shows a brand spinner in the middle and announces itself as `role="status"`.
 *
 * `fill="viewport"` (default) keeps the page-level `min-h-[80vh]`; `fill="container"`
 * fills the parent block (`py-12`) — for cards, drawers and table bodies.
 *
 * Usage:
 *   if (isLoading) return <LoadingOverlay />
 *   if (isLoading) return <LoadingOverlay message="Načítání…" />
 *   {isLoading && <LoadingOverlay fill="container" />}
 */
export type LoadingOverlayFill = 'viewport' | 'container'

export interface LoadingOverlayProps {
  message?: string
  fill?: LoadingOverlayFill
}

export function LoadingOverlay({ message, fill = 'viewport' }: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'flex items-center justify-center',
        fill === 'viewport' ? 'min-h-[80vh]' : 'w-full h-full py-12',
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-[5px] border-neutral-50 dark:border-neutral-800" />
          <div className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-brand-500 animate-spin" />
        </div>
        {message && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
        )}
      </div>
    </div>
  )
}
