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

  describe('loading skeleton', () => {
    it('renders skeleton chips while the query is in-flight', () => {
      vi.mocked(gitlingoApi.getTopSearch).mockReturnValue(new Promise(() => {}))
      const { container } = renderMostSearched()

      // No interactive chip buttons yet
      expect(screen.queryAllByRole('button')).toHaveLength(0)
      // Skeleton placeholders are present
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('renders CHIP_LIMIT (9) chip skeletons plus one caption skeleton', () => {
      vi.mocked(gitlingoApi.getTopSearch).mockReturnValue(new Promise(() => {}))
      const { container } = renderMostSearched()

      // 9 chip skeletons + 1 caption skeleton = 10 total animate-pulse elements
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(10)
    })

    it('arranges chip skeletons in pyramid: 5 top row, 4 bottom row', () => {
      vi.mocked(gitlingoApi.getTopSearch).mockReturnValue(new Promise(() => {}))
      const { container } = renderMostSearched()

      const rows = container.querySelectorAll('.flex.flex-wrap.justify-center')
      expect(rows).toHaveLength(2)
      expect(rows[0].querySelectorAll('.animate-pulse')).toHaveLength(5)
      expect(rows[1].querySelectorAll('.animate-pulse')).toHaveLength(4)
    })

    it('replaces skeleton with real chips once data loads', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob', 'carol']))
      const { container } = renderMostSearched()

      // Skeleton is present on first render
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

      // After data arrives skeleton is gone and real chips are shown
      await waitFor(() => screen.getByText('@alice'))
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(0)
      expect(screen.getAllByRole('button')).toHaveLength(3)
    })

    it('renders nothing (no skeleton) once the query resolves to empty data', async () => {
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
    it('shows the section caption when data is present', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['torvalds']))
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getByText(/most searched github users on gitlingo/i)).toBeInTheDocument()
      })
    })

    it('renders one chip per item with @ prefix', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob', 'carol']))
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getByText('@alice')).toBeInTheDocument()
        expect(screen.getByText('@bob')).toBeInTheDocument()
        expect(screen.getByText('@carol')).toBeInTheDocument()
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

    it('shows hit count in tooltip (singular: "1 hit")', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue({
        ok: true,
        data: [
          {
            username: 'torvalds',
            provider: 'github',
            hit: 1,
            avatarUrl: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-02-01T00:00:00.000Z',
          },
        ],
        pagination: { total: 1, count: 1, offset: 0, limit: 9 },
      })
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('1 hit')
      })
    })

    it('shows hit count in tooltip (plural: "n hits")', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue({
        ok: true,
        data: [
          {
            username: 'torvalds',
            provider: 'github',
            hit: 42,
            avatarUrl: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-02-01T00:00:00.000Z',
          },
        ],
        pagination: { total: 1, count: 1, offset: 0, limit: 9 },
      })
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('42 hits')
      })
    })

    it('renders one tooltip per chip', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob', 'carol']))
      renderMostSearched()
      await waitFor(() => {
        expect(screen.getAllByRole('tooltip')).toHaveLength(3)
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
      await waitFor(() => screen.getByText('@torvalds'))

      await userEvent.click(screen.getByRole('button', { name: /search for torvalds/i }))

      expect(onSearch).toHaveBeenCalledOnce()
      expect(onSearch).toHaveBeenCalledWith('torvalds')
    })

    it('calls onSearch when Enter is pressed on a chip', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['octocat']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('@octocat'))

      const chip = screen.getByRole('button', { name: /search for octocat/i })
      fireEvent.keyDown(chip, { key: 'Enter' })

      expect(onSearch).toHaveBeenCalledWith('octocat')
    })

    it('calls onSearch when Space is pressed on a chip', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['octocat']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('@octocat'))

      const chip = screen.getByRole('button', { name: /search for octocat/i })
      fireEvent.keyDown(chip, { key: ' ' })

      expect(onSearch).toHaveBeenCalledWith('octocat')
    })

    it('does not call onSearch for unrelated key presses', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['octocat']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('@octocat'))

      const chip = screen.getByRole('button', { name: /search for octocat/i })
      fireEvent.keyDown(chip, { key: 'Tab' })
      fireEvent.keyDown(chip, { key: 'Escape' })

      expect(onSearch).not.toHaveBeenCalled()
    })
  })

  describe('arrow key navigation', () => {
    it('ArrowRight moves focus from first chip to second chip', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob', 'carol']))
      renderMostSearched()
      await waitFor(() => screen.getByText('@alice'))

      const buttons = screen.getAllByRole('button')
      buttons[0].focus()
      fireEvent.keyDown(buttons[0], { key: 'ArrowRight' })

      expect(document.activeElement).toBe(buttons[1])
    })

    it('ArrowLeft moves focus from second chip to first chip', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob', 'carol']))
      renderMostSearched()
      await waitFor(() => screen.getByText('@alice'))

      const buttons = screen.getAllByRole('button')
      buttons[1].focus()
      fireEvent.keyDown(buttons[1], { key: 'ArrowLeft' })

      expect(document.activeElement).toBe(buttons[0])
    })

    it('ArrowRight wraps from last chip to first chip', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob', 'carol']))
      renderMostSearched()
      await waitFor(() => screen.getByText('@alice'))

      const buttons = screen.getAllByRole('button')
      const lastIndex = buttons.length - 1
      buttons[lastIndex].focus()
      fireEvent.keyDown(buttons[lastIndex], { key: 'ArrowRight' })

      expect(document.activeElement).toBe(buttons[0])
    })

    it('ArrowLeft wraps from first chip to last chip', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob', 'carol']))
      renderMostSearched()
      await waitFor(() => screen.getByText('@alice'))

      const buttons = screen.getAllByRole('button')
      buttons[0].focus()
      fireEvent.keyDown(buttons[0], { key: 'ArrowLeft' })

      expect(document.activeElement).toBe(buttons[buttons.length - 1])
    })

    it('ArrowRight does not call onSearch', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('@alice'))

      const buttons = screen.getAllByRole('button')
      buttons[0].focus()
      fireEvent.keyDown(buttons[0], { key: 'ArrowRight' })

      expect(onSearch).not.toHaveBeenCalled()
    })

    it('ArrowLeft does not call onSearch', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('@alice'))

      const buttons = screen.getAllByRole('button')
      buttons[1].focus()
      fireEvent.keyDown(buttons[1], { key: 'ArrowLeft' })

      expect(onSearch).not.toHaveBeenCalled()
    })

    it('ArrowRight works across pyramid rows (top-row last → bottom-row first)', async () => {
      // 5 items: topRow=[0,1,2], bottomRow=[3,4]; DOM order matches allItems order
      const usernames = ['a', 'b', 'c', 'd', 'e']
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(usernames))
      renderMostSearched()
      await waitFor(() => screen.getByText('@a'))

      const buttons = screen.getAllByRole('button')
      // button[2] is last of top row ('c'), button[3] is first of bottom row ('d')
      buttons[2].focus()
      fireEvent.keyDown(buttons[2], { key: 'ArrowRight' })

      expect(document.activeElement).toBe(buttons[3])
    })

    it('Enter still triggers search after arrow-key focus move', async () => {
      const onSearch = vi.fn()
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob']))
      renderMostSearched(onSearch)
      await waitFor(() => screen.getByText('@alice'))

      const buttons = screen.getAllByRole('button')
      buttons[0].focus()
      fireEvent.keyDown(buttons[0], { key: 'ArrowRight' })
      // Now focus is on buttons[1] ('bob')
      fireEvent.keyDown(buttons[1], { key: 'Enter' })

      expect(onSearch).toHaveBeenCalledOnce()
      expect(onSearch).toHaveBeenCalledWith('bob')
    })
  })

  describe('rank opacity gradient', () => {
    it('first chip has opacity 1 (highest rank)', async () => {
      const usernames = Array.from({ length: 9 }, (_, i) => `user${i}`)
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(usernames))
      renderMostSearched()
      await waitFor(() => screen.getByText('@user0'))

      const firstWrapper = screen.getAllByRole('button')[0].parentElement as HTMLElement
      expect(parseFloat(firstWrapper.style.opacity)).toBe(1)
    })

    it('last chip has lower opacity than first chip', async () => {
      const usernames = Array.from({ length: 9 }, (_, i) => `user${i}`)
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(usernames))
      renderMostSearched()
      await waitFor(() => screen.getByText('@user0'))

      const buttons = screen.getAllByRole('button')
      const firstOpacity = parseFloat((buttons[0].parentElement as HTMLElement).style.opacity)
      const lastOpacity = parseFloat(
        (buttons[buttons.length - 1].parentElement as HTMLElement).style.opacity
      )
      expect(firstOpacity).toBeGreaterThan(lastOpacity)
    })

    it('opacities strictly decrease from first to last', async () => {
      const usernames = Array.from({ length: 9 }, (_, i) => `user${i}`)
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(usernames))
      renderMostSearched()
      await waitFor(() => screen.getByText('@user0'))

      const opacities = screen
        .getAllByRole('button')
        .map((btn) => parseFloat((btn.parentElement as HTMLElement).style.opacity))

      for (let i = 1; i < opacities.length; i++) {
        expect(opacities[i]).toBeLessThan(opacities[i - 1])
      }
    })

    it('single chip has opacity 1 (no ranking contrast needed)', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['solo']))
      renderMostSearched()
      await waitFor(() => screen.getByText('@solo'))

      const wrapper = screen.getByRole('button').parentElement as HTMLElement
      expect(parseFloat(wrapper.style.opacity)).toBe(1)
    })
  })

  describe('tooltip positioning', () => {
    it('tooltip has z-10 so it stacks above neighboring chips', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob']))
      const { container } = renderMostSearched()
      await waitFor(() => screen.getByText('@alice'))

      const tooltips = container.querySelectorAll('[role="tooltip"]')
      tooltips.forEach((tooltip) => {
        expect(tooltip.className).toContain('z-10')
      })
    })

    it('tooltip is pointer-events-none so it never blocks chip clicks', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice', 'bob']))
      const { container } = renderMostSearched()
      await waitFor(() => screen.getByText('@alice'))

      const tooltips = container.querySelectorAll('[role="tooltip"]')
      tooltips.forEach((tooltip) => {
        expect(tooltip.className).toContain('pointer-events-none')
      })
    })

    it('tooltip is consistently placed above the chip (negative top offset)', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice']))
      const { container } = renderMostSearched()
      await waitFor(() => screen.getByText('@alice'))

      const tooltip = container.querySelector('[role="tooltip"]') as HTMLElement
      // -top-8 class means 2rem above the chip — confirms consistent upward placement
      expect(tooltip.className).toContain('-top-8')
    })

    it('tooltip is horizontally centered on its chip', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(makeResponse(['alice']))
      const { container } = renderMostSearched()
      await waitFor(() => screen.getByText('@alice'))

      const tooltip = container.querySelector('[role="tooltip"]') as HTMLElement
      expect(tooltip.className).toContain('left-1/2')
      expect(tooltip.className).toContain('-translate-x-1/2')
    })
  })

  describe('avatar border ring', () => {
    it('avatar image has a ring border', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(
        makeResponse(['torvalds'], { avatarUrl: 'https://avatars.github.com/u/1' })
      )
      renderMostSearched()
      await waitFor(() => screen.getByText('@torvalds'))

      const img = document.querySelector('img[aria-hidden="true"]') as HTMLImageElement
      expect(img.className).toContain('ring-2')
    })

    it('fallback initial span has a ring border', async () => {
      vi.mocked(gitlingoApi.getTopSearch).mockResolvedValue(
        makeResponse(['torvalds'], { avatarUrl: null })
      )
      renderMostSearched()
      await waitFor(() => screen.getByText('T'))

      const initial = screen.getByText('T')
      expect(initial.className).toContain('ring-2')
    })
  })
})
