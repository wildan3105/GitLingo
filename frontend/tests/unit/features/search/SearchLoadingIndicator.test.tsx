/**
 * SearchLoadingIndicator Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '../../../../src/test/testUtils'
import {
  SearchLoadingIndicator,
  LOADING_MESSAGES,
  STEP_PROGRESS,
  MESSAGE_INTERVAL_MS,
} from '../../../../src/features/search/components/SearchLoadingIndicator'

describe('SearchLoadingIndicator', () => {
  it('renders with accessible role and label', () => {
    render(<SearchLoadingIndicator />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renders with data-testid', () => {
    render(<SearchLoadingIndicator />)
    expect(screen.getByTestId('search-loading-indicator')).toBeInTheDocument()
  })

  it('has aria-live set to polite', () => {
    render(<SearchLoadingIndicator />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('shows the first message on mount', () => {
    render(<SearchLoadingIndicator />)
    expect(screen.getByText(LOADING_MESSAGES[0])).toBeInTheDocument()
  })

  it('shows 20% progress on mount', () => {
    render(<SearchLoadingIndicator />)
    expect(screen.getByTestId('progress-value')).toHaveTextContent('20%')
  })

  describe('one-shot progression (no looping)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('advances to the next message after MESSAGE_INTERVAL_MS', () => {
      render(<SearchLoadingIndicator />)

      act(() => {
        vi.advanceTimersByTime(MESSAGE_INTERVAL_MS)
      })

      expect(screen.getByText(LOADING_MESSAGES[1])).toBeInTheDocument()
    })

    it('advances through all messages in order', () => {
      render(<SearchLoadingIndicator />)

      LOADING_MESSAGES.forEach((_, i) => {
        expect(screen.getByText(LOADING_MESSAGES[i])).toBeInTheDocument()
        act(() => {
          vi.advanceTimersByTime(MESSAGE_INTERVAL_MS)
        })
      })
    })

    it('does not show two messages simultaneously', () => {
      render(<SearchLoadingIndicator />)

      act(() => {
        vi.advanceTimersByTime(MESSAGE_INTERVAL_MS)
      })

      expect(screen.queryByText(LOADING_MESSAGES[0])).not.toBeInTheDocument()
      expect(screen.getByText(LOADING_MESSAGES[1])).toBeInTheDocument()
    })

    it('stops at the last message and does not loop', () => {
      render(<SearchLoadingIndicator />)

      // Each step needs its own act so the re-render schedules the next setTimeout
      for (let i = 0; i < LOADING_MESSAGES.length - 1; i++) {
        act(() => {
          vi.advanceTimersByTime(MESSAGE_INTERVAL_MS)
        })
      }

      expect(screen.getByText(LOADING_MESSAGES[LOADING_MESSAGES.length - 1])).toBeInTheDocument()

      // Further advancement must NOT loop back to the first message
      act(() => {
        vi.advanceTimersByTime(MESSAGE_INTERVAL_MS * 3)
      })

      expect(screen.getByText(LOADING_MESSAGES[LOADING_MESSAGES.length - 1])).toBeInTheDocument()
      expect(screen.queryByText(LOADING_MESSAGES[0])).not.toBeInTheDocument()
    })

    it('shows the correct progress percentage at each step', () => {
      render(<SearchLoadingIndicator />)

      STEP_PROGRESS.forEach((pct, i) => {
        expect(screen.getByTestId('progress-value')).toHaveTextContent(`${pct}%`)
        if (i < STEP_PROGRESS.length - 1) {
          act(() => {
            vi.advanceTimersByTime(MESSAGE_INTERVAL_MS)
          })
        }
      })
    })

    it('caps progress at 95% on the final step', () => {
      render(<SearchLoadingIndicator />)

      for (let i = 0; i < LOADING_MESSAGES.length - 1; i++) {
        act(() => {
          vi.advanceTimersByTime(MESSAGE_INTERVAL_MS)
        })
      }

      expect(screen.getByTestId('progress-value')).toHaveTextContent('95%')
    })

    it('never shows 100% while loading is still in progress', () => {
      render(<SearchLoadingIndicator />)

      for (let i = 0; i < LOADING_MESSAGES.length - 1; i++) {
        act(() => {
          vi.advanceTimersByTime(MESSAGE_INTERVAL_MS)
        })
      }
      // Extra advancement past all steps
      act(() => {
        vi.advanceTimersByTime(MESSAGE_INTERVAL_MS * 10)
      })

      expect(screen.queryByText('100%')).not.toBeInTheDocument()
    })
  })
})
