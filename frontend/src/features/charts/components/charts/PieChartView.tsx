/**
 * PieChartView Component
 * Pie chart showing language distribution
 */

import { memo, useMemo } from 'react'
import { Pie } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { pieChartOptions } from '../../config/chartDefaults'
import { normalizeData } from '../../utils/normalizeData'
import { LoadingState } from '../../../../shared/components/LoadingState'
import type { LanguageData } from '../../../../contracts/api'

export type PieChartViewProps = {
  /** Language statistics data */
  data: LanguageData[]
  /** Loading state */
  isLoading?: boolean
}

/**
 * Pie chart component for displaying language distribution
 *
 * Features:
 * - Displays all data from filtered data
 * - Language colors preserved from API
 * - Legend with language names
 * - Tooltips with counts and percentages
 * - Responsive and accessible
 *
 * @example
 * ```typescript
 * <PieChartView data={languageData} isLoading={false} />
 * ```
 */
export const PieChartView = memo(function PieChartView({
  data,
  isLoading = false,
}: PieChartViewProps) {
  // Memoize normalized data
  const { labels, values, colors } = useMemo(() => normalizeData(data), [data])

  // Calculate total for percentages
  const total = useMemo(() => values.reduce((sum, value) => sum + value, 0), [values])

  // Memoize chart data
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Repositories',
          data: values,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }),
    [labels, values, colors]
  )

  // Memoize chart options
  const options = useMemo(
    () => ({
      ...pieChartOptions,
      plugins: {
        ...pieChartOptions.plugins,
        tooltip: {
          ...pieChartOptions.plugins?.tooltip,
          callbacks: {
            label: (context: TooltipItem<'pie'>) => {
              const label = context.label || ''
              const value = context.parsed || 0
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
    <div className="h-[28rem] w-full" role="img" aria-label="Pie chart of programming languages">
      <Pie data={chartData} options={options} />
    </div>
  )
})
