# Phase 5: Charts Feature (Core Functionality)

## Overview
Build the chart visualization system with 4 chart types and chart switching functionality.

## Tasks

### 5.1 Choose and setup chart library
**Description:** Research, choose, and configure a chart library that supports all required chart types.

**Steps:**
- Evaluate options: Chart.js + react-chartjs-2 OR Recharts
- Install chosen library and dependencies
- Create basic chart example to verify setup
- Configure chart defaults (colors, animations, responsiveness)
- Document decision in README

**Recommended: Chart.js + react-chartjs-2**
- Pros: Supports all 4 chart types, highly customizable, good performance
- Cons: More imperative API

**Alternative: Recharts**
- Pros: React-native API, composable, good for simple charts
- Cons: Radar chart support may need customization

**Acceptance Criteria:**
- ✅ Chart library installed
- ✅ Sample chart renders correctly
- ✅ Library supports Bar, Pie, Doughnut, Radar
- ✅ Responsive by default
- ✅ Decision documented

---

### 5.2 Create normalizeSeries utility + tests
**Description:** Create utility function to transform API series data into chart-compatible format.

**Steps:**
- Create `features/charts/utils/normalizeSeries.ts`
- Implement function to transform series array
- Handle `__forks__` special case (include/exclude based on chart type)
- Extract labels, values, colors
- Support filtering (e.g., top N languages)
- Add TypeScript types
- Keep function pure

**Function signature:**
```typescript
type NormalizedChartData = {
  labels: string[]
  values: number[]
  colors: string[]
}

type NormalizeOptions = {
  excludeForks?: boolean
  maxItems?: number
}

function normalizeSeries(
  series: LanguageSeries[],
  options?: NormalizeOptions
): NormalizedChartData
```

**Behavior:**
- Default: include all series items
- `excludeForks: true`: filter out `__forks__` key
- `maxItems: N`: take top N items by value
- Preserve order from API (already sorted)

**Acceptance Criteria:**
- ✅ Function transforms series correctly
- ✅ Forks handling works as expected
- ✅ Top N filtering works
- ✅ Colors extracted correctly
- ✅ Function is pure and testable
- ✅ 100% test coverage

**Unit tests:**
- ✅ Transforms series with all fields
- ✅ Excludes forks when option set
- ✅ Limits to maxItems when set
- ✅ Handles empty series
- ✅ Preserves order

---

### 5.3 Create BarChartView component
**Description:** Build Bar chart component (default chart type).

**Steps:**
- Create `features/charts/components/charts/BarChartView.tsx`
- Use chart library from 5.1
- Use normalizeSeries utility
- Display horizontal or vertical bars
- Show language colors
- Add tooltips with counts
- Make responsive
- Add loading skeleton
- Style with Tailwind CSS

**Props:**
```typescript
type BarChartViewProps = {
  series: LanguageSeries[]
  isLoading?: boolean
}
```

**Chart configuration:**
- Orientation: horizontal (better for many languages)
- X-axis: repository count
- Y-axis: language names
- Colors: from series[].color
- Tooltip: show language name + count + percentage

**Acceptance Criteria:**
- ✅ Bar chart renders correctly
- ✅ Colors match language colors
- ✅ Tooltips display correctly
- ✅ Responsive on mobile/desktop
- ✅ Loading state shows skeleton
- ✅ Accessible (ARIA labels)

---

### 5.4 Create PieChartView component
**Description:** Build Pie chart component.

**Steps:**
- Create `features/charts/components/charts/PieChartView.tsx`
- Use chart library from 5.1
- Use normalizeSeries utility
- Display pie slices with language colors
- Show legend with language names
- Add tooltips with counts and percentages
- Make responsive
- Exclude forks from pie chart (too much clutter)
- Style with Tailwind CSS

**Props:**
```typescript
type PieChartViewProps = {
  series: LanguageSeries[]
  isLoading?: boolean
}
```

**Chart configuration:**
- Exclude `__forks__` from display
- Colors: from series[].color
- Legend: show language names
- Tooltip: show language name + count + percentage

**Acceptance Criteria:**
- ✅ Pie chart renders correctly
- ✅ Colors match language colors
- ✅ Forks excluded from chart
- ✅ Legend displays correctly
- ✅ Tooltips display correctly
- ✅ Responsive on mobile/desktop

---

### 5.5 Create DoughnutChartView component
**Description:** Build Doughnut chart component (pie chart with hole in center).

**Steps:**
- Create `features/charts/components/charts/DoughnutChartView.tsx`
- Similar to PieChartView but with center cutout
- Use chart library from 5.1
- Use normalizeSeries utility
- Display doughnut with language colors
- Show legend with language names
- Add tooltips with counts and percentages
- Exclude forks
- Make responsive
- Style with Tailwind CSS

**Props:**
```typescript
type DoughnutChartViewProps = {
  series: LanguageSeries[]
  isLoading?: boolean
}
```

**Acceptance Criteria:**
- ✅ Doughnut chart renders correctly
- ✅ Center hole visible
- ✅ Colors match language colors
- ✅ Forks excluded from chart
- ✅ Legend displays correctly
- ✅ Tooltips display correctly

---

### 5.6 Create RadarChartView component
**Description:** Build Radar chart component.

**Steps:**
- Create `features/charts/components/charts/RadarChartView.tsx`
- Use chart library from 5.1
- Use normalizeSeries utility
- Display radar with language colors
- Limit to top 8 languages (radar gets crowded)
- Add tooltips with counts
- Exclude forks
- Make responsive
- Style with Tailwind CSS

**Props:**
```typescript
type RadarChartViewProps = {
  series: LanguageSeries[]
  isLoading?: boolean
}
```

**Chart configuration:**
- Max items: 8 (use normalizeSeries maxItems option)
- Exclude `__forks__`
- Colors: from series[].color
- Tooltip: show language name + count

**Acceptance Criteria:**
- ✅ Radar chart renders correctly
- ✅ Limited to top 8 languages
- ✅ Colors match language colors
- ✅ Forks excluded from chart
- ✅ Tooltips display correctly
- ✅ Responsive on mobile/desktop

---

### 5.7 Create ChartTypeSelect component
**Description:** Build chart type selector (tabs or dropdown).

**Steps:**
- Create `features/charts/components/ChartTypeSelect.tsx`
- Display 4 chart types as tabs or buttons
- Show active chart type
- Handle onChange event
- Add icons for each chart type (optional)
- Style with Tailwind CSS
- Make responsive (horizontal scroll on mobile if needed)

**Props:**
```typescript
type ChartType = 'bar' | 'pie' | 'doughnut' | 'radar'

type ChartTypeSelectProps = {
  value: ChartType
  onChange: (type: ChartType) => void
}
```

**Chart types:**
- Bar (default)
- Pie
- Doughnut
- Radar

**Acceptance Criteria:**
- ✅ All 4 chart types selectable
- ✅ Active state visible
- ✅ onChange fires correctly
- ✅ Responsive on mobile
- ✅ Accessible (keyboard navigation, ARIA)

---

### 5.8 Create ChartPanel component
**Description:** Build main chart panel that renders the selected chart type.

**Steps:**
- Create `features/charts/components/ChartPanel.tsx`
- Accept chart type and series data
- Render correct chart component based on type
- Handle loading state
- Handle error state
- Handle empty state (no languages)
- Include ChartTypeSelect
- Style with Tailwind CSS

**Props:**
```typescript
type ChartPanelProps = {
  series: LanguageSeries[]
  isLoading?: boolean
  error?: string
}
```

**Component logic:**
- Manage chartType state (default: 'bar')
- Render chart based on chartType
- Pass series to chart component
- Show loading skeleton when isLoading
- Show error state when error
- Show empty state when series is empty

**Acceptance Criteria:**
- ✅ Correct chart renders based on selection
- ✅ Chart switching works instantly (no refetch)
- ✅ Loading state displays correctly
- ✅ Error state displays correctly
- ✅ Empty state displays correctly
- ✅ Responsive layout

---

### 5.9 Test chart switching (no refetch)
**Description:** Create tests to ensure chart switching doesn't trigger API refetch.

**Steps:**
- Create `tests/unit/features/charts/ChartPanel.test.tsx`
- Create `tests/unit/features/charts/normalizeSeries.test.ts`
- Test chart type switching
- Verify no additional API calls on chart type change
- Test all chart components render correctly
- Test normalizeSeries with various inputs

**Test cases:**

**ChartPanel.test.tsx:**
- ✅ Renders BarChartView by default
- ✅ Switching to Pie renders PieChartView
- ✅ Switching to Doughnut renders DoughnutChartView
- ✅ Switching to Radar renders RadarChartView
- ✅ No API refetch on chart type change
- ✅ Loading state shows skeleton
- ✅ Error state shows error message
- ✅ Empty state shows empty message

**normalizeSeries.test.ts:**
- ✅ Transforms series correctly
- ✅ Excludes forks when excludeForks: true
- ✅ Limits to maxItems when set
- ✅ Handles empty series gracefully
- ✅ Preserves order from API

**Chart component tests:**
- ✅ Each chart component renders with mock data
- ✅ Loading state works
- ✅ Colors applied correctly

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ >90% coverage for charts feature
- ✅ Chart switching verified (no refetch)
- ✅ normalizeSeries 100% covered

---

## Definition of Done
- [ ] All 9 tasks completed
- [ ] Chart library configured
- [ ] All 4 chart types implemented
- [ ] Chart switching works without refetch
- [ ] normalizeSeries utility tested thoroughly
- [ ] All tests pass with >90% coverage
- [ ] No TypeScript errors
- [ ] Charts are responsive on all devices

## Dependencies
- Phase 3 (Shared Components) must be complete
- Phase 2 (API Contracts) must be complete

## Estimated Effort
6-8 hours

## Notes
- Keep chart components memoized to prevent unnecessary rerenders
- Consider lazy loading chart components if bundle size is large
- Ensure charts are accessible (ARIA labels, keyboard navigation)
- Test with large datasets (50+ languages)
