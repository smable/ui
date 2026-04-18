/**
 * LoadingOverlay — centered spinner without background dimming.
 * Fills the parent container and shows a green spinner in the middle.
 *
 * Usage:
 *   if (isLoading) return <LoadingOverlay />
 *   if (isLoading) return <LoadingOverlay message="Načítání…" />
 */
interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
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
