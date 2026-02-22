import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastProvider, TOAST_DEFAULT_DURATION_MS } from '../shared/hooks/useToast'

/**
 * React Query client configuration
 *
 * Cache strategy:
 * - Queries: Cache for 5 minutes, stale after 5 minutes
 * - Mutations: Cache results for 5 minutes for instant "back" navigation
 * - Network: Retry once on failure, refetch on reconnect
 * - Focus: Don't refetch on window focus (prevents unnecessary requests)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when connection restored
    },
    mutations: {
      gcTime: 5 * 60 * 1000, // 5 minutes - keep mutation results in cache
      retry: 0, // Don't retry mutations automatically (user can click retry)
    },
  },
})

/**
 * App-level providers wrapper
 * Includes QueryClient for data fetching/caching and ToastProvider for notifications
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider position="top-right" defaultDuration={TOAST_DEFAULT_DURATION_MS}>
        {children}
        {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ToastProvider>
    </QueryClientProvider>
  )
}
