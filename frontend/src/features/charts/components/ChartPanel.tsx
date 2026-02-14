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
import { Button } from '../../../shared/components/Button'
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
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-secondary-200">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleDownload}
                disabled={actionsDisabled || isDownloading}
                loading={isDownloading}
                variant="secondary"
              >
                {downloadSuccess ? '✓ Downloaded' : 'Download PNG'}
              </Button>

              <ShareButtons username={username} provider={provider} disabled={actionsDisabled} />
            </div>

            {downloadError && (
              <p className="text-sm text-error-600" role="alert">
                {downloadError}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
