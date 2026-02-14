/**
 * Select Component
 * A styled dropdown with error states and accessibility
 */

import { SelectHTMLAttributes } from 'react'

export type SelectOption<T = string> = {
  value: T
  label: string
  disabled?: boolean
}

export type SelectProps<T = string> = {
  /** Label for the select */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Current value */
  value: T
  /** Available options */
  options: SelectOption<T>[]
  /** Change handler */
  onChange: (value: T) => void
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Additional CSS classes */
  className?: string
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'disabled'>

export function Select<T extends string = string>({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  error,
  className = '',
  ...rest
}: SelectProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T)
  }

  const hasError = Boolean(error)
  const selectId = rest.id || `select-${label?.toLowerCase().replace(/\s/g, '-')}`

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : undefined}
          className={`
            w-full px-4 py-3 pr-10
            bg-white border-2 rounded-lg
            text-secondary-900 text-base
            appearance-none cursor-pointer
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50
            ${
              hasError
                ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
                : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-200 hover:border-secondary-400'
            }
          `}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={String(option.value)} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-secondary-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {hasError && (
        <p id={`${selectId}-error`} className="text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
