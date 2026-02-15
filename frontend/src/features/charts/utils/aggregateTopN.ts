/**
 * Utility for aggregating language series into Top-N + Others
 */

import type { LanguageSeries } from '../../../contracts/api'

export type TopNOption = 'all' | 'top10' | 'top25'

// Configurable limits for Top-N options
export const TOP_N_LIMITS: Record<Exclude<TopNOption, 'all'>, number> = {
  top10: 10,
  top25: 25,
}

// Color for the "Others" category
const OTHERS_COLOR = '#94a3b8' // secondary-400 from Tailwind

/**
 * Aggregates language series based on Top-N selection
 *
 * If 'all' is selected, returns the series as-is.
 * If 'topN' is selected, returns the top N items plus an "Others" aggregation.
 *
 * Backend already sorts by count descending, so we just slice and sum.
 *
 * @param series - Original language series data
 * @param topN - Selected Top-N option
 * @returns Aggregated series with "Others" if applicable
 *
 * @example
 * ```typescript
 * const aggregated = aggregateTopN(series, 'top10')
 * // Returns top 10 languages + "Others" if there are more than 10
 * ```
 */
export function aggregateTopN(series: LanguageSeries[], topN: TopNOption): LanguageSeries[] {
  // If 'all' selected, return original series
  if (topN === 'all') {
    return series
  }

  const limit = TOP_N_LIMITS[topN]

  // If series length is within limit, no need to aggregate
  if (series.length <= limit) {
    return series
  }

  // Split into top N and the rest
  const topItems = series.slice(0, limit)
  const remainingItems = series.slice(limit)

  // If there are no remaining items, return top items only
  if (remainingItems.length === 0) {
    return topItems
  }

  // Sum remaining items into "Others"
  const othersValue = remainingItems.reduce((sum, item) => sum + item.value, 0)

  const othersItem: LanguageSeries = {
    key: '__others__',
    label: 'Others',
    value: othersValue,
    color: OTHERS_COLOR,
  }

  return [...topItems, othersItem]
}
