/**
 * Compute inverted pyramid row distribution for a list of items.
 *
 * Rule: topRowCount = ceil(n / 2), bottomRowCount = n - topRowCount
 *
 * | n | top | bottom |
 * |---|-----|--------|
 * | 0 |  0  |   0    |
 * | 1 |  1  |   0    |
 * | 2 |  2  |   0    |
 * | 3 |  2  |   1    |
 * | 4 |  2  |   2    |
 * | 5 |  3  |   2    |
 * | 9 |  5  |   4    |
 */
export function computePyramidRows<T>(items: T[]): [T[], T[]] {
  const n = items.length
  if (n === 0) return [[], []]
  // For n ≤ 2 put everything in the top row (single centered row is fine)
  // The ceil(n/2) formula only applies for n ≥ 3 per spec
  if (n <= 2) return [items.slice(), []]
  const topCount = Math.ceil(n / 2)
  return [items.slice(0, topCount), items.slice(topCount)]
}
