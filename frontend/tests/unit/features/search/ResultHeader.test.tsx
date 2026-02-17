/**
 * ResultHeader Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

      const githubLink = screen.getByRole('link', { name: /open github/i })
      expect(githubLink).toHaveAttribute('href', 'https://ghe.rakuten-it.com/testuser')
    })

    it('defaults to github.com when providerBaseUrl is not provided', () => {
      const profile: Profile = {
        ...baseProfile,
      }

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={5} metadata={metadata} />)

      const githubLink = screen.getByRole('link', { name: /open github/i })
      expect(githubLink).toHaveAttribute('href', 'https://ghe.example.com/gheuser')
    })

    it('handles GHE URLs without trailing slash', () => {
      const profile: Profile = {
        ...baseProfile,
        username: 'gheuser',
        providerBaseUrl: 'https://ghe.example.com',
      }

      renderWithProviders(<ResultHeader profile={profile} totalRepos={5} metadata={metadata} />)

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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={50} metadata={metadata} />)

      const githubLink = screen.getByRole('link', { name: /open github/i })
      expect(githubLink).toHaveAttribute('href', 'https://ghe.company.com/myorg')
    })
  })

  describe('Profile display', () => {
    it('renders username correctly', () => {
      renderWithProviders(
        <ResultHeader profile={baseProfile} totalRepos={10} metadata={metadata} />
      )

      expect(screen.getByText('@testuser')).toBeInTheDocument()
    })

    it('does not render repository count in profile card', () => {
      renderWithProviders(
        <ResultHeader profile={baseProfile} totalRepos={42} metadata={metadata} />
      )

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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

      expect(screen.getByText('1,250 Followers')).toBeInTheDocument()
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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

      expect(screen.getByText('250 Members')).toBeInTheDocument()
    })

    it('does not display followers/following for organizations', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'organization',
        statistics: {
          members: 250,
          followers: 100, // Should be ignored for orgs
          following: 50, // Should be ignored for orgs
        },
      }

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

      // Should render without errors
      expect(screen.getByText('@testuser')).toBeInTheDocument()
      expect(screen.queryByText(/Followers/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Following/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Members/i)).not.toBeInTheDocument()
    })

    it('handles empty statistics object', () => {
      const profile: Profile = {
        ...baseProfile,
        statistics: {},
      }

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

      expect(screen.getByText('@testuser')).toBeInTheDocument()
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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

      // Zero values should still display
      expect(screen.getByText('0 Followers')).toBeInTheDocument()
      expect(screen.getByText('0 Following')).toBeInTheDocument()
    })

    it('formats large numbers with commas', () => {
      const profile: Profile = {
        ...baseProfile,
        type: 'user',
        statistics: {
          followers: 1234567,
          following: 9876,
        },
      }

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

      expect(screen.getByText('1,234,567 Followers')).toBeInTheDocument()
      expect(screen.getByText('9,876 Following')).toBeInTheDocument()
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

      renderWithProviders(<ResultHeader profile={profile} totalRepos={10} metadata={metadata} />)

      expect(screen.getByText('100 Followers')).toBeInTheDocument()
      expect(screen.queryByText(/Following/i)).not.toBeInTheDocument()
    })
  })
})
