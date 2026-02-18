/**
 * Utility for aggregating language data into Top-N + Others
 */

import type { LanguageData } from '../../../contracts/api'

export type TopNOption = 'all' | 'top10' | 'top25'

// Configurable limits for Top-N options
export const TOP_N_LIMITS: Record<Exclude<TopNOption, 'all'>, number> = {
  top10: 10,
  top25: 25,
}

// Color for the "Others" category
const OTHERS_COLOR = '#94a3b8' // secondary-400 from Tailwind

/**
 * Aggregates language data based on Top-N selection
 *
 * If 'all' is selected, returns the data as-is.
 * If 'topN' is selected, returns the top N items plus an "Others" aggregation.
 *
 * Backend already sorts by count descending, so we just slice and sum.
 *
 * @param data - Original language data
 * @param topN - Selected Top-N option
 * @returns Aggregated data with "Others" if applicable
 *
 * @example
 * ```typescript
 * const aggregated = aggregateTopN(data, 'top10')
 * // Returns top 10 languages + "Others" if there are more than 10
 * ```
 */
export function aggregateTopN(data: LanguageData[], topN: TopNOption): LanguageData[] {
  // If 'all' selected, return original data
  if (topN === 'all') {
    return data
  }

  const limit = TOP_N_LIMITS[topN]

  // If data length is within limit, no need to aggregate
  if (data.length <= limit) {
    return data
  }

  // Split into top N and the rest
  const topItems = data.slice(0, limit)
  const remainingItems = data.slice(limit)

  // If there are no remaining items, return top items only
  if (remainingItems.length === 0) {
    return topItems
  }

  // Sum remaining items into "Others"
  const othersValue = remainingItems.reduce((sum, item) => sum + item.value, 0)

  const othersItem: LanguageData = {
    key: '__others__',
    label: 'Others',
    value: othersValue,
    color: OTHERS_COLOR,
  }

  return [...topItems, othersItem]
}
