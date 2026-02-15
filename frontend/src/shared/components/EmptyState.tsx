/**
 * EmptyState Component
 * Displays friendly no-data states with optional actions
 */

import type { ReactNode } from 'react'
import { Button } from './Button'

export type EmptyStateProps = {
  /** Main title */
  title: string
  /** Optional description */
  description?: string
  /** Optional icon */
  icon?: ReactNode
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Additional CSS classes */
  className?: string
}

/**
 * Default empty state icon
 */
function DefaultIcon() {
  return (
    <svg
      className="w-16 h-16 text-secondary-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="mb-4">{icon || <DefaultIcon />}</div>

      <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>

      {description && <p className="mt-2 text-sm text-secondary-600 max-w-md">{description}</p>}

      {action && (
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
