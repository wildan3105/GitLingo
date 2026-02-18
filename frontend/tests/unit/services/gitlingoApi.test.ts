/**
 * GitLingo API Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { searchLanguageStatistics } from '../../../src/services/gitlingoApi'
import type { SuccessResponse, ErrorResponse } from '../../../src/contracts/api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

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
          retry_after_seconds: 60,
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
        expect(result.error.retry_after_seconds).toBe(60)
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

    it('should not send provider parameter in request', async () => {
      const mockSuccessResponse: SuccessResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'testuser',
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
})
