/**
 * Chart Data Normalization Utilities
 * Transforms API data into chart-compatible format
 */

import type { LanguageData } from '../../../contracts/api'

/**
 * Normalized chart data format
 */
export type NormalizedChartData = {
  /** Language names for chart labels */
  labels: string[]
  /** Repository counts for chart values */
  values: number[]
  /** Language colors for chart display */
  colors: string[]
}

/**
 * Options for normalizing data
 */
export type NormalizeOptions = {
  /** Whether to exclude the __forks__ entry from results */
  excludeForks?: boolean
  /** Maximum number of items to include (takes top N by value) */
  maxItems?: number
}

/**
 * Normalizes language data for chart consumption
 *
 * Transforms the API data format into a simplified structure
 * with separate arrays for labels, values, and colors that can
 * be directly consumed by chart libraries.
 *
 * @param data - Array of language statistics from API
 * @param options - Optional configuration for filtering/limiting data
 * @returns Normalized data with labels, values, and colors arrays
 *
 * @example
 * ```typescript
 * const data = [
 *   { key: 'JavaScript', value: 25, color: '#f1e05a' },
 *   { key: 'TypeScript', value: 15, color: '#3178c6' },
 *   { key: '__forks__', value: 5, color: '#cccccc' }
 * ]
 *
 * // Include all items
 * normalizeData(data)
 * // { labels: ['JavaScript', 'TypeScript', '__forks__'], values: [25, 15, 5], colors: [...] }
 *
 * // Exclude forks
 * normalizeData(data, { excludeForks: true })
 * // { labels: ['JavaScript', 'TypeScript'], values: [25, 15], colors: [...] }
 *
 * // Limit to top 2
 * normalizeData(data, { maxItems: 2 })
 * // { labels: ['JavaScript', 'TypeScript'], values: [25, 15], colors: [...] }
 * ```
 */
export function normalizeData(
  data: LanguageData[],
  options?: NormalizeOptions
): NormalizedChartData {
  const { excludeForks = false, maxItems } = options || {}

  // Filter out forks if requested
  let filteredData = data
  if (excludeForks) {
    filteredData = data.filter((item) => item.key !== '__forks__')
  }

  // Limit to maxItems if specified
  if (maxItems !== undefined && maxItems >= 0) {
    filteredData = filteredData.slice(0, maxItems)
  }

  // Transform to separate arrays
  const labels = filteredData.map((item) => item.label)
  const values = filteredData.map((item) => item.value)
  const colors = filteredData.map((item) => item.color)

  return {
    labels,
    values,
    colors,
  }
}
