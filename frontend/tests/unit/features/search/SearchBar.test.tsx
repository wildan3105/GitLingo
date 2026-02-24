/**
 * SearchBar Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../../../src/test/testUtils'
import { SearchBar } from '../../../../src/features/search/components/SearchBar'
import userEvent from '@testing-library/user-event'

describe('SearchBar', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
  }

  it('renders input with label', () => {
    render(<SearchBar {...defaultProps} />)

    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(<SearchBar {...defaultProps} value="octocat" />)

    const input = screen.getByLabelText('Username') as HTMLInputElement
    expect(input.value).toBe('octocat')
  })

  it('calls onChange when user types', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} onChange={handleChange} />)

    const input = screen.getByLabelText('Username')
    await user.type(input, 'test')

    expect(handleChange).toHaveBeenCalled()
  })

  it('calls onSubmit when Enter key pressed with valid username', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} value="octocat" onSubmit={handleSubmit} />)

    const input = screen.getByLabelText('Username')
    await user.type(input, '{Enter}')

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not call onSubmit when Enter pressed with empty username', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} value="" onSubmit={handleSubmit} />)

    const input = screen.getByLabelText('Username')
    await user.type(input, '{Enter}')

    expect(handleSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Username is required')).toBeInTheDocument()
  })

  it('does not call onSubmit when Enter pressed with invalid username', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} value="invalid user" onSubmit={handleSubmit} />)

    const input = screen.getByLabelText('Username')
    await user.type(input, '{Enter}')

    expect(handleSubmit).not.toHaveBeenCalled()
    expect(
      screen.getByText(/can only contain alphanumeric characters and hyphens/i)
    ).toBeInTheDocument()
  })

  it('does not show a validation error on blur with empty username', async () => {
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} value="" />)

    const input = screen.getByLabelText('Username')

    // Focus and blur without typing — empty field errors only surface on submit,
    // not on blur, so that clicking a chip never flashes "Username is required".
    await user.click(input)
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText('Username is required')).not.toBeInTheDocument()
    })
  })

  it('shows validation error on blur with invalid username', async () => {
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} value="invalid@user" />)

    const input = screen.getByLabelText('Username')

    // Focus and blur
    await user.click(input)
    await user.tab()

    await waitFor(() => {
      expect(
        screen.getByText(/can only contain alphanumeric characters and hyphens/i)
      ).toBeInTheDocument()
    })
  })

  it('shows validation error for username too long', async () => {
    const longUsername = 'a'.repeat(40) // 40 characters (max is 39)
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} value={longUsername} />)

    const input = screen.getByLabelText('Username')
    await user.click(input)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Username must be 39 characters or less')).toBeInTheDocument()
    })
  })

  it('clears validation error when user types after error', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<SearchBar {...defaultProps} value="invalid@user" onChange={handleChange} />)

    const input = screen.getByLabelText('Username')

    // Trigger validation error via blur on non-empty invalid value
    await user.click(input)
    await user.tab()

    await waitFor(() => {
      expect(
        screen.getByText(/can only contain alphanumeric characters and hyphens/i)
      ).toBeInTheDocument()
    })

    // Start typing — error clears immediately
    await user.click(input)
    await user.type(input, 'a')

    await waitFor(() => {
      expect(
        screen.queryByText(/can only contain alphanumeric characters and hyphens/i)
      ).not.toBeInTheDocument()
    })
    expect(handleChange).toHaveBeenCalled()
  })

  it('disables input when loading', () => {
    render(<SearchBar {...defaultProps} isLoading={true} />)

    const input = screen.getByLabelText('Username') as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it('shows loading spinner when loading', () => {
    render(<SearchBar {...defaultProps} isLoading={true} />)

    const spinner = screen.getByLabelText('Username').parentElement?.querySelector('svg')
    expect(spinner).toBeInTheDocument()
  })

  it('displays external error prop', () => {
    render(<SearchBar {...defaultProps} value="test" error="User not found" />)

    // External errors should show immediately without needing to blur
    expect(screen.getByText('User not found')).toBeInTheDocument()
  })

  it('has accessible ARIA attributes', () => {
    render(<SearchBar {...defaultProps} value="" />)

    const input = screen.getByLabelText('Username')

    // Should have correct ARIA attributes
    expect(input).toHaveAttribute('id', 'username-search')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('has ARIA invalid and describedby when error present', async () => {
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} value="" />)

    const input = screen.getByLabelText('Username')

    // Trigger error via submit attempt (Enter on empty still shows "Username is required")
    await user.type(input, '{Enter}')

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'username-error')
    })
  })

  it('error message has role alert', async () => {
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} value="" />)

    const input = screen.getByLabelText('Username')
    // Trigger error via submit attempt (Enter on empty still shows "Username is required")
    await user.type(input, '{Enter}')

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Username is required')
    })
  })

  it('shows helper text when no error', () => {
    render(<SearchBar {...defaultProps} value="test" />)

    expect(screen.getByText('Press Enter to search')).toBeInTheDocument()
  })

  it('hides helper text when loading', () => {
    render(<SearchBar {...defaultProps} value="test" isLoading={true} />)

    expect(screen.queryByText('Press Enter to search')).not.toBeInTheDocument()
  })

  it('accepts valid GitHub usernames', async () => {
    const validUsernames = [
      'a',
      'octocat',
      'my-user-123',
      'user-name',
      'abc123',
      'a'.repeat(39), // exactly 39 chars
    ]

    const handleSubmit = vi.fn()
    const user = userEvent.setup()

    for (const username of validUsernames) {
      handleSubmit.mockClear()

      const { unmount } = render(
        <SearchBar {...defaultProps} value={username} onSubmit={handleSubmit} />
      )

      const input = screen.getByLabelText('Username')
      await user.type(input, '{Enter}')

      expect(handleSubmit).toHaveBeenCalledTimes(1)

      unmount()
    }
  })

  it('clears error state when value prop changes to chip username after submit error', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<SearchBar {...defaultProps} value="" />)

    const input = screen.getByLabelText('Username')

    // Trigger "Username is required" via Enter
    await user.type(input, '{Enter}')
    expect(screen.getByText('Username is required')).toBeInTheDocument()

    // Simulate chip click: parent updates value prop to the chip's username
    rerender(<SearchBar {...defaultProps} value="octocat" />)

    // Error should clear immediately — no flash of red while valid search runs
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument()
  })

  it('rejects invalid GitHub usernames', async () => {
    const invalidUsernames = [
      '-startwithhyphen',
      'endwithhyphen-',
      'has space',
      'has@special',
      'has.dot',
      '',
    ]

    const handleSubmit = vi.fn()
    const user = userEvent.setup()

    for (const username of invalidUsernames) {
      handleSubmit.mockClear()

      const { unmount } = render(
        <SearchBar {...defaultProps} value={username} onSubmit={handleSubmit} />
      )

      const input = screen.getByLabelText('Username')
      await user.type(input, '{Enter}')

      expect(handleSubmit).not.toHaveBeenCalled()

      unmount()
    }
  })
})
