/**
 * useSearch Hook
 * Custom hook for managing search state and API calls
 */

import { useState } from 'react'
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
  /** Current provider selection */
  provider: string
  /** Update provider */
  setProvider: (value: string) => void
  /** Trigger search (validates and calls API) */
  handleSearch: () => void
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
  const [provider, setProvider] = useState('github')
  const [validationError, setValidationError] = useState<string | null>(null)

  // React Query mutation for API call
  const mutation = useMutation<ApiResponse, Error, { username: string; provider: string }>({
    mutationFn: ({ username, provider }) => searchLanguageStatistics(username, provider),
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
    mutation.mutate({ username, provider })
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

  return {
    username,
    setUsername,
    provider,
    setProvider,
    handleSearch,
    isLoading: mutation.isPending,
    error,
    data,
    validationError,
  }
}
