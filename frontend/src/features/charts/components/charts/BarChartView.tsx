/**
 * BarChartView Component
 * Horizontal bar chart showing language statistics
 */

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
export function BarChartView({ series, isLoading = false }: BarChartViewProps) {
  if (isLoading) {
    return <LoadingState variant="chart" />
  }

  const { labels, values, colors } = normalizeSeries(series)

  // Calculate total for percentages
  const total = values.reduce((sum, value) => sum + value, 0)

  const data = {
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
  }

  const options = {
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
  }

  return (
    <div className="h-96 w-full" role="img" aria-label="Bar chart of programming languages">
      <Bar data={data} options={options} />
    </div>
  )
}
