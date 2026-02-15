/**
 * RadarChartView Component
 * Radar chart showing top languages
 */

import { memo, useMemo } from 'react'
import { Radar } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { radarChartOptions } from '../../config/chartDefaults'
import { normalizeSeries } from '../../utils/normalizeSeries'
import { LoadingState } from '../../../../shared/components/LoadingState'
import type { LanguageSeries } from '../../../../contracts/api'

export type RadarChartViewProps = {
  /** Language statistics series data */
  series: LanguageSeries[]
  /** Loading state */
  isLoading?: boolean
}

/**
 * Radar chart component for displaying top languages
 *
 * Features:
 * - Limited to top 8 languages (radar gets crowded with more)
 * - Excludes __forks__ from display
 * - Language colors preserved from API
 * - Tooltips with repository counts
 * - Responsive and accessible
 *
 * @example
 * ```typescript
 * <RadarChartView series={languageSeries} isLoading={false} />
 * ```
 */
export const RadarChartView = memo(function RadarChartView({
  series,
  isLoading = false,
}: RadarChartViewProps) {
  // Memoize normalized data
  const { labels, values, colors } = useMemo(
    () => normalizeSeries(series, { excludeForks: true, maxItems: 8 }),
    [series]
  )

  // Memoize chart data
  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Repositories',
          data: values,
          backgroundColor: colors.map((color) => `${color}33`),
          borderColor: colors,
          borderWidth: 2,
          pointBackgroundColor: colors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }),
    [labels, values, colors]
  )

  // Memoize chart options
  const options = useMemo(
    () => ({
      ...radarChartOptions,
      plugins: {
        ...radarChartOptions.plugins,
        tooltip: {
          ...radarChartOptions.plugins?.tooltip,
          callbacks: {
            label: (context: TooltipItem<'radar'>) => {
              const label = context.dataset.label || ''
              const value = context.parsed.r || 0
              return `${label}: ${value} repositories`
            },
          },
        },
      },
    }),
    []
  )

  if (isLoading) {
    return <LoadingState variant="chart" />
  }

  return (
    <div
      className="h-[28rem] w-full"
      role="img"
      aria-label="Radar chart of top programming languages"
    >
      <Radar data={data} options={options} />
    </div>
  )
})
