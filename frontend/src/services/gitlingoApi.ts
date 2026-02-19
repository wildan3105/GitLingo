/**
 * GitLingo API Service
 * Handles all GitLingo-specific API calls
 */

import { apiClient } from './apiClient'
import type { ApiResponse, TopSearchResponse } from '../contracts/api'

/**
 * Search for language statistics for a given username
 *
 * @param username - GitHub username or organization
 * @param provider - Provider name (default: 'github')
 * @returns Promise resolving to ApiResponse (success or error)
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
/**
 * Fetch the most-searched usernames leaderboard
 *
 * Always resolves — returns null on network failure (component falls back to empty state).
 * The API itself always returns HTTP 200, so null only occurs on a fetch-level error.
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
