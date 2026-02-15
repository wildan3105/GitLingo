# Phase 9: Performance & Polish

## Overview
Optimize performance, reduce bundle size, and add final polish to the application.

## Tasks

### 9.1 Add memoization for chart components
**Description:** Optimize chart rendering with React.memo and useMemo.

**Steps:**
- Wrap chart components with React.memo
- Memoize normalized chart data with useMemo
- Memoize chart configuration objects
- Prevent unnecessary rerenders
- Measure performance before/after
- Document optimization decisions

**Components to memoize:**
- BarChartView
- PieChartView
- RadarChartView
- ChartPanel

**Data to memoize:**
```typescript
// Example:
const chartData = useMemo(
  () => normalizeSeries(series, { excludeForks: true }),
  [series]
)

const chartOptions = useMemo(
  () => ({ responsive: true, maintainAspectRatio: false }),
  []
)
```

**Acceptance Criteria:**
- ✅ Chart components wrapped with React.memo
- ✅ Expensive computations memoized
- ✅ No unnecessary rerenders detected (use React DevTools Profiler)
- ✅ Performance improved measurably
- ✅ No regressions in functionality

---

### 9.2 Add lazy loading for chart components
**Description:** Code-split chart components to reduce initial bundle size.

**Steps:**
- Use React.lazy for chart components
- Add Suspense boundary with loading fallback
- Test that lazy loading works
- Measure bundle size before/after
- Ensure smooth loading experience
- Document bundle size savings

**Implementation:**
```typescript
// Before:
import BarChartView from './charts/BarChartView'

// After:
const BarChartView = React.lazy(() => import('./charts/BarChartView'))

// Usage:
<Suspense fallback={<ChartLoadingSkeleton />}>
  <BarChartView series={series} />
</Suspense>
```

**Acceptance Criteria:**
- ✅ Chart components lazy loaded
- ✅ Suspense boundary handles loading
- ✅ Initial bundle size reduced
- ✅ Chart loading is smooth
- ✅ No flash of unstyled content
- ✅ Bundle size documented

---

### 9.3 Optimize bundle size
**Description:** Analyze and reduce bundle size.

**Steps:**
- Run bundle analyzer (vite-plugin-visualizer)
- Identify large dependencies
- Replace heavy libraries with lighter alternatives (if possible)
- Enable tree-shaking
- Remove unused code
- Optimize images (if any)
- Enable gzip/brotli compression
- Document bundle size

**Bundle analysis:**
```bash
npm run build -- --mode analyze
```

**Targets:**
- Initial bundle: < 200KB (gzipped)
- Chart bundle: < 100KB (gzipped, lazy loaded)
- Total: < 300KB (gzipped)

**Optimizations to consider:**
- Tree-shake chart library
- Use production builds
- Remove console.logs in production
- Minimize CSS
- Optimize font loading

**Acceptance Criteria:**
- ✅ Bundle analyzer run
- ✅ Large dependencies identified
- ✅ Unnecessary code removed
- ✅ Bundle size < 300KB gzipped
- ✅ Bundle size documented
- ✅ No regressions in functionality

---

### 9.4 Add loading states and skeletons
**Description:** Improve perceived performance with loading states.

**Steps:**
- Review all loading states
- Ensure consistent skeleton design
- Add progressive loading where possible
- Optimize loading animations
- Test on slow connections
- Measure time to interactive

**Loading states to review:**
- SearchBar (during search)
- ChartPanel (during data fetch)
- Chart components (during render)
- Download button (during export)
- Error state to success transition

**Skeleton requirements:**
- Match actual content layout
- Animate smoothly (shimmer effect)
- Don't cause layout shift
- Load fast (< 100ms)

**Acceptance Criteria:**
- ✅ All loading states have skeletons
- ✅ Skeletons match actual content
- ✅ No layout shift when content loads
- ✅ Animations are smooth (60fps)
- ✅ Loading feels fast (even on slow connections)

---

### 9.5 Add React Query caching optimization
**Description:** Optimize API caching to reduce unnecessary requests.

**Steps:**
- Review React Query configuration
- Set appropriate staleTime (5 minutes)
- Set appropriate cacheTime (10 minutes)
- Enable cache persistence (optional)
- Add cache invalidation on errors
- Test cache behavior
- Document cache strategy

**Cache configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})
```

**Cache strategy:**
- Cache successful responses for 5 minutes
- Invalidate cache on errors
- Refetch on reconnect
- Don't refetch on window focus
- Clear cache on logout (if auth added later)

**Acceptance Criteria:**
- ✅ Cache reduces duplicate requests
- ✅ Stale data handled appropriately
- ✅ Cache invalidation works
- ✅ Cache persists across page refresh (optional)
- ✅ Cache strategy documented

---

### 9.6 Add performance monitoring
**Description:** Add performance metrics and monitoring.

**Steps:**
- Measure key performance metrics
- Add performance logging (dev only)
- Track API response times
- Track chart render times
- Monitor bundle load times
- Document performance targets
- Consider adding analytics (optional)

**Metrics to track:**
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- API response time
- Chart render time
- Bundle load time

**Performance targets:**
- TTI: < 2s on 4G
- FCP: < 1s on 4G
- LCP: < 2.5s on 4G
- API response: < 500ms (small accounts)
- Chart render: < 100ms

**Acceptance Criteria:**
- ✅ Key metrics measured
- ✅ Performance logging added (dev only)
- ✅ Targets documented
- ✅ Slow operations identified
- ✅ Metrics tracked over time (optional)

---

### 9.7 Final polish and UX improvements
**Description:** Add final touches for a polished user experience.

**Steps:**
- Review all animations (smooth, consistent)
- Review all spacing (consistent, balanced)
- Review all colors (accessible contrast)
- Add hover states where appropriate
- Add active states for buttons
- Add smooth transitions
- Fix any visual inconsistencies
- Test on multiple browsers

**Polish checklist:**
- ✅ Consistent spacing throughout
- ✅ Smooth transitions (200-300ms)
- ✅ Hover states on all interactive elements
- ✅ Active states for buttons
- ✅ Loading states are smooth
- ✅ Error states are friendly
- ✅ Success states are celebratory (subtle)
- ✅ Typography is consistent

**UX improvements:**
- Auto-focus search input on load
- Clear search on success (optional)
- Remember last search (localStorage - optional)
- Add keyboard shortcuts hint (optional)
- Add "Share" success feedback
- Add "Download" success feedback

**Acceptance Criteria:**
- ✅ All animations are smooth
- ✅ Spacing is consistent
- ✅ Colors pass contrast checks
- ✅ Hover/active states added
- ✅ No visual bugs or glitches
- ✅ Feels polished and professional

---

### 9.8 Integration performance testing
**Description:** Test performance with realistic data and scenarios.

**Steps:**
- Test with small accounts (< 10 repos)
- Test with medium accounts (10-50 repos)
- Test with large accounts (50+ repos)
- Test with slow network (throttle to 3G)
- Test with many languages (50+)
- Test rapid chart switching
- Measure and document results

**Test accounts to use:**
- Small: personal accounts
- Medium: small organizations
- Large: facebook, microsoft, google

**Performance scenarios:**
- Search → Success (measure time)
- Chart switching (measure rerenders)
- Download chart (measure export time)
- Error → Retry → Success (measure recovery)

**Acceptance Criteria:**
- ✅ Performs well with all account sizes
- ✅ No freezing or janky animations
- ✅ Smooth on slow networks
- ✅ Large datasets handled gracefully
- ✅ All targets met or documented
- ✅ Performance regressions caught

---

## Definition of Done
- [ ] All 8 tasks completed
- [ ] Chart components memoized
- [ ] Chart components lazy loaded
- [ ] Bundle size optimized (< 300KB gzipped)
- [ ] Loading states polished
- [ ] Caching optimized
- [ ] Performance metrics tracked
- [ ] Final polish complete
- [ ] Performance targets met or documented

## Dependencies
- Phase 7 (Integration) must be complete
- All previous phases should be complete for accurate testing

## Estimated Effort
5-6 hours

## Notes
- Performance optimization should be data-driven
- Use React DevTools Profiler extensively
- Test on real devices with real network conditions
- Don't over-optimize - focus on user-perceived performance
- Document all performance decisions
- Keep bundle size in check as features are added
- Consider setting up performance budgets
- Monitor performance in production (if deployed)
