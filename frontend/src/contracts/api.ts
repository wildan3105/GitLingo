/**
 * API Contracts for GitLingo Frontend
 * These types mirror the backend API response/request shapes exactly
 */

/**
 * Search query parameters
 */
export type SearchQuery = {
  username: string
  provider?: string
}

/**
 * Profile information returned from the API
 */
export type Profile = {
  username: string
  name: string | null
  avatarUrl: string
  profileUrl: string
  type: 'user' | 'organization'
  providerUserId: string
  location?: string | null
  websiteUrl?: string | null
  isVerified?: boolean
}

/**
 * Language series data point for charts
 */
export type LanguageSeries = {
  key: string
  label: string
  value: number
  color: string
}

/**
 * Metadata about the response
 */
export type Metadata = {
  generatedAt: string
  unit: 'repos'
  limit: number
}

/**
 * Error detail information
 */
export type ErrorDetail = {
  code:
    | 'user_not_found'
    | 'rate_limited'
    | 'network_error'
    | 'server_error'
    | 'validation_error'
    | 'timeout'
    | 'generic'
  message: string
  details?: Record<string, unknown>
  retry_after_seconds?: number
}

/**
 * Metadata for error responses
 */
export type Meta = {
  generatedAt: string
}

/**
 * Successful API response
 */
export type SuccessResponse = {
  ok: true
  provider: string
  profile: Profile
  series: LanguageSeries[]
  metadata: Metadata
}

/**
 * Error API response
 */
export type ErrorResponse = {
  ok: false
  provider: string
  error: ErrorDetail
  meta: Meta
}

/**
 * Discriminated union of all possible API responses
 * Use the 'ok' field to narrow the type
 */
export type ApiResponse = SuccessResponse | ErrorResponse

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse(response: ApiResponse): response is SuccessResponse {
  return response.ok === true
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return response.ok === false
}
