/**
 * Checkbox Component
 * Styled checkbox with label for form inputs
 */

import type { ChangeEvent } from 'react'

export type CheckboxProps = {
  /** Checkbox label text */
  label: string
  /** Whether checkbox is checked */
  checked: boolean
  /** Handler for checkbox state change */
  onChange: (checked: boolean) => void
  /** Disabled state */
  disabled?: boolean
  /** Unique identifier */
  id: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Checkbox with label and micro-interactions
 *
 * Features:
 * - Custom styled checkbox with smooth transitions
 * - Hover and focus states for accessibility
 * - Disabled state support
 * - Click area includes label for better UX
 *
 * @example
 * ```typescript
 * <Checkbox
 *   id="include-forks"
 *   label="Include forks"
 *   checked={includeForks}
 *   onChange={setIncludeForks}
 * />
 * ```
 */
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  id,
  className = '',
}: CheckboxProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center">
        {/* Hidden native checkbox for accessibility */}
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          aria-checked={checked}
        />

        {/* Custom checkbox appearance */}
        <label
          htmlFor={id}
          className={`
            flex items-center gap-2.5 cursor-pointer select-none
            transition-all duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80'}
          `}
        >
          {/* Checkbox box */}
          <div
            className={`
              relative w-5 h-5 rounded border-2
              transition-all duration-200
              ${
                checked
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-white border-secondary-300 peer-focus:border-primary-500'
              }
              ${!disabled && 'peer-focus:ring-2 peer-focus:ring-primary-200 peer-focus:ring-offset-1'}
              ${!disabled && !checked && 'hover:border-primary-400'}
              ${!disabled && 'hover:scale-105 active:scale-95'}
            `}
          >
            {/* Checkmark icon */}
            {checked && (
              <svg
                className="absolute inset-0 w-full h-full text-white p-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Label text */}
          <span className="text-sm font-medium text-secondary-700">{label}</span>
        </label>
      </div>
    </div>
  )
}
