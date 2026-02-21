/**
 * SegmentedControl Component
 * A group of mutually exclusive buttons styled as a unified control
 */

import type { ReactNode } from 'react'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
}

export type SegmentedControlProps<T extends string> = {
  /** Available options */
  options: SegmentedOption<T>[]
  /** Currently selected value */
  value: T
  /** Handler for value changes */
  onChange: (value: T) => void
  /** Disabled state */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Segmented control component for mutually exclusive options
 *
 * Features:
 * - Clean, unified appearance
 * - Active state with visual feedback
 * - Keyboard navigation support
 * - Micro-interactions (hover, active states)
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```typescript
 * const options = [
 *   { value: 'top10', label: 'Top 10' },
 *   { value: 'top25', label: 'Top 25' },
 *   { value: 'all', label: 'All' },
 * ]
 *
 * <SegmentedControl
 *   options={options}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 * />
 * ```
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex items-center bg-secondary-100 rounded-lg p-1 gap-1 ${className}`}
      role="group"
      aria-label="Segmented control"
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
              disabled:cursor-not-allowed disabled:opacity-50
              ${
                isActive
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-200/50'
              }
              ${!disabled && !isActive && 'hover:scale-[1.02] active:scale-[0.98]'}
            `}
            aria-pressed={isActive}
          >
            {option.icon && <span className="inline-flex mr-1.5">{option.icon}</span>}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
