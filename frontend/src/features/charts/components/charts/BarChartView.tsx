/**
 * BarChartView Component
 * Horizontal bar chart showing language statistics
 */

import { memo, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { barChartOptions } from '../../config/chartDefaults'
import { normalizeData } from '../../utils/normalizeData'
import { LoadingState } from '../../../../shared/components/LoadingState'
import type { LanguageData } from '../../../../contracts/api'

export type BarChartViewProps = {
  /** Language statistics data */
  data: LanguageData[]
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
 * <BarChartView data={languageData} isLoading={false} />
 * ```
 */
export const BarChartView = memo(function BarChartView({
  data,
  isLoading = false,
}: BarChartViewProps) {
  // Memoize normalized data to prevent recalculation on every render
  const { labels, values, colors } = useMemo(() => normalizeData(data), [data])

  // Calculate total for percentages
  const total = useMemo(() => values.reduce((sum, value) => sum + value, 0), [values])

  // Memoize chart data object
  const chartData = useMemo(
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
    <div className="h-[28rem] w-full" role="img" aria-label="Bar chart of programming languages">
      <Bar data={chartData} options={options} />
    </div>
  )
})
