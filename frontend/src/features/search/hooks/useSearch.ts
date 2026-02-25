/**
 * useSearch Hook
 * Custom hook for managing search state and API calls
 */

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { searchLanguageStatistics } from '../../../services/gitlingoApi'
import { validateUsername } from '../utils/validation'
import type { ApiResponse, SuccessResponse, ErrorResponse } from '../../../contracts/api'
import { isSuccessResponse } from '../../../contracts/api'

const DEFAULT_TITLE = 'GitLingo - Visualize GitHub Language Statistics'

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
  /** Search for a specific username directly — avoids state timing issues when triggered from chips */
  handleSearchFor: (targetUsername: string) => void
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

  // Filter state - set forks and unknown to be false
  const [includeForks, setIncludeForks] = useState(false)
  const [includeUnknownLanguage, setIncludeUnknownLanguage] = useState(false)


  const queryClient = useQueryClient()

  // React Query mutation for API call
  const mutation = useMutation<ApiResponse, Error, { username: string }>({
    mutationFn: ({ username }) => searchLanguageStatistics(username),
    onSuccess: (data) => {
      // Invalidate the top-search cache so the leaderboard reflects the new hit
      // count the next time the empty state is shown. React Query refetches in
      // the background, so there is no loading flash for the user.
      if (isSuccessResponse(data)) {
        queryClient.invalidateQueries({ queryKey: ['topSearch'] })
      }
    },
  })

  /**
   * Custom setUsername that resets error/data state when user types.
   * When the field is cleared, also resets the URL to root so the address
   * bar always matches the visible UI state.
   */
  const setUsername = (value: string) => {
    setUsernameState(value)
    // Clear previous search results and errors when user starts typing
    mutation.reset()
    setValidationError(null)
    // When the field is cleared, navigate back to root so the URL doesn't
    // linger at /github/<username> while the empty-state UI is showing.
    if (!value && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
      document.title = DEFAULT_TITLE
    }
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
   * Search for a specific username directly.
   * Sets the input value and triggers an API call in one step, bypassing the
   * async state timing issue that would occur with setUsername + handleSearch.
   */
  const handleSearchFor = (targetUsername: string) => {
    setUsernameState(targetUsername)
    setValidationError(null)
    mutation.reset()

    const validation = validateUsername(targetUsername)
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid username')
      return
    }

    mutation.mutate({ username: targetUsername })
  }

  /**
   * Resets all state to defaults
   * - Clears username
   * - Resets includeForks to false, includeUnknownLanguage to false
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
    // Reset URL and title to root/default
    window.history.pushState({}, '', '/')
    document.title = DEFAULT_TITLE
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

  // Update URL and document title when search result changes
  useEffect(() => {
    if (data && username) {
      window.history.pushState({}, '', `/github/${username}`)
      document.title = `GitLingo • github • ${username}`
    } else if (error) {
      // Reset URL when search fails so it doesn't linger at a previous result
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/')
      }
      document.title = DEFAULT_TITLE
    }
  }, [data, error, username])

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
    handleSearchFor,
    handleReset,
    isLoading: mutation.isPending,
    error,
    data,
    validationError,
  }
}
