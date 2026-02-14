/**
 * SearchPage Component
 * Main page that integrates search, charts, and actions
 */

import { useSearch } from './hooks/useSearch'
import { SearchBar } from './components/SearchBar'
import { ProviderSelect } from './components/ProviderSelect'
import { ResultHeader } from './components/ResultHeader'
import { ChartPanel } from '../charts/components/ChartPanel'
import { Card } from '../../shared/components/Card'
import { EmptyState } from '../../shared/components/EmptyState'
import { ErrorState } from '../../shared/components/ErrorState'
import { Button } from '../../shared/components/Button'

/**
 * Main search page component
 *
 * Integrates all features:
 * - Username search with validation
 * - Provider selection
 * - Chart visualization with type switching
 * - Download and share actions
 * - Comprehensive error handling
 *
 * @example
 * ```typescript
 * <SearchPage />
 * ```
 */
export function SearchPage() {
  const {
    username,
    setUsername,
    provider,
    setProvider,
    handleSearch,
    isLoading,
    error,
    data,
    validationError,
  } = useSearch()

  // Render error state with retry
  const renderError = () => {
    if (!error) return null

    let errorMessage = error.error.message
    const errorCode = error.error.code

    // Customize error messages based on error code
    switch (errorCode) {
      case 'user_not_found':
        errorMessage = `We couldn't find a GitHub user or organization with the username "${username}". Please check the spelling and try again.`
        break
      case 'rate_limited':
        errorMessage = "GitHub's API rate limit has been reached. Please try again in a moment."
        break
      case 'network_error':
        errorMessage =
          'Unable to connect to the server. Please check your internet connection and try again.'
        break
      case 'server_error':
        errorMessage =
          'The server encountered an error while processing your request. Please try again in a moment.'
        break
      case 'timeout':
        errorMessage =
          'The request took too long to complete. This can happen with large accounts. Please try again.'
        break
    }

    return (
      <Card>
        <ErrorState
          code={errorCode}
          message={errorMessage}
          onRetry={handleSearch}
          retryAfter={error.error.retry_after_seconds}
        />
      </Card>
    )
  }

  // Render initial empty state
  const renderEmptyState = () => {
    return (
      <Card>
        <EmptyState
          title="Search a GitHub Username"
          description="Enter a GitHub username to visualize their programming language statistics with beautiful charts."
          icon={
            <svg
              className="w-16 h-16 text-secondary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
      </Card>
    )
  }

  const hasSearched = data || error
  const hasData = data && data.series.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            GitLingo
          </h1>
          <p className="text-secondary-600 mt-1">Visualize your GitHub language statistics</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Search Form */}
          <Card padding="lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  value={username}
                  onChange={setUsername}
                  onSubmit={handleSearch}
                  isLoading={isLoading}
                  error={validationError || undefined}
                />
              </div>

              <div className="md:w-48">
                <ProviderSelect value={provider} onChange={setProvider} disabled={isLoading} />
              </div>

              <div className="flex flex-col gap-1.5">
                {/* Invisible label for alignment */}
                <label
                  className="text-sm font-medium text-transparent select-none pointer-events-none"
                  aria-hidden="true"
                >
                  &nbsp;
                </label>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !!validationError}
                  loading={isLoading}
                  variant="primary"
                  className="w-full md:w-auto"
                >
                  Search
                </Button>
              </div>
            </div>
          </Card>

          {/* Results */}
          {hasData && data && (
            <>
              {/* Profile Header */}
              <Card padding="lg">
                <ResultHeader
                  profile={data.profile}
                  totalRepos={data.series.reduce((sum, item) => sum + item.value, 0)}
                  provider={provider}
                />
              </Card>

              {/* Chart Panel */}
              <ChartPanel
                series={data.series}
                username={username}
                provider={provider}
                isLoading={isLoading}
              />
            </>
          )}

          {/* Error State */}
          {error && !isLoading && renderError()}

          {/* Empty State */}
          {!hasSearched && !isLoading && renderEmptyState()}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-secondary-500">
        <p>
          Made with{' '}
          <span className="text-error-500" aria-label="love">
            ♥
          </span>{' '}
          using Chart.js and React
        </p>
      </footer>
    </div>
  )
}
