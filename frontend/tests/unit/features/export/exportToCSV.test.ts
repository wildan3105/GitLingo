/**
 * exportToCSV Utility Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV } from '../../../../src/features/export/utils/exportToCSV'
import type { LanguageData } from '../../../../src/contracts/api'

const MOCK_URL = 'blob:mock-csv'

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

// Better approach: intercept Blob at the module level
const blobTexts: string[] = []
const OriginalBlob = globalThis.Blob
class BlobCapture extends OriginalBlob {
  _text: string
  constructor(parts: BlobPart[], options?: BlobPropertyBag) {
    super(parts, options)
    this._text = (parts[0] as string) ?? ''
    blobTexts.push(this._text)
  }
}

describe('exportToCSV', () => {
  beforeEach(() => {
    blobTexts.length = 0
    vi.stubGlobal('Blob', BlobCapture)
  })

  afterEach(() => {
    vi.stubGlobal('Blob', OriginalBlob)
  })

  const sampleData: LanguageData[] = [
    { key: 'TypeScript', label: 'TypeScript', value: 10, color: '#3178c6' },
    { key: 'JavaScript', label: 'JavaScript', value: 10, color: '#f1e05a' },
  ]

  it('generates a CSV with the correct header row', () => {
    exportToCSV(sampleData, 'test')
    expect(blobTexts[0]).toMatch(/^Language,Repositories,Percentage/)
  })

  it('calculates 50% for each language when values are equal', () => {
    exportToCSV(sampleData, 'test')
    const lines = blobTexts[0].split('\n')
    expect(lines[1]).toContain('50.00%')
    expect(lines[2]).toContain('50.00%')
  })

  it('filters out the __forks__ entry', () => {
    const dataWithForks: LanguageData[] = [
      ...sampleData,
      { key: '__forks__', label: 'Forks', value: 5, color: '#aaa' },
    ]
    exportToCSV(dataWithForks, 'test')
    expect(blobTexts[0]).not.toContain('Forks')
  })

  it('produces only the header row when data is empty', () => {
    exportToCSV([], 'test')
    expect(blobTexts[0].trim()).toBe('Language,Repositories,Percentage')
  })

  it('shows 0.00% for all rows when totalRepos is zero', () => {
    const zeroData: LanguageData[] = [{ key: 'Go', label: 'Go', value: 0, color: '#00ADD8' }]
    exportToCSV(zeroData, 'test')
    expect(blobTexts[0]).toContain('0.00%')
  })

  it('escapes a language name containing a comma', () => {
    const dataWithComma: LanguageData[] = [{ key: 'C,D', label: 'C, D', value: 5, color: '#aaa' }]
    exportToCSV(dataWithComma, 'test')
    expect(blobTexts[0]).toContain('"C, D"')
  })

  it('escapes a language name containing a double-quote', () => {
    const dataWithQuote: LanguageData[] = [
      { key: 'Say', label: 'Say "Hi"', value: 5, color: '#aaa' },
    ]
    exportToCSV(dataWithQuote, 'test')
    expect(blobTexts[0]).toContain('"Say ""Hi"""')
  })

  it('passes through plain language names unchanged', () => {
    exportToCSV(sampleData, 'test')
    expect(blobTexts[0]).toContain('TypeScript')
    expect(blobTexts[0]).not.toContain('"TypeScript"')
  })

  it('triggers a download: createObjectURL called, anchor download set, revokeObjectURL called', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    exportToCSV(sampleData, 'my-file')

    expect(URL.createObjectURL).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(MOCK_URL)
    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement
    expect(anchor.download).toBe('my-file.csv')
  })
})
