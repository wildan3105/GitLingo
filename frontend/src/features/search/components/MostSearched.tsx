/**
 * MostSearched Component
 * Shows the top-searched GitHub users as clickable avatar+username chips.
 * Only rendered on the homepage empty state; returns null when data is unavailable.
 */

import { useRef } from 'react'
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
  onSearch: (username: string) => void
  onNavigate: (username: string, direction: 'prev' | 'next') => void
}

function UserChip({ item, onSearch, onNavigate }: UserChipProps) {
  const tooltipId = `chip-tooltip-${item.username}`
  const hitLabel = `${item.hit} ${item.hit === 1 ? 'hit' : 'hits'}`

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
    <div className="relative group">
      <button
        onClick={() => onSearch(item.username)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-secondary-200 rounded-xl text-sm font-medium text-secondary-700 hover:border-primary-400 hover:text-primary-700 hover:shadow-md hover:scale-105 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 active:scale-95 cursor-pointer"
        aria-label={`Search for ${item.username}`}
        aria-describedby={tooltipId}
      >
        {item.avatarUrl ? (
          <img
            src={item.avatarUrl}
            alt=""
            className="w-7 h-7 rounded-full flex-shrink-0"
            aria-hidden="true"
          />
        ) : (
          <span
            className="w-7 h-7 rounded-full bg-secondary-200 flex items-center justify-center text-sm font-semibold text-secondary-600 flex-shrink-0"
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
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-secondary-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {hitLabel}
      </span>
    </div>
  )
}

export function MostSearched({ onSearch }: MostSearchedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['topSearch'],
    queryFn: () => getTopSearch(9),
    staleTime: 5 * 60 * 1000,
  })

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

  return (
    <div ref={containerRef} className="border-t border-secondary-100 pt-5 space-y-3">
      <p className="text-sm text-secondary-500 text-center">
        Most searched GitHub users on GitLingo:
      </p>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-3">
          {topRow.map((item) => (
            <UserChip
              key={item.username}
              item={item}
              onSearch={onSearch}
              onNavigate={handleChipNavigate}
            />
          ))}
        </div>
        {bottomRow.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {bottomRow.map((item) => (
              <UserChip
                key={item.username}
                item={item}
                onSearch={onSearch}
                onNavigate={handleChipNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
