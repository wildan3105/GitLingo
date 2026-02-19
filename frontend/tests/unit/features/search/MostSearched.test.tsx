/**
 * MostSearched Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MostSearched } from '../../../../src/features/search/components/MostSearched'
import * as gitlingoApi from '../../../../src/services/gitlingoApi'
import type { TopSearchResponse, TopSearchItem } from '../../../../src/contracts/api'

vi.mock('../../../../src/services/gitlingoApi', () => ({
  getTopSearch: vi.fn(),
  searchLanguageStatistics: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function renderMostSearched(onSearch = vi.fn()) {
  return render(<MostSearched onSearch={onSearch} />, { wrapper: createWrapper() })
}

function makeResponse(
  usernames: string[],
  overrides: Partial<TopSearchItem> = {}
): TopSearchResponse {
  return {
    ok: true,
    data: usernames.map((username, i) => ({
      username,
      provider: 'github',
      hit: 10 - i,
      avatarUrl: `https://avatars.githubusercontent.com/u/${i + 1}`,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
      ...overrides,
    })),
    pagination: { total: usernames.length, count: usernames.length, offset: 0, limit: 9 },
  }
}

describe('MostSearched', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fallback — renders nothing', () => {
    it('renders nothing when API returns empty data array', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue({
        ok: true,
        data: [],
        pagination: { total: 0, count: 0, offset: 0, limit: 9 },
      })
      const { container } = renderMostSearched()
      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })

    it('renders nothing when API call fails (returns null)', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(null)
      const { container } = renderMostSearched()
      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })
  })

  describe('chip rendering', () => {
    it('shows the inspiration caption when data is present', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['torvalds']))
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getByText(/need some inspiration/i)).toBeInTheDocument()
      })
    })

    it('renders one chip per item', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob', 'carol']))
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getByText('alice')).toBeInTheDocument()
        expect(screen.getByText('bob')).toBeInTheDocument()
        expect(screen.getByText('carol')).toBeInTheDocument()
      })
    })

    it('shows avatar image when avatarUrl is provided', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(
        makeResponse(['torvalds'], { avatarUrl: 'https://avatars.github.com/u/1024' })
      )
      renderMostSearched()
      await waitFor(() => {
        const img = document.querySelector('img[aria-hidden="true"]') as HTMLImageElement
        expect(img).not.toBeNull()
        expect(img.src).toBe('https://avatars.github.com/u/1024')
      })
    })

    it('shows first-letter initial when avatarUrl is null', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(
        makeResponse(['torvalds'], { avatarUrl: null })
      )
      renderMostSearched()
      await waitFor(() => {
        // Initial "T" displayed in the fallback span
        expect(screen.getByText('T')).toBeInTheDocument()
      })
    })

    it('chip has descriptive aria-label for keyboard navigation', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['testuser']))
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Search for testuser' })).toBeInTheDocument()
      })
    })
  })

  describe('inverted pyramid layout', () => {
    it('renders all 9 chips for a full set', async () => {
      const usernames = Array.from({ length: 9 }, (_, i) => `user${i}`)
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(usernames))
      renderMostSearched()
      await waitFor(() => {
        const chips = screen.getAllByRole('button')
        expect(chips).toHaveLength(9)
      })
    })

    it('renders a single chip with no bottom row for n=1', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['solo']))
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(1)
      })
    })

    it('requests exactly 9 items from the API', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse([]))
      renderMostSearched()
      await waitFor(() => {
        expect(gitlingoApi.getTopSearch).toHaveBeenCalledWith(9)
      })
    })
  })

  describe('interaction', () => {
    it('calls onSearch with the username when a chip is clicked', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['torvalds']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('torvalds'))

      await userEvent.click(screen.getByRole('button', { name: /search for torvalds/i }))

      expect(onSearch).toHaveBeenCalledOnce()
      expect(onSearch).toHaveBeenCalledWith('torvalds')
    })

    it('calls onSearch when Enter is pressed on a chip', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['octocat']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('octocat'))

      const chip = screen.getByRole('button', { name: /search for octocat/i })
      fireEvent.keyDown(chip, { key: 'Enter' })

      expect(onSearch).toHaveBeenCalledWith('octocat')
    })

    it('calls onSearch when Space is pressed on a chip', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['octocat']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('octocat'))

      const chip = screen.getByRole('button', { name: /search for octocat/i })
      fireEvent.keyDown(chip, { key: ' ' })

      expect(onSearch).toHaveBeenCalledWith('octocat')
    })

    it('does not call onSearch for unrelated key presses', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['octocat']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('octocat'))

      const chip = screen.getByRole('button', { name: /search for octocat/i })
      fireEvent.keyDown(chip, { key: 'Tab' })
      fireEvent.keyDown(chip, { key: 'Escape' })

      expect(onSearch).not.toHaveBeenCalled()
    })
  })
})
