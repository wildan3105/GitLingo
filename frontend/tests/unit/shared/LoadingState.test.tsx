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

  describe('kpiCards variant — responsive grid', () => {
    it('uses 2-column grid on mobile (not 1-column)', () => {
      render(<LoadingState variant="kpiCards" />)
      const grid = screen.getByLabelText('Loading metrics')
      expect(grid).toHaveClass('grid-cols-2')
      expect(grid).not.toHaveClass('grid-cols-1')
    })

    it('expands to 4-column grid on desktop (lg+)', () => {
      render(<LoadingState variant="kpiCards" />)
      const grid = screen.getByLabelText('Loading metrics')
      expect(grid.className).toContain('lg:grid-cols-4')
    })

    it('renders exactly 4 skeleton cards', () => {
      const { container } = render(<LoadingState variant="kpiCards" />)
      const cards = container.querySelectorAll('[aria-label="Loading metrics"] > div')
      expect(cards).toHaveLength(4)
    })
  })

  describe('chartPanel variant — responsive toolbar', () => {
    it('toolbar stacks vertically on mobile (flex-col base)', () => {
      const { container } = render(<LoadingState variant="chartPanel" />)
      const toolbar = container.querySelector('.border-b')
      expect(toolbar).toHaveClass('flex-col')
    })

    it('toolbar goes horizontal at sm breakpoint (not lg)', () => {
      const { container } = render(<LoadingState variant="chartPanel" />)
      const toolbar = container.querySelector('.border-b')
      expect(toolbar?.className).toContain('sm:flex-row')
      expect(toolbar?.className).not.toContain('lg:flex-row')
    })
  })

  describe('profile variant — responsive row 2', () => {
    it('metadata row stacks vertically on mobile (flex-col base)', () => {
      const { container } = render(<LoadingState variant="profile" />)
      const row2 = container.querySelector('.border-t')
      expect(row2).toHaveClass('flex-col')
    })

    it('metadata row goes horizontal at md breakpoint (md:flex-row)', () => {
      const { container } = render(<LoadingState variant="profile" />)
      const row2 = container.querySelector('.border-t')
      expect(row2?.className).toContain('md:flex-row')
    })

    it('metadata row alignment is unchanged on desktop (md:items-center md:justify-between)', () => {
      const { container } = render(<LoadingState variant="profile" />)
      const row2 = container.querySelector('.border-t')
      expect(row2?.className).toContain('md:items-center')
      expect(row2?.className).toContain('md:justify-between')
    })
  })
})
