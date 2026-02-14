/**
 * DoughnutChartView Component
 * Doughnut chart (pie with center hole) showing language distribution
 */

import { Doughnut } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { doughnutChartOptions } from '../../config/chartDefaults'
import { normalizeSeries } from '../../utils/normalizeSeries'
import { LoadingState } from '../../../../shared/components/LoadingState'
import type { LanguageSeries } from '../../../../contracts/api'

export type DoughnutChartViewProps = {
  /** Language statistics series data */
  series: LanguageSeries[]
  /** Loading state */
  isLoading?: boolean
}

/**
 * Doughnut chart component for displaying language distribution
 *
 * Features:
 * - Pie chart with center cutout
 * - Excludes __forks__ from display (reduces clutter)
 * - Language colors preserved from API
 * - Legend with language names
 * - Tooltips with counts and percentages
 * - Responsive and accessible
 *
 * @example
 * ```typescript
 * <DoughnutChartView series={languageSeries} isLoading={false} />
 * ```
 */
export function DoughnutChartView({ series, isLoading = false }: DoughnutChartViewProps) {
  if (isLoading) {
    return <LoadingState variant="chart" />
  }

  const { labels, values, colors } = normalizeSeries(series, {
    excludeForks: true, // Doughnut charts look cleaner without forks
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
    ...doughnutChartOptions,
    plugins: {
      ...doughnutChartOptions.plugins,
      tooltip: {
        ...doughnutChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
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
    <div className="h-96 w-full" role="img" aria-label="Doughnut chart of programming languages">
      <Doughnut data={data} options={options} />
    </div>
  )
}
