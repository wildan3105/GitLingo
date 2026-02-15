/**
 * Tests for aggregateTopN utility
 */

import { describe, it, expect } from 'vitest'
import { aggregateTopN } from '../../../../src/features/charts/utils/aggregateTopN'
import type { LanguageSeries } from '../../../../src/contracts/api'

describe('aggregateTopN', () => {
  const createSeries = (count: number): LanguageSeries[] => {
    return Array.from({ length: count }, (_, i) => ({
      key: `lang${i}`,
      label: `Language ${i}`,
      value: count - i, // Descending values
      color: `#${i}${i}${i}`,
    }))
  }

  describe('all option', () => {
    it('returns original series when "all" is selected', () => {
      const series = createSeries(15)
      const result = aggregateTopN(series, 'all')

      expect(result).toEqual(series)
      expect(result.length).toBe(15)
    })

    it('handles empty series', () => {
      const result = aggregateTopN([], 'all')

      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })
  })

  describe('top10 option', () => {
    it('returns top 10 items when series has more than 10', () => {
      const series = createSeries(15)
      const result = aggregateTopN(series, 'top10')

      expect(result.length).toBe(11) // 10 + "Others"
      expect(result[10].key).toBe('__others__')
      expect(result[10].label).toBe('Others')
    })

    it('aggregates remaining items into "Others"', () => {
      const series = createSeries(15)
      const result = aggregateTopN(series, 'top10')

      const othersItem = result[10]
      // lang10-14 have values 5,4,3,2,1 = 15
      expect(othersItem.value).toBe(15)
      expect(othersItem.color).toBe('#94a3b8')
    })

    it('returns original series when series has exactly 10 items', () => {
      const series = createSeries(10)
      const result = aggregateTopN(series, 'top10')

      expect(result).toEqual(series)
      expect(result.length).toBe(10)
    })

    it('returns original series when series has less than 10 items', () => {
      const series = createSeries(5)
      const result = aggregateTopN(series, 'top10')

      expect(result).toEqual(series)
      expect(result.length).toBe(5)
    })

    it('handles empty series', () => {
      const result = aggregateTopN([], 'top10')

      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })
  })

  describe('top25 option', () => {
    it('returns top 25 items when series has more than 25', () => {
      const series = createSeries(30)
      const result = aggregateTopN(series, 'top25')

      expect(result.length).toBe(26) // 25 + "Others"
      expect(result[25].key).toBe('__others__')
      expect(result[25].label).toBe('Others')
    })

    it('aggregates remaining items into "Others"', () => {
      const series = createSeries(30)
      const result = aggregateTopN(series, 'top25')

      const othersItem = result[25]
      // lang25-29 have values 5,4,3,2,1 = 15
      expect(othersItem.value).toBe(15)
      expect(othersItem.color).toBe('#94a3b8')
    })

    it('returns original series when series has exactly 25 items', () => {
      const series = createSeries(25)
      const result = aggregateTopN(series, 'top25')

      expect(result).toEqual(series)
      expect(result.length).toBe(25)
    })

    it('returns original series when series has less than 25 items', () => {
      const series = createSeries(20)
      const result = aggregateTopN(series, 'top25')

      expect(result).toEqual(series)
      expect(result.length).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('handles series with one item correctly', () => {
      const series = createSeries(1)

      expect(aggregateTopN(series, 'top10')).toEqual(series)
      expect(aggregateTopN(series, 'top25')).toEqual(series)
      expect(aggregateTopN(series, 'all')).toEqual(series)
    })

    it('preserves original series data structure', () => {
      const series: LanguageSeries[] = [
        { key: 'js', label: 'JavaScript', value: 100, color: '#f7df1e' },
        { key: 'ts', label: 'TypeScript', value: 50, color: '#3178c6' },
      ]

      const result = aggregateTopN(series, 'all')

      expect(result[0]).toEqual(series[0])
      expect(result[1]).toEqual(series[1])
    })

    it('handles series with exactly limit + 1 items', () => {
      const series = createSeries(11) // 10 + 1
      const result = aggregateTopN(series, 'top10')

      expect(result.length).toBe(11) // 10 + "Others"
      expect(result[10].key).toBe('__others__')
      expect(result[10].value).toBe(1) // Only last item aggregated
    })
  })
})
