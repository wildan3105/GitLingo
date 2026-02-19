/**
 * Tests for computePyramidRows utility
 */

import { describe, it, expect } from 'vitest'
import { computePyramidRows } from '../../../../src/features/search/utils/pyramidRows'

describe('computePyramidRows', () => {
  describe('edge cases', () => {
    it('returns two empty rows for empty input', () => {
      const [top, bottom] = computePyramidRows([])
      expect(top).toEqual([])
      expect(bottom).toEqual([])
    })

    it('returns single item in top row, empty bottom row for n=1', () => {
      const [top, bottom] = computePyramidRows(['a'])
      expect(top).toEqual(['a'])
      expect(bottom).toEqual([])
    })

    it('returns two items in top row, empty bottom row for n=2', () => {
      const [top, bottom] = computePyramidRows(['a', 'b'])
      expect(top).toEqual(['a', 'b'])
      expect(bottom).toEqual([])
    })
  })

  describe('inverted pyramid distribution (top heavier than bottom)', () => {
    it('n=3 → top 2, bottom 1', () => {
      const items = [1, 2, 3]
      const [top, bottom] = computePyramidRows(items)
      expect(top).toEqual([1, 2])
      expect(bottom).toEqual([3])
    })

    it('n=4 → top 2, bottom 2', () => {
      const items = [1, 2, 3, 4]
      const [top, bottom] = computePyramidRows(items)
      expect(top).toEqual([1, 2])
      expect(bottom).toEqual([3, 4])
    })

    it('n=5 → top 3, bottom 2', () => {
      const items = [1, 2, 3, 4, 5]
      const [top, bottom] = computePyramidRows(items)
      expect(top).toEqual([1, 2, 3])
      expect(bottom).toEqual([4, 5])
    })

    it('n=6 → top 3, bottom 3', () => {
      const items = [1, 2, 3, 4, 5, 6]
      const [top, bottom] = computePyramidRows(items)
      expect(top).toEqual([1, 2, 3])
      expect(bottom).toEqual([4, 5, 6])
    })

    it('n=7 → top 4, bottom 3', () => {
      const items = [1, 2, 3, 4, 5, 6, 7]
      const [top, bottom] = computePyramidRows(items)
      expect(top).toEqual([1, 2, 3, 4])
      expect(bottom).toEqual([5, 6, 7])
    })

    it('n=8 → top 4, bottom 4', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8]
      const [top, bottom] = computePyramidRows(items)
      expect(top).toEqual([1, 2, 3, 4])
      expect(bottom).toEqual([5, 6, 7, 8])
    })

    it('n=9 → top 5, bottom 4', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      const [top, bottom] = computePyramidRows(items)
      expect(top).toEqual([1, 2, 3, 4, 5])
      expect(bottom).toEqual([6, 7, 8, 9])
    })
  })

  describe('top row is always >= bottom row', () => {
    it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('holds for n=%i', (n) => {
      const items = Array.from({ length: n }, (_, i) => i)
      const [top, bottom] = computePyramidRows(items)
      expect(top.length).toBeGreaterThanOrEqual(bottom.length)
    })
  })

  describe('total items preserved', () => {
    it.each([0, 1, 2, 3, 5, 9])('top + bottom = n for n=%i', (n) => {
      const items = Array.from({ length: n }, (_, i) => i)
      const [top, bottom] = computePyramidRows(items)
      expect(top.length + bottom.length).toBe(n)
    })
  })

  describe('works with objects (TopSearchItem-like)', () => {
    it('preserves item identity in correct order', () => {
      const items = [
        { username: 'alice' },
        { username: 'bob' },
        { username: 'carol' },
        { username: 'dave' },
        { username: 'eve' },
      ]
      const [top, bottom] = computePyramidRows(items)
      expect(top).toEqual([{ username: 'alice' }, { username: 'bob' }, { username: 'carol' }])
      expect(bottom).toEqual([{ username: 'dave' }, { username: 'eve' }])
    })
  })
})
