/**
 * CSV Export Utilities
 * Export language statistics data to CSV format
 */

import type { LanguageData } from '../../../contracts/api'

/** Number of decimal places used when formatting percentage values in the CSV. */
const PERCENTAGE_DECIMAL_PLACES = 2

/**
 * Converts language data to CSV format and triggers download
 *
 * Format: Language, Repositories, Percentage
 * - Excludes forks from the export
 * - Calculates percentages based on total repositories
 * - Generates a downloadable CSV file
 *
 * @param data - Language statistics data
 * @param filename - Name for the downloaded file (without extension)
 *
 * @example
 * ```typescript
 * exportToCSV(languageData, 'octocat-github-languages')
 * ```
 */
export function exportToCSV(data: LanguageData[], filename: string): void {
  // Filter out forks and calculate total
  const languages = data.filter((item) => item.key !== '__forks__')
  const totalRepos = languages.reduce((sum, item) => sum + item.value, 0)

  // Build CSV header
  const headers = ['Language', 'Repositories', 'Percentage']
  const csvRows: string[] = [headers.join(',')]

  // Build CSV rows
  for (const item of languages) {
    const percentage =
      totalRepos > 0 ? ((item.value / totalRepos) * 100).toFixed(PERCENTAGE_DECIMAL_PLACES) : '0.00'
    const row = [
      // Escape language name if it contains commas or quotes
      escapeCSVValue(item.label),
      item.value.toString(),
      `${percentage}%`,
    ]
    csvRows.push(row.join(','))
  }

  // Join all rows with newlines
  const csvContent = csvRows.join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Escapes a CSV value by wrapping it in quotes if needed
 *
 * Values that contain commas, quotes, or newlines need to be wrapped
 * in quotes, and any internal quotes need to be doubled.
 *
 * @param value - The value to escape
 * @returns Escaped value safe for CSV
 *
 * @example
 * ```typescript
 * escapeCSVValue('C++')        // 'C++'
 * escapeCSVValue('Hello, World') // '"Hello, World"'
 * escapeCSVValue('Say "Hi"')   // '"Say ""Hi"""'
 * ```
 */
function escapeCSVValue(value: string): string {
  // Check if value needs escaping
  const needsEscaping = /[",\n\r]/.test(value)

  if (needsEscaping) {
    // Double any quotes and wrap in quotes
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}
