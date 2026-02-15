/**
 * normalizeSeries Utility Tests
 */

import { describe, it, expect } from 'vitest'
import { normalizeSeries } from '../../../../src/features/charts/utils/normalizeSeries'
import type { LanguageSeries } from '../../../../src/contracts/api'

describe('normalizeSeries', () => {
  const mockSeries: LanguageSeries[] = [
    { key: 'JavaScript', label: 'JavaScript', value: 25, color: '#f1e05a' },
    { key: 'TypeScript', label: 'TypeScript', value: 15, color: '#3178c6' },
    { key: 'Python', label: 'Python', value: 10, color: '#3572A5' },
    { key: '__forks__', label: 'Forked repos', value: 5, color: '#cccccc' },
    { key: 'Go', label: 'Go', value: 3, color: '#00ADD8' },
  ]

  describe('basic transformation', () => {
    it('transforms series into separate arrays', () => {
      const result = normalizeSeries(mockSeries)

      expect(result.labels).toEqual(['JavaScript', 'TypeScript', 'Python', 'Forked repos', 'Go'])
      expect(result.values).toEqual([25, 15, 10, 5, 3])
      expect(result.colors).toEqual(['#f1e05a', '#3178c6', '#3572A5', '#cccccc', '#00ADD8'])
    })

    it('returns arrays of equal length', () => {
      const result = normalizeSeries(mockSeries)

      expect(result.labels.length).toBe(result.values.length)
      expect(result.values.length).toBe(result.colors.length)
    })

    it('preserves order from input series', () => {
      const result = normalizeSeries(mockSeries)

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
      const result = normalizeSeries(mockSeries, { excludeForks: true })

      expect(result.labels).not.toContain('Forked repos')
      expect(result.labels).toEqual(['JavaScript', 'TypeScript', 'Python', 'Go'])
      expect(result.values).toEqual([25, 15, 10, 3])
      expect(result.colors.length).toBe(4)
    })

    it('includes __forks__ when excludeForks is false', () => {
      const result = normalizeSeries(mockSeries, { excludeForks: false })

      expect(result.labels).toContain('Forked repos')
      expect(result.labels.length).toBe(5)
    })

    it('includes __forks__ by default when option not provided', () => {
      const result = normalizeSeries(mockSeries)

      expect(result.labels).toContain('Forked repos')
    })
  })

  describe('maxItems option', () => {
    it('limits to maxItems when specified', () => {
      const result = normalizeSeries(mockSeries, { maxItems: 3 })

      expect(result.labels.length).toBe(3)
      expect(result.values.length).toBe(3)
      expect(result.colors.length).toBe(3)
    })

    it('returns top N items by preserving original order', () => {
      const result = normalizeSeries(mockSeries, { maxItems: 2 })

      expect(result.labels).toEqual(['JavaScript', 'TypeScript'])
      expect(result.values).toEqual([25, 15])
    })

    it('returns all items when maxItems exceeds series length', () => {
      const result = normalizeSeries(mockSeries, { maxItems: 100 })

      expect(result.labels.length).toBe(mockSeries.length)
    })

    it('returns empty arrays when maxItems is 0', () => {
      const result = normalizeSeries(mockSeries, { maxItems: 0 })

      expect(result.labels).toEqual([])
      expect(result.values).toEqual([])
      expect(result.colors).toEqual([])
    })

    it('ignores maxItems when not provided', () => {
      const result = normalizeSeries(mockSeries)

      expect(result.labels.length).toBe(mockSeries.length)
    })
  })

  describe('combined options', () => {
    it('excludes forks and limits to maxItems', () => {
      const result = normalizeSeries(mockSeries, {
        excludeForks: true,
        maxItems: 2,
      })

      expect(result.labels).toEqual(['JavaScript', 'TypeScript'])
      expect(result.labels).not.toContain('Forked repos')
      expect(result.values).toEqual([25, 15])
      expect(result.colors.length).toBe(2)
    })

    it('applies excludeForks before maxItems', () => {
      const result = normalizeSeries(mockSeries, {
        excludeForks: true,
        maxItems: 4,
      })

      // Should have 4 items after excluding forks
      expect(result.labels).toEqual(['JavaScript', 'TypeScript', 'Python', 'Go'])
      expect(result.labels).not.toContain('Forked repos')
    })
  })

  describe('edge cases', () => {
    it('handles empty series array', () => {
      const result = normalizeSeries([])

      expect(result.labels).toEqual([])
      expect(result.values).toEqual([])
      expect(result.colors).toEqual([])
    })

    it('handles series with only __forks__', () => {
      const forksOnly: LanguageSeries[] = [
        { key: '__forks__', label: 'Forked repos', value: 10, color: '#cccccc' },
      ]

      const result = normalizeSeries(forksOnly, { excludeForks: true })

      expect(result.labels).toEqual([])
      expect(result.values).toEqual([])
      expect(result.colors).toEqual([])
    })

    it('handles series with single item', () => {
      const singleItem: LanguageSeries[] = [
        { key: 'Rust', label: 'Rust', value: 42, color: '#dea584' },
      ]

      const result = normalizeSeries(singleItem)

      expect(result.labels).toEqual(['Rust'])
      expect(result.values).toEqual([42])
      expect(result.colors).toEqual(['#dea584'])
    })

    it('handles series with duplicate keys', () => {
      const duplicates: LanguageSeries[] = [
        { key: 'JavaScript', label: 'JavaScript', value: 10, color: '#f1e05a' },
        { key: 'JavaScript', label: 'JavaScript', value: 5, color: '#f1e05a' },
      ]

      const result = normalizeSeries(duplicates)

      expect(result.labels).toEqual(['JavaScript', 'JavaScript'])
      expect(result.values).toEqual([10, 5])
    })

    it('handles series with zero values', () => {
      const withZeros: LanguageSeries[] = [
        { key: 'JavaScript', label: 'JavaScript', value: 10, color: '#f1e05a' },
        { key: 'TypeScript', label: 'TypeScript', value: 0, color: '#3178c6' },
        { key: 'Python', label: 'Python', value: 5, color: '#3572A5' },
      ]

      const result = normalizeSeries(withZeros)

      expect(result.labels).toEqual(['JavaScript', 'TypeScript', 'Python'])
      expect(result.values).toEqual([10, 0, 5])
    })
  })

  describe('pure function behavior', () => {
    it('does not mutate input series', () => {
      const originalSeries = [...mockSeries]
      const seriesCopy = [...mockSeries]

      normalizeSeries(seriesCopy, { excludeForks: true, maxItems: 2 })

      expect(seriesCopy).toEqual(originalSeries)
    })

    it('returns same result for same input', () => {
      const result1 = normalizeSeries(mockSeries, {
        excludeForks: true,
        maxItems: 3,
      })
      const result2 = normalizeSeries(mockSeries, {
        excludeForks: true,
        maxItems: 3,
      })

      expect(result1).toEqual(result2)
    })
  })
})
