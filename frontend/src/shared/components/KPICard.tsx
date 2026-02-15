/**
 * KPICard Component
 * Displays key performance indicators with label, value, and optional subtitle
 */

import type { ReactNode } from 'react'

export type KPICardProps = {
  /** Label/title for the metric */
  label: string
  /** Main value to display */
  value: string | number
  /** Optional subtitle/description */
  subtitle?: string
  /** Optional icon */
  icon?: ReactNode
  /** Color theme for the card */
  color?: 'primary' | 'success' | 'warning' | 'secondary'
  /** Additional CSS classes */
  className?: string
}

/**
 * KPI Card component for displaying metrics
 *
 * Features:
 * - Clean, minimal design
 * - Optional icon support
 * - Color variants for different metric types
 * - Responsive text sizing
 * - Subtle visual hierarchy
 *
 * @example
 * ```typescript
 * <KPICard
 *   label="Total Repositories"
 *   value={42}
 *   subtitle="analyzed"
 *   color="primary"
 * />
 * ```
 */
export function KPICard({
  label,
  value,
  subtitle,
  icon,
  color = 'secondary',
  className = '',
}: KPICardProps) {
  // Color variants
  const colorClasses = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    secondary: 'text-secondary-700',
  }

  const iconColorClasses = {
    primary: 'text-primary-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    secondary: 'text-secondary-400',
  }

  return (
    <div
      className={`
        bg-white/50 border border-secondary-200 rounded-lg p-4
        transition-all duration-200
        hover:bg-white hover:border-secondary-300 hover:shadow-sm hover:scale-[1.02]
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide mb-2">
            {label}
          </p>

          {/* Value */}
          <p className={`text-2xl font-bold ${colorClasses[color]} truncate`}>{value}</p>

          {/* Subtitle */}
          {subtitle && <p className="text-xs text-secondary-500 mt-1">{subtitle}</p>}
        </div>

        {/* Icon */}
        {icon && (
          <div className={`flex-shrink-0 ${iconColorClasses[color]}`} aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
