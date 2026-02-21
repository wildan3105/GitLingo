/**
 * ChartTypeSelect Component
 * Allows users to switch between different chart types
 */

import { useEffect, useRef, useState } from 'react'

export type ChartType = 'bar' | 'pie' | 'polar'

export type ChartTypeSelectProps = {
  /** Currently selected chart type */
  value: ChartType
  /** Handler for chart type changes */
  onChange: (type: ChartType) => void
}

const CUSTOM_OPTIONS = [
  {
    value: 'pie' as ChartType,
    label: 'Pie Chart',
    description: 'Circular chart showing language distribution',
  },
  {
    value: 'polar' as ChartType,
    label: 'Polar Area',
    description: 'Radial chart with segments sized by value',
  },
]

const TAB_BASE =
  'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-105 active:scale-95'
const TAB_ACTIVE = 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md scale-105'
const TAB_INACTIVE =
  'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 hover:text-secondary-900 hover:shadow-sm'

/**
 * Chart type selector component
 *
 * - "Bar" renders as a regular tab button.
 * - "Pie" and "Polar Area" are grouped under a "Custom Charts" dropdown button.
 *   The button is highlighted (active gradient) when either of those types is selected,
 *   and its label changes to the active sub-type name for clarity.
 *
 * @example
 * ```typescript
 * const [chartType, setChartType] = useState<ChartType>('bar')
 * <ChartTypeSelect value={chartType} onChange={setChartType} />
 * ```
 */
export function ChartTypeSelect({ value, onChange }: ChartTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isCustomActive = value === 'pie' || value === 'polar'
  const activeCustomOption = CUSTOM_OPTIONS.find((o) => o.value === value)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  return (
    <div role="tablist" aria-label="Chart type selection" className="flex gap-2 p-2">
      {/* Bar Tab */}
      <button
        type="button"
        role="tab"
        aria-selected={value === 'bar'}
        aria-controls="chart-panel-bar"
        onClick={() => onChange('bar')}
        title="Horizontal bars showing repository counts"
        className={`${TAB_BASE} ${value === 'bar' ? TAB_ACTIVE : TAB_INACTIVE}`}
      >
        Bar
      </button>

      {/* Custom Charts Dropdown */}
      <div
        ref={dropdownRef}
        className="relative"
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      >
        <button
          type="button"
          role="tab"
          aria-selected={isCustomActive}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={
            isCustomActive ? `Custom Charts — ${activeCustomOption!.label}` : 'Custom Charts'
          }
          onClick={() => setIsOpen((prev) => !prev)}
          className={`${TAB_BASE} flex items-center gap-1.5 ${isCustomActive ? TAB_ACTIVE : TAB_INACTIVE}`}
        >
          {/* Sparkles icon */}
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>

          <span>{isCustomActive ? activeCustomOption!.label : 'Custom Charts'}</span>

          {/* Chevron — rotates when open */}
          <svg
            className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            role="listbox"
            aria-label="Custom chart types"
            className="absolute top-full left-0 mt-1.5 w-64 rounded-xl bg-white shadow-xl border border-secondary-200 overflow-hidden z-20 animate-fade-in-up"
          >
            {/* Section header */}
            <div className="px-3 pt-2.5 pb-1.5 border-b border-secondary-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">
                Custom Charts
              </p>
            </div>

            {CUSTOM_OPTIONS.map((option) => {
              const isSelected = value === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors duration-150 ${
                    isSelected
                      ? 'bg-primary-50 text-primary-900'
                      : 'text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  {/* Icon box */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-primary-100' : 'bg-secondary-100'
                    }`}
                  >
                    {option.value === 'pie' ? (
                      <svg
                        className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-secondary-500'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                    ) : (
                      <svg
                        className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-secondary-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path strokeLinecap="round" d="M12 12l-6.364 3.636" />
                        <path strokeLinecap="round" d="M12 12V3" />
                        <path strokeLinecap="round" d="M12 12l6.364 3.636" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                      </svg>
                    )}
                  </div>

                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{option.label}</span>
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-primary-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-secondary-500 mt-0.5 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
