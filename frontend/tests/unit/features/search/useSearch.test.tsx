/**
 * useSearch Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSearch } from '../../../../src/features/search/hooks/useSearch'
import * as gitlingoApi from '../../../../src/services/gitlingoApi'
import type { ApiResponse } from '../../../../src/contracts/api'

// Create a wrapper with QueryClient for testing hooks that use React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        gcTime: 0, // Disable caching for tests
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has empty username initially', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.username).toBe('')
    })

    it('has no validation error initially', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.validationError).toBeNull()
    })

    it('is not loading initially', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('has no data initially', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.data).toBeNull()
    })

    it('has no error initially', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('state updates', () => {
    it('updates username when setUsername is called', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setUsername('octocat')
      })

      expect(result.current.username).toBe('octocat')
    })

    it('has includeForks set to true by default', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.includeForks).toBe(true)
    })

    it('has includeUnknownLanguage set to true by default', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.includeUnknownLanguage).toBe(true)
    })

    it('updates includeForks when setIncludeForks is called', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setIncludeForks(false)
      })

      expect(result.current.includeForks).toBe(false)
    })

    it('updates includeUnknownLanguage when setIncludeUnknownLanguage is called', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setIncludeUnknownLanguage(false)
      })

      expect(result.current.includeUnknownLanguage).toBe(false)
    })

    it('resets all state when handleReset is called', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // Set some state
      act(() => {
        result.current.setUsername('testuser')
        result.current.setIncludeForks(true)
        result.current.setIncludeUnknownLanguage(true)
      })

      // Verify state was set
      expect(result.current.username).toBe('testuser')
      expect(result.current.includeForks).toBe(true)
      expect(result.current.includeUnknownLanguage).toBe(true)

      // Reset
      act(() => {
        result.current.handleReset()
      })

      // Verify state was reset to defaults (both false)
      expect(result.current.username).toBe('')
      expect(result.current.includeForks).toBe(false)
      expect(result.current.includeUnknownLanguage).toBe(false)
      expect(result.current.validationError).toBeNull()
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('validation before API call', () => {
    it('sets validation error when username is empty', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleSearch()
      })

      expect(result.current.validationError).toBe('Username is required')
    })

    it('sets validation error when username is invalid', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setUsername('invalid user')
      })

      act(() => {
        result.current.handleSearch()
      })

      expect(result.current.validationError).toBe(
        'Username can only contain alphanumeric characters and hyphens'
      )
    })

    it('does not call API when validation fails', () => {
      const searchSpy = vi.spyOn(gitlingoApi, 'searchLanguageStatistics')

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setUsername('')
        result.current.handleSearch()
      })

      expect(searchSpy).not.toHaveBeenCalled()
    })

    it.skip('clears previous validation error on new search', async () => {
      const mockSuccessResponse: ApiResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'octocat',
          name: 'The Octocat',
          avatarUrl: 'https://example.com/avatar.png',
          profileUrl: 'https://github.com/octocat',
        },
        series: [],
        metadata: {
          totalRepositories: 8,
          processedAt: '2024-01-01T00:00:00Z',
        },
      }

      vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // First invalid search
      act(() => {
        result.current.setUsername('')
        result.current.handleSearch()
      })
      expect(result.current.validationError).toBe('Username is required')

      // Second valid search should clear error
      act(() => {
        result.current.setUsername('octocat')
        result.current.handleSearch()
      })

      await waitFor(() => {
        expect(result.current.validationError).toBeNull()
      })
    })
  })

  describe('API calls', () => {
    it.skip('calls API with correct parameters when validation passes', async () => {
      const mockSuccessResponse: ApiResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'octocat',
          name: 'The Octocat',
          avatarUrl: 'https://example.com/avatar.png',
          profileUrl: 'https://github.com/octocat',
        },
        series: [],
        metadata: {
          totalRepositories: 8,
          processedAt: '2024-01-01T00:00:00Z',
        },
      }

      const searchSpy = vi
        .spyOn(gitlingoApi, 'searchLanguageStatistics')
        .mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setUsername('octocat')
        result.current.setProvider('github')
        result.current.handleSearch()
      })

      await waitFor(() => {
        expect(searchSpy).toHaveBeenCalledWith('octocat', 'github')
      })
    })

    it.skip('updates data state on successful API call', async () => {
      const mockSuccessResponse: ApiResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'octocat',
          name: 'The Octocat',
          avatarUrl: 'https://example.com/avatar.png',
          profileUrl: 'https://github.com/octocat',
        },
        series: [],
        metadata: {
          totalRepositories: 8,
          processedAt: '2024-01-01T00:00:00Z',
        },
      }

      vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setUsername('octocat')
        result.current.handleSearch()
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockSuccessResponse)
        expect(result.current.error).toBeNull()
      })
    })

    it.skip('updates error state on failed API call', async () => {
      const mockErrorResponse: ApiResponse = {
        ok: false,
        provider: 'github',
        error: {
          code: 'user_not_found',
          message: 'User not found',
        },
        meta: {
          generatedAt: '2024-01-01T00:00:00Z',
        },
      }

      vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(mockErrorResponse)

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setUsername('nonexistent')
        result.current.handleSearch()
      })

      await waitFor(() => {
        expect(result.current.error).toEqual(mockErrorResponse)
        expect(result.current.data).toBeNull()
      })
    })

    it.skip('sets isLoading to true during API call', async () => {
      const mockSuccessResponse: ApiResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'octocat',
          name: 'The Octocat',
          avatarUrl: 'https://example.com/avatar.png',
          profileUrl: 'https://github.com/octocat',
        },
        series: [],
        metadata: {
          totalRepositories: 8,
          processedAt: '2024-01-01T00:00:00Z',
        },
      }

      vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockSuccessResponse), 100)
          })
      )

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setUsername('octocat')
        result.current.handleSearch()
      })

      // Should be loading immediately after calling handleSearch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Should not be loading after API call completes
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('multiple searches', () => {
    it.skip('handles consecutive searches correctly', async () => {
      const mockResponse1: ApiResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'user1',
          name: 'User 1',
          avatarUrl: 'https://example.com/avatar1.png',
          profileUrl: 'https://github.com/user1',
        },
        series: [],
        metadata: {
          totalRepositories: 5,
          processedAt: '2024-01-01T00:00:00Z',
        },
      }

      const mockResponse2: ApiResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'user2',
          name: 'User 2',
          avatarUrl: 'https://example.com/avatar2.png',
          profileUrl: 'https://github.com/user2',
        },
        series: [],
        metadata: {
          totalRepositories: 10,
          processedAt: '2024-01-01T00:00:00Z',
        },
      }

      const searchSpy = vi
        .spyOn(gitlingoApi, 'searchLanguageStatistics')
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // First search
      act(() => {
        result.current.setUsername('user1')
        result.current.handleSearch()
      })

      await waitFor(() => {
        expect(result.current.data?.profile.username).toBe('user1')
      })

      // Second search
      act(() => {
        result.current.setUsername('user2')
        result.current.handleSearch()
      })

      await waitFor(() => {
        expect(result.current.data?.profile.username).toBe('user2')
      })

      expect(searchSpy).toHaveBeenCalledTimes(2)
    })
  })
})
