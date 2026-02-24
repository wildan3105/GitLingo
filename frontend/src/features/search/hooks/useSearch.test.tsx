import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSearch } from './useSearch'
import * as gitlingoApi from '../../../services/gitlingoApi'
import type { SuccessResponse, ErrorResponse } from '../../../contracts/api'

vi.mock('../../../services/gitlingoApi')

const DEFAULT_TITLE = 'GitLingo - Visualize GitHub Language Statistics'

const mockSuccessResponse: SuccessResponse = {
  ok: true,
  provider: 'github',
  profile: {
    username: 'octocat',
    name: 'The Octocat',
    avatarUrl: 'https://avatars.githubusercontent.com/octocat',
    type: 'user',
    providerUserId: '583231',
  },
  data: [{ key: 'TypeScript', label: 'TypeScript', value: 10, color: '#3178c6' }],
  metadata: { generatedAt: '2026-02-24T00:00:00Z', unit: 'repos', limit: 100 },
}

const mockErrorResponse: ErrorResponse = {
  ok: false,
  provider: 'github',
  error: { code: 'user_not_found', message: 'User not found' },
  meta: { generatedAt: '2026-02-24T00:00:00Z' },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useSearch', () => {
  beforeEach(() => {
    document.title = DEFAULT_TITLE
    window.history.pushState({}, '', '/')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('document.title', () => {
    it('sets dynamic title on successful search', async () => {
      vi.mocked(gitlingoApi.searchLanguageStatistics).mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), { wrapper: createWrapper() })

      act(() => { result.current.setUsername('octocat') })
      act(() => { result.current.handleSearch() })

      await waitFor(() => {
        expect(document.title).toBe('GitLingo • github • octocat')
      })
    })

    it('resets title to default when error occurs after a successful search', async () => {
      vi.mocked(gitlingoApi.searchLanguageStatistics)
        .mockResolvedValueOnce(mockSuccessResponse)
        .mockResolvedValueOnce(mockErrorResponse)

      const { result } = renderHook(() => useSearch(), { wrapper: createWrapper() })

      // First search — success
      act(() => { result.current.setUsername('octocat') })
      act(() => { result.current.handleSearch() })
      await waitFor(() => expect(document.title).toBe('GitLingo • github • octocat'))

      // Second search — error
      act(() => { result.current.setUsername('notexist') })
      act(() => { result.current.handleSearch() })
      await waitFor(() => expect(document.title).toBe(DEFAULT_TITLE))
    })

    it('resets title to default when handleReset is called', async () => {
      vi.mocked(gitlingoApi.searchLanguageStatistics).mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), { wrapper: createWrapper() })

      act(() => { result.current.setUsername('octocat') })
      act(() => { result.current.handleSearch() })
      await waitFor(() => expect(document.title).toBe('GitLingo • github • octocat'))

      act(() => { result.current.handleReset() })
      expect(document.title).toBe(DEFAULT_TITLE)
    })

    it('resets title to default when username field is cleared after a successful search', async () => {
      vi.mocked(gitlingoApi.searchLanguageStatistics).mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), { wrapper: createWrapper() })

      act(() => { result.current.setUsername('octocat') })
      act(() => { result.current.handleSearch() })
      await waitFor(() => expect(document.title).toBe('GitLingo • github • octocat'))

      // Simulate URL update then field clear
      window.history.pushState({}, '', '/github/octocat')
      act(() => { result.current.setUsername('') })
      expect(document.title).toBe(DEFAULT_TITLE)
    })
  })

  describe('URL management', () => {
    it('updates URL to /github/{username} on successful search', async () => {
      vi.mocked(gitlingoApi.searchLanguageStatistics).mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), { wrapper: createWrapper() })

      act(() => { result.current.setUsername('octocat') })
      act(() => { result.current.handleSearch() })

      await waitFor(() => {
        expect(window.location.pathname).toBe('/github/octocat')
      })
    })

    it('resets URL to / when error occurs after a previous successful search', async () => {
      vi.mocked(gitlingoApi.searchLanguageStatistics)
        .mockResolvedValueOnce(mockSuccessResponse)
        .mockResolvedValueOnce(mockErrorResponse)

      const { result } = renderHook(() => useSearch(), { wrapper: createWrapper() })

      // First search — success, URL becomes /github/octocat
      act(() => { result.current.setUsername('octocat') })
      act(() => { result.current.handleSearch() })
      await waitFor(() => expect(window.location.pathname).toBe('/github/octocat'))

      // Second search — error, URL must reset to /
      act(() => { result.current.setUsername('notexist') })
      act(() => { result.current.handleSearch() })
      await waitFor(() => expect(window.location.pathname).toBe('/'))
    })

    it('keeps URL at / when first search returns an error', async () => {
      vi.mocked(gitlingoApi.searchLanguageStatistics).mockResolvedValue(mockErrorResponse)

      const { result } = renderHook(() => useSearch(), { wrapper: createWrapper() })

      act(() => { result.current.setUsername('notexist') })
      act(() => { result.current.handleSearch() })

      await waitFor(() => expect(result.current.error).not.toBeNull())
      expect(window.location.pathname).toBe('/')
    })

    it('resets URL to / when handleReset is called after a successful search', async () => {
      vi.mocked(gitlingoApi.searchLanguageStatistics).mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useSearch(), { wrapper: createWrapper() })

      act(() => { result.current.setUsername('octocat') })
      act(() => { result.current.handleSearch() })
      await waitFor(() => expect(window.location.pathname).toBe('/github/octocat'))

      act(() => { result.current.handleReset() })
      expect(window.location.pathname).toBe('/')
    })
  })
})
