/**
 * PolarAreaChartView Component
 * Polar area chart showing language distribution with radial segments
 */

import { memo, useMemo } from 'react'
import { PolarArea } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { polarAreaChartOptions } from '../../config/chartDefaults'
import { normalizeData } from '../../utils/normalizeData'
import { LoadingState } from '../../../../shared/components/LoadingState'
import type { LanguageData } from '../../../../contracts/api'

export type PolarAreaChartViewProps = {
  /** Language statistics data */
  data: LanguageData[]
  /** Loading state */
  isLoading?: boolean
}

/**
 * Polar area chart component for displaying language distribution
 *
 * Features:
 * - Radial segments sized by repository count
 * - Displays all data from filtered data
 * - Language colors preserved from API
 * - Legend with language names
 * - Tooltips with counts and percentages
 * - Responsive and accessible
 *
 * @example
 * ```typescript
 * <PolarAreaChartView data={languageData} isLoading={false} />
 * ```
 */
export const PolarAreaChartView = memo(function PolarAreaChartView({
  data,
  isLoading = false,
}: PolarAreaChartViewProps) {
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
      ...polarAreaChartOptions,
      plugins: {
        ...polarAreaChartOptions.plugins,
        tooltip: {
          ...polarAreaChartOptions.plugins?.tooltip,
          callbacks: {
            label: (context: TooltipItem<'polarArea'>) => {
              const label = context.label || ''
              const value = context.parsed.r || 0
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
    <div
      className="h-[28rem] w-full"
      role="img"
      aria-label="Polar area chart of programming languages"
    >
      <PolarArea data={chartData} options={options} />
    </div>
  )
})
