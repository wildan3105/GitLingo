/**
 * ErrorState Component
 * Displays user-friendly error messages with retry functionality
 */

import { useEffect, useState } from 'react'
import { Button } from './Button'

export type ErrorStateProps = {
  /** Error code */
  code:
    | 'user_not_found'
    | 'rate_limited'
    | 'network_error'
    | 'server_error'
    | 'validation_error'
    | 'timeout'
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
  const iconColor = code === 'rate_limited' ? 'text-amber-600' : 'text-error-600'

  return (
    <svg
      className={`w-12 h-12 ${iconColor}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {code === 'user_not_found' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      )}
      {code === 'rate_limited' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )}
      {(code === 'network_error' || code === 'server_error' || code === 'generic') && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
          Please wait {countdown} second{countdown !== 1 ? 's' : ''} before retrying
        </p>
      )}

      {onRetry && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            disabled={!canRetry}
            aria-label={canRetry ? 'Retry now' : `Retry in ${countdown} seconds`}
          >
            {canRetry ? 'Try Again' : `Retry in ${countdown}s`}
          </Button>
        </div>
      )}
    </div>
  )
}
