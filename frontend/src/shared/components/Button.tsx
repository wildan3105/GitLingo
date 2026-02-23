/**
 * Button Component
 * A distinctive button with code-inspired aesthetics
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonProps = {
  /** Button visual style */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Disabled state */
  disabled?: boolean
  /** Loading state with spinner */
  loading?: boolean
  /** Button content */
  children: ReactNode
  /** Click handler */
  onClick?: () => void
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
  /** Additional CSS classes */
  className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled' | 'onClick'>

/**
 * Loading spinner component
 */
function Spinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  // Base styles with micro-interactions
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    tracking-wide
    hover:scale-[1.02] active:scale-[0.98]
    disabled:hover:scale-100
  `

  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-3 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg',
  }

  // Variant styles with distinctive look
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-500
      hover:from-blue-700 hover:to-blue-600
      text-white shadow-md hover:shadow-lg
      focus:ring-blue-500
      border border-blue-400/20
    `,
    secondary: `
      bg-secondary-100 hover:bg-secondary-200
      text-secondary-900 shadow-sm
      focus:ring-secondary-500
      border border-secondary-300
    `,
    ghost: `
      bg-transparent hover:bg-secondary-100
      text-secondary-700 hover:text-secondary-900
      focus:ring-secondary-500
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-500
      hover:from-red-700 hover:to-red-600
      text-white shadow-md hover:shadow-lg
      focus:ring-red-500
      border border-red-400/20
    `,
  }

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick()
    }
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner size={size} />
        </span>
      )}
      <span className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}>
        {children}
      </span>
    </button>
  )
}
