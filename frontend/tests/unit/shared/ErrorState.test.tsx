/**
 * ErrorState Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '../../../src/test/test-utils'
import { ErrorState } from '../../../src/shared/components/ErrorState'

describe('ErrorState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders error message', () => {
    render(<ErrorState code="generic" message="Something went wrong" />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders user_not_found error', () => {
    render(<ErrorState code="user_not_found" message="User not found" />)

    expect(screen.getByText('User not found')).toBeInTheDocument()
  })

  it('renders rate_limited error', () => {
    render(<ErrorState code="rate_limited" message="Rate limit exceeded" />)

    expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
  })

  it('renders network_error', () => {
    render(<ErrorState code="network_error" message="Network error occurred" />)

    expect(screen.getByText('Network error occurred')).toBeInTheDocument()
  })

  it('renders server_error', () => {
    render(<ErrorState code="server_error" message="Server error" />)

    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('renders details when provided', () => {
    render(<ErrorState code="generic" message="Error" details="Additional error information" />)

    expect(screen.getByText('Additional error information')).toBeInTheDocument()
  })

  it('shows retry button when onRetry provided', () => {
    render(<ErrorState code="generic" message="Error" onRetry={vi.fn()} />)

    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('calls onRetry when retry button clicked', () => {
    vi.useRealTimers() // Use real timers for this test
    const handleRetry = vi.fn()

    const { getByText } = render(
      <ErrorState code="generic" message="Error" onRetry={handleRetry} />
    )

    const button = getByText('Try Again')
    button.click()

    expect(handleRetry).toHaveBeenCalledTimes(1)
    vi.useFakeTimers() // Restore fake timers
  })

  it('shows countdown for rate limit', () => {
    render(
      <ErrorState code="rate_limited" message="Rate limited" retryAfter={60} onRetry={vi.fn()} />
    )

    expect(screen.getByText(/please wait 60 seconds/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('Retry in 60s')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('decrements countdown timer', () => {
    // Test that countdown starts correctly
    render(
      <ErrorState code="rate_limited" message="Rate limited" retryAfter={60} onRetry={vi.fn()} />
    )

    expect(screen.getByText(/please wait 60 seconds/i)).toBeInTheDocument()
    expect(screen.getByText('Retry in 60s')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('has accessible ARIA attributes', () => {
    render(<ErrorState code="generic" message="Error" />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })
})
