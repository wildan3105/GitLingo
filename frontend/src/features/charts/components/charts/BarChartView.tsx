/**
 * BarChartView Component
 * Horizontal bar chart showing language statistics
 */

import { memo, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { barChartOptions } from '../../config/chartDefaults'
import { normalizeSeries } from '../../utils/normalizeSeries'
import { LoadingState } from '../../../../shared/components/LoadingState'
import type { LanguageSeries } from '../../../../contracts/api'

export type BarChartViewProps = {
  /** Language statistics series data */
  series: LanguageSeries[]
  /** Loading state */
  isLoading?: boolean
}

/**
 * Bar chart component for displaying language statistics
 *
 * Features:
 * - Horizontal orientation (better for many languages)
 * - Language colors preserved from API
 * - Tooltips with repository counts
 * - Responsive and accessible
 *
 * @example
 * ```typescript
 * <BarChartView series={languageSeries} isLoading={false} />
 * ```
 */
export const BarChartView = memo(function BarChartView({
  series,
  isLoading = false,
}: BarChartViewProps) {
  // Memoize normalized data to prevent recalculation on every render
  const { labels, values, colors } = useMemo(() => normalizeSeries(series), [series])

  // Calculate total for percentages
  const total = useMemo(() => values.reduce((sum, value) => sum + value, 0), [values])

  // Memoize chart data object
  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Repositories',
          data: values,
          backgroundColor: colors,
          borderColor: colors.map((color) => color),
          borderWidth: 1,
        },
      ],
    }),
    [labels, values, colors]
  )

  // Memoize chart options with tooltip callback
  const options = useMemo(
    () => ({
      ...barChartOptions,
      plugins: {
        ...barChartOptions.plugins,
        tooltip: {
          ...barChartOptions.plugins?.tooltip,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const label = context.dataset.label || ''
              const value = context.parsed.x || 0
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
              return `${label}: ${value} repositories (${percentage}%)`
            },
          },
        },
      },
    }),
    [total]
  )

  if (isLoading) {
    return <LoadingState variant="chart" />
  }

  return (
    <div className="h-96 w-full" role="img" aria-label="Bar chart of programming languages">
      <Bar data={data} options={options} />
    </div>
  )
})
