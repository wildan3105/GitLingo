/**
 * PieChartView Component
 * Pie chart showing language distribution
 */

import { Pie } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { pieChartOptions } from '../../config/chartDefaults'
import { normalizeSeries } from '../../utils/normalizeSeries'
import { LoadingState } from '../../../../shared/components/LoadingState'
import type { LanguageSeries } from '../../../../contracts/api'

export type PieChartViewProps = {
  /** Language statistics series data */
  series: LanguageSeries[]
  /** Loading state */
  isLoading?: boolean
}

/**
 * Pie chart component for displaying language distribution
 *
 * Features:
 * - Excludes __forks__ from display (reduces clutter)
 * - Language colors preserved from API
 * - Legend with language names
 * - Tooltips with counts and percentages
 * - Responsive and accessible
 *
 * @example
 * ```typescript
 * <PieChartView series={languageSeries} isLoading={false} />
 * ```
 */
export function PieChartView({ series, isLoading = false }: PieChartViewProps) {
  if (isLoading) {
    return <LoadingState variant="chart" />
  }

  const { labels, values, colors } = normalizeSeries(series, {
    excludeForks: true, // Pie charts look cleaner without forks
  })

  // Calculate total for percentages
  const total = values.reduce((sum, value) => sum + value, 0)

  const data = {
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
  }

  const options = {
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
  }

  return (
    <div className="h-96 w-full" role="img" aria-label="Pie chart of programming languages">
      <Pie data={data} options={options} />
    </div>
  )
}
