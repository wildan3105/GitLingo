/**
 * SearchPage Component
 * Main page that integrates search, charts, and actions
 */

import { useSearch } from './hooks/useSearch'
import { SearchBar } from './components/SearchBar'
import { ResultHeader } from './components/ResultHeader'
import { ChartPanel } from '../charts/components/ChartPanel'
import { Card } from '../../shared/components/Card'
import { EmptyState } from '../../shared/components/EmptyState'
import { ErrorState } from '../../shared/components/ErrorState'
import { Button } from '../../shared/components/Button'
import { LoadingState } from '../../shared/components/LoadingState'
import { KPICard } from '../../shared/components/KPICard'

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
    includeForks,
    setIncludeForks,
    includeUnknownLanguage,
    setIncludeUnknownLanguage,
    handleSearch,
    handleReset,
    isLoading,
    error,
    data,
    validationError,
  } = useSearch()

  // Filter data based on user selections
  const filteredData = data
    ? {
        ...data,
        series: data.series.filter((item) => {
          // Filter out forks if not included
          if (!includeForks && item.key === '__forks__') {
            return false
          }
          // Filter out unknown language if not included
          if (!includeUnknownLanguage && item.key === 'Unknown') {
            return false
          }
          return true
        }),
      }
    : null

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
      case 'invalid_token':
        errorMessage =
          'The configured token is invalid or has expired. Please check your token and try again.'
        break
      case 'insufficient_scopes':
        errorMessage =
          'The configured token does not have sufficient permissions to fetch this profile. Please update your token scopes and try again.'
        break
    }

    // Map unknown codes (e.g. future backend codes) to 'generic' so the icon always renders
    const knownCodes = [
      'user_not_found',
      'rate_limited',
      'network_error',
      'server_error',
      'validation_error',
      'timeout',
      'invalid_token',
      'insufficient_scopes',
      'generic',
    ] as const
    const displayCode = (knownCodes as readonly string[]).includes(errorCode)
      ? (errorCode as (typeof knownCodes)[number])
      : 'generic'

    return (
      <div className="animate-fade-in-up">
        <Card>
          <ErrorState
            code={displayCode}
            message={errorMessage}
            onRetry={handleSearch}
            retryAfter={error.error.retry_after_seconds}
          />
        </Card>
      </div>
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary-50 to-secondary-100">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={handleReset}
            className="text-left transition-all duration-200 hover:opacity-80 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-1 -m-1"
            aria-label="Reset to home"
          >
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              GitLingo
            </h1>
            <p className="text-sm text-secondary-600 mt-1 leading-relaxed">
              Visualize your GitHub language statistics
            </p>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="space-y-8">
          {/* Search Form */}
          <Card padding="lg">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Username Input */}
              <div className="flex-1">
                <SearchBar
                  value={username}
                  onChange={setUsername}
                  onSubmit={handleSearch}
                  isLoading={isLoading}
                  error={validationError || undefined}
                />
              </div>

              {/* Search Button */}
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
                  variant="primary"
                  className="w-full md:w-auto px-8"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search
                </Button>
              </div>
            </div>
          </Card>

          {/* Loading Skeletons - Show during loading after a search */}
          {isLoading && username && (
            <>
              <Card padding="lg">
                <LoadingState variant="profile" />
              </Card>

              <Card padding="lg">
                <LoadingState variant="chartPanel" />
              </Card>
            </>
          )}

          {/* Profile Header - Show for any successful search */}
          {filteredData && !isLoading && (
            <div className="animate-fade-in-up">
              <Card variant="subtle" padding="md">
                <ResultHeader profile={filteredData.profile} metadata={filteredData.metadata} />
              </Card>
            </div>
          )}

          {/* KPI Cards - Show key metrics */}
          {filteredData &&
            !isLoading &&
            (() => {
              // Calculate metrics from series data
              const totalRepos = filteredData.series.reduce((sum, item) => sum + item.value, 0)

              // Find top language (excluding forks)
              const languages = filteredData.series.filter((item) => item.key !== '__forks__')
              const topLanguageItem =
                languages.length > 0
                  ? languages.reduce((max, item) => (item.value > max.value ? item : max))
                  : null

              // Count unique languages (excluding forks)
              const languageCount = filteredData.series.filter(
                (item) => item.key !== '__forks__'
              ).length

              // Calculate forks percentage
              const forksItem = filteredData.series.find((item) => item.key === '__forks__')
              const forksCount = forksItem?.value || 0
              const forksPercentage =
                totalRepos > 0 ? ((forksCount / totalRepos) * 100).toFixed(1) : '0.0'

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
                  <KPICard
                    label="Repositories"
                    value={totalRepos}
                    subtitle="analyzed"
                    color="primary"
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    }
                  />

                  <KPICard
                    label="Top Language"
                    value={topLanguageItem?.label || 'None'}
                    subtitle={
                      topLanguageItem ? `by repo count (excluding forks)` : 'no languages detected'
                    }
                    color="success"
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    }
                  />

                  <KPICard
                    label="Languages"
                    value={languageCount}
                    subtitle="detected"
                    color="secondary"
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    }
                  />

                  <KPICard
                    label="Forks"
                    value={`${forksPercentage}%`}
                    subtitle="of repositories"
                    color="warning"
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  />
                </div>
              )
            })()}

          {/* Chart Panel - Show whenever we have data, even if filtered results are empty */}
          {data && !isLoading && (
            <div className="animate-fade-in-up animate-delay-200 mt-12">
              <ChartPanel
                series={filteredData?.series || []}
                username={username}
                isLoading={isLoading}
                includeForks={includeForks}
                setIncludeForks={setIncludeForks}
                includeUnknownLanguage={includeUnknownLanguage}
                setIncludeUnknownLanguage={setIncludeUnknownLanguage}
                hasOriginalData={data.series.length > 0}
              />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && renderError()}

          {/* Initial Empty State */}
          {!hasSearched && !isLoading && renderEmptyState()}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between text-sm text-secondary-500">
          <p>
            © 2026 GitLingo, created by{' '}
            <a
              href="https://github.com/wildan3105/GitLingo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-700 hover:text-primary-600 transition-all duration-200 hover:underline underline-offset-2"
            >
              Wildan Nahar
            </a>{' '}
            with{' '}
            <span className="text-error-500 inline-block animate-pulse" aria-label="love">
              ♥
            </span>
          </p>

          <div className="flex items-center gap-4">
            {/* X (Twitter) Link */}
            <a
              href="https://twitter.com/wildan3105"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on X (Twitter)"
              className="text-secondary-400 hover:text-[#1DA1F2] transition-all duration-200 hover:scale-110"
            >
              <svg
                className="w-5 h-5 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* GitHub Link */}
            <a
              href="https://github.com/wildan3105"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
              className="text-secondary-400 hover:text-secondary-900 transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
