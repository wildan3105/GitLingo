/**
 * ErrorState Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '../../../src/test/test-utils'
import { ErrorState } from '../../../src/shared/components/ErrorState'
import { formatDuration } from '../../../src/shared/utils/formatDuration'

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

  it('renders invalid_token error', () => {
    render(<ErrorState code="invalid_token" message="The token is invalid or expired" />)

    expect(screen.getByText('The token is invalid or expired')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders insufficient_scopes error', () => {
    render(
      <ErrorState
        code="insufficient_scopes"
        message="The token does not have sufficient permissions"
      />
    )

    expect(screen.getByText('The token does not have sufficient permissions')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
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

  it('shows countdown for rate limit — seconds range', () => {
    render(
      <ErrorState code="rate_limited" message="Rate limited" retryAfter={45} onRetry={vi.fn()} />
    )

    expect(screen.getByText(/please wait 45s before retrying/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('Retry')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows countdown for rate limit — minutes range', () => {
    render(
      <ErrorState code="rate_limited" message="Rate limited" retryAfter={90} onRetry={vi.fn()} />
    )

    expect(screen.getByText(/please wait 1m 30s before retrying/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('Retry')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows countdown for rate limit — hours range', () => {
    render(
      <ErrorState code="rate_limited" message="Rate limited" retryAfter={3600} onRetry={vi.fn()} />
    )

    expect(screen.getByText(/please wait 1h before retrying/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('Retry')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('has accessible ARIA attributes', () => {
    render(<ErrorState code="generic" message="Error" />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  describe('countdown timer', () => {
    it('decrements each second', () => {
      render(
        <ErrorState code="rate_limited" message="Rate limited" retryAfter={3} onRetry={vi.fn()} />
      )
      expect(screen.getByText(/please wait 3s before retrying/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText(/please wait 2s before retrying/i)).toBeInTheDocument()
    })

    it('enables the retry button when countdown reaches 0', () => {
      render(
        <ErrorState code="rate_limited" message="Rate limited" retryAfter={3} onRetry={vi.fn()} />
      )

      expect(screen.getByRole('button')).toBeDisabled()

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(screen.queryByText(/please wait/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button')).not.toBeDisabled()
      expect(screen.getByRole('button')).toHaveTextContent('Try Again')
    })

    it('resets countdown when retryAfter prop changes', () => {
      const onRetry = vi.fn()
      const { rerender } = render(
        <ErrorState code="rate_limited" message="Rate limited" retryAfter={5} onRetry={onRetry} />
      )

      expect(screen.getByText(/please wait 5s before retrying/i)).toBeInTheDocument()

      rerender(
        <ErrorState code="rate_limited" message="Rate limited" retryAfter={3} onRetry={onRetry} />
      )

      expect(screen.getByText(/please wait 3s before retrying/i)).toBeInTheDocument()
    })
  })
})

describe('formatDuration', () => {
  it('formats seconds below 60', () => {
    expect(formatDuration(1)).toBe('1s')
    expect(formatDuration(30)).toBe('30s')
    expect(formatDuration(59)).toBe('59s')
  })

  it('formats exactly 60 seconds as minutes', () => {
    expect(formatDuration(60)).toBe('1m')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1m 30s')
    expect(formatDuration(150)).toBe('2m 30s')
    expect(formatDuration(3599)).toBe('59m 59s')
  })

  it('omits seconds when zero in minutes range', () => {
    expect(formatDuration(120)).toBe('2m')
    expect(formatDuration(1800)).toBe('30m')
  })

  it('formats exactly 1 hour', () => {
    expect(formatDuration(3600)).toBe('1h')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(3660)).toBe('1h 1m')
    expect(formatDuration(5400)).toBe('1h 30m')
    expect(formatDuration(7200)).toBe('2h')
  })

  it('omits minutes when zero in hours range', () => {
    expect(formatDuration(7200)).toBe('2h')
    expect(formatDuration(36000)).toBe('10h')
  })
})
