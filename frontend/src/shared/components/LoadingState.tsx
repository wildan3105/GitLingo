/**
 * LoadingState Component
 * Skeleton UI with smooth shimmer animation
 */

export type LoadingStateProps = {
  /** Loading variant */
  variant?: 'chart' | 'search' | 'default'
  /** Additional CSS classes */
  className?: string
}

/**
 * Shimmer animation wrapper
 */
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 2s ease-in-out infinite',
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
        {variant === 'default' && <DefaultSpinner />}
      </div>
    </>
  )
}
