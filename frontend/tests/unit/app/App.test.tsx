import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../../../src/app/App'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('App', () => {
  it('renders GitLingo heading', () => {
    render(<App />, { wrapper: createWrapper() })
    expect(screen.getByText('GitLingo')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<App />, { wrapper: createWrapper() })
    expect(screen.getByText('Visualize your GitHub language statistics')).toBeInTheDocument()
  })

  it('renders search form', () => {
    render(<App />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })
})
