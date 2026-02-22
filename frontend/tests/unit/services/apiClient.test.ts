/**
 * apiClient Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApiClient, ApiClientError } from '../../../src/services/apiClient'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeJsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }
}

beforeEach(() => {
  mockFetch.mockClear()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('ApiClientError', () => {
  it('has name "ApiClientError"', () => {
    const err = new ApiClientError('oops')
    expect(err.name).toBe('ApiClientError')
  })

  it('stores statusCode and response', () => {
    const err = new ApiClientError('oops', 404, { detail: 'not found' })
    expect(err.statusCode).toBe(404)
    expect(err.response).toEqual({ detail: 'not found' })
  })

  it('is an instance of Error', () => {
    expect(new ApiClientError('x')).toBeInstanceOf(Error)
  })
})

describe('createApiClient — GET', () => {
  const client = createApiClient({ baseUrl: 'http://localhost:3001' })

  it('sends a GET request with Content-Type: application/json', async () => {
    mockFetch.mockResolvedValueOnce(makeJsonResponse({ ok: true }))

    await client.get('/api/v1/test')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    )
  })

  it('returns the parsed JSON body', async () => {
    mockFetch.mockResolvedValueOnce(makeJsonResponse({ value: 42 }))
    const result = await client.get<{ value: number }>('/test')
    expect(result.value).toBe(42)
  })

  it('returns the parsed body even for non-2xx responses', async () => {
    const errorBody = { ok: false, error: { code: 'not_found' } }
    mockFetch.mockResolvedValueOnce(makeJsonResponse(errorBody, 404))
    const result = await client.get('/test')
    expect(result).toEqual(errorBody)
  })
})

describe('createApiClient — POST', () => {
  const client = createApiClient({ baseUrl: 'http://localhost:3001' })

  it('sends a POST request with JSON-stringified body', async () => {
    mockFetch.mockResolvedValueOnce(makeJsonResponse({ ok: true }))

    await client.post('/api/v1/resource', { name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/resource',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    )
  })

  it('sends body as undefined when no body is provided', async () => {
    mockFetch.mockResolvedValueOnce(makeJsonResponse({ ok: true }))

    await client.post('/api/v1/resource')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: undefined })
    )
  })
})

describe('createApiClient — error handling', () => {
  const client = createApiClient({ baseUrl: 'http://localhost:3001', timeout: 100 })

  it('throws ApiClientError with "Request timed out" on AbortError', async () => {
    const abortError = new Error('The user aborted a request.')
    abortError.name = 'AbortError'
    mockFetch.mockRejectedValueOnce(abortError)

    await expect(client.get('/test')).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Request timed out',
    })
  })

  it('throws ApiClientError with "Network error" on TypeError', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(client.get('/test')).rejects.toMatchObject({
      name: 'ApiClientError',
      message: expect.stringContaining('Network error'),
    })
  })

  it('throws ApiClientError with "Failed to parse response as JSON" on JSON parse failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('bad json')
      },
      text: async () => 'not json',
    })

    await expect(client.get('/test')).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Failed to parse response as JSON',
    })
  })

  it('wraps an unknown non-Error thrown during fetch in ApiClientError', async () => {
    mockFetch.mockRejectedValueOnce('unexpected string error')

    await expect(client.get('/test')).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Unknown error occurred',
    })
  })

  it('re-throws an ApiClientError without wrapping it again', async () => {
    const original = new ApiClientError('Already wrapped', 503)
    mockFetch.mockRejectedValueOnce(original)

    await expect(client.get('/test')).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Already wrapped',
      statusCode: 503,
    })
  })
})
