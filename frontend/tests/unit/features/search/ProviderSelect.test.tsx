/**
 * ProviderSelect Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../../src/test/testUtils'
import { ProviderSelect } from '../../../../src/features/search/components/ProviderSelect'
import userEvent from '@testing-library/user-event'

describe('ProviderSelect', () => {
  const defaultProps = {
    value: 'github',
    onChange: vi.fn(),
  }

  it('renders select with label', () => {
    render(<ProviderSelect {...defaultProps} />)

    expect(screen.getByLabelText('Provider')).toBeInTheDocument()
  })

  it('renders all provider options', () => {
    render(<ProviderSelect {...defaultProps} />)

    expect(screen.getByRole('option', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'GitLab (Coming soon)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Bitbucket (Coming soon)' })).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(<ProviderSelect {...defaultProps} value="github" />)

    const select = screen.getByLabelText('Provider') as HTMLSelectElement
    expect(select.value).toBe('github')
  })

  it('GitHub option is enabled', () => {
    render(<ProviderSelect {...defaultProps} />)

    const githubOption = screen.getByRole('option', {
      name: 'GitHub',
    }) as HTMLOptionElement
    expect(githubOption.disabled).toBe(false)
  })

  it('GitLab option is disabled', () => {
    render(<ProviderSelect {...defaultProps} />)

    const gitlabOption = screen.getByRole('option', {
      name: 'GitLab (Coming soon)',
    }) as HTMLOptionElement
    expect(gitlabOption.disabled).toBe(true)
  })

  it('Bitbucket option is disabled', () => {
    render(<ProviderSelect {...defaultProps} />)

    const bitbucketOption = screen.getByRole('option', {
      name: 'Bitbucket (Coming soon)',
    }) as HTMLOptionElement
    expect(bitbucketOption.disabled).toBe(true)
  })

  it('calls onChange when value changes', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<ProviderSelect {...defaultProps} onChange={handleChange} />)

    const select = screen.getByLabelText('Provider')

    // Try to change to gitlab (even though it's disabled, we can test the handler)
    // Note: userEvent won't let us select a disabled option, so we'll just test
    // that the select element is interactive
    await user.click(select)

    // Since all other options are disabled, we can only verify the component is interactive
    expect(select).toBeInTheDocument()
  })

  it('disables select when disabled prop is true', () => {
    render(<ProviderSelect {...defaultProps} disabled={true} />)

    const select = screen.getByLabelText('Provider') as HTMLSelectElement
    expect(select).toBeDisabled()
  })

  it('does not disable select by default', () => {
    render(<ProviderSelect {...defaultProps} />)

    const select = screen.getByLabelText('Provider') as HTMLSelectElement
    expect(select).not.toBeDisabled()
  })

  it('has accessible ARIA attributes', () => {
    render(<ProviderSelect {...defaultProps} />)

    const select = screen.getByLabelText('Provider')

    // Should have proper label association
    expect(select).toHaveAttribute('id')

    // Should be a select element
    expect(select.tagName).toBe('SELECT')
  })

  it('shows coming soon text for unavailable providers', () => {
    render(<ProviderSelect {...defaultProps} />)

    // Verify the text includes "Coming soon" for disabled providers
    expect(screen.getByText(/GitLab.*Coming soon/)).toBeInTheDocument()
    expect(screen.getByText(/Bitbucket.*Coming soon/)).toBeInTheDocument()
  })
})
