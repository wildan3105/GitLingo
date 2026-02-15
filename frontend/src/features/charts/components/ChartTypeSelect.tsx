/**
 * ChartTypeSelect Component
 * Allows users to switch between different chart types
 */

export type ChartType = 'bar' | 'pie' | 'radar'

export type ChartTypeSelectProps = {
  /** Currently selected chart type */
  value: ChartType
  /** Handler for chart type changes */
  onChange: (type: ChartType) => void
}

type ChartTypeOption = {
  value: ChartType
  label: string
  description: string
}

const CHART_TYPES: ChartTypeOption[] = [
  {
    value: 'bar',
    label: 'Bar',
    description: 'Horizontal bars showing repository counts',
  },
  {
    value: 'pie',
    label: 'Pie',
    description: 'Circular chart showing language distribution',
  },
  {
    value: 'radar',
    label: 'Radar',
    description: 'Multi-axis chart for top languages',
  },
]

/**
 * Chart type selector component
 *
 * Allows users to switch between different chart visualizations.
 * Styled as tab buttons with active state indication.
 *
 * @example
 * ```typescript
 * const [chartType, setChartType] = useState<ChartType>('bar')
 *
 * <ChartTypeSelect value={chartType} onChange={setChartType} />
 * ```
 */
export function ChartTypeSelect({ value, onChange }: ChartTypeSelectProps) {
  return (
    <div
      role="tablist"
      aria-label="Chart type selection"
      className="flex gap-2 overflow-x-auto p-2"
    >
      {CHART_TYPES.map((chartType) => {
        const isActive = value === chartType.value

        return (
          <button
            key={chartType.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`chart-panel-${chartType.value}`}
            onClick={() => onChange(chartType.value)}
            title={chartType.description}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              whitespace-nowrap
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 hover:text-secondary-900'
              }
            `}
          >
            {chartType.label}
          </button>
        )
      })}
    </div>
  )
}
