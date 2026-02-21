/**
 * Tests for Checkbox Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../../../src/shared/components/Checkbox'

describe('Checkbox', () => {
  const defaultProps = {
    id: 'test-checkbox',
    label: 'Test Label',
    checked: false,
    onChange: vi.fn(),
  }

  describe('rendering', () => {
    it('renders with label', () => {
      render(<Checkbox {...defaultProps} />)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('renders checkbox input', () => {
      render(<Checkbox {...defaultProps} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('applies correct id to input', () => {
      render(<Checkbox {...defaultProps} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('id', 'test-checkbox')
    })

    it('applies additional className if provided', () => {
      const { container } = render(<Checkbox {...defaultProps} className="custom-class" />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  describe('checked state', () => {
    it('renders as unchecked when checked is false', () => {
      render(<Checkbox {...defaultProps} checked={false} />)
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('renders as checked when checked is true', () => {
      render(<Checkbox {...defaultProps} checked={true} />)
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('has correct aria-checked attribute', () => {
      render(<Checkbox {...defaultProps} checked={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('interactions', () => {
    it('calls onChange with true when unchecked checkbox is clicked', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<Checkbox {...defaultProps} checked={false} onChange={onChange} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('calls onChange with false when checked checkbox is clicked', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<Checkbox {...defaultProps} checked={true} onChange={onChange} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(false)
    })

    it('allows clicking on label to toggle checkbox', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<Checkbox {...defaultProps} checked={false} onChange={onChange} />)

      const label = screen.getByText('Test Label')
      await user.click(label)

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(true)
    })
  })

  describe('disabled state', () => {
    it('disables checkbox when disabled is true', () => {
      render(<Checkbox {...defaultProps} disabled={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('does not call onChange when disabled checkbox is clicked', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<Checkbox {...defaultProps} disabled={true} onChange={onChange} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('applies disabled styling', () => {
      const { container } = render(<Checkbox {...defaultProps} disabled={true} />)
      const label = container.querySelector('label')
      expect(label).toHaveClass('cursor-not-allowed', 'opacity-50')
    })
  })

  describe('accessibility', () => {
    it('has proper label association', () => {
      render(<Checkbox {...defaultProps} />)
      const checkbox = screen.getByRole('checkbox')
      const label = screen.getByText('Test Label')

      expect(checkbox).toHaveAttribute('id', 'test-checkbox')
      expect(label.closest('label')).toHaveAttribute('for', 'test-checkbox')
    })

    it('is keyboard accessible', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<Checkbox {...defaultProps} checked={false} onChange={onChange} />)

      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard(' ')

      expect(onChange).toHaveBeenCalledWith(true)
    })
  })
})
