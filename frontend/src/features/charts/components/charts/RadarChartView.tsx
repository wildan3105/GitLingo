/**
 * RadarChartView Component
 * Radar chart showing top languages
 */

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
export function RadarChartView({ series, isLoading = false }: RadarChartViewProps) {
  if (isLoading) {
    return <LoadingState variant="chart" />
  }

  const { labels, values, colors } = normalizeSeries(series, {
    excludeForks: true, // Exclude forks from radar
    maxItems: 8, // Limit to top 8 to avoid clutter
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Repositories',
        data: values,
        backgroundColor: colors.map((color) => `${color}33`), // 20% opacity
        borderColor: colors,
        borderWidth: 2,
        pointBackgroundColor: colors,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
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
  }

  return (
    <div className="h-96 w-full" role="img" aria-label="Radar chart of top programming languages">
      <Radar data={data} options={options} />
    </div>
  )
}
