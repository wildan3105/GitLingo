/**
 * useSearch Hook
 * Custom hook for managing search state and API calls
 */

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { searchLanguageStatistics } from '../../../services/gitlingoApi'
import { validateUsername } from '../utils/validation'
import type { ApiResponse, SuccessResponse, ErrorResponse } from '../../../contracts/api'
import { isSuccessResponse } from '../../../contracts/api'

export type UseSearchReturn = {
  /** Current username input value */
  username: string
  /** Update username */
  setUsername: (value: string) => void
  /** Whether to include forked repositories in results */
  includeForks: boolean
  /** Update include forks filter */
  setIncludeForks: (value: boolean) => void
  /** Whether to include unknown language repositories in results */
  includeUnknownLanguage: boolean
  /** Update include unknown language filter */
  setIncludeUnknownLanguage: (value: boolean) => void
  /** Trigger search (validates and calls API) */
  handleSearch: () => void
  /** Reset all state to defaults */
  handleReset: () => void
  /** Whether API call is in progress */
  isLoading: boolean
  /** API error response if request failed */
  error: ErrorResponse | null
  /** API success response if request succeeded */
  data: SuccessResponse | null
  /** Client-side validation error */
  validationError: string | null
}

/**
 * Custom hook for managing search functionality
 *
 * Manages form state (username, provider), validation, and API calls
 * using React Query mutations for user-triggered searches.
 *
 * @returns Object containing search state and handlers
 *
 * @example
 * ```typescript
 * function SearchPage() {
 *   const {
 *     username,
 *     setUsername,
 *     provider,
 *     setProvider,
 *     handleSearch,
 *     isLoading,
 *     error,
 *     data,
 *     validationError
 *   } = useSearch()
 *
 *   return (
 *     <div>
 *       <input value={username} onChange={(e) => setUsername(e.target.value)} />
 *       <button onClick={handleSearch}>Search</button>
 *       {data && <Results data={data} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSearch(): UseSearchReturn {
  // Form state
  const [username, setUsernameState] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Filter state - both default to true
  const [includeForks, setIncludeForks] = useState(true)
  const [includeUnknownLanguage, setIncludeUnknownLanguage] = useState(true)

  // React Query mutation for API call
  const mutation = useMutation<ApiResponse, Error, { username: string }>({
    mutationFn: ({ username }) => searchLanguageStatistics(username),
  })

  /**
   * Custom setUsername that resets error/data state when user types
   */
  const setUsername = (value: string) => {
    setUsernameState(value)
    // Clear previous search results and errors when user starts typing
    mutation.reset()
    setValidationError(null)
  }

  /**
   * Handles search submission
   * - Validates username
   * - If valid, triggers API call via React Query
   * - If invalid, sets validation error
   */
  const handleSearch = () => {
    // Clear previous validation error
    setValidationError(null)

    // Validate username
    const validation = validateUsername(username)
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid username')
      return
    }

    // Validation passed - trigger API call
    mutation.mutate({ username })
  }

  /**
   * Resets all state to defaults
   * - Clears username
   * - Resets filters to true
   * - Clears API data and errors
   * - Clears validation errors
   * - Resets URL to root
   */
  const handleReset = () => {
    setUsernameState('')
    setIncludeForks(false)
    setIncludeUnknownLanguage(false)
    setValidationError(null)
    mutation.reset()
    // Reset URL to root
    window.history.pushState({}, '', '/')
  }

  // Split API response into success/error for easier consumption
  let data: SuccessResponse | null = null
  let error: ErrorResponse | null = null

  if (mutation.data) {
    if (isSuccessResponse(mutation.data)) {
      data = mutation.data
    } else {
      error = mutation.data
    }
  }

  // Update URL when search succeeds
  useEffect(() => {
    if (data && username) {
      const newUrl = `/github/${username}`
      // Update URL without reloading the page
      window.history.pushState({}, '', newUrl)
    }
  }, [data, username])

  // Read from URL on initial load (deep linking support)
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/^\/github\/([^/]+)$/)

    if (match) {
      const usernameFromUrl = match[1]
      if (usernameFromUrl && !username && !mutation.data) {
        setUsernameState(usernameFromUrl)
        // Auto-trigger search for deep-linked URLs
        const validation = validateUsername(usernameFromUrl)
        if (validation.isValid) {
          mutation.mutate({ username: usernameFromUrl })
        }
      }
    } else if (path !== '/') {
      // If URL doesn't match /github/{username} and it's not the root path,
      // redirect to homepage
      window.history.replaceState({}, '', '/')
    }
    // Only run on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    username,
    setUsername,
    includeForks,
    setIncludeForks,
    includeUnknownLanguage,
    setIncludeUnknownLanguage,
    handleSearch,
    handleReset,
    isLoading: mutation.isPending,
    error,
    data,
    validationError,
  }
}
