/**
 * EmptyState Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../src/test/testUtils'
import { EmptyState } from '../../../src/shared/components/EmptyState'
import userEvent from '@testing-library/user-event'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data found" />)

    expect(screen.getByText('No data found')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="No data" description="Try searching for something else" />)

    expect(screen.getByText('Try searching for something else')).toBeInTheDocument()
  })

  it('renders default icon when no icon provided', () => {
    const { container } = render(<EmptyState title="Empty" />)
    const icon = container.querySelector('svg')

    expect(icon).toBeInTheDocument()
  })

  it('renders custom icon when provided', () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>
    render(<EmptyState title="Empty" icon={customIcon} />)

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const action = {
      label: 'Start searching',
      onClick: vi.fn(),
    }

    render(<EmptyState title="Empty" action={action} />)

    expect(screen.getByRole('button', { name: /start searching/i })).toBeInTheDocument()
  })

  it('calls action onClick when button clicked', async () => {
    const handleClick = vi.fn()
    const action = {
      label: 'Click me',
      onClick: handleClick,
    }
    const user = userEvent.setup()

    render(<EmptyState title="Empty" action={action} />)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not render action button when not provided', () => {
    render(<EmptyState title="Empty" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="Empty" className="custom-class" />)
    const wrapper = container.querySelector('.custom-class')

    expect(wrapper).toBeInTheDocument()
  })
})
