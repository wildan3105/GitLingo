/**
 * Tests for aggregateTopN utility
 */

import { describe, it, expect } from 'vitest'
import { aggregateTopN } from '../../../../src/features/charts/utils/aggregateTopN'
import type { LanguageData } from '../../../../src/contracts/api'

describe('aggregateTopN', () => {
  const createData = (count: number): LanguageData[] => {
    return Array.from({ length: count }, (_, i) => ({
      key: `lang${i}`,
      label: `Language ${i}`,
      value: count - i, // Descending values
      color: `#${i}${i}${i}`,
    }))
  }

  describe('all option', () => {
    it('returns original data when "all" is selected', () => {
      const data = createData(15)
      const result = aggregateTopN(data, 'all')

      expect(result).toEqual(data)
      expect(result.length).toBe(15)
    })

    it('handles empty data', () => {
      const result = aggregateTopN([], 'top10')

      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })
  })

  describe('top10 option', () => {
    it('returns top 10 items when data has more than 10', () => {
      const data = createData(15)
      const result = aggregateTopN(data, 'top10')

      expect(result.length).toBe(11) // 10 + "Others"
      expect(result[10].key).toBe('__others__')
      expect(result[10].label).toBe('Others')
    })

    it('aggregates remaining items into "Others"', () => {
      const data = createData(15)
      const result = aggregateTopN(data, 'top10')

      const othersItem = result[10]
      // lang10-14 have values 5,4,3,2,1 = 15
      expect(othersItem.value).toBe(15)
      expect(othersItem.color).toBe('#94a3b8')
    })

    it('returns original data when data has exactly 10 items', () => {
      const data = createData(10)
      const result = aggregateTopN(data, 'top10')

      expect(result).toEqual(data)
      expect(result.length).toBe(10)
    })

    it('returns original data when data has less than 10 items', () => {
      const data = createData(5)
      const result = aggregateTopN(data, 'top10')

      expect(result).toEqual(data)
      expect(result.length).toBe(5)
    })

    it('handles empty data', () => {
      const result = aggregateTopN([], 'top10')

      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })
  })

  describe('top25 option', () => {
    it('returns top 25 items when data has more than 25', () => {
      const data = createData(30)
      const result = aggregateTopN(data, 'top25')

      expect(result.length).toBe(26) // 25 + "Others"
      expect(result[25].key).toBe('__others__')
      expect(result[25].label).toBe('Others')
    })

    it('aggregates remaining items into "Others"', () => {
      const data = createData(30)
      const result = aggregateTopN(data, 'top25')

      const othersItem = result[25]
      // lang25-29 have values 5,4,3,2,1 = 15
      expect(othersItem.value).toBe(15)
      expect(othersItem.color).toBe('#94a3b8')
    })

    it('returns original data when data has exactly 25 items', () => {
      const data = createData(25)
      const result = aggregateTopN(data, 'top25')

      expect(result).toEqual(data)
      expect(result.length).toBe(25)
    })

    it('returns original data when data has less than 25 items', () => {
      const data = createData(20)
      const result = aggregateTopN(data, 'top25')

      expect(result).toEqual(data)
      expect(result.length).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('handles data with one item correctly', () => {
      const data = createData(1)

      expect(aggregateTopN(data, 'top10')).toEqual(data)
      expect(aggregateTopN(data, 'top25')).toEqual(data)
      expect(aggregateTopN(data, 'all')).toEqual(data)
    })

    it('preserves original data structure', () => {
      const data: LanguageData[] = [
        { key: 'js', label: 'JavaScript', value: 100, color: '#f7df1e' },
        { key: 'ts', label: 'TypeScript', value: 50, color: '#3178c6' },
      ]

      const result = aggregateTopN(data, 'top10')

      expect(result[0]).toEqual(data[0])
      expect(result[1]).toEqual(data[1])
    })

    it('handles data with exactly limit + 1 items', () => {
      const data = createData(11) // 10 + 1
      const result = aggregateTopN(data, 'top10')

      expect(result.length).toBe(11) // 10 + "Others"
      expect(result[10].key).toBe('__others__')
      expect(result[10].value).toBe(1) // Only last item aggregated
    })
  })
})
