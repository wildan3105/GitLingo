/**
 * MostSearched Component
 * Shows the top-searched GitHub users as clickable avatar+username chips.
 * Only rendered on the homepage empty state; returns null when data is unavailable.
 */

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
}

function UserChip({ item, onSearch }: UserChipProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSearch(item.username)
    }
  }

  return (
    <button
      onClick={() => onSearch(item.username)}
      onKeyDown={handleKeyDown}
      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-secondary-200 rounded-full text-sm font-medium text-secondary-700 hover:border-primary-400 hover:text-primary-700 hover:shadow-md hover:scale-105 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 active:scale-95 cursor-pointer"
      aria-label={`Search for ${item.username}`}
    >
      {item.avatarUrl ? (
        <img
          src={item.avatarUrl}
          alt=""
          className="w-5 h-5 rounded-full flex-shrink-0"
          aria-hidden="true"
        />
      ) : (
        <span
          className="w-5 h-5 rounded-full bg-secondary-200 flex items-center justify-center text-xs font-semibold text-secondary-600 flex-shrink-0"
          aria-hidden="true"
        >
          {item.username[0].toUpperCase()}
        </span>
      )}
      <span className="max-w-[120px] truncate">{item.username}</span>
    </button>
  )
}

export function MostSearched({ onSearch }: MostSearchedProps) {
  const { data } = useQuery({
    queryKey: ['topSearch'],
    queryFn: () => getTopSearch(9),
    staleTime: 5 * 60 * 1000,
  })

  const items = data?.data ?? []

  // Fallback: return nothing so the page looks like the current empty state
  if (items.length === 0) return null

  const [topRow, bottomRow] = computePyramidRows(items)

  return (
    <div className="border-t border-secondary-100 pt-5 space-y-3">
      <p className="text-sm text-secondary-500 text-center">
        Need some inspiration? Here are our &ldquo;most searched&rdquo; users on GitLingo:
      </p>
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2">
          {topRow.map((item) => (
            <UserChip key={item.username} item={item} onSearch={onSearch} />
          ))}
        </div>
        {bottomRow.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {bottomRow.map((item) => (
              <UserChip key={item.username} item={item} onSearch={onSearch} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
