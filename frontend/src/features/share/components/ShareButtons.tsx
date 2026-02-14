/**
 * ShareButtons Component
 * Social media share buttons for X (Twitter) and Facebook
 */

import { useState } from 'react'
import { buildShareUrl, openSharePopup } from '../utils/buildShareUrl'

export type ShareButtonsProps = {
  /** GitHub username to share */
  username: string
  /** Provider (github, gitlab, etc.) */
  provider: string
  /** Disabled state */
  disabled?: boolean
}

/**
 * Share buttons component for social media platforms
 *
 * Features:
 * - Share to X (Twitter)
 * - Share to Facebook
 * - Opens share dialogs in centered popup windows
 * - Responsive layout
 * - Accessible with ARIA labels
 *
 * @example
 * ```typescript
 * <ShareButtons username="octocat" provider="github" />
 * ```
 */
export function ShareButtons({ username, provider, disabled = false }: ShareButtonsProps) {
  const appUrl = window.location.origin
  const [sharedPlatform, setSharedPlatform] = useState<'twitter' | 'facebook' | null>(null)

  const handleShare = (platform: 'twitter' | 'facebook') => {
    const shareUrl = buildShareUrl(platform, { username, provider, appUrl })
    openSharePopup(shareUrl)

    // Show success feedback
    setSharedPlatform(platform)
    setTimeout(() => setSharedPlatform(null), 2000)
  }

  const buttonBaseClass = `
    inline-flex items-center gap-2 px-4 py-2 rounded-lg
    font-medium text-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Twitter / X Button */}
      <button
        type="button"
        onClick={() => handleShare('twitter')}
        disabled={disabled}
        aria-label="Share on X (Twitter)"
        className={`
          ${buttonBaseClass}
          bg-black text-white
          hover:bg-gray-800
          focus:ring-gray-500
        `}
      >
        {sharedPlatform === 'twitter' ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Shared!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </>
        )}
      </button>

      {/* Facebook Button */}
      <button
        type="button"
        onClick={() => handleShare('facebook')}
        disabled={disabled}
        aria-label="Share on Facebook"
        className={`
          ${buttonBaseClass}
          bg-[#1877F2] text-white
          hover:bg-[#166FE5]
          focus:ring-blue-500
        `}
      >
        {sharedPlatform === 'facebook' ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Shared!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Share on Facebook
          </>
        )}
      </button>
    </div>
  )
}
