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

    it('renders repository count', () => {
      renderWithProviders(
        <ResultHeader profile={baseProfile} totalRepos={42} metadata={metadata} />
      )

      expect(screen.getByText('42 repositories')).toBeInTheDocument()
    })

    it('uses singular form for single repository', () => {
      renderWithProviders(<ResultHeader profile={baseProfile} totalRepos={1} metadata={metadata} />)

      expect(screen.getByText('1 repository')).toBeInTheDocument()
    })
  })
})
