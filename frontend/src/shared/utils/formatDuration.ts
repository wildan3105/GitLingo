/**
 * Format a duration in seconds to a human-readable string.
 * - < 60s  → "Xs"         (e.g. "45s")
 * - < 60m  → "Xm Ys"     (e.g. "2m 30s"), omits seconds when 0 ("3m")
 * - ≥ 60m  → "Xh Ym"     (e.g. "1h 30m"), omits minutes when 0 ("2h")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  const hours = Math.floor(mins / 60)
  const remainMins = mins % 60
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`
}
