/**
 * normalizeData Utility Tests
 */

import { describe, it, expect } from 'vitest'
import { normalizeData } from '../../../../src/features/charts/utils/normalizeData'
import type { LanguageData } from '../../../../src/contracts/api'

describe('normalizeData', () => {
  const mockData: LanguageData[] = [
    { key: 'JavaScript', label: 'JavaScript', value: 25, color: '#f1e05a' },
    { key: 'TypeScript', label: 'TypeScript', value: 15, color: '#3178c6' },
    { key: 'Python', label: 'Python', value: 10, color: '#3572A5' },
    { key: '__forks__', label: 'Forked repos', value: 5, color: '#cccccc' },
    { key: 'Go', label: 'Go', value: 3, color: '#00ADD8' },
  ]

  describe('basic transformation', () => {
    it('transforms data into separate arrays', () => {
      const result = normalizeData(mockData)

      expect(result.labels).toEqual(['JavaScript', 'TypeScript', 'Python', 'Forked repos', 'Go'])
      expect(result.values).toEqual([25, 15, 10, 5, 3])
      expect(result.colors).toEqual(['#f1e05a', '#3178c6', '#3572A5', '#cccccc', '#00ADD8'])
    })

    it('returns arrays of equal length', () => {
      const result = normalizeData(mockData)

      expect(result.labels.length).toBe(result.values.length)
      expect(result.values.length).toBe(result.colors.length)
    })

    it('preserves order from input data', () => {
      const result = normalizeData(mockData)

      // First item should be JavaScript
      expect(result.labels[0]).toBe('JavaScript')
      expect(result.values[0]).toBe(25)
      expect(result.colors[0]).toBe('#f1e05a')

      // Last item should be Go
      expect(result.labels[4]).toBe('Go')
      expect(result.values[4]).toBe(3)
      expect(result.colors[4]).toBe('#00ADD8')
    })
  })

  describe('excludeForks option', () => {
    it('excludes __forks__ when excludeForks is true', () => {
      const result = normalizeData(mockData, { excludeForks: true })

      expect(result.labels).not.toContain('Forked repos')
      expect(result.labels).toEqual(['JavaScript', 'TypeScript', 'Python', 'Go'])
      expect(result.values).toEqual([25, 15, 10, 3])
      expect(result.colors.length).toBe(4)
    })

    it('includes __forks__ when excludeForks is false', () => {
      const result = normalizeData(mockData, { excludeForks: false })

      expect(result.labels).toContain('Forked repos')
      expect(result.labels.length).toBe(5)
    })

    it('includes __forks__ by default when option not provided', () => {
      const result = normalizeData(mockData)

      expect(result.labels).toContain('Forked repos')
    })
  })

  describe('maxItems option', () => {
    it('limits to maxItems when specified', () => {
      const result = normalizeData(mockData, { maxItems: 3 })

      expect(result.labels.length).toBe(3)
      expect(result.values.length).toBe(3)
      expect(result.colors.length).toBe(3)
    })

    it('returns top N items by preserving original order', () => {
      const result = normalizeData(mockData, { maxItems: 2 })

      expect(result.labels).toEqual(['JavaScript', 'TypeScript'])
      expect(result.values).toEqual([25, 15])
    })

    it('returns all items when maxItems exceeds data length', () => {
      const result = normalizeData(mockData, { maxItems: 100 })

      expect(result.labels.length).toBe(mockData.length)
    })

    it('returns empty arrays when maxItems is 0', () => {
      const result = normalizeData(mockData, { maxItems: 0 })

      expect(result.labels).toEqual([])
      expect(result.values).toEqual([])
      expect(result.colors).toEqual([])
    })

    it('ignores maxItems when not provided', () => {
      const result = normalizeData(mockData)

      expect(result.labels.length).toBe(mockData.length)
    })
  })

  describe('combined options', () => {
    it('excludes forks and limits to maxItems', () => {
      const result = normalizeData(mockData, {
        excludeForks: true,
        maxItems: 2,
      })

      expect(result.labels).toEqual(['JavaScript', 'TypeScript'])
      expect(result.labels).not.toContain('Forked repos')
      expect(result.values).toEqual([25, 15])
      expect(result.colors.length).toBe(2)
    })

    it('applies excludeForks before maxItems', () => {
      const result = normalizeData(mockData, {
        excludeForks: true,
        maxItems: 4,
      })

      // Should have 4 items after excluding forks
      expect(result.labels).toEqual(['JavaScript', 'TypeScript', 'Python', 'Go'])
      expect(result.labels).not.toContain('Forked repos')
    })
  })

  describe('edge cases', () => {
    it('handles empty data array', () => {
      const result = normalizeData([])

      expect(result.labels).toEqual([])
      expect(result.values).toEqual([])
      expect(result.colors).toEqual([])
    })

    it('handles data with only __forks__', () => {
      const forksOnly: LanguageData[] = [
        { key: '__forks__', label: 'Forked repos', value: 10, color: '#cccccc' },
      ]

      const result = normalizeData(forksOnly, { excludeForks: true })

      expect(result.labels).toEqual([])
      expect(result.values).toEqual([])
      expect(result.colors).toEqual([])
    })

    it('handles data with single item', () => {
      const singleItem: LanguageData[] = [
        { key: 'Rust', label: 'Rust', value: 42, color: '#dea584' },
      ]

      const result = normalizeData(singleItem)

      expect(result.labels).toEqual(['Rust'])
      expect(result.values).toEqual([42])
      expect(result.colors).toEqual(['#dea584'])
    })

    it('handles data with duplicate keys', () => {
      const duplicates: LanguageData[] = [
        { key: 'JavaScript', label: 'JavaScript', value: 10, color: '#f1e05a' },
        { key: 'JavaScript', label: 'JavaScript', value: 5, color: '#f1e05a' },
      ]

      const result = normalizeData(duplicates)

      expect(result.labels).toEqual(['JavaScript', 'JavaScript'])
      expect(result.values).toEqual([10, 5])
    })

    it('handles data with zero values', () => {
      const withZeros: LanguageData[] = [
        { key: 'JavaScript', label: 'JavaScript', value: 10, color: '#f1e05a' },
        { key: 'TypeScript', label: 'TypeScript', value: 0, color: '#3178c6' },
        { key: 'Python', label: 'Python', value: 5, color: '#3572A5' },
      ]

      const result = normalizeData(withZeros)

      expect(result.labels).toEqual(['JavaScript', 'TypeScript', 'Python'])
      expect(result.values).toEqual([10, 0, 5])
    })
  })

  describe('pure function behavior', () => {
    it('does not mutate input data', () => {
      const originalData = [...mockData]
      const dataCopy = [...mockData]

      normalizeData(dataCopy, { excludeForks: true, maxItems: 2 })

      expect(dataCopy).toEqual(originalData)
    })

    it('returns same result for same input', () => {
      const result1 = normalizeData(mockData, {
        excludeForks: true,
        maxItems: 3,
      })
      const result2 = normalizeData(mockData, {
        excludeForks: true,
        maxItems: 3,
      })

      expect(result1).toEqual(result2)
    })
  })
})
