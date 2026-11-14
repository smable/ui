import type { CSSProperties } from 'react'
import clsx from 'clsx'

export type SkeletonRounded = 'md' | 'lg' | 'xl' | 'full'

/**
 * Skeleton — šedý pulzující obdélník místo obsahu, který se načítá. Pro čtečky je skrytý;
 * stav načítání ohlas na kontejneru (`aria-busy`) nebo přes `LoadingOverlay`.
 *
 * @example
 *   <Skeleton className="h-4 w-1/2" />
 *   <Skeleton width={40} height={40} rounded="full" />
 */
export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  /** Výchozí `md`. */
  rounded?: SkeletonRounded
}

const ROUNDED: Record<SkeletonRounded, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  const style: CSSProperties | undefined = width !== undefined || height !== undefined ? { width, height } : undefined
  return (
    <div
      aria-hidden="true"
      className={clsx('animate-pulse bg-neutral-200 dark:bg-neutral-800', ROUNDED[rounded], className)}
      style={style}
    />
  )
}
