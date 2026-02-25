/**
 * LoadingState Component
 * Skeleton UI with smooth shimmer animation
 */

import type { CSSProperties } from 'react'

export type LoadingStateProps = {
  /** Loading variant */
  variant?: 'chart' | 'search' | 'default' | 'profile' | 'kpiCards' | 'chartPanel'
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
 * Row 1: avatar + name + badge | action buttons
 * Row 2: @username + joined + stat | location + website + last updated
 */
function ProfileSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-label="Loading profile">
      {/* Row 1: Avatar + Name + Badge | Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Row 2: @username + joined + stat | location + website + last updated */}
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2 md:gap-4 pt-2 border-t border-secondary-100">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  )
}

/**
 * KPI cards skeleton - matches the 4-card grid below ResultHeader
 */
function KpiCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      role="status"
      aria-live="polite"
      aria-label="Loading metrics"
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white/50 border border-secondary-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-6 rounded flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Chart panel skeleton - matches ChartPanel layout
 * Header + unified 3-section toolbar + chart area
 */
function ChartPanelSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-label="Loading chart">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Unified toolbar: left (chart types) | middle (top-N) | right (dropdowns) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-secondary-200">
        {/* Left: 3 chart type buttons */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-lg" />
          ))}
        </div>

        {/* Middle: 3 segmented control options (Top 10 / Top 25 / All) */}
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-md" />
          ))}
        </div>

        {/* Right: Advanced + Share dropdowns */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Chart area */}
      <div className="h-[28rem] w-full">
        <Skeleton className="h-full w-full rounded-lg" />
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
        {variant === 'kpiCards' && <KpiCardsSkeleton />}
        {variant === 'chartPanel' && <ChartPanelSkeleton />}
        {variant === 'default' && <DefaultSpinner />}
      </div>
    </>
  )
}
