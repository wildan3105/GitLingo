/**
 * Dropdown Component
 * Accessible dropdown menu with keyboard navigation
 */

import { useState, useRef, useEffect, type ReactNode } from 'react'

export type DropdownItem = {
  /** Unique identifier for the item */
  id: string
  /** Display label */
  label: string
  /** Icon element to show before label */
  icon?: ReactNode
  /** Click handler */
  onClick: () => void
  /** Disabled state */
  disabled?: boolean
}

export type DropdownProps = {
  /** Trigger button content */
  trigger: ReactNode
  /** Menu items */
  items: DropdownItem[]
  /** Custom content to render instead of items */
  customContent?: ReactNode
  /** Additional CSS classes for trigger button */
  className?: string
  /** Disabled state */
  disabled?: boolean
  /** Alignment of dropdown menu */
  align?: 'left' | 'right' | 'center'
}

/**
 * Dropdown menu component
 *
 * Features:
 * - Click outside to close
 * - Keyboard navigation (Escape, Arrow keys, Enter)
 * - Accessible with ARIA attributes
 * - Configurable alignment
 * - Smooth transitions
 *
 * @example
 * ```typescript
 * <Dropdown
 *   trigger={<span>Export</span>}
 *   items={[
 *     { id: 'csv', label: 'Download CSV', onClick: () => {} },
 *     { id: 'png', label: 'Download PNG', onClick: () => {} },
 *   ]}
 * />
 * ```
 */
export function Dropdown({
  trigger,
  items,
  customContent,
  className = '',
  disabled = false,
  align = 'center',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      const enabledItems = items.filter((item) => !item.disabled)
      const enabledCount = enabledItems.length

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          buttonRef.current?.focus()
          break

        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex((prev) => {
            const nextIndex = prev + 1
            return nextIndex >= enabledCount ? 0 : nextIndex
          })
          break

        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex((prev) => {
            const nextIndex = prev - 1
            return nextIndex < 0 ? enabledCount - 1 : nextIndex
          })
          break

        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < enabledCount) {
            const item = enabledItems[focusedIndex]
            item.onClick()
            setIsOpen(false)
            setFocusedIndex(-1)
          }
          break

        case 'Home':
          event.preventDefault()
          setFocusedIndex(0)
          break

        case 'End':
          event.preventDefault()
          setFocusedIndex(enabledCount - 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, focusedIndex, items])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
      if (isOpen) {
        setFocusedIndex(-1)
      }
    }
  }

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick()
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg
          font-medium text-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {trigger}
        {/* Chevron icon */}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`
            absolute z-50 mt-2 min-w-[12rem] origin-top
            bg-white rounded-lg shadow-lg border border-secondary-200
            ${customContent ? 'py-0' : 'py-1'} animate-in fade-in slide-in-from-top-1 duration-200
            ${alignmentClasses[align]}
          `}
        >
          {customContent
            ? customContent
            : items.map((item, index) => {
                const isFocused = index === focusedIndex
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                    transition-colors duration-150
                    ${
                      item.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : isFocused
                          ? 'bg-secondary-100 text-secondary-900'
                          : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                    }
                    focus:outline-none focus:bg-secondary-100
                  `}
                    tabIndex={isFocused ? 0 : -1}
                  >
                    {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                  </button>
                )
              })}
        </div>
      )}
    </div>
  )
}
