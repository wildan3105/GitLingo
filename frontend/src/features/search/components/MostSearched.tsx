/**
 * MostSearched Component
 * Shows the top-searched GitHub users as clickable avatar+username chips.
 * Only rendered on the homepage empty state; returns null when data is unavailable.
 */

import { useRef, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTopSearch } from '../../../services/gitlingoApi'
import { computePyramidRows } from '../utils/pyramidRows'
import type { TopSearchItem } from '../../../contracts/api'

type MostSearchedProps = {
  /** Called with the username when a chip is clicked or activated via keyboard */
  onSearch: (username: string) => void
}

type UserChipProps = {
  item: TopSearchItem
  /** 0-based rank index; used to compute opacity gradient */
  rank: number
  /** Total number of chips rendered; used to compute opacity gradient */
  total: number
  onSearch: (username: string) => void
  onNavigate: (username: string, direction: 'prev' | 'next') => void
}

/**
 * Returns true when the viewport is narrower than the md breakpoint (768 px).
 * Defaults to false (desktop) when matchMedia is unavailable (SSR, JSDOM).
 */
function useMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(max-width: 767px)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}

/** Number of top-searched chips to request from the API and to mirror in the skeleton. */
const CHIP_LIMIT = 9

/** Maximum opacity drop applied to the lowest-ranked chip (0 = no fade, 1 = invisible). */
const OPACITY_RANGE = 0.5

function ChipSkeleton() {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-secondary-100 border border-secondary-200 rounded-xl animate-pulse">
      <div className="w-7 h-7 rounded-full bg-secondary-300 flex-shrink-0" />
      <div className="h-3 w-20 rounded bg-secondary-300" />
    </div>
  )
}

function UserChip({ item, rank, total, onSearch, onNavigate }: UserChipProps) {
  const tooltipId = `chip-tooltip-${item.username}`
  const hitLabel = `${item.hit} ${item.hit === 1 ? 'hit' : 'hits'}`
  // Fade from 1.0 (rank 1) down to (1 - OPACITY_RANGE) for the last rank.
  // When there is only one chip there is nothing to rank against, so keep full opacity.
  const opacity = total <= 1 ? 1 : 1 - (rank / (total - 1)) * OPACITY_RANGE

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSearch(item.username)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      onNavigate(item.username, 'next')
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onNavigate(item.username, 'prev')
    }
  }

  return (
    // max-w constrains each chip on mobile so long usernames can't dominate the row;
    // reset to none on desktop where the pyramid layout handles sizing naturally.
    <div className="relative group max-w-[160px] md:max-w-none" style={{ opacity }}>
      <button
        onClick={() => onSearch(item.username)}
        onKeyDown={handleKeyDown}
        // min-h ensures a comfortable 44px tap target on mobile; desktop height is
        // already adequate from padding so we reset it there.
        className="w-full flex items-center gap-3 px-5 py-2.5 min-h-[44px] md:min-h-0 bg-white border border-secondary-200 rounded-xl text-sm font-medium text-secondary-700 hover:border-primary-400 hover:text-primary-700 hover:shadow-md hover:scale-105 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 active:scale-95 cursor-pointer"
        aria-label={`Search for ${item.username}`}
        aria-describedby={tooltipId}
      >
        {item.avatarUrl ? (
          <img
            src={item.avatarUrl}
            alt=""
            className="w-5 h-5 md:w-7 md:h-7 rounded-full flex-shrink-0 ring-2 ring-secondary-300"
            aria-hidden="true"
          />
        ) : (
          <span
            className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-secondary-200 flex items-center justify-center text-sm font-semibold text-secondary-600 flex-shrink-0 ring-2 ring-secondary-300"
            aria-hidden="true"
          >
            {item.username[0].toUpperCase()}
          </span>
        )}
        <span className="max-w-[140px] truncate">@{item.username}</span>
      </button>

      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded bg-secondary-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {hitLabel}
      </span>
    </div>
  )
}

export function MostSearched({ onSearch }: MostSearchedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobileLayout()

  const { data, isLoading } = useQuery({
    queryKey: ['topSearch'],
    queryFn: () => getTopSearch(CHIP_LIMIT),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    const skeletonIndices = Array.from({ length: CHIP_LIMIT }, (_, i) => i)

    if (isMobile) {
      return (
        <div className="border-t border-secondary-100 pt-2 space-y-2">
          <div className="h-3.5 w-52 bg-secondary-200 rounded animate-pulse mx-auto" />
          <div className="overflow-x-auto">
            <div className="grid grid-flow-col grid-rows-2 auto-cols-max gap-x-2.5 gap-y-2">
              {skeletonIndices.map((_, i) => (
                <ChipSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      )
    }

    const [skeletonTop, skeletonBottom] = computePyramidRows(skeletonIndices)
    return (
      <div className="border-t border-secondary-100 pt-3 space-y-3">
        <div className="h-3.5 w-52 bg-secondary-200 rounded animate-pulse mx-auto" />
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            {skeletonTop.map((_, i) => (
              <ChipSkeleton key={i} />
            ))}
          </div>
          {skeletonBottom.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {skeletonBottom.map((_, i) => (
                <ChipSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const items = data?.data ?? []

  // Fallback: return nothing so the page looks like the current empty state
  if (items.length === 0) return null

  const [topRow, bottomRow] = computePyramidRows(items)

  // All items in display order (top row first, then bottom row) so the index
  // aligns with the DOM order of buttons inside the container.
  const allItems = [...topRow, ...bottomRow]

  const handleChipNavigate = (currentUsername: string, direction: 'prev' | 'next') => {
    const currentIndex = allItems.findIndex((item) => item.username === currentUsername)
    const count = allItems.length
    const nextIndex =
      direction === 'next' ? (currentIndex + 1) % count : (currentIndex - 1 + count) % count
    const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('button')
    buttons?.[nextIndex]?.focus()
  }

  const chipProps = { total: allItems.length, onSearch, onNavigate: handleChipNavigate }

  return (
    <div
      ref={containerRef}
      className="border-t border-secondary-100 pt-2 md:pt-3 space-y-2 md:space-y-3"
    >
      <p className="text-sm font-medium text-secondary-500 text-center">
        Most searched GitHub users on GitLingo:
      </p>

      {isMobile ? (
        // Mobile: 2-row horizontal scroll grid — chips never wrap or get squished.
        // The relative wrapper hosts a right-edge fade that signals more chips exist.
        <div className="relative">
          <div
            className="overflow-x-auto"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            <div className="grid grid-flow-col grid-rows-2 auto-cols-max gap-x-2.5 gap-y-2 pb-1">
              {allItems.map((item, i) => (
                <UserChip key={item.username} item={item} rank={i} {...chipProps} />
              ))}
            </div>
          </div>
          {/* Right-edge gradient fade — visual hint that more chips exist off-screen */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent"
            aria-hidden="true"
          />
        </div>
      ) : (
        // Desktop: inverted pyramid (unchanged)
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            {topRow.map((item, i) => (
              <UserChip key={item.username} item={item} rank={i} {...chipProps} />
            ))}
          </div>
          {bottomRow.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {bottomRow.map((item, i) => (
                <UserChip key={item.username} item={item} rank={topRow.length + i} {...chipProps} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
