/**
 * Select Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../src/test/testUtils'
import { Select } from '../../../src/shared/components/Select'
import userEvent from '@testing-library/user-event'

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  it('renders with options', () => {
    render(<Select value="option1" options={options} onChange={vi.fn()} />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Select label="Choose option" value="option1" options={options} onChange={vi.fn()} />)

    expect(screen.getByText('Choose option')).toBeInTheDocument()
    expect(screen.getByLabelText('Choose option')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Select placeholder="Select an option" value="" options={options} onChange={vi.fn()} />)

    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('calls onChange with correct value', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Select value="option1" options={options} onChange={handleChange} />)

    await user.selectOptions(screen.getByRole('combobox'), 'option2')

    expect(handleChange).toHaveBeenCalledWith('option2')
  })

  it('displays error message', () => {
    render(
      <Select value="option1" options={options} onChange={vi.fn()} error="This field is required" />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })

  it('applies error styling when error present', () => {
    render(<Select value="option1" options={options} onChange={vi.fn()} error="Error" />)

    const select = screen.getByRole('combobox')
    expect(select.className).toContain('border-error-500')
    expect(select).toHaveAttribute('aria-invalid', 'true')
  })

  it('disables select when disabled prop is true', () => {
    render(<Select value="option1" options={options} onChange={vi.fn()} disabled />)

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('disables specific options', () => {
    const optionsWithDisabled = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2', disabled: true },
    ]

    render(<Select value="option1" options={optionsWithDisabled} onChange={vi.fn()} />)

    const options = screen.getAllByRole('option') as HTMLOptionElement[]
    expect(options[1]).toBeDisabled()
  })

  it('is keyboard accessible', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Select value="option1" options={options} onChange={handleChange} />)

    const select = screen.getByRole('combobox')
    select.focus()
    expect(select).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    // Keyboard navigation is handled by native select element
  })
})
