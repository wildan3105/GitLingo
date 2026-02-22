/**
 * useToast — queue cap tests
 *
 * Verifies that the toast queue never exceeds MAX_TOASTS (3),
 * evicting the oldest entry when the limit is exceeded.
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../../../src/shared/hooks/useToast'

// Helper: renders a button that fires N toasts on click.
// Uses a long duration so toasts don't auto-dismiss mid-test.
function ToastTrigger({ messages }: { messages: string[] }) {
  const { showToast } = useToast()
  return (
    <button
      onClick={() => {
        messages.forEach((message) => showToast({ type: 'success', message, duration: 999_999 }))
      }}
    >
      Trigger
    </button>
  )
}

function setup(messages: string[]) {
  render(
    <ToastProvider>
      <ToastTrigger messages={messages} />
    </ToastProvider>
  )
}

describe('useToast — queue cap', () => {
  afterEach(() => vi.useRealTimers())

  it('shows 1 toast when 1 is triggered', () => {
    setup(['Toast A'])
    fireEvent.click(screen.getByText('Trigger'))
    expect(screen.getAllByRole('status')).toHaveLength(1)
  })

  it('shows all 3 toasts when exactly 3 are triggered (boundary)', () => {
    setup(['Toast A', 'Toast B', 'Toast C'])
    fireEvent.click(screen.getByText('Trigger'))
    expect(screen.getByText('Toast A')).toBeInTheDocument()
    expect(screen.getByText('Toast B')).toBeInTheDocument()
    expect(screen.getByText('Toast C')).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(3)
  })

  it('evicts the oldest toast when a 4th is added', () => {
    setup(['Toast A', 'Toast B', 'Toast C', 'Toast D'])
    fireEvent.click(screen.getByText('Trigger'))
    expect(screen.queryByText('Toast A')).not.toBeInTheDocument()
    expect(screen.getByText('Toast B')).toBeInTheDocument()
    expect(screen.getByText('Toast C')).toBeInTheDocument()
    expect(screen.getByText('Toast D')).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(3)
  })

  it('keeps only the latest 3 when 5 are added', () => {
    setup(['Toast A', 'Toast B', 'Toast C', 'Toast D', 'Toast E'])
    fireEvent.click(screen.getByText('Trigger'))
    expect(screen.queryByText('Toast A')).not.toBeInTheDocument()
    expect(screen.queryByText('Toast B')).not.toBeInTheDocument()
    expect(screen.getByText('Toast C')).toBeInTheDocument()
    expect(screen.getByText('Toast D')).toBeInTheDocument()
    expect(screen.getByText('Toast E')).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(3)
  })

  it('auto-dismiss clears toasts after their duration expires', () => {
    vi.useFakeTimers()
    setup(['Toast A', 'Toast B', 'Toast C', 'Toast D'])
    fireEvent.click(screen.getByText('Trigger'))
    expect(screen.getAllByRole('status')).toHaveLength(3)

    act(() => vi.advanceTimersByTime(1_000_000))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
