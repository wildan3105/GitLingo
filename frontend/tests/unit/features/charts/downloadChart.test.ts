/**
 * downloadChart Utility Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  downloadChart,
  generateFilename,
} from '../../../../src/features/charts/utils/downloadChart'

const MOCK_URL = 'blob:mock-url'

beforeEach(() => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn().mockReturnValue(MOCK_URL),
    revokeObjectURL: vi.fn(),
  })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// generateFilename
// ---------------------------------------------------------------------------

describe('generateFilename', () => {
  it('produces the correct pattern with default png format', () => {
    const filename = generateFilename({ username: 'octocat', chartType: 'bar' })
    expect(filename).toMatch(/^gitlingo-octocat-bar-\d{8}\.png$/)
  })

  it('uses the explicit jpg format when provided', () => {
    const filename = generateFilename({ username: 'octocat', chartType: 'pie', format: 'jpg' })
    expect(filename).toMatch(/^gitlingo-octocat-pie-\d{8}\.jpg$/)
  })

  it("timestamp in filename matches today's date", () => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const filename = generateFilename({ username: 'user', chartType: 'bar' })
    expect(filename).toContain(today)
  })
})

// ---------------------------------------------------------------------------
// downloadChart
// ---------------------------------------------------------------------------

describe('downloadChart', () => {
  function makeContainerWithCanvas(toBlob?: (cb: (b: Blob | null) => void) => void) {
    const canvas = document.createElement('canvas')
    const mockBlob = new Blob([''], { type: 'image/png' })
    canvas.toBlob = toBlob ?? vi.fn().mockImplementation((cb) => cb(mockBlob))
    const container = document.createElement('div')
    container.appendChild(canvas)
    return container
  }

  it('calls createObjectURL and revokeObjectURL on a successful download', async () => {
    const container = makeContainerWithCanvas()
    await downloadChart(container, { username: 'octocat', chartType: 'bar' })

    expect(URL.createObjectURL).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(MOCK_URL)
  })

  it('sets the anchor download attribute to a filename containing username and chartType', async () => {
    const container = makeContainerWithCanvas()
    const appendSpy = vi.spyOn(document.body, 'appendChild')

    await downloadChart(container, { username: 'octocat', chartType: 'bar' })

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement
    expect(anchor.download).toContain('octocat')
    expect(anchor.download).toContain('bar')
    expect(anchor.download).toMatch(/\.png$/)
  })

  it('clicks the anchor to trigger the browser download', async () => {
    const container = makeContainerWithCanvas()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click')

    await downloadChart(container, { username: 'octocat', chartType: 'bar' })

    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('uses jpg format when specified', async () => {
    const container = makeContainerWithCanvas()
    const appendSpy = vi.spyOn(document.body, 'appendChild')

    await downloadChart(container, { username: 'octocat', chartType: 'pie', format: 'jpg' })

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement
    expect(anchor.download).toMatch(/\.jpg$/)
  })

  it('throws when no canvas element is found in the container', async () => {
    const emptyContainer = document.createElement('div')
    await expect(
      downloadChart(emptyContainer, { username: 'u', chartType: 'bar' })
    ).rejects.toThrow('Download failed: Chart canvas not found')
  })

  it('throws when toBlob returns null', async () => {
    const container = makeContainerWithCanvas((cb) => cb(null))
    await expect(downloadChart(container, { username: 'u', chartType: 'bar' })).rejects.toThrow(
      'Download failed: Failed to generate image from chart'
    )
  })
})
