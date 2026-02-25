/**
 * SearchLoadingIndicator
 * Animated equalizer bars + one-shot progress through status messages.
 *
 * Each of the 5 messages represents one phase (20% each). Progress advances
 * via time-based steps and stops at 95% — indicating work is still ongoing —
 * rather than looping. The component unmounts when the search completes.
 */

import { useState, useEffect } from 'react'

export const LOADING_MESSAGES = [
  'Fetching the profile...',
  'Loading repositories...',
  'Analyzing language usage...',
  'Computing statistics...',
  'Preparing your insights...',
] as const

// Progress value shown at each step. Caps at 95% since loading is still ongoing.
export const STEP_PROGRESS = [20, 40, 60, 80, 95] as const

export const MESSAGE_INTERVAL_MS = 2_000

export function SearchLoadingIndicator() {
  const [msgIndex, setMsgIndex] = useState(0)

  // Advance one step at a time; stop when the last message is reached
  useEffect(() => {
    if (msgIndex === LOADING_MESSAGES.length - 1) return
    const timer = setTimeout(() => setMsgIndex((i) => i + 1), MESSAGE_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [msgIndex])

  const progress = STEP_PROGRESS[msgIndex]

  return (
    <div
      className="slow-search-enter flex flex-col items-center gap-3 py-2 w-full max-w-xs mx-auto"
      role="status"
      aria-live="polite"
      aria-label="Loading"
      data-testid="search-loading-indicator"
    >
      {/* Equalizer bars — GPU-only animation via transform */}
      <div className="flex items-end gap-1 h-8" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className="w-1 h-full rounded-full bg-blue-500 block"
            style={{
              transformOrigin: 'bottom',
              animation: 'waveBar 1.1s ease-in-out infinite',
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>

      {/* Progress bar with percentage below */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <div className="w-full h-1.5 bg-secondary-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
        <span
          className="text-sm font-medium text-secondary-600 tabular-nums"
          data-testid="progress-value"
          aria-hidden="true"
        >
          {progress}%
        </span>
      </div>

      {/* Status message — key change triggers slide-up animation on each step */}
      <p key={msgIndex} className="text-xs text-secondary-500 animate-message-cycle">
        {LOADING_MESSAGES[msgIndex]}
      </p>
    </div>
  )
}
