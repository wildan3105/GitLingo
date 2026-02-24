/**
 * LoadingState Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../src/test/testUtils'
import { LoadingState } from '../../../src/shared/components/LoadingState'

describe('LoadingState', () => {
  it('renders default spinner variant', () => {
    render(<LoadingState />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renders chart variant', () => {
    render(<LoadingState variant="chart" />)
    expect(screen.getByLabelText('Loading chart')).toBeInTheDocument()
  })

  it('renders search variant', () => {
    render(<LoadingState variant="search" />)
    expect(screen.getByLabelText('Loading results')).toBeInTheDocument()
  })

  it('has accessible ARIA attributes', () => {
    render(<LoadingState />)
    const status = screen.getByRole('status')

    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingState className="custom-class" />)
    const wrapper = container.querySelector('.custom-class')

    expect(wrapper).toBeInTheDocument()
  })

  it('includes screen reader text', () => {
    render(<LoadingState variant="default" />)
    expect(screen.getByText('Loading...')).toHaveClass('sr-only')
  })
})
