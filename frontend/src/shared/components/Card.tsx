/**
 * Card Component
 * A clean container with subtle depth and optional hover effects
 */

import type { ReactNode } from 'react'

export type CardProps = {
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Shadow depth */
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  /** Enable hover effect */
  hover?: boolean
  /** Card content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

export function Card({
  padding = 'md',
  shadow = 'md',
  hover = false,
  children,
  className = '',
}: CardProps) {
  // Padding variants
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  // Shadow variants with subtle color tint
  const shadowStyles = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg shadow-secondary-200/50',
  }

  // Hover effect
  const hoverStyles = hover
    ? 'hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200'
    : ''

  return (
    <div
      data-testid="card"
      className={`
        bg-white rounded-lg border border-secondary-200
        ${paddingStyles[padding]}
        ${shadowStyles[shadow]}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
