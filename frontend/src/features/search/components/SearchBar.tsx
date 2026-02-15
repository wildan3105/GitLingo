/**
 * SearchBar Component
 * Text input for username search with client-side validation
 */

import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent, ChangeEvent } from 'react'
import { validateUsername } from '../utils/validation'

export type SearchBarProps = {
  /** Current username value */
  value: string
  /** Handler for value changes */
  onChange: (value: string) => void
  /** Handler for form submission */
  onSubmit: () => void
  /** Loading state - disables input during search */
  isLoading?: boolean
  /** Validation or API error message */
  error?: string
}

export function SearchBar({ value, onChange, onSubmit, isLoading = false, error }: SearchBarProps) {
  const [touched, setTouched] = useState(false)
  const [validationError, setValidationError] = useState<string | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on mount for better UX
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear validation error when user types
    if (validationError) {
      setValidationError(undefined)
    }
  }

  const handleBlur = () => {
    setTouched(true)

    // Validate on blur
    const validation = validateUsername(value)
    if (!validation.isValid) {
      setValidationError(validation.error)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // Validate before submit
      const validation = validateUsername(value)
      if (!validation.isValid) {
        setValidationError(validation.error)
        setTouched(true)
        return
      }

      // Clear validation error and submit
      setValidationError(undefined)
      onSubmit()
    }
  }

  // Show error if there's a validation error (requires touched) or external error (always show)
  const displayError = validationError || error
  const hasError = (touched && !!validationError) || !!error

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="username-search" className="text-sm font-medium text-secondary-700">
        Username
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id="username-search"
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Enter username (e.g., octocat)"
          aria-invalid={hasError}
          aria-describedby={hasError ? 'username-error' : undefined}
          aria-busy={isLoading}
          className={`
            w-full px-4 py-3
            border-2 rounded-lg
            transition-all duration-200
            placeholder:text-secondary-400
            disabled:bg-secondary-50 disabled:cursor-not-allowed disabled:text-secondary-500 disabled:opacity-75
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${
              hasError
                ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
                : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-200'
            }
          `}
        />

        {/* Loading indicator inside input */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p
          id="username-error"
          role="alert"
          className="mt-2 text-sm text-error-600 flex items-start gap-1"
        >
          <svg
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>{displayError}</span>
        </p>
      )}

      {/* Helper text */}
      {!hasError && !isLoading && (
        <p className="mt-2 text-sm text-secondary-500">Press Enter to search</p>
      )}
    </div>
  )
}
