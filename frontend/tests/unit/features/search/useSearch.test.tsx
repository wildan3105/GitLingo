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

// Variant that also exposes the QueryClient for spy assertions
function createWrapperWithClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { queryClient, wrapper }
}

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset URL to root before each test
    window.history.pushState({}, '', '/')
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

    it('has includeForks set to false by default', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.includeForks).toBe(false)
    })

    it('has includeUnknownLanguage set to false by default', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      expect(result.current.includeUnknownLanguage).toBe(false)
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
        },
        data: [],
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
        },
        data: [],
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
        },
        data: [],
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
        },
        data: [],
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
        },
        data: [],
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
        },
        data: [],
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

  describe('URL management', () => {
    it('updates URL when search succeeds', async () => {
      const mockSuccessResponse: ApiResponse = {
        ok: true,
        provider: 'github',
        profile: {
          username: 'octocat',
          name: 'The Octocat',
          avatarUrl: 'https://example.com/avatar.png',
          type: 'user',
          providerUserId: '123',
        },
        data: [],
        metadata: {
          generatedAt: '2024-01-01T00:00:00Z',
          unit: 'repos',
          limit: 100,
        },
      }

      vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.setUsername('octocat')
      })

      act(() => {
        result.current.handleSearch()
      })

      // Wait for both data and URL to update
      await waitFor(
        () => {
          expect(result.current.data).toBeTruthy()
          expect(window.location.pathname).toBe('/github/octocat')
        },
        { timeout: 2000 }
      )
    })

    it('resets URL to root when handleReset is called', () => {
      // Set URL to a user page
      window.history.pushState({}, '', '/github/testuser')
      expect(window.location.pathname).toBe('/github/testuser')

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleReset()
      })

      // URL should be reset to root
      expect(window.location.pathname).toBe('/')
    })

    it('reads username from URL on initial load', async () => {
      // Set URL before rendering hook
      window.history.pushState({}, '', '/github/urluser')

      const searchSpy = vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue({
        ok: true,
        provider: 'github',
        profile: {
          username: 'urluser',
          name: 'URL User',
          avatarUrl: 'https://example.com/avatar.png',
          type: 'user',
          providerUserId: '456',
        },
        data: [],
        metadata: {
          generatedAt: '2024-01-01T00:00:00Z',
          unit: 'repos',
          limit: 100,
        },
      })

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // Username should be populated from URL
      await waitFor(() => {
        expect(result.current.username).toBe('urluser')
      })

      // Search should be automatically triggered
      await waitFor(() => {
        expect(searchSpy).toHaveBeenCalledWith('urluser')
      })
    })

    it('does not auto-search for invalid username in URL', () => {
      // Set URL with invalid username
      window.history.pushState({}, '', '/github/invalid user')

      const searchSpy = vi.spyOn(gitlingoApi, 'searchLanguageStatistics')

      renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // Should not trigger search for invalid username
      expect(searchSpy).not.toHaveBeenCalled()
    })

    it('ignores non-github URL paths', () => {
      // Set URL to non-matching path
      window.history.pushState({}, '', '/some/other/path')

      const searchSpy = vi.spyOn(gitlingoApi, 'searchLanguageStatistics')

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // Username should remain empty
      expect(result.current.username).toBe('')

      // Should not trigger search
      expect(searchSpy).not.toHaveBeenCalled()
    })

    it('redirects to homepage for invalid URL paths', () => {
      // Set URL to non-matching path
      window.history.pushState({}, '', '/invalid/path')

      renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // Should redirect to root
      expect(window.location.pathname).toBe('/')
    })

    it('redirects to homepage for non-github provider paths', () => {
      // Set URL with different provider
      window.history.pushState({}, '', '/gitlab/testuser')

      renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // Should redirect to root
      expect(window.location.pathname).toBe('/')
    })

    it('does not redirect when already on homepage', () => {
      // Set URL to root
      window.history.pushState({}, '', '/')

      renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // Should stay on root
      expect(window.location.pathname).toBe('/')
    })
  })

  describe('handleSearchFor', () => {
    it('sets username to the provided value', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleSearchFor('torvalds')
      })

      expect(result.current.username).toBe('torvalds')
    })

    it('clears any existing validation error', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      // First trigger a validation error via handleSearch
      act(() => {
        result.current.handleSearch() // empty username → validation error
      })
      expect(result.current.validationError).not.toBeNull()

      // handleSearchFor should clear it
      act(() => {
        result.current.handleSearchFor('torvalds')
      })
      expect(result.current.validationError).toBeNull()
    })

    it('sets a validation error and does not call API for an invalid username', () => {
      const searchSpy = vi.spyOn(gitlingoApi, 'searchLanguageStatistics')

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleSearchFor('invalid username with spaces')
      })

      expect(result.current.validationError).not.toBeNull()
      expect(searchSpy).not.toHaveBeenCalled()
    })

    it('does not call API for an empty string', () => {
      const searchSpy = vi.spyOn(gitlingoApi, 'searchLanguageStatistics')

      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleSearchFor('')
      })

      expect(searchSpy).not.toHaveBeenCalled()
    })
  })

  describe('cache invalidation', () => {
    const makeSuccessResponse = (): ApiResponse => ({
      ok: true,
      provider: 'github',
      profile: {
        username: 'torvalds',
        name: null,
        type: 'user',
        providerUserId: '1024',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1024?v=4',
      },
      data: [],
      metadata: { generatedAt: '2026-02-19T00:00:00.000Z', unit: 'repos', limit: 0 },
    })

    const makeErrorResponse = (): ApiResponse => ({
      ok: false,
      provider: 'github',
      error: { code: 'user_not_found', message: 'Not found' },
      meta: { generatedAt: '2026-02-19T00:00:00.000Z' },
    })

    it('invalidates the topSearch query after a successful search', async () => {
      const { queryClient, wrapper } = createWrapperWithClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(makeSuccessResponse())

      const { result } = renderHook(() => useSearch(), { wrapper })

      act(() => {
        result.current.handleSearchFor('torvalds')
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['topSearch'] })
      })
    })

    it('does NOT invalidate topSearch cache when the search returns an error', async () => {
      const { queryClient, wrapper } = createWrapperWithClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(makeErrorResponse())

      const { result } = renderHook(() => useSearch(), { wrapper })

      act(() => {
        result.current.handleSearchFor('nobody')
      })

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['topSearch'] })
    })

    it('invalidates topSearch when search is triggered via handleSearch too', async () => {
      const { queryClient, wrapper } = createWrapperWithClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(makeSuccessResponse())

      const { result } = renderHook(() => useSearch(), { wrapper })

      act(() => {
        result.current.setUsername('torvalds')
      })
      act(() => {
        result.current.handleSearch()
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['topSearch'] })
      })
    })
  })
})
