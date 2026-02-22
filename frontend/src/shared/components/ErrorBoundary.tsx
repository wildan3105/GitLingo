/**
 * ErrorBoundary Component
 * Catches unhandled render errors and shows a fallback UI instead of a blank page
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

/**
 * App-level error boundary.
 *
 * Wraps the component tree so that any uncaught render error shows a friendly
 * fallback instead of unmounting the entire page. Must be a class component —
 * React error boundaries cannot be written as function components.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
          <div className="text-center px-4">
            <h1 className="text-xl font-semibold text-secondary-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-secondary-600 mb-6">
              An unexpected error occurred. Please reload the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
