/**
 * Toast Component
 * Notification toast for success/error/info feedback
 */

import type { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export type ToastProps = {
  /** Unique identifier */
  id: string
  /** Toast type determines color and icon */
  type: ToastType
  /** Message to display */
  message: string
  /** Callback when dismissed */
  onDismiss: (id: string) => void
}

/**
 * Toast notification component
 *
 * Features:
 * - Color-coded variants (success, error, info)
 * - Manual dismiss with X button
 * - Fade-in animation
 * - Accessible with aria-live
 * - Icon for each type
 *
 * @example
 * ```typescript
 * <Toast
 *   id="toast-1"
 *   type="success"
 *   message="Chart downloaded!"
 *   onDismiss={(id) => removeToast(id)}
 * />
 * ```
 */
export function Toast({ id, type, message, onDismiss }: ToastProps) {
  // Variant styles
  const variants = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: 'text-green-500',
      iconPath: (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      ),
    },
    error: {
      bg: 'bg-error-50 border-error-200',
      text: 'text-error-800',
      icon: 'text-error-500',
      iconPath: (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      ),
    },
    info: {
      bg: 'bg-primary-50 border-primary-200',
      text: 'text-primary-800',
      icon: 'text-primary-500',
      iconPath: (
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      ),
    },
  }

  const variant = variants[type]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        ${variant.bg} ${variant.text}
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        max-w-sm w-full animate-fade-in-up
      `}
    >
      {/* Icon */}
      <svg
        className={`w-5 h-5 flex-shrink-0 ${variant.icon}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        {variant.iconPath}
      </svg>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-5">{message}</p>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className={`
          flex-shrink-0 inline-flex rounded-md p-1
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${type === 'success' ? 'focus:ring-green-500 hover:bg-green-100' : ''}
          ${type === 'error' ? 'focus:ring-error-500 hover:bg-error-100' : ''}
          ${type === 'info' ? 'focus:ring-primary-500 hover:bg-primary-100' : ''}
          transition-colors duration-150
        `}
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

/**
 * Toast container component
 * Renders multiple toasts in a fixed position
 */
export type ToastContainerProps = {
  children: ReactNode
  /** Position of toast container */
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export function ToastContainer({ children, position = 'top-right' }: ToastContainerProps) {
  const positions = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={`fixed ${positions[position]} z-50 flex flex-col gap-3 pointer-events-none`}
    >
      <div className="flex flex-col gap-3 pointer-events-auto">{children}</div>
    </div>
  )
}
