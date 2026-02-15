/**
 * ChartPanel Component
 * Main chart container that manages chart type selection and rendering
 */

import { useState, useRef } from 'react'
import { ChartTypeSelect, type ChartType } from './ChartTypeSelect'
import { BarChartView } from './charts/BarChartView'
import { PieChartView } from './charts/PieChartView'
import { DoughnutChartView } from './charts/DoughnutChartView'
import { RadarChartView } from './charts/RadarChartView'
import { Card } from '../../../shared/components/Card'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ShareButtons } from '../../share/components/ShareButtons'
import { downloadChart } from '../utils/downloadChart'
import type { LanguageSeries } from '../../../contracts/api'

export type ChartPanelProps = {
  /** Language statistics series data */
  series: LanguageSeries[]
  /** GitHub username */
  username: string
  /** Provider (github, gitlab, etc.) */
  provider: string
  /** Loading state */
  isLoading?: boolean
  /** Error message if request failed */
  error?: string
}

/**
 * Main chart panel component
 *
 * Features:
 * - Chart type selection (bar, pie, doughnut, radar)
 * - Instant switching between chart types (no refetch)
 * - Download chart as PNG
 * - Share to social media
 * - Loading, error, and empty states
 * - Responsive layout
 *
 * @example
 * ```typescript
 * <ChartPanel
 *   series={languageSeries}
 *   username="octocat"
 *   provider="github"
 *   isLoading={isLoading}
 *   error={error?.message}
 * />
 * ```
 */
export function ChartPanel({
  series,
  username,
  provider,
  isLoading = false,
  error,
}: ChartPanelProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // Show error state
  if (error && !isLoading) {
    return (
      <Card>
        <ErrorState code="generic" message={error} />
      </Card>
    )
  }

  // Show empty state
  if (!isLoading && series.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No language data"
          description="This user doesn't have any repositories with detected programming languages."
        />
      </Card>
    )
  }

  // Handle download
  const handleDownload = async () => {
    if (!chartRef.current) {
      setDownloadError('Chart not found')
      return
    }

    setIsDownloading(true)
    setDownloadError(null)
    setDownloadSuccess(false)

    try {
      await downloadChart(chartRef.current, {
        username,
        provider,
        chartType,
      })

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed'
      setDownloadError(message)
    } finally {
      setIsDownloading(false)
    }
  }

  // Render chart based on selected type
  const renderChart = () => {
    const chartProps = { series, isLoading }

    switch (chartType) {
      case 'pie':
        return <PieChartView {...chartProps} />
      case 'doughnut':
        return <DoughnutChartView {...chartProps} />
      case 'radar':
        return <RadarChartView {...chartProps} />
      case 'bar':
      default:
        return <BarChartView {...chartProps} />
    }
  }

  const hasData = !isLoading && series.length > 0
  const actionsDisabled = isLoading || !!error || !hasData

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-secondary-900">Language Statistics</h2>
            <p className="text-sm text-secondary-600 mt-1">
              Programming languages used across repositories
            </p>
          </div>
        </div>

        <ChartTypeSelect value={chartType} onChange={setChartType} />

        {/* Chart display area */}
        <div
          ref={chartRef}
          id={`chart-panel-${chartType}`}
          role="tabpanel"
          aria-labelledby={`chart-type-${chartType}`}
          className="mt-6"
        >
          {renderChart()}
        </div>

        {/* Actions: Download and Share */}
        {hasData && (
          <div className="flex flex-col gap-4 pt-4 border-t border-secondary-200">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={actionsDisabled || isDownloading}
                aria-label="Download chart as PNG"
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-lg
                  font-medium text-sm transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-green-600 text-white
                  hover:bg-green-700
                  focus:ring-green-500
                `}
              >
                {isDownloading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Downloading...
                  </>
                ) : downloadSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Downloaded!
                  </>
                ) : (
                  <>
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
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download PNG
                  </>
                )}
              </button>

              <ShareButtons username={username} provider={provider} disabled={actionsDisabled} />
            </div>

            {downloadError && (
              <p className="text-sm text-error-600 text-center" role="alert">
                {downloadError}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
