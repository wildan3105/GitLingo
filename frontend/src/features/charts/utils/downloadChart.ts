/**
 * Chart Download Utility
 * Export chart as PNG image and trigger browser download
 */

export type DownloadOptions = {
  /** GitHub username */
  username: string
  /** Chart type being downloaded */
  chartType: string
  /** Image format (default: png) */
  format?: 'png' | 'jpg'
}

/**
 * Downloads a chart as an image file
 *
 * Uses the Chart.js canvas element to export the chart as a base64 image,
 * then triggers a browser download with a descriptive filename.
 *
 * @param chartElement - The HTML element containing the chart canvas
 * @param options - Download configuration (username, chartType, format)
 * @returns Promise that resolves when download is triggered
 * @throws Error if canvas element is not found or export fails
 *
 * @example
 * ```typescript
 * const chartContainer = document.getElementById('chart')
 * await downloadChart(chartContainer, {
 *   username: 'octocat',
 *   chartType: 'bar'
 * })
 * ```
 */
export async function downloadChart(
  chartElement: HTMLElement,
  options: DownloadOptions
): Promise<void> {
  const { username, chartType, format = 'png' } = options

  try {
    // Find the canvas element within the chart container
    const canvas = chartElement.querySelector('canvas')
    if (!canvas) {
      throw new Error('Chart canvas not found')
    }

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        `image/${format}`,
        1.0 // Maximum quality
      )
    })

    if (!blob) {
      throw new Error('Failed to generate image from chart')
    }

    // Create download URL
    const url = URL.createObjectURL(blob)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const filename = `gitlingo-${username}-${chartType}-${timestamp}.${format}`

    // Create temporary link and trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to download chart'
    throw new Error(`Download failed: ${message}`)
  }
}

/**
 * Generates a filename for the chart download
 *
 * Format: gitlingo-{username}-{chartType}-{timestamp}.{format}
 *
 * @param options - Download configuration
 * @returns Formatted filename string
 *
 * @example
 * ```typescript
 * generateFilename({
 *   username: 'octocat',
 *   chartType: 'bar',
 *   format: 'png'
 * })
 * // Returns: "gitlingo-octocat-bar-20250217.png"
 * ```
 */
export function generateFilename(options: DownloadOptions): string {
  const { username, chartType, format = 'png' } = options
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
  return `gitlingo-${username}-${chartType}-${timestamp}.${format}`
}
