/**
 * ErrorState Component
 * Displays user-friendly error messages with retry functionality
 */

import { useEffect, useState } from 'react'
import { Button } from './Button'
import { formatDuration } from '../utils/formatDuration'

export type ErrorStateProps = {
  /** Error code */
  code:
    | 'user_not_found'
    | 'rate_limited'
    | 'network_error'
    | 'server_error'
    | 'validation_error'
    | 'timeout'
    | 'invalid_token'
    | 'insufficient_scopes'
    | 'generic'
  /** Error message */
  message: string
  /** Additional details */
  details?: string
  /** Retry delay in seconds (for rate limiting) */
  retryAfter?: number
  /** Retry callback */
  onRetry?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Error icon component
 */
function ErrorIcon({ code }: { code: ErrorStateProps['code'] }) {
  const iconColor =
    code === 'rate_limited'
      ? 'text-amber-600'
      : code === 'insufficient_scopes' || code === 'invalid_token'
        ? 'text-orange-500'
        : 'text-error-600'

  return (
    <svg
      className={`w-12 h-12 ${iconColor}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* User not found: person silhouette */}
      {code === 'user_not_found' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      )}
      {/* Rate limited: clock */}
      {code === 'rate_limited' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )}
      {/* Invalid token: lock */}
      {code === 'invalid_token' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      )}
      {/* Insufficient scopes: shield with exclamation */}
      {code === 'insufficient_scopes' && (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 2h.01" />
        </>
      )}
      {/* Generic / network / server / validation / timeout: warning triangle */}
      {(code === 'generic' ||
        code === 'network_error' ||
        code === 'server_error' ||
        code === 'validation_error' ||
        code === 'timeout') && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      )}
    </svg>
  )
}

export function ErrorState({
  code,
  message,
  details,
  retryAfter,
  onRetry,
  className = '',
}: ErrorStateProps) {
  const [countdown, setCountdown] = useState(retryAfter || 0)

  // Update countdown when retryAfter changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(retryAfter || 0)
  }, [retryAfter])

  // Start countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [countdown])

  const canRetry = !retryAfter || countdown === 0

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <ErrorIcon code={code} />

      <h3 className="mt-4 text-lg font-semibold text-secondary-900">{message}</h3>

      {details && <p className="mt-2 text-sm text-secondary-600 max-w-md">{details}</p>}

      {retryAfter && countdown > 0 && (
        <p className="mt-3 text-sm text-amber-700 font-medium">
          Please wait {formatDuration(countdown)} before retrying
        </p>
      )}

      {onRetry && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            disabled={!canRetry}
            aria-label={canRetry ? 'Retry now' : `Retry in ${formatDuration(countdown)}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {canRetry ? 'Try Again' : 'Retry'}
          </Button>
        </div>
      )}
    </div>
  )
}
