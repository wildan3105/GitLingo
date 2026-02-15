/**
 * LoadingState Component
 * Skeleton UI with smooth shimmer animation
 */

import type { CSSProperties } from 'react'

export type LoadingStateProps = {
  /** Loading variant */
  variant?: 'chart' | 'search' | 'default' | 'profile' | 'chartPanel'
  /** Additional CSS classes */
  className?: string
}

/**
 * Shimmer animation wrapper
 */
function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 2s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

/**
 * Chart loading skeleton
 */
function ChartSkeleton() {
  return (
    <div className="w-full space-y-4" role="status" aria-live="polite" aria-label="Loading chart">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Chart bars skeleton */}
      <div className="space-y-3 pt-4">
        {[100, 85, 70, 55, 40, 25].map((width, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Search results skeleton
 */
function SearchSkeleton() {
  return (
    <div className="w-full space-y-4" role="status" aria-live="polite" aria-label="Loading results">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Profile card skeleton - matches ResultHeader layout
 */
function ProfileSkeleton() {
  return (
    <div className="w-full" role="status" aria-live="polite" aria-label="Loading profile">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />

        {/* Profile info */}
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Chart panel skeleton - matches ChartPanel layout
 */
function ChartPanelSkeleton() {
  return (
    <div className="w-full space-y-6" role="status" aria-live="polite" aria-label="Loading chart">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Chart type selector */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>

      {/* Chart area */}
      <div className="h-96 w-full">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>

      {/* Actions area */}
      <div className="flex items-center justify-center gap-3 pt-4 border-t border-secondary-200">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

/**
 * Default spinner loading
 */
function DefaultSpinner() {
  return (
    <div
      className="flex items-center justify-center py-12"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <svg
        className="animate-spin h-10 w-10 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function LoadingState({ variant = 'default', className = '' }: LoadingStateProps) {
  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
      <div className={className}>
        {variant === 'chart' && <ChartSkeleton />}
        {variant === 'search' && <SearchSkeleton />}
        {variant === 'profile' && <ProfileSkeleton />}
        {variant === 'chartPanel' && <ChartPanelSkeleton />}
        {variant === 'default' && <DefaultSpinner />}
      </div>
    </>
  )
}
