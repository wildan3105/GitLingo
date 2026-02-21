/**
 * Base API Client for HTTP requests
 * Handles timeouts, error transformation, and logging
 */

const DEFAULT_TIMEOUT = 30000 // 30 seconds
const isDev = import.meta.env.MODE === 'development'

/**
 * API Client configuration
 */
export type ApiClientConfig = {
  baseUrl: string
  timeout?: number
}

/**
 * API Client error class
 */
export class ApiClientError extends Error {
  statusCode?: number
  response?: unknown

  constructor(message: string, statusCode?: number, response?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.response = response
  }
}

/**
 * Create an API client with configuration
 */
export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, timeout = DEFAULT_TIMEOUT } = config

  /**
   * Make a fetch request with timeout support
   */
  async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      if (isDev) {
        console.log('[API Request]', { method: options?.method || 'GET', url })
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      clearTimeout(timeoutId)

      // Try to parse JSON response
      let data: T
      try {
        data = await response.json()
      } catch {
        throw new ApiClientError(
          'Failed to parse response as JSON',
          response.status,
          await response.text()
        )
      }

      if (isDev) {
        console.log('[API Response]', { status: response.status, data })
      }

      // Return data even for non-2xx responses (backend returns structured errors)
      return data
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiClientError('Request timed out', undefined, { timeout })
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiClientError('Network error: Unable to connect to server', undefined, error)
      }

      // Re-throw ApiClientError
      if (error instanceof ApiClientError) {
        throw error
      }

      // Handle unknown errors
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        error
      )
    }
  }

  /**
   * Make a GET request
   */
  async function get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * Make a POST request
   */
  async function post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  return {
    request,
    get,
    post,
  }
}

/**
 * Default API client instance
 * Uses environment variable for base URL
 */
export const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://192.168.32.142:3001',
  timeout: DEFAULT_TIMEOUT,
})
