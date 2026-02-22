/**
 * Search — Integration Tests
 *
 * Tests end-to-end user flows at the page level:
 * - Success flow: typing a username → loading → results rendered
 * - Reset flow: clearing results back to the empty state
 * - Error flows: each API error code renders the correct customised message
 *
 * API calls are mocked at the service layer (vi.spyOn on gitlingoApi).
 * Chart canvas components are stubbed to avoid JSDOM canvas errors.
 */

// Stub canvas-based chart components before any imports
vi.mock('../../src/features/charts/components/charts/BarChartView', () => ({
  BarChartView: () => <div data-testid="bar-chart" />,
}))
vi.mock('../../src/features/charts/components/charts/PieChartView', () => ({
  PieChartView: () => <div data-testid="pie-chart" />,
}))
vi.mock('../../src/features/charts/components/charts/PolarAreaChartView', () => ({
  PolarAreaChartView: () => <div data-testid="polar-chart" />,
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchPage } from '../../src/features/search/SearchPage'
import { ToastProvider } from '../../src/shared/hooks/useToast'
import * as gitlingoApi from '../../src/services/gitlingoApi'
import type { ApiResponse } from '../../src/contracts/api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    )
  }
}

const SUCCESS_RESPONSE: ApiResponse = {
  ok: true,
  provider: 'github',
  profile: {
    username: 'octocat',
    name: 'The Octocat',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    type: 'user',
    providerUserId: '583231',
  },
  data: [
    { key: 'TypeScript', label: 'TypeScript', value: 20, color: '#3178c6' },
    { key: 'JavaScript', label: 'JavaScript', value: 10, color: '#f1e05a' },
  ],
  metadata: { generatedAt: '2026-01-01T00:00:00Z', unit: 'repos', limit: 100 },
}

function buildErrorResponse(
  code: string,
  message = 'An error occurred',
  extra?: Partial<{ retryAfterSeconds: number }>
): ApiResponse {
  return {
    ok: false,
    provider: 'github',
    error: { code: code as never, message, ...extra },
    meta: { generatedAt: '2026-01-01T00:00:00Z' },
  }
}

function renderPage() {
  render(<SearchPage />, { wrapper: createWrapper() })
}

// Silence the MostSearched top-search query — not under test here
function mockTopSearch() {
  vi.spyOn(gitlingoApi, 'getTopSearch').mockResolvedValue({
    ok: true,
    data: [],
    pagination: { total: 0, count: 0, offset: 0, limit: 9 },
  })
}

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  window.history.pushState({}, '', '/')
  mockTopSearch()
})

// ---------------------------------------------------------------------------
// Success flow
// ---------------------------------------------------------------------------

describe('search flow — success', () => {
  it('shows the initial empty state before any search', () => {
    renderPage()

    expect(screen.getByText('Search a GitHub Username')).toBeInTheDocument()
  })

  it('shows loading skeletons while the search is in-flight', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => expect(screen.getAllByRole('status').length).toBeGreaterThan(0))
  })

  it('renders the profile name after a successful search', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => expect(screen.getByText('The Octocat')).toBeInTheDocument())
  })

  it('renders all four KPI cards after a successful search', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => expect(screen.getByText('Repositories')).toBeInTheDocument())
    expect(screen.getByText('Top Language')).toBeInTheDocument()
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Language Coverage')).toBeInTheDocument()
  })

  it('renders the chart panel after a successful search', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument())
  })

  it('hides the empty state once results are shown', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => expect(screen.getByText('The Octocat')).toBeInTheDocument())
    expect(screen.queryByText('Search a GitHub Username')).not.toBeInTheDocument()
  })

  it('calls the API with the typed username', async () => {
    const spy = vi
      .spyOn(gitlingoApi, 'searchLanguageStatistics')
      .mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => expect(spy).toHaveBeenCalledWith('octocat'))
  })
})

// ---------------------------------------------------------------------------
// Reset flow
// ---------------------------------------------------------------------------

describe('reset flow', () => {
  /** Renders the page, performs a successful search, and returns the user handle. */
  async function searchAndWait() {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))
    await waitFor(() => expect(screen.getByText('The Octocat')).toBeInTheDocument())

    return user
  }

  it('returns to the empty state after clicking Reset', async () => {
    const user = await searchAndWait()

    await user.click(screen.getByRole('button', { name: /^reset$/i }))

    await waitFor(() => expect(screen.getByText('Search a GitHub Username')).toBeInTheDocument())
    expect(screen.queryByText('The Octocat')).not.toBeInTheDocument()
  })

  it('clears the username input after clicking Reset', async () => {
    const user = await searchAndWait()

    await user.click(screen.getByRole('button', { name: /^reset$/i }))

    expect((screen.getByLabelText('Username') as HTMLInputElement).value).toBe('')
  })

  it('removes KPI cards after clicking Reset', async () => {
    const user = await searchAndWait()

    await user.click(screen.getByRole('button', { name: /^reset$/i }))

    await waitFor(() => expect(screen.queryByText('Language Coverage')).not.toBeInTheDocument())
  })

  it('removes the chart panel after clicking Reset', async () => {
    const user = await searchAndWait()

    await user.click(screen.getByRole('button', { name: /^reset$/i }))

    await waitFor(() => expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument())
  })

  it('returns to the empty state when the header logo button is clicked', async () => {
    const user = await searchAndWait()

    await user.click(screen.getByRole('button', { name: /reset to home/i }))

    await waitFor(() => expect(screen.getByText('Search a GitHub Username')).toBeInTheDocument())
    expect(screen.queryByText('The Octocat')).not.toBeInTheDocument()
  })

  it('clears the error state when Reset is clicked after an error', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('user_not_found')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'baduser')
    await user.click(screen.getByRole('button', { name: /^search$/i }))
    await waitFor(() =>
      expect(screen.queryByText('Search a GitHub Username')).not.toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /^reset$/i }))

    await waitFor(() => expect(screen.getByText('Search a GitHub Username')).toBeInTheDocument())
  })
})

// ---------------------------------------------------------------------------
// Error flows
// ---------------------------------------------------------------------------

describe('error flow — user_not_found', () => {
  it('shows a customised message that includes the searched username', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('user_not_found')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'unknownuser')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(
        screen.getByText(
          /We couldn't find a GitHub user or organization with the username "unknownuser"/
        )
      ).toBeInTheDocument()
    )
  })

  it('does not show the empty state when an error is displayed', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('user_not_found')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'unknownuser')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(screen.queryByText('Search a GitHub Username')).not.toBeInTheDocument()
    )
  })

  it('renders a Retry Now button', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('user_not_found')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'unknownuser')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /retry now/i })).toBeInTheDocument()
    )
  })
})

describe('error flow — rate_limited', () => {
  it('shows the rate limit message', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('rate_limited')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(
        screen.getByText("Uh oh. GitHub's API rate limit has been reached.")
      ).toBeInTheDocument()
    )
  })
})

describe('error flow — network_error', () => {
  it('shows the network connection message', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('network_error')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(
        screen.getByText(
          'Unable to connect to the server. Please check your internet connection and try again.'
        )
      ).toBeInTheDocument()
    )
  })
})

describe('error flow — server_error', () => {
  it('shows the server error message', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('server_error')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(
        screen.getByText(
          'The server encountered an error while processing your request. Please try again in a moment.'
        )
      ).toBeInTheDocument()
    )
  })
})

// ---------------------------------------------------------------------------
// Cache freshness chip
// ---------------------------------------------------------------------------

describe('cache freshness chip', () => {
  it('renders the cache freshness chip when cachedUntil is in the future', async () => {
    const cachedUntil = new Date(Date.now() + 2 * 60 * 60_000).toISOString() // 2 hours from now
    const responseWithCache: ApiResponse = {
      ...SUCCESS_RESPONSE,
      metadata: { ...SUCCESS_RESPONSE.metadata, cachedUntil },
    }
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(responseWithCache)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => expect(screen.getByTestId('cache-freshness-chip')).toBeInTheDocument())
  })

  it('does not render the cache freshness chip when cachedUntil is absent', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => expect(screen.getByText('The Octocat')).toBeInTheDocument())
    expect(screen.queryByTestId('cache-freshness-chip')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Chart type switching
// ---------------------------------------------------------------------------

describe('chart type switching', () => {
  async function searchAndWait() {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))
    await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument())
    return user
  }

  it('renders the bar chart by default after a successful search', async () => {
    await searchAndWait()

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    expect(screen.queryByTestId('polar-chart')).not.toBeInTheDocument()
  })

  it('switches to pie chart when Pie Chart is selected from Custom Charts', async () => {
    const user = await searchAndWait()

    await user.click(screen.getByRole('tab', { name: /custom charts/i }))
    await user.click(screen.getByRole('option', { name: /pie chart/i }))

    await waitFor(() => expect(screen.getByTestId('pie-chart')).toBeInTheDocument())
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('switches to polar area chart when Polar Area is selected from Custom Charts', async () => {
    const user = await searchAndWait()

    await user.click(screen.getByRole('tab', { name: /custom charts/i }))
    await user.click(screen.getByRole('option', { name: /polar area/i }))

    await waitFor(() => expect(screen.getByTestId('polar-chart')).toBeInTheDocument())
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('switches back to bar chart from a custom chart type', async () => {
    const user = await searchAndWait()

    await user.click(screen.getByRole('tab', { name: /custom charts/i }))
    await user.click(screen.getByRole('option', { name: /pie chart/i }))
    await waitFor(() => expect(screen.getByTestId('pie-chart')).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: /bar/i }))

    await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument())
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
  })

  it('does not trigger an API refetch when switching chart types', async () => {
    const spy = vi
      .spyOn(gitlingoApi, 'searchLanguageStatistics')
      .mockResolvedValue(SUCCESS_RESPONSE)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))
    await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument())
    const callsAfterSearch = spy.mock.calls.length

    await user.click(screen.getByRole('tab', { name: /custom charts/i }))
    await user.click(screen.getByRole('option', { name: /pie chart/i }))
    await waitFor(() => expect(screen.getByTestId('pie-chart')).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: /bar/i }))
    await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument())

    expect(spy.mock.calls.length).toBe(callsAfterSearch)
  })
})

describe('error flow — timeout', () => {
  it('shows the timeout message', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('timeout')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(
        screen.getByText(
          'The request took too long to complete. This can happen with large accounts. Please try again.'
        )
      ).toBeInTheDocument()
    )
  })
})

describe('error flow — invalid_token', () => {
  it('shows the invalid token message', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('invalid_token')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(
        screen.getByText(
          'The configured token is invalid or has expired. Please check your token and try again.'
        )
      ).toBeInTheDocument()
    )
  })
})

describe('error flow — insufficient_scopes', () => {
  it('shows the insufficient scopes message', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildErrorResponse('insufficient_scopes')
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() =>
      expect(
        screen.getByText(
          'The configured token does not have sufficient permissions to fetch this profile. Please update your token scopes and try again.'
        )
      ).toBeInTheDocument()
    )
  })
})

describe('error flow — retry', () => {
  it('re-triggers the search when Retry Now is clicked', async () => {
    const spy = vi
      .spyOn(gitlingoApi, 'searchLanguageStatistics')
      .mockResolvedValue(buildErrorResponse('server_error'))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /retry now/i })).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /retry now/i }))

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2))
  })
})
