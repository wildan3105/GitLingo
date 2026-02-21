/**
 * Card Component
 * A clean container with subtle depth and optional hover effects
 */

import type { ReactNode } from 'react'

export type CardProps = {
  /** Visual weight variant */
  variant?: 'subtle' | 'default' | 'prominent'
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Shadow depth (overrides variant default) */
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  /** Enable hover effect */
  hover?: boolean
  /** Card content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

export function Card({
  variant = 'default',
  padding = 'md',
  shadow,
  hover = false,
  children,
  className = '',
}: CardProps) {
  // Variant presets (background, border, default shadow)
  const variantStyles = {
    subtle: {
      bg: 'bg-white/50',
      border: 'border border-secondary-200',
      shadow: 'shadow-sm',
    },
    default: {
      bg: 'bg-white',
      border: 'border border-secondary-200',
      shadow: 'shadow-md',
    },
    prominent: {
      bg: 'bg-white',
      border: 'border-2 border-secondary-300',
      shadow: 'shadow-lg shadow-secondary-200/50',
    },
  }

  // Padding variants
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  // Shadow variants (if explicitly provided)
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

  // Use explicit shadow if provided, otherwise use variant default
  const appliedShadow = shadow ? shadowStyles[shadow] : variantStyles[variant].shadow

  return (
    <div
      data-testid="card"
      className={`
        ${variantStyles[variant].bg}
        ${variantStyles[variant].border}
        ${appliedShadow}
        rounded-lg
        ${paddingStyles[padding]}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
