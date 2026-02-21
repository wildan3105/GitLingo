/**
 * ChartPanel Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { ChartPanel } from '../../../../src/features/charts/components/ChartPanel'
import { ToastProvider } from '../../../../src/shared/hooks/useToast'
import type { LanguageData } from '../../../../src/contracts/api'

// Mock the chart components to avoid canvas rendering in tests
vi.mock('../../../../src/features/charts/components/charts/BarChartView', () => ({
  BarChartView: () => <div data-testid="bar-chart">Bar Chart</div>,
}))

vi.mock('../../../../src/features/charts/components/charts/PieChartView', () => ({
  PieChartView: () => <div data-testid="pie-chart">Pie Chart</div>,
}))

vi.mock('../../../../src/features/charts/components/charts/PolarAreaChartView', () => ({
  PolarAreaChartView: () => <div data-testid="polar-chart">Polar Chart</div>,
}))

describe('ChartPanel', () => {
  const mockData: LanguageData[] = [
    { key: 'JavaScript', label: 'JavaScript', value: 25, color: '#f1e05a' },
    { key: 'TypeScript', label: 'TypeScript', value: 15, color: '#3178c6' },
    { key: 'Python', label: 'Python', value: 10, color: '#3572A5' },
  ]

  const defaultProps = {
    data: mockData,
    username: 'testuser',
    isLoading: false,
    includeForks: true,
    setIncludeForks: vi.fn(),
    includeUnknownLanguage: true,
    setIncludeUnknownLanguage: vi.fn(),
    hasOriginalData: true,
  }

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    })
  })

  describe('Share dropdown', () => {
    it('renders Share button with share icon', () => {
      renderWithProviders(<ChartPanel {...defaultProps} />)

      const shareButton = screen.getByText('Share')
      expect(shareButton).toBeInTheDocument()
    })

    it('opens dropdown when Share button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ChartPanel {...defaultProps} />)

      const shareButton = screen.getByText('Share')
      await user.click(shareButton)

      // Should show Copy URL option
      expect(screen.getByText('Copy URL')).toBeInTheDocument()
      expect(screen.getByText('Download PNG')).toBeInTheDocument()
      expect(screen.getByText('Download CSV')).toBeInTheDocument()
    })

    it('has Copy URL as first option in dropdown', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ChartPanel {...defaultProps} />)

      const shareButton = screen.getByText('Share')
      await user.click(shareButton)

      // Verify all three options are present
      expect(screen.getByText('Copy URL')).toBeInTheDocument()
      expect(screen.getByText('Download PNG')).toBeInTheDocument()
      expect(screen.getByText('Download CSV')).toBeInTheDocument()

      // Copy URL should appear first in the document order
      const copyUrlElement = screen.getByText('Copy URL')
      const downloadPngElement = screen.getByText('Download PNG')

      // Get parent buttons
      const copyUrlButton = copyUrlElement.closest('button')
      const downloadPngButton = downloadPngElement.closest('button')

      // In DOM order, Copy URL should come before Download PNG
      expect(copyUrlButton?.compareDocumentPosition(downloadPngButton!)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })
  })

  describe('Copy URL functionality', () => {
    it('copies current URL to clipboard when Copy URL is clicked', async () => {
      const user = userEvent.setup()
      const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')

      // Set a specific URL for testing
      window.history.pushState({}, '', '/github/testuser')

      renderWithProviders(<ChartPanel {...defaultProps} />)

      // Open dropdown
      const shareButton = screen.getByText('Share')
      await user.click(shareButton)

      // Click Copy URL
      const copyUrlButton = screen.getByText('Copy URL')
      await user.click(copyUrlButton)

      // Verify clipboard API was called with correct URL
      await waitFor(() => {
        expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('/github/testuser'))
      })
    })

    it('shows success toast when URL is copied successfully', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ChartPanel {...defaultProps} />)

      // Open dropdown
      const shareButton = screen.getByText('Share')
      await user.click(shareButton)

      // Click Copy URL
      const copyUrlButton = screen.getByText('Copy URL')
      await user.click(copyUrlButton)

      // Check for success toast message
      await waitFor(() => {
        expect(screen.getByText('URL copied to clipboard!')).toBeInTheDocument()
      })
    })

    it('shows error toast when copying URL fails', async () => {
      const user = userEvent.setup()

      // Mock clipboard to reject
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard access denied')),
        },
        writable: true,
        configurable: true,
      })

      renderWithProviders(<ChartPanel {...defaultProps} />)

      // Open dropdown
      const shareButton = screen.getByText('Share')
      await user.click(shareButton)

      // Click Copy URL
      const copyUrlButton = screen.getByText('Copy URL')
      await user.click(copyUrlButton)

      // Check for error toast message
      await waitFor(() => {
        expect(screen.getByText('Clipboard access denied')).toBeInTheDocument()
      })
    })
  })

  describe('Share button state', () => {
    it('does not render Share button when no data is available', () => {
      renderWithProviders(<ChartPanel {...defaultProps} data={[]} hasOriginalData={false} />)

      // When there's no data, the whole toolbar shouldn't render
      const shareButton = screen.queryByText('Share')
      expect(shareButton).not.toBeInTheDocument()

      // Instead, should show empty state
      expect(screen.getByText('No language data')).toBeInTheDocument()
    })

    it('renders Share button when data is available', () => {
      renderWithProviders(<ChartPanel {...defaultProps} />)

      const shareButton = screen.getByText('Share')
      expect(shareButton).toBeInTheDocument()
      expect(shareButton.closest('button')).not.toBeDisabled()
    })
  })
})
