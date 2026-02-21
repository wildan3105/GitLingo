/**
 * SearchPage — Language Coverage KPI Card Tests
 *
 * Covers:
 * - Label rendered correctly
 * - Coverage % computed correctly from raw API data
 * - Subtitle shows unknown hint when unknownCount > 0
 * - Subtitle omits hint when unknownCount is 0
 * - 0 % edge case (all repos Unknown)
 * - Empty data edge case (no divide-by-zero, shows 100%)
 * - Coverage is stable regardless of the "include Unknown" toggle
 *   (computed from raw data, not filteredData)
 * - "Forks" label no longer present
 */

// Mock chart components to prevent canvas/Chart.js errors in JSDOM
vi.mock('../../../../src/features/charts/components/charts/BarChartView', () => ({
  BarChartView: () => <div data-testid="bar-chart" />,
}))
vi.mock('../../../../src/features/charts/components/charts/PieChartView', () => ({
  PieChartView: () => <div data-testid="pie-chart" />,
}))
vi.mock('../../../../src/features/charts/components/charts/PolarAreaChartView', () => ({
  PolarAreaChartView: () => <div data-testid="polar-chart" />,
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchPage } from '../../../../src/features/search/SearchPage'
import { ToastProvider } from '../../../../src/shared/hooks/useToast'
import * as gitlingoApi from '../../../../src/services/gitlingoApi'
import type { ApiResponse, LanguageData } from '../../../../src/contracts/api'

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

function buildResponse(data: LanguageData[]): ApiResponse {
  return {
    ok: true,
    provider: 'github',
    profile: {
      username: 'octocat',
      name: 'The Octocat',
      avatarUrl: 'https://example.com/avatar.png',
      type: 'user',
      providerUserId: '1',
    },
    data,
    metadata: { generatedAt: '2024-01-01T00:00:00Z', unit: 'repos', limit: 100 },
  }
}

/** Renders SearchPage, types a username, and submits the search form. */
async function renderAndSearch(data: LanguageData[]) {
  vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(buildResponse(data))
  // Silence the MostSearched query — not under test here
  vi.spyOn(gitlingoApi, 'getTopSearch').mockResolvedValue({
    ok: true,
    data: [],
    pagination: { total: 0, count: 0, offset: 0, limit: 9 },
  })

  const user = userEvent.setup()
  render(<SearchPage />, { wrapper: createWrapper() })

  await user.type(screen.getByLabelText('Username'), 'octocat')
  await user.click(screen.getByRole('button', { name: /search/i }))

  // Wait until at least one KPI card label is visible
  await waitFor(() => {
    expect(screen.getByText('Language Coverage')).toBeInTheDocument()
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SearchPage — Reset button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
    vi.spyOn(gitlingoApi, 'getTopSearch').mockResolvedValue({
      ok: true,
      data: [],
      pagination: { total: 0, count: 0, offset: 0, limit: 9 },
    })
  })

  function renderPage() {
    render(<SearchPage />, { wrapper: createWrapper() })
  }

  it('renders a Reset button alongside the Search button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /^reset$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument()
  })

  it('Reset and Search buttons are siblings inside the same container', () => {
    renderPage()
    const search = screen.getByRole('button', { name: /^search$/i })
    const reset = screen.getByRole('button', { name: /^reset$/i })
    expect(search.parentElement).toBe(reset.parentElement)
  })

  it('clears the username field when Reset is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const input = screen.getByLabelText('Username') as HTMLInputElement
    await user.type(input, 'octocat')
    expect(input.value).toBe('octocat')

    await user.click(screen.getByRole('button', { name: /^reset$/i }))
    expect(input.value).toBe('')
  })

  it('clears search results when Reset is clicked after a successful search', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildResponse([{ key: 'TypeScript', label: 'TypeScript', value: 10, color: '#3178c6' }])
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /^search$/i }))
    await waitFor(() => expect(screen.getByText('Language Coverage')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^reset$/i }))
    await waitFor(() => expect(screen.queryByText('Language Coverage')).not.toBeInTheDocument())
  })

  it('Reset button is not disabled on initial render', () => {
    renderPage()
    const reset = screen.getByRole('button', { name: /^reset$/i })
    expect(reset).not.toBeDisabled()
  })
})

describe('SearchPage — keyboard interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
    vi.spyOn(gitlingoApi, 'getTopSearch').mockResolvedValue({
      ok: true,
      data: [],
      pagination: { total: 0, count: 0, offset: 0, limit: 9 },
    })
  })

  function renderPage() {
    render(<SearchPage />, { wrapper: createWrapper() })
  }

  it('fires search when Enter is pressed on the focused Search button', async () => {
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(
      buildResponse([{ key: 'TypeScript', label: 'TypeScript', value: 10, color: '#3178c6' }])
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Username'), 'octocat')

    // Tab once from the input → focus lands on Search button
    await user.tab()
    expect(screen.getByRole('button', { name: /^search$/i })).toHaveFocus()

    await user.keyboard('{Enter}')

    await waitFor(() => expect(gitlingoApi.searchLanguageStatistics).toHaveBeenCalled())
  })

  it('clears the username field when Enter is pressed on the focused Reset button', async () => {
    const user = userEvent.setup()
    renderPage()

    const input = screen.getByLabelText('Username') as HTMLInputElement
    await user.type(input, 'octocat')
    expect(input.value).toBe('octocat')

    // Tab twice from the input → Search button → Reset button
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: /^reset$/i })).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(input.value).toBe('')
  })
})

describe('SearchPage — Language Coverage KPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('renders the "Language Coverage" label', async () => {
    await renderAndSearch([{ key: 'TypeScript', label: 'TypeScript', value: 10, color: '#3178c6' }])
    expect(screen.getByText('Language Coverage')).toBeInTheDocument()
  })

  it('does not render a "Forks" label', async () => {
    await renderAndSearch([{ key: 'TypeScript', label: 'TypeScript', value: 10, color: '#3178c6' }])
    expect(screen.queryByText('Forks')).not.toBeInTheDocument()
  })

  it('shows 100% when there are no Unknown repos', async () => {
    await renderAndSearch([
      { key: 'TypeScript', label: 'TypeScript', value: 8, color: '#3178c6' },
      { key: 'JavaScript', label: 'JavaScript', value: 2, color: '#f1e05a' },
    ])
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('shows "repos have detected language" subtitle (no hint) when there are no unknowns', async () => {
    await renderAndSearch([{ key: 'TypeScript', label: 'TypeScript', value: 5, color: '#3178c6' }])
    expect(screen.getByText('repos have detected language')).toBeInTheDocument()
  })

  it('shows 80% when 2 of 10 repos are Unknown', async () => {
    await renderAndSearch([
      { key: 'TypeScript', label: 'TypeScript', value: 8, color: '#3178c6' },
      { key: 'Unknown', label: 'Unknown', value: 2, color: '#aaaaaa' },
    ])
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('includes the unknown count in the subtitle when there are Unknown repos', async () => {
    await renderAndSearch([
      { key: 'TypeScript', label: 'TypeScript', value: 8, color: '#3178c6' },
      { key: 'Unknown', label: 'Unknown', value: 2, color: '#aaaaaa' },
    ])
    expect(screen.getByText('repos have detected language (2 unknown)')).toBeInTheDocument()
  })

  it('shows 0% when all repos are Unknown', async () => {
    await renderAndSearch([{ key: 'Unknown', label: 'Unknown', value: 5, color: '#aaaaaa' }])
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows 100% when data is empty (no divide-by-zero)', async () => {
    await renderAndSearch([])
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('rounds coverage to the nearest integer', async () => {
    // 7 classified out of 9 total → 77.77…% → rounds to 78%
    await renderAndSearch([
      { key: 'TypeScript', label: 'TypeScript', value: 7, color: '#3178c6' },
      { key: 'Unknown', label: 'Unknown', value: 2, color: '#aaaaaa' },
    ])
    expect(screen.getByText('78%')).toBeInTheDocument()
  })

  it('includes forks in the coverage denominator (honest total)', async () => {
    // 8 classified + 2 Unknown + 5 forks = 15 total; 2 unknown
    // coverage = (15 - 2) / 15 = 86.6…% → 87%
    await renderAndSearch([
      { key: 'TypeScript', label: 'TypeScript', value: 8, color: '#3178c6' },
      { key: 'Unknown', label: 'Unknown', value: 2, color: '#aaaaaa' },
      { key: '__forks__', label: 'Forks', value: 5, color: '#cccccc' },
    ])
    expect(screen.getByText('87%')).toBeInTheDocument()
  })

  it('coverage is stable regardless of the "include Unknown" toggle state', async () => {
    // The toggle only affects filteredData (the chart); coverage reads raw data.
    // With 8 classified + 2 Unknown, coverage is always 80% no matter the toggle.
    const data: LanguageData[] = [
      { key: 'TypeScript', label: 'TypeScript', value: 8, color: '#3178c6' },
      { key: 'Unknown', label: 'Unknown', value: 2, color: '#aaaaaa' },
    ]
    vi.spyOn(gitlingoApi, 'searchLanguageStatistics').mockResolvedValue(buildResponse(data))
    vi.spyOn(gitlingoApi, 'getTopSearch').mockResolvedValue({
      ok: true,
      data: [],
      pagination: { total: 0, count: 0, offset: 0, limit: 9 },
    })

    const user = userEvent.setup()
    render(<SearchPage />, { wrapper: createWrapper() })

    await user.type(screen.getByLabelText('Username'), 'octocat')
    await user.click(screen.getByRole('button', { name: /search/i }))

    await waitFor(() => expect(screen.getByText('Language Coverage')).toBeInTheDocument())

    // Coverage shows 80% with Unknown repos included in the chart (default toggle = true)
    expect(screen.getByText('80%')).toBeInTheDocument()

    // Open the "Advanced" filter dropdown to access the checkbox
    await user.click(screen.getByRole('button', { name: /advanced/i }))

    // Toggle Unknown repos OFF — chart changes but coverage must remain 80%
    const unknownToggle = screen.getByRole('checkbox', { name: /include unknown/i })
    await user.click(unknownToggle)

    // Coverage must not change to 100%
    expect(screen.getByText('80%')).toBeInTheDocument()
  })
})
