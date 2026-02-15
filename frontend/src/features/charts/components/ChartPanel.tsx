/**
 * ChartPanel Component
 * Main chart container that manages chart type selection and rendering
 */

import { useState, useRef } from 'react'
import { ChartTypeSelect, type ChartType } from './ChartTypeSelect'
import { BarChartView } from './charts/BarChartView'
import { PieChartView } from './charts/PieChartView'
import { PolarAreaChartView } from './charts/PolarAreaChartView'
import { RadarChartView } from './charts/RadarChartView'
import { Card } from '../../../shared/components/Card'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'
import { Dropdown, type DropdownItem } from '../../../shared/components/Dropdown'
import { Checkbox } from '../../../shared/components/Checkbox'
import { downloadChart } from '../utils/downloadChart'
import { exportToCSV } from '../../export/utils/exportToCSV'
import { useToast } from '../../../shared/hooks/useToast'
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
  /** Whether to include forked repositories in results */
  includeForks: boolean
  /** Update include forks filter */
  setIncludeForks: (value: boolean) => void
  /** Whether to include unknown language repositories in results */
  includeUnknownLanguage: boolean
  /** Update include unknown language filter */
  setIncludeUnknownLanguage: (value: boolean) => void
  /** Whether the user has any repositories (before filtering) */
  hasOriginalData?: boolean
}

/**
 * Main chart panel component
 *
 * Features:
 * - Chart type selection (bar, pie, radar)
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
  includeForks,
  setIncludeForks,
  includeUnknownLanguage,
  setIncludeUnknownLanguage,
  hasOriginalData = true,
}: ChartPanelProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [isExporting, setIsExporting] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Show error state
  if (error && !isLoading) {
    return (
      <Card>
        <ErrorState code="generic" message={error} />
      </Card>
    )
  }

  // Show empty state only if user has no repositories at all
  if (!isLoading && series.length === 0 && !hasOriginalData) {
    return (
      <Card>
        <EmptyState
          title="No language data"
          description="This user doesn't have any repositories with detected programming languages."
        />
      </Card>
    )
  }

  // Handle PNG download
  const handleDownloadPNG = async () => {
    if (!chartRef.current) {
      showToast({ type: 'error', message: 'Chart not found' })
      return
    }

    setIsExporting(true)

    try {
      await downloadChart(chartRef.current, {
        username,
        provider,
        chartType,
      })

      showToast({ type: 'success', message: 'Chart downloaded successfully!' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed'
      showToast({ type: 'error', message })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle CSV download
  const handleDownloadCSV = () => {
    try {
      const filename = `${username}-${provider}-languages`
      exportToCSV(series, filename)
      showToast({ type: 'success', message: 'CSV exported successfully!' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      showToast({ type: 'error', message })
    }
  }

  // Render chart based on selected type
  const renderChart = () => {
    const chartProps = { series, isLoading }

    switch (chartType) {
      case 'pie':
        return <PieChartView {...chartProps} />
      case 'polar':
        return <PolarAreaChartView {...chartProps} />
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
    <Card variant="prominent" padding="lg">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">Language Statistics</h2>
            <p className="text-sm text-secondary-600 mt-2">
              Programming languages used across repositories
            </p>
          </div>

          {/* Options - Filter Checkboxes */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-secondary-700">Options</h3>
            <div className="flex flex-col gap-2.5">
              <Checkbox
                id="chart-include-forks"
                label="Include fork"
                checked={includeForks}
                onChange={setIncludeForks}
                disabled={isLoading}
              />
              <Checkbox
                id="chart-include-unknown"
                label="Include unknown"
                checked={includeUnknownLanguage}
                onChange={setIncludeUnknownLanguage}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <ChartTypeSelect value={chartType} onChange={setChartType} />

        {/* Chart display area */}
        <div
          ref={chartRef}
          id={`chart-panel-${chartType}`}
          role="tabpanel"
          aria-labelledby={`chart-type-${chartType}`}
          aria-busy={isLoading}
          className="mt-6"
        >
          {series.length === 0 && hasOriginalData ? (
            <div className="flex items-center justify-center h-[28rem] bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-300">
              <div className="text-center px-4">
                <svg
                  className="mx-auto h-12 w-12 text-secondary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-secondary-900">
                  No repositories match your filters
                </h3>
                <p className="mt-2 text-sm text-secondary-600">
                  Try adjusting the filter options above to see more data.
                </p>
              </div>
            </div>
          ) : (
            renderChart()
          )}
        </div>

        {/* Actions: Export */}
        {hasData && (
          <div className="flex flex-col gap-3 pt-4 border-t border-secondary-200">
            <div className="flex items-center justify-center">
              <Dropdown
                trigger={
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export
                  </>
                }
                items={
                  [
                    {
                      id: 'download-png',
                      label: 'Download PNG',
                      icon: (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      ),
                      onClick: handleDownloadPNG,
                      disabled: isExporting,
                    },
                    {
                      id: 'download-csv',
                      label: 'Download CSV',
                      icon: (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      ),
                      onClick: handleDownloadCSV,
                    },
                  ] as DropdownItem[]
                }
                className="bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500"
                disabled={actionsDisabled}
                align="center"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
