/**
 * ResultHeader Component
 * Displays profile summary information above chart
 */

import { useState } from 'react'
import type { Profile, Metadata } from '../../../contracts/api'

export type ResultHeaderProps = {
  /** User/organization profile information */
  profile: Profile
  /** Total number of repositories */
  totalRepos: number
  /** API response metadata (for last updated timestamp) */
  metadata: Metadata
}

/**
 * Format ISO timestamp to relative time (e.g., "2h ago")
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 30) return `${diffDay}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Format ISO timestamp to human-readable local time
 */
function formatLocalDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

/**
 * Result header showing profile summary
 *
 * Displays:
 * - Row 1: Avatar + Name + Badge | Action buttons
 * - Row 2: @username + repos | Location + Website + Last updated
 *
 * @example
 * ```typescript
 * <ResultHeader
 *   profile={profile}
 *   totalRepos={125}
 *   metadata={metadata}
 * />
 * ```
 */
export function ResultHeader({ profile, totalRepos, metadata }: ResultHeaderProps) {
  const [copied, setCopied] = useState(false)
  const accountType = profile.type || 'User'

  // Construct GitHub profile URL (backend doesn't always return profileUrl)
  const profileUrl = profile.profileUrl || `https://github.com/${profile.username}`

  // Ensure website URL has a protocol
  const normalizeUrl = (url: string): string => {
    if (!url) return url
    if (url.match(/^https?:\/\//i)) return url
    return `https://${url}`
  }

  // Get display URL (without protocol)
  const getDisplayUrl = (url: string): string => {
    if (!url) return url
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  }

  // Copy profile URL to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Identity + Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Avatar + Name + Badge */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={`${profile.username} avatar`}
              className="w-14 h-14 rounded-full border-2 border-primary-200 flex-shrink-0"
            />
          )}

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="text-lg font-semibold text-secondary-900 truncate">
              {profile.name || profile.username}
            </h3>

            {/* Account Type Badge */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 flex-shrink-0">
              {accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase()}
            </span>

            {/* Verified Badge */}
            {profile.isVerified && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 flex-shrink-0"
                title={
                  profile.type === 'organization'
                    ? 'Verified by Github'
                    : 'Public email available on GitHub profile'
                }
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {
                  profile.type === 'organization'
                    ? 'Verified'
                    : 'Email available' /* More specific for user to indicate they have public email */
                }
              </span>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Open GitHub Button */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 hover:border-secondary-400 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">Open GitHub</span>
          </a>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 hover:border-secondary-400 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Copy profile link"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 text-success-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="hidden sm:inline text-success-600">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Metadata */}
      <div className="flex items-center justify-between gap-4 text-sm text-secondary-600 pt-2 border-t border-secondary-100">
        {/* Left: @username + repos */}
        <div className="flex items-center gap-2 leading-relaxed">
          <span className="font-medium text-secondary-700">@{profile.username}</span>
          <span className="text-secondary-400">•</span>
          <span>
            {totalRepos.toLocaleString()} {totalRepos === 1 ? 'repository' : 'repositories'}
          </span>
        </div>

        {/* Right: Location + Website + Last Updated */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Location */}
          {profile.location && (
            <>
              <div className="flex items-center gap-1.5" title={profile.location}>
                <svg
                  className="w-4 h-4 text-secondary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                <span className="hidden md:inline">{profile.location}</span>
              </div>
              <span className="text-secondary-400 hidden md:inline">•</span>
            </>
          )}

          {/* Website */}
          {profile.websiteUrl && (
            <>
              <a
                href={normalizeUrl(profile.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors duration-200"
                title={profile.websiteUrl}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="hidden md:inline truncate max-w-[150px]">
                  {getDisplayUrl(profile.websiteUrl)}
                </span>
              </a>
              <span className="text-secondary-400 hidden md:inline">•</span>
            </>
          )}

          {/* Last Updated */}
          <div
            className="flex items-center gap-1.5"
            title={formatLocalDateTime(metadata.generatedAt)}
          >
            <svg
              className="w-4 h-4 text-secondary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Updated {formatRelativeTime(metadata.generatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
