/**
 * GitLingo API Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { searchLanguageStatistics, getTopSearch } from '../../../src/services/gitlingoApi'
import {
  isErrorResponse,
  isSuccessResponse,
} from '../../../src/contracts/api'
import type { SuccessResponse, ErrorResponse, TopSearchResponse } from '../../../src/contracts/api'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('gitlingoApi', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('searchLanguageStatistics', () => {
    it('should return SuccessResponse for valid user', async () => {
      const mockSuccessResponse: SuccessResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'octocat',
          name: 'The Octocat',
          avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
          type: 'user',
          providerUserId: '1',
        },
        data: [
          { key: 'JavaScript', label: 'JavaScript', value: 100, color: '#f1e05a' },
          { key: 'Python', label: 'Python', value: 10, color: '#3572A5' },
        ],
        metadata: {
          generatedAt: '2026-02-14T02:10:00.000Z',
          unit: 'repos',
          limit: 2,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      })

      const result = await searchLanguageStatistics('octocat')

      expect(result.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/search?username=octocat'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )

      if (result.ok) {
        expect(result.profile.username).toBe('octocat')
        expect(result.data).toHaveLength(2)
        expect(result.provider).toBe('github')
      }
    })

    it('should return ErrorResponse with user_not_found for 404', async () => {
      const mockErrorResponse: ErrorResponse = {
        ok: false,
        provider: 'github',
        error: {
          code: 'user_not_found',
          message: 'The specified user was not found.',
          details: { username: 'nonexistent' },
        },
        meta: {
          generatedAt: '2026-02-14T02:10:00.000Z',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse,
      })

      const result = await searchLanguageStatistics('nonexistent')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('user_not_found')
        expect(result.error.message).toContain('not found')
      }
    })

    it('should return ErrorResponse with rate_limited for 429', async () => {
      const mockErrorResponse: ErrorResponse = {
        ok: false,
        provider: 'github',
        error: {
          code: 'rate_limited',
          message: 'API rate limit exceeded',
          retryAfterSeconds: 60,
        },
        meta: {
          generatedAt: '2026-02-14T02:10:00.000Z',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => mockErrorResponse,
      })

      const result = await searchLanguageStatistics('testuser')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('rate_limited')
        expect(result.error.retryAfterSeconds).toBe(60)
      }
    })

    it('should return ErrorResponse with server_error for 500', async () => {
      const mockErrorResponse: ErrorResponse = {
        ok: false,
        provider: 'github',
        error: {
          code: 'server_error',
          message: 'Internal server error',
        },
        meta: {
          generatedAt: '2026-02-14T02:10:00.000Z',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockErrorResponse,
      })

      const result = await searchLanguageStatistics('testuser')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('server_error')
      }
    })

    it('should return ErrorResponse with network_error for network failure', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const result = await searchLanguageStatistics('testuser')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('network_error')
        expect(result.error.message).toContain('Unable to connect')
      }
    })

    it('should handle timeout errors', async () => {
      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(abortError)

      const result = await searchLanguageStatistics('testuser')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('network_error')
        expect(result.error.message).toContain('timed out')
      }
    })

    it('should encode query parameters correctly', async () => {
      const mockSuccessResponse: SuccessResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'test-user',
          name: null,
          avatarUrl: 'https://avatars.githubusercontent.com/u/123?v=4',
          type: 'user',
          providerUserId: '123',
        },
        data: [],
        metadata: {
          generatedAt: '2026-02-14T02:10:00.000Z',
          unit: 'repos',
          limit: 0,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      })

      await searchLanguageStatistics('test-user')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('username=test-user'),
        expect.any(Object)
      )
      // Provider is not sent as query param - backend defaults to github
      expect(mockFetch).toHaveBeenCalledWith(
        expect.not.stringContaining('provider='),
        expect.any(Object)
      )
    })

    it('returns ErrorResponse with network_error when server returns non-JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON')
        },
        text: async () => '<html><body>502 Bad Gateway</body></html>',
      })

      const result = await searchLanguageStatistics('testuser')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('network_error')
        expect(result.error.message).toBe('Failed to parse response as JSON')
      }
    })

    it('returns ErrorResponse with network_error when response body is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => {
          throw new SyntaxError('Unexpected end of JSON input')
        },
        text: async () => '',
      })

      const result = await searchLanguageStatistics('testuser')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('network_error')
        expect(result.error.message).toBe('Failed to parse response as JSON')
      }
    })

    it('should not send provider parameter in request', async () => {
      const mockSuccessResponse: SuccessResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'testuser',
          name: null,
          avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          type: 'user',
          providerUserId: '1',
        },
        data: [],
        metadata: {
          generatedAt: '2026-02-14T02:10:00.000Z',
          unit: 'repos',
          limit: 0,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      })

      await searchLanguageStatistics('testuser')

      // Verify URL only contains username, not provider
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/search?username=testuser'),
        expect.any(Object)
      )
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('provider='),
        expect.any(Object)
      )
    })
  })

  describe('getTopSearch', () => {
    const mockTopSearchResponse: TopSearchResponse = {
      ok: true,
      data: [
        {
          username: 'torvalds',
          provider: 'github',
          hit: 42,
          avatarUrl: 'https://avatars.githubusercontent.com/u/1024?v=4',
          createdAt: '2026-02-01T10:00:00.000Z',
          updatedAt: '2026-02-19T01:16:28.000Z',
        },
      ],
      pagination: { total: 1, count: 1, offset: 0, limit: 9 },
    }

    it('returns TopSearchResponse on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTopSearchResponse,
      })

      const result = await getTopSearch(9)

      expect(result).not.toBeNull()
      expect(result?.ok).toBe(true)
      expect(result?.data).toHaveLength(1)
      expect(result?.data[0].username).toBe('torvalds')
    })

    it('calls the correct endpoint with provider=github, limit, and offset=0', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTopSearchResponse,
      })

      await getTopSearch(9)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/topsearch'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('provider=github'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=9'), expect.any(Object))
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=0'),
        expect.any(Object)
      )
    })

    it('uses the provided limit parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ...mockTopSearchResponse, data: [] }),
      })

      await getTopSearch(5)

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=5'), expect.any(Object))
    })

    it('returns null when fetch throws a network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const result = await getTopSearch(9)

      expect(result).toBeNull()
    })

    it('returns null when request times out (AbortError)', async () => {
      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(abortError)

      const result = await getTopSearch(9)

      expect(result).toBeNull()
    })

    it('returns null when response body is not valid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON')
        },
        text: async () => '<html>Gateway error</html>',
      })

      const result = await getTopSearch(9)

      expect(result).toBeNull()
    })

    it('returns empty data array when API reports empty results', async () => {
      const emptyResponse: TopSearchResponse = {
        ok: true,
        data: [],
        pagination: { total: 0, count: 0, offset: 0, limit: 9 },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => emptyResponse,
      })

      const result = await getTopSearch(9)

      expect(result).not.toBeNull()
      expect(result?.data).toEqual([])
    })
  })
})

describe('type guards', () => {
  const errorResponse: ErrorResponse = {
    ok: false,
    provider: 'github',
    error: { code: 'user_not_found', message: 'not found' },
    meta: { generatedAt: '2026-01-01T00:00:00Z' },
  }

  const successResponse: SuccessResponse = {
    ok: true,
    provider: 'github',
    profile: {
      username: 'u',
      name: null,
      avatarUrl: 'https://example.com/avatar.png',
      type: 'user',
      providerUserId: '1',
    },
    data: [],
    metadata: { generatedAt: '2026-01-01T00:00:00Z', unit: 'repos', limit: 0 },
  }

  it('isErrorResponse returns true for error responses and false for success', () => {
    expect(isErrorResponse(errorResponse)).toBe(true)
    expect(isErrorResponse(successResponse)).toBe(false)
  })

  it('isSuccessResponse returns true for success and false for error responses', () => {
    expect(isSuccessResponse(successResponse)).toBe(true)
    expect(isSuccessResponse(errorResponse)).toBe(false)
  })
})
