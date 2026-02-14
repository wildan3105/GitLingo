/**
 * Social Media Share URL Builder
 * Generates shareable URLs for different social platforms
 */

export type Platform = 'twitter' | 'facebook'

export type ShareData = {
  /** GitHub username to share */
  username: string
  /** Provider (github, gitlab, etc.) */
  provider: string
  /** Base URL of the application */
  appUrl: string
}

/**
 * Builds a shareable URL for a specific social media platform
 *
 * Constructs platform-specific share URLs with pre-filled text and
 * links back to the application with query parameters.
 *
 * @param platform - Social media platform (twitter or facebook)
 * @param data - Share data including username, provider, and app URL
 * @returns Complete share URL for the platform
 *
 * @example
 * ```typescript
 * buildShareUrl('twitter', {
 *   username: 'octocat',
 *   provider: 'github',
 *   appUrl: 'https://gitlingo.dev'
 * })
 * // Returns: "https://twitter.com/intent/tweet?text=...&url=..."
 * ```
 */
export function buildShareUrl(platform: Platform, data: ShareData): string {
  const { username, provider, appUrl } = data

  // Build the app URL with query parameters
  const targetUrl = `${appUrl}?username=${encodeURIComponent(
    username
  )}&provider=${encodeURIComponent(provider)}`

  switch (platform) {
    case 'twitter': {
      const text = `Check out ${username}'s programming language stats on GitLingo!`
      const encodedText = encodeURIComponent(text)
      const encodedUrl = encodeURIComponent(targetUrl)
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    }

    case 'facebook': {
      const encodedUrl = encodeURIComponent(targetUrl)
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    }

    default: {
      // TypeScript should prevent this, but handle it anyway
      const _exhaustiveCheck: never = platform
      throw new Error(`Unsupported platform: ${_exhaustiveCheck}`)
    }
  }
}

/**
 * Opens a share URL in a centered popup window
 *
 * Creates a popup window with specified dimensions, centered on screen.
 * Used for social media share dialogs.
 *
 * @param url - The URL to open in the popup
 * @param width - Popup width in pixels (default: 600)
 * @param height - Popup height in pixels (default: 400)
 *
 * @example
 * ```typescript
 * const shareUrl = buildShareUrl('twitter', data)
 * openSharePopup(shareUrl)
 * ```
 */
export function openSharePopup(url: string, width: number = 600, height: number = 400): void {
  // Calculate center position
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'toolbar=no',
    'location=no',
    'directories=no',
    'status=no',
    'menubar=no',
    'scrollbars=yes',
    'resizable=yes',
  ].join(',')

  window.open(url, '_blank', features)
}
