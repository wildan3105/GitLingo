/**
 * ResultHeader Component Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultHeader } from '../../../../src/features/search/components/ResultHeader'
import { ToastProvider } from '../../../../src/shared/hooks/useToast'
import type { Profile, Metadata } from '../../../../src/contracts/api'

describe('ResultHeader', () => {
  const baseProfile: Profile = {
    username: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://avatars.githubusercontent.com/u/123',
    type: 'user',
    providerUserId: '123',
  }

  const metadata: Metadata = {
    generatedAt: '2024-01-01T00:00:00Z',
    unit: 'repos',
    limit: 100,
  }

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>)
  }

  beforeEach(() => {
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {},
      },
      writable: true,
      configurable: true,
    })
  })

  describe('Profile URL construction', () => {
    it('uses providerBaseUrl to construct profile URL when available', () => {
      const profile: Profile = {
        ...baseProfile,
        providerBaseUrl: 'https://ghe.rakuten-it.com',
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      const githubLink = screen.getByRole('link', { name: /open github/i })
      expect(githubLink).toHaveAttribute('href', 'https://ghe.rakuten-it.com/testuser')
    })

    it('defaults to github.com when providerBaseUrl is not provided', () => {
      const profile: Profile = {
        ...baseProfile,
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      const githubLink = screen.getByRole('link', { name: /open github/i })
      expect(githubLink).toHaveAttribute('href', 'https://github.com/testuser')
    })
  })

  describe('GitHub Enterprise (GHE) support', () => {
    it('correctly constructs GHE profile URL', () => {
      const profile: Profile = {
        ...baseProfile,
        username: 'gheuser',
        providerBaseUrl: 'https://ghe.example.com',
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      const githubLink = screen.getByRole('link', { name: /open github/i })
      expect(githubLink).toHaveAttribute('href', 'https://ghe.example.com/gheuser')
    })

    it('handles GHE URLs without trailing slash', () => {
      const profile: Profile = {
        ...baseProfile,
        username: 'gheuser',
        providerBaseUrl: 'https://ghe.example.com',
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      const githubLink = screen.getByRole('link', { name: /open github/i })
      expect(githubLink).toHaveAttribute('href', 'https://ghe.example.com/gheuser')
    })

    it('works with organization profiles on GHE', () => {
      const profile: Profile = {
        ...baseProfile,
        username: 'myorg',
        type: 'organization',
        providerBaseUrl: 'https://ghe.company.com',
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      const githubLink = screen.getByRole('link', { name: /open github/i })
      expect(githubLink).toHaveAttribute('href', 'https://ghe.company.com/myorg')
    })
  })

  describe('Profile display', () => {
    it('renders username correctly', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)

      expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('does not render repository count in profile card', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)

      // Repository count should NOT be in the profile card (it's in KPI cards instead)
      expect(screen.queryByText(/42 repositories/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/repository/i)).not.toBeInTheDocument()
    })
  })

  describe('User statistics', () => {
    it('displays followers count for users', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'user',
        statistics: {
          followers: 150,
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('150 Followers')).toBeInTheDocument()
    })

    it('displays following count for users', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'user',
        statistics: {
          following: 75,
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('75 Following')).toBeInTheDocument()
    })

    it('displays both followers and following for users', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'user',
        statistics: {
          followers: 1250,
          following: 340,
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('1.3K Followers')).toBeInTheDocument()
      expect(screen.getByText('340 Following')).toBeInTheDocument()
    })

    it('does not display members count for users', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'user',
        statistics: {
          followers: 100,
          members: 50, // Should be ignored for users
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('100 Followers')).toBeInTheDocument()
      expect(screen.queryByText(/Members/i)).not.toBeInTheDocument()
    })
  })

  describe('Organization statistics', () => {
    it('displays members count for organizations', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'organization',
        statistics: {
          members: 250,
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('250 Members')).toBeInTheDocument()
    })

    it('does not display followers/following for organizations', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'organization',
        statistics: {
          members: 250,
          followers: 100,
          following: 50,
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('250 Members')).toBeInTheDocument()
      expect(screen.queryByText(/Followers/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Following/i)).not.toBeInTheDocument()
    })
  })

  describe('Statistics edge cases', () => {
    it('handles missing statistics object gracefully', () => {
      const profile: Profile = {
        ...baseProfile,
        // No statistics field
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      // Should render without errors
      expect(screen.getByText('testuser')).toBeInTheDocument()
      expect(screen.queryByText(/Followers/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Following/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Members/i)).not.toBeInTheDocument()
    })

    it('handles empty statistics object', () => {
      const profile: Profile = {
        ...baseProfile,
        statistics: {},
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('testuser')).toBeInTheDocument()
      expect(screen.queryByText(/Followers/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Following/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Members/i)).not.toBeInTheDocument()
    })

    it('handles zero values correctly', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'user',
        statistics: {
          followers: 0,
          following: 0,
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      // Zero values should still display (sub-1000 → plain number)
      expect(screen.getByText('0 Followers')).toBeInTheDocument()
      expect(screen.getByText('0 Following')).toBeInTheDocument()
    })

    it('formats large numbers with compact notation', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'user',
        statistics: {
          followers: 1234567,
          following: 9876,
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('1.2M Followers')).toBeInTheDocument()
      expect(screen.getByText('9.9K Following')).toBeInTheDocument()
    })

    it('handles partial statistics for users', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'user',
        statistics: {
          followers: 100,
          // following is missing
        },
      }

      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)

      expect(screen.getByText('100 Followers')).toBeInTheDocument()
      expect(screen.queryByText(/Following/i)).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Compact number formatting
  // ---------------------------------------------------------------------------

  describe('compact number formatting', () => {
    const mkUser = (followers: number, following?: number): Profile => ({
      ...baseProfile,
      type: 'user',
      statistics: { followers, ...(following !== undefined ? { following } : {}) },
    })
    const mkOrg = (members: number): Profile => ({
      ...baseProfile,
      type: 'organization',
      statistics: { members },
    })

    // Boundaries
    it('shows plain number for values below 1 000', () => {
      renderWithProviders(<ResultHeader profile={mkUser(999)} metadata={metadata} />)
      expect(screen.getByText('999 Followers')).toBeInTheDocument()
    })

    it('shows 1K for exactly 1 000', () => {
      renderWithProviders(<ResultHeader profile={mkUser(1000)} metadata={metadata} />)
      expect(screen.getByText('1K Followers')).toBeInTheDocument()
    })

    it('shows 1.5K for 1 500', () => {
      renderWithProviders(<ResultHeader profile={mkUser(1500)} metadata={metadata} />)
      expect(screen.getByText('1.5K Followers')).toBeInTheDocument()
    })

    it('shows 21.9K for 21 869', () => {
      renderWithProviders(<ResultHeader profile={mkUser(21869)} metadata={metadata} />)
      expect(screen.getByText('21.9K Followers')).toBeInTheDocument()
    })

    it('shows 10K for 10 000 (no trailing .0)', () => {
      renderWithProviders(<ResultHeader profile={mkUser(10000)} metadata={metadata} />)
      expect(screen.getByText('10K Followers')).toBeInTheDocument()
    })

    it('shows 1M for 1 000 000', () => {
      renderWithProviders(<ResultHeader profile={mkUser(1_000_000)} metadata={metadata} />)
      expect(screen.getByText('1M Followers')).toBeInTheDocument()
    })

    it('shows 1.2M for 1 200 000', () => {
      renderWithProviders(<ResultHeader profile={mkUser(1_200_000)} metadata={metadata} />)
      expect(screen.getByText('1.2M Followers')).toBeInTheDocument()
    })

    it('shows 1B for 1 000 000 000', () => {
      renderWithProviders(<ResultHeader profile={mkUser(1_000_000_000)} metadata={metadata} />)
      expect(screen.getByText('1B Followers')).toBeInTheDocument()
    })

    it('shows 2.5B for 2 500 000 000', () => {
      renderWithProviders(<ResultHeader profile={mkUser(2_500_000_000)} metadata={metadata} />)
      expect(screen.getByText('2.5B Followers')).toBeInTheDocument()
    })

    it('applies compact format to following', () => {
      renderWithProviders(<ResultHeader profile={mkUser(0, 5000)} metadata={metadata} />)
      expect(screen.getByText('5K Following')).toBeInTheDocument()
    })

    it('applies compact format to members (org)', () => {
      renderWithProviders(<ResultHeader profile={mkOrg(250_000)} metadata={metadata} />)
      expect(screen.getByText('250K Members')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // No-wrap and truncation guarantees
  // ---------------------------------------------------------------------------

  describe('no-wrap and truncation', () => {
    it('followers span has whitespace-nowrap', () => {
      renderWithProviders(
        <ResultHeader
          profile={{ ...baseProfile, type: 'user', statistics: { followers: 21869 } }}
          metadata={metadata}
        />
      )
      expect(screen.getByText('21.9K Followers').className).toContain('whitespace-nowrap')
    })

    it('following span has whitespace-nowrap', () => {
      renderWithProviders(
        <ResultHeader
          profile={{ ...baseProfile, type: 'user', statistics: { following: 9 } }}
          metadata={metadata}
        />
      )
      expect(screen.getByText('9 Following').className).toContain('whitespace-nowrap')
    })

    it('members span has whitespace-nowrap', () => {
      renderWithProviders(
        <ResultHeader
          profile={{ ...baseProfile, type: 'organization', statistics: { members: 250 } }}
          metadata={metadata}
        />
      )
      expect(screen.getByText('250 Members').className).toContain('whitespace-nowrap')
    })

    it('"Joined since" span has whitespace-nowrap', () => {
      renderWithProviders(
        <ResultHeader
          profile={{ ...baseProfile, createdAt: '2011-04-10T00:00:00Z' }}
          metadata={metadata}
        />
      )
      expect(screen.getByText('Joined since 2011').className).toContain('whitespace-nowrap')
    })

    it('location span has truncate class', () => {
      renderWithProviders(
        <ResultHeader
          profile={{ ...baseProfile, location: 'San Francisco, California, USA' }}
          metadata={metadata}
        />
      )
      // The location span may be hidden on narrow viewports but it must carry truncate
      const locationEl = screen.getByText('San Francisco, California, USA')
      expect(locationEl.className).toContain('truncate')
    })

    it('location span has a max-width to bound the truncation', () => {
      renderWithProviders(
        <ResultHeader
          profile={{ ...baseProfile, location: 'San Francisco, California, USA' }}
          metadata={metadata}
        />
      )
      const locationEl = screen.getByText('San Francisco, California, USA')
      expect(locationEl.className).toMatch(/max-w-/)
    })
  })

  // ---------------------------------------------------------------------------
  // Two-group layout: left wraps freely, right stays pinned
  // ---------------------------------------------------------------------------

  describe('metadata two-group layout', () => {
    it('metadata-left does not use flex-wrap (single-row enforced by overflow-hidden)', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)
      expect(screen.getByTestId('metadata-left').className).not.toContain('flex-wrap')
    })

    it('metadata-left has overflow-hidden to clip any overflow and enforce single row', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)
      expect(screen.getByTestId('metadata-left').className).toContain('overflow-hidden')
    })

    it('metadata-right does not use flex-wrap so it never wraps', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)
      expect(screen.getByTestId('metadata-right').className).not.toContain('flex-wrap')
    })

    it('metadata-right has flex-shrink-0 so it stays pinned to the right', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)
      expect(screen.getByTestId('metadata-right').className).toContain('flex-shrink-0')
    })

    it('both metadata containers are direct children of the same row', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)
      const left = screen.getByTestId('metadata-left')
      const right = screen.getByTestId('metadata-right')
      expect(left.parentElement).toBe(right.parentElement)
    })

    it('location is rendered inside metadata-left, not metadata-right', () => {
      const profile: Profile = { ...baseProfile, location: 'Tokyo, Japan' }
      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)
      const left = screen.getByTestId('metadata-left')
      expect(left).toHaveTextContent('Tokyo, Japan')
      expect(screen.getByTestId('metadata-right')).not.toHaveTextContent('Tokyo, Japan')
    })

    it('website is rendered inside metadata-left, not metadata-right', () => {
      const profile: Profile = { ...baseProfile, websiteUrl: 'https://example.com' }
      renderWithProviders(<ResultHeader profile={profile} metadata={metadata} />)
      const left = screen.getByTestId('metadata-left')
      expect(left.querySelector('a[href="https://example.com"]')).not.toBeNull()
      expect(
        screen.getByTestId('metadata-right').querySelector('a[href="https://example.com"]')
      ).toBeNull()
    })

    it('"Updated X ago" is rendered inside metadata-right', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)
      expect(screen.getByTestId('metadata-right')).toHaveTextContent(/Updated/)
    })

    it('cache chip is a direct child of metadata-right (not in a nested wrapping container)', () => {
      const NOW = new Date('2026-02-21T10:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(NOW)
      const cachedUntil = new Date(NOW.getTime() + 60 * 60_000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      const chip = screen.getByTestId('cache-freshness-chip')
      expect(chip.parentElement).toBe(screen.getByTestId('metadata-right'))
      vi.useRealTimers()
    })
  })

  // ---------------------------------------------------------------------------
  // Cache freshness chip
  // ---------------------------------------------------------------------------

  describe('cache freshness chip', () => {
    // Fix "now" to a known point so time calculations are deterministic
    const NOW = new Date('2026-02-21T10:00:00.000Z')

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(NOW)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not render the chip when cachedUntil is absent', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={metadata} />)
      expect(screen.queryByTestId('cache-freshness-chip')).not.toBeInTheDocument()
    })

    it('does not render the chip when metadata has no cache fields at all', () => {
      const m: Metadata = { generatedAt: NOW.toISOString(), unit: 'repos', limit: 100 }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.queryByTestId('cache-freshness-chip')).not.toBeInTheDocument()
    })

    it('shows "in Xh Ym" chip text when cachedUntil is hours+minutes away', () => {
      // 11h 46m from now
      const cachedUntil = new Date(NOW.getTime() + 11 * 60 * 60_000 + 46 * 60_000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.getByTestId('cache-freshness-chip')).toBeInTheDocument()
      expect(screen.getByText('in 11h 46m')).toBeInTheDocument()
    })

    it('chip title tooltip reads "Refreshes in Xh Ym"', () => {
      const cachedUntil = new Date(NOW.getTime() + 11 * 60 * 60_000 + 46 * 60_000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.getByTestId('cache-freshness-chip')).toHaveAttribute(
        'title',
        'Refreshes in 11h 46m'
      )
    })

    it('shows "in Xh" chip text when cachedUntil is an exact number of hours away', () => {
      const cachedUntil = new Date(NOW.getTime() + 3 * 60 * 60_000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.getByText('in 3h')).toBeInTheDocument()
    })

    it('shows "in Xm" chip text when cachedUntil is minutes away', () => {
      const cachedUntil = new Date(NOW.getTime() + 45 * 60_000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.getByText('in 45m')).toBeInTheDocument()
    })

    it('shows "in < 1m" chip text when cachedUntil is less than a minute away', () => {
      const cachedUntil = new Date(NOW.getTime() + 30_000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.getByText('in < 1m')).toBeInTheDocument()
    })

    it('shows "Stale" when cachedUntil is in the past', () => {
      const cachedUntil = new Date(NOW.getTime() - 60_000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.getByTestId('cache-freshness-chip')).toBeInTheDocument()
      expect(screen.getByText('Stale')).toBeInTheDocument()
    })

    it('shows "Stale" when cachedUntil equals now (boundary)', () => {
      const cachedUntil = NOW.toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.getByText('Stale')).toBeInTheDocument()
    })

    it('does not show "in X" chip text when stale', () => {
      const cachedUntil = new Date(NOW.getTime() - 1000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.queryByText(/^in /)).not.toBeInTheDocument()
    })

    it('does not show "Stale" text when still fresh', () => {
      const cachedUntil = new Date(NOW.getTime() + 60 * 60_000).toISOString()
      const m: Metadata = { ...metadata, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.queryByText('Stale')).not.toBeInTheDocument()
    })

    it('"Updated X ago" still renders alongside the chip', () => {
      const cachedUntil = new Date(NOW.getTime() + 60 * 60_000).toISOString()
      const generatedAt = new Date(NOW.getTime() - 14 * 60_000).toISOString()
      const m: Metadata = { ...metadata, generatedAt, cachedUntil }
      renderWithProviders(<ResultHeader profile={baseProfile} metadata={m} />)
      expect(screen.getByText('Updated 14m ago')).toBeInTheDocument()
      expect(screen.getByTestId('cache-freshness-chip')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Boundary layout — maximum field values must not overflow the single row.
  //
  // GitHub limits: username ≤ 39 chars, location ≤ 255 chars, website ≤ 255 chars.
  // followers/following are already compact-formatted (e.g. "999.9K").
  // We cannot measure pixels in JSDOM, so we assert the CSS contract that
  // *guarantees* single-row behaviour:
  //   • metadata-left: overflow-hidden + no flex-wrap (clips any overflow)
  //   • metadata-right: flex-shrink-0 + no flex-wrap (stays pinned)
  //   • Every variable-length text field: truncate + max-w-* + inline-block
  //   • Every number+label pair: whitespace-nowrap (no mid-text line break)
  // ---------------------------------------------------------------------------

  describe('boundary layout — maximum field values', () => {
    // GitHub maximums
    const MAX_USERNAME = 'a'.repeat(39)
    // 255-char location string (no GitHub hard cap documented, 255 is a safe DB-tier upper bound)
    const MAX_LOCATION = 'San Francisco, California, United States of America '
      .repeat(5)
      .slice(0, 255)
    // 255-char website URL
    const MAX_WEBSITE_URL = 'https://' + 'x'.repeat(247)

    const maxProfile: Profile = {
      username: MAX_USERNAME,
      name: 'Boundary Test User With A Very Long Display Name',
      avatarUrl: 'https://example.com/avatar.png',
      type: 'user',
      providerUserId: '999999999',
      createdAt: '2008-04-10T00:00:00Z',
      location: MAX_LOCATION,
      websiteUrl: MAX_WEBSITE_URL,
      statistics: {
        // Produces "999.9K" — largest compact representation before 1M
        followers: 999_900,
        following: 999_900,
      },
    }

    const maxMetadata: Metadata = {
      generatedAt: new Date('2026-02-21T10:00:00.000Z').toISOString(),
      unit: 'repos',
      limit: 100,
      // Cache chip present: "in 11h 46m"
      cachedUntil: new Date('2026-02-21T21:46:00.000Z').toISOString(),
    }

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-21T10:00:00.000Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('renders without error with all fields at maximum length', () => {
      expect(() =>
        renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      ).not.toThrow()
    })

    // ── Container-level single-row guarantees ──────────────────────────────

    it('metadata-left has overflow-hidden (clips overflow → single row)', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      expect(screen.getByTestId('metadata-left').className).toContain('overflow-hidden')
    })

    it('metadata-left does not have flex-wrap (items cannot spill to a second row)', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      expect(screen.getByTestId('metadata-left').className).not.toContain('flex-wrap')
    })

    it('metadata-right has flex-shrink-0 (stays pinned, never collapses)', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      expect(screen.getByTestId('metadata-right').className).toContain('flex-shrink-0')
    })

    it('metadata-right does not have flex-wrap', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      expect(screen.getByTestId('metadata-right').className).not.toContain('flex-wrap')
    })

    // ── Per-field truncation guarantees ────────────────────────────────────

    it('location span is inline-block so max-w truncation actually applies', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      const locationSpan = screen.getByTitle(MAX_LOCATION).querySelector('span')!
      // inline-block (not plain inline) is required for overflow:hidden to respect max-width
      expect(locationSpan.className).toMatch(/inline-block/)
    })

    it('location span has truncate class', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      const locationSpan = screen.getByTitle(MAX_LOCATION).querySelector('span')!
      expect(locationSpan.className).toContain('truncate')
    })

    it('location span has a max-w constraint', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      const locationSpan = screen.getByTitle(MAX_LOCATION).querySelector('span')!
      expect(locationSpan.className).toMatch(/max-w-/)
    })

    it('website span is inline-block so max-w truncation actually applies', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      const websiteLink = screen.getByTitle(MAX_WEBSITE_URL)
      const websiteSpan = websiteLink.querySelector('span')!
      // Must be inline-block — plain inline ignores max-width + overflow:hidden
      expect(websiteSpan.className).toMatch(/inline-block/)
    })

    it('website span has truncate class', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      const websiteLink = screen.getByTitle(MAX_WEBSITE_URL)
      const websiteSpan = websiteLink.querySelector('span')!
      expect(websiteSpan.className).toContain('truncate')
    })

    it('website span has a max-w constraint', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      const websiteLink = screen.getByTitle(MAX_WEBSITE_URL)
      const websiteSpan = websiteLink.querySelector('span')!
      expect(websiteSpan.className).toMatch(/max-w-/)
    })

    // ── Number-label pairs must not break across lines ─────────────────────

    it('max followers ("999.9K Followers") span has whitespace-nowrap', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      expect(screen.getByText('999.9K Followers').className).toContain('whitespace-nowrap')
    })

    it('max following ("999.9K Following") span has whitespace-nowrap', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      expect(screen.getByText('999.9K Following').className).toContain('whitespace-nowrap')
    })

    it('"Joined since YYYY" span has whitespace-nowrap', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      expect(screen.getByText('Joined since 2008').className).toContain('whitespace-nowrap')
    })

    // ── Right-group content is present ─────────────────────────────────────

    it('"Updated X ago" and cache chip both appear in metadata-right', () => {
      renderWithProviders(<ResultHeader profile={maxProfile} metadata={maxMetadata} />)
      const right = screen.getByTestId('metadata-right')
      expect(right).toHaveTextContent(/Updated/)
      expect(right).toContainElement(screen.getByTestId('cache-freshness-chip'))
    })
  })
})
