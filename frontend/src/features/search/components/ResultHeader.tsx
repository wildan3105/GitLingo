/**
 * ResultHeader Component
 * Displays profile summary information above chart
 */

import type { Profile } from '../../../contracts/api'

export type ResultHeaderProps = {
  /** User/organization profile information */
  profile: Profile
  /** Total number of repositories */
  totalRepos: number
}

/**
 * Result header showing profile summary
 *
 * Displays:
 * - Username
 * - Account type (User/Organization)
 * - Provider badge
 * - Total repository count
 *
 * @example
 * ```typescript
 * <ResultHeader
 *   profile={profile}
 *   totalRepos={125}
 * />
 * ```
 */
export function ResultHeader({ profile, totalRepos }: ResultHeaderProps) {
  const accountType = profile.type || 'User'

  // Ensure website URL has a protocol
  const normalizeUrl = (url: string): string => {
    if (!url) return url
    // If it already has a protocol, return as is
    if (url.match(/^https?:\/\//i)) return url
    // Otherwise, add https://
    return `https://${url}`
  }

  // Get display URL (without protocol)
  const getDisplayUrl = (url: string): string => {
    if (!url) return url
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  }

  return (
    <div className="flex items-start gap-4 pb-4 border-b border-secondary-200">
      {/* Avatar */}
      {profile.avatarUrl && (
        <img
          src={profile.avatarUrl}
          alt={`${profile.username} avatar`}
          className="w-16 h-16 rounded-full border-2 border-primary-200"
        />
      )}

      {/* Profile Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-semibold text-secondary-900">
            {profile.name || profile.username}
          </h3>

          {/* Account Type Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            {accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-2 text-sm text-secondary-600 leading-relaxed">
          <span className="font-medium">@{profile.username}</span>
          <span className="text-secondary-400">•</span>
          <span>
            {totalRepos.toLocaleString()} {totalRepos === 1 ? 'repository' : 'repositories'}
          </span>
        </div>

        {/* Profile Link */}
        {profile.profileUrl && (
          <a
            href={profile.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 hover:text-primary-700 hover:underline transition-all duration-200"
          >
            View Profile
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>

      {/* Additional Info (Right-aligned) */}
      {(profile.location || profile.websiteUrl) && (
        <div className="flex flex-col items-end gap-2 text-sm text-secondary-600">
          {/* Location */}
          {profile.location && (
            <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-secondary-900">
              <svg
                className="w-4 h-4 text-secondary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{profile.location}</span>
            </div>
          )}

          {/* Website */}
          {profile.websiteUrl && (
            <a
              href={normalizeUrl(profile.websiteUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-all duration-200 hover:underline underline-offset-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span className="truncate max-w-[200px]">{getDisplayUrl(profile.websiteUrl)}</span>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
