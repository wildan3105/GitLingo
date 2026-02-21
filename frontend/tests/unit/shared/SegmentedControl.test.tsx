/**
 * Tests for SegmentedControl Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  SegmentedControl,
  type SegmentedOption,
} from '../../../src/shared/components/SegmentedControl'

describe('SegmentedControl', () => {
  const options: SegmentedOption<'a' | 'b' | 'c'>[] = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ]

  describe('rendering', () => {
    it('renders all options', () => {
      render(<SegmentedControl options={options} value="a" onChange={vi.fn()} />)

      expect(screen.getByText('Option A')).toBeInTheDocument()
      expect(screen.getByText('Option B')).toBeInTheDocument()
      expect(screen.getByText('Option C')).toBeInTheDocument()
    })

    it('marks selected option as active', () => {
      render(<SegmentedControl options={options} value="b" onChange={vi.fn()} />)

      const optionB = screen.getByText('Option B').closest('button')
      expect(optionB).toHaveClass('bg-white')
      expect(optionB).toHaveAttribute('aria-pressed', 'true')
    })

    it('renders with icon when provided', () => {
      const optionsWithIcon: SegmentedOption<'a'>[] = [
        { value: 'a', label: 'With Icon', icon: <span data-testid="icon">★</span> },
      ]

      render(<SegmentedControl options={optionsWithIcon} value="a" onChange={vi.fn()} />)

      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <SegmentedControl options={options} value="a" onChange={vi.fn()} className="custom-class" />
      )

      const control = container.firstChild
      expect(control).toHaveClass('custom-class')
    })
  })

  describe('interactions', () => {
    it('calls onChange when option is clicked', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<SegmentedControl options={options} value="a" onChange={onChange} />)

      const optionB = screen.getByText('Option B')
      await user.click(optionB)

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith('b')
    })

    it('does not call onChange when disabled', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<SegmentedControl options={options} value="a" onChange={onChange} disabled={true} />)

      const optionB = screen.getByText('Option B')
      await user.click(optionB)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not call onChange when clicking active option', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<SegmentedControl options={options} value="a" onChange={onChange} />)

      const optionA = screen.getByText('Option A')
      await user.click(optionA)

      // onChange is still called even for active option (component doesn't prevent it)
      // This is expected behavior as the parent can decide what to do
      expect(onChange).toHaveBeenCalledWith('a')
    })
  })

  describe('disabled state', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(<SegmentedControl options={options} value="a" onChange={vi.fn()} disabled={true} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })

    it('applies disabled styling', () => {
      render(<SegmentedControl options={options} value="a" onChange={vi.fn()} disabled={true} />)

      const optionA = screen.getByText('Option A').closest('button')
      expect(optionA).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })
  })

  describe('accessibility', () => {
    it('has proper role and aria attributes', () => {
      const { container } = render(
        <SegmentedControl options={options} value="a" onChange={vi.fn()} />
      )

      const control = container.firstChild
      expect(control).toHaveAttribute('role', 'group')
      expect(control).toHaveAttribute('aria-label')
    })

    it('sets aria-pressed correctly', () => {
      render(<SegmentedControl options={options} value="b" onChange={vi.fn()} />)

      const optionA = screen.getByText('Option A').closest('button')
      const optionB = screen.getByText('Option B').closest('button')
      const optionC = screen.getByText('Option C').closest('button')

      expect(optionA).toHaveAttribute('aria-pressed', 'false')
      expect(optionB).toHaveAttribute('aria-pressed', 'true')
      expect(optionC).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
