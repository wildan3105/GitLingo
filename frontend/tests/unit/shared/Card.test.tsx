/**
 * Card Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../src/test/testUtils'
import { Card } from '../../../src/shared/components/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with default medium padding', () => {
    render(<Card>Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('p-6')
  })

  it('renders with no padding', () => {
    render(<Card padding="none">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('p-0')
  })

  it('renders with small padding', () => {
    render(<Card padding="sm">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('p-4')
  })

  it('renders with large padding', () => {
    render(<Card padding="lg">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('p-8')
  })

  it('renders with default medium shadow', () => {
    render(<Card>Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('shadow-md')
  })

  it('renders with no shadow', () => {
    render(<Card shadow="none">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('shadow-none')
  })

  it('renders with small shadow', () => {
    render(<Card shadow="sm">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('shadow-sm')
  })

  it('renders with large shadow', () => {
    render(<Card shadow="lg">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('shadow-lg')
  })

  it('applies hover effect when enabled', () => {
    render(<Card hover>Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('hover:shadow-xl')
  })

  it('does not apply hover effect by default', () => {
    render(<Card>Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).not.toContain('hover:shadow-xl')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('custom-class')
  })
})
