/**
 * GitLingo API Service
 * Handles all GitLingo-specific API calls
 */

import { apiClient } from './apiClient'
import type { ApiResponse, TopSearchResponse } from '../contracts/api'

/**
 * Fetch the most-searched usernames leaderboard.
 *
 * Returns `null` only when the underlying request fails (e.g. network error,
 * timeout, or invalid/unparseable response). Non-2xx HTTP responses still
 * resolve to a parsed `TopSearchResponse` value if the body is valid.
 * This is intentional — the top-search section is non-critical UI and degrades
 * silently to an empty state. Contrast with `searchLanguageStatistics`, which
 * returns a typed `ErrorResponse` because its failures must be surfaced to the user.
 *
 * @param limit - Max entries to return (default 9)
 */
export async function getTopSearch(limit = 9): Promise<TopSearchResponse | null> {
  try {
    const params = new URLSearchParams({
      provider: 'github',
      limit: String(limit),
      offset: '0',
    })
    return await apiClient.get<TopSearchResponse>(`/api/v1/topsearch?${params.toString()}`)
  } catch {
    return null
  }
}

/**
 * Search for language statistics for a given username.
 *
 * Returns a typed `ErrorResponse` on failure so callers can display a specific
 * error message and retry button. For the silent-failure equivalent see `getTopSearch`.
 *
 * @param username - GitHub username or organization
 * @returns Promise resolving to ApiResponse (SuccessResponse or ErrorResponse)
 *
 * @example
 * ```ts
 * const result = await searchLanguageStatistics('octocat')
 * if (result.ok) {
 *   console.log(result.data) // Language statistics
 * } else {
 *   console.error(result.error) // Error details
 * }
 * ```
 */
export async function searchLanguageStatistics(username: string): Promise<ApiResponse> {
  try {
    // Build query params
    const params = new URLSearchParams()
    params.append('username', username)
    // Provider defaults to 'github' on backend

    // Make API request
    const response = await apiClient.get<ApiResponse>(`/api/v1/search?${params.toString()}`)

    return response
  } catch (error) {
    // Transform unknown errors into ErrorResponse format
    return {
      ok: false,
      provider: 'github',
      error: {
        code: 'network_error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: { error },
      },
      meta: {
        generatedAt: new Date().toISOString(),
      },
    }
  }
}
