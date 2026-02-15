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
  /** Provider name (github, gitlab, etc.) */
  provider: string
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
 *   provider="github"
 * />
 * ```
 */
export function ResultHeader({ profile, totalRepos, provider }: ResultHeaderProps) {
  const providerDisplay = provider.charAt(0).toUpperCase() + provider.slice(1)
  const accountType = profile.type || 'User'

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-secondary-200">
      {/* Avatar */}
      {profile.avatarUrl && (
        <img
          src={profile.avatarUrl}
          alt={`${profile.username} avatar`}
          className="w-16 h-16 rounded-full border-2 border-primary-200"
        />
      )}

      {/* Profile Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-xl font-bold text-secondary-900">
            {profile.name || profile.username}
          </h3>

          {/* Account Type Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            {accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase()}
          </span>

          {/* Provider Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {providerDisplay}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-2 text-sm text-secondary-600">
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
            className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 hover:text-primary-700 hover:underline"
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
    </div>
  )
}
