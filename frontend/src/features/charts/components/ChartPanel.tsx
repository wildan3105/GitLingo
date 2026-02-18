/**
 * ChartPanel Component
 * Main chart container that manages chart type selection and rendering
 */

import { useState, useRef } from 'react'
import { ChartTypeSelect, type ChartType } from './ChartTypeSelect'
import { BarChartView } from './charts/BarChartView'
import { PieChartView } from './charts/PieChartView'
import { PolarAreaChartView } from './charts/PolarAreaChartView'
import { Card } from '../../../shared/components/Card'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'
import { Dropdown, type DropdownItem } from '../../../shared/components/Dropdown'
import { Checkbox } from '../../../shared/components/Checkbox'
import { SegmentedControl, type SegmentedOption } from '../../../shared/components/SegmentedControl'
import { downloadChart } from '../utils/downloadChart'
import { exportToCSV } from '../../export/utils/exportToCSV'
import { aggregateTopN, type TopNOption } from '../utils/aggregateTopN'
import { useToast } from '../../../shared/hooks/useToast'
import type { LanguageData } from '../../../contracts/api'

// Top-N options for segmented control
const TOP_N_OPTIONS: SegmentedOption<TopNOption>[] = [
  { value: 'top10', label: 'Top 10' },
  { value: 'top25', label: 'Top 25' },
  { value: 'all', label: 'All languages' },
]

export type ChartPanelProps = {
  /** Language statistics data */
  data: LanguageData[]
  /** GitHub username */
  username: string
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
 *   data={languageData}
 *   username="octocat"
 *   isLoading={isLoading}
 *   error={error?.message}
 * />
 * ```
 */
export function ChartPanel({
  data,
  username,
  isLoading = false,
  error,
  includeForks,
  setIncludeForks,
  includeUnknownLanguage,
  setIncludeUnknownLanguage,
  hasOriginalData = true,
}: ChartPanelProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [topN, setTopN] = useState<TopNOption>('all')
  const [isExporting, setIsExporting] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Apply Top-N aggregation to data
  const aggregatedData = aggregateTopN(data, topN)

  // Show error state
  if (error && !isLoading) {
    return (
      <Card>
        <ErrorState code="generic" message={error} />
      </Card>
    )
  }

  // Show empty state only if user has no repositories at all
  if (!isLoading && data.length === 0 && !hasOriginalData) {
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
      const filename = `${username}-languages`
      exportToCSV(data, filename)
      showToast({ type: 'success', message: 'CSV exported successfully!' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      showToast({ type: 'error', message })
    }
  }

  // Handle Copy URL
  const handleCopyURL = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      showToast({ type: 'success', message: 'URL copied to clipboard!' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to copy URL'
      showToast({ type: 'error', message })
    }
  }

  // Share dropdown items
  const SHARE_ITEMS: DropdownItem[] = [
    {
      id: 'copy-url',
      label: 'Copy URL',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      onClick: handleCopyURL,
      disabled: false,
    },
    {
      id: 'download-png',
      label: 'Download PNG',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      onClick: handleDownloadCSV,
      disabled: false,
    },
  ]

  // Render chart based on selected type
  const renderChart = () => {
    const chartProps = { data: aggregatedData, isLoading }

    switch (chartType) {
      case 'pie':
        return <PieChartView {...chartProps} />
      case 'polar':
        return <PolarAreaChartView {...chartProps} />
      case 'bar':
      default:
        return <BarChartView {...chartProps} />
    }
  }

  const hasData = !isLoading && data.length > 0

  return (
    <Card variant="prominent" padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">Language Statistics</h2>
          <p className="text-sm text-secondary-600 mt-1 leading-relaxed">
            Programming languages used across repositories
          </p>
        </div>

        {/* Unified Toolbar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-secondary-200">
          {/* Left: Chart Types */}
          <div className="flex-shrink-0">
            <ChartTypeSelect value={chartType} onChange={setChartType} />
          </div>

          {/* Middle: Top-N Selector */}
          <div className="flex-shrink-0">
            <SegmentedControl
              options={TOP_N_OPTIONS}
              value={topN}
              onChange={setTopN}
              disabled={isLoading}
            />
          </div>

          {/* Right: Advanced + Export */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Advanced Dropdown (Filters) */}
            <Dropdown
              trigger={
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  Advanced
                </>
              }
              items={[
                {
                  id: 'advanced-filters',
                  label: '',
                  onClick: () => {},
                  disabled: true,
                },
              ]}
              customContent={
                <div className="px-4 py-3 min-w-[200px]">
                  <p className="text-xs font-medium text-secondary-700 mb-3">Filter Options</p>
                  <div className="space-y-2.5">
                    <Checkbox
                      id="advanced-include-forks"
                      label="Include fork"
                      checked={includeForks}
                      onChange={setIncludeForks}
                      disabled={isLoading}
                    />
                    <Checkbox
                      id="advanced-include-unknown"
                      label="Include unknown"
                      checked={includeUnknownLanguage}
                      onChange={setIncludeUnknownLanguage}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              }
            />

            {/* Share Dropdown */}
            <Dropdown
              trigger={
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </>
              }
              items={SHARE_ITEMS}
              disabled={!hasData || isExporting}
            />
          </div>
        </div>

        {/* Chart display area */}
        <div
          ref={chartRef}
          id={`chart-panel-${chartType}`}
          role="tabpanel"
          aria-labelledby={`chart-type-${chartType}`}
          aria-busy={isLoading}
          className="mt-6"
        >
          {data.length === 0 && hasOriginalData ? (
            <div className="flex items-center justify-center h-[28rem] bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-300 transition-all duration-200">
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
                <h3 className="mt-4 text-lg font-semibold text-secondary-900">
                  No repositories match your filters
                </h3>
                <p className="mt-2 text-sm text-secondary-600 leading-relaxed">
                  Try adjusting the filter options above to see more data.
                </p>
              </div>
            </div>
          ) : (
            <div key={chartType} className="animate-fade-in-up">
              {renderChart()}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
