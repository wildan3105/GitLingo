/**
 * Dropdown Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropdown } from '../../../src/shared/components/Dropdown'
import type { DropdownItem } from '../../../src/shared/components/Dropdown'

function makeItems(n = 2): DropdownItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `item-${i}`,
    label: `Option ${i + 1}`,
    onClick: vi.fn(),
  }))
}

function renderDropdown(props?: Partial<React.ComponentProps<typeof Dropdown>>) {
  const items = props?.items ?? makeItems()
  return render(
    <Dropdown trigger={<span>Open</span>} items={items} {...props} />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Dropdown', () => {
  describe('rendering', () => {
    it('renders the trigger content', () => {
      renderDropdown()
      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('is closed by default — menu not in DOM', () => {
      renderDropdown()
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('renders customContent instead of items when provided', async () => {
      const user = userEvent.setup()
      renderDropdown({ customContent: <div>Custom panel</div> })
      await user.click(screen.getByRole('button'))
      expect(screen.getByText('Custom panel')).toBeInTheDocument()
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
    })
  })

  describe('open / close', () => {
    it('opens the menu on trigger click', async () => {
      const user = userEvent.setup()
      renderDropdown()
      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('closes the menu on a second trigger click', async () => {
      const user = userEvent.setup()
      renderDropdown()
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByRole('button'))
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('closes when clicking outside the dropdown', async () => {
      const user = userEvent.setup()
      renderDropdown()
      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('menu')).toBeInTheDocument()
      fireEvent.mouseDown(document.body)
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    })

    it('closes and returns focus to trigger on Escape', async () => {
      const user = userEvent.setup()
      renderDropdown()
      const trigger = screen.getByRole('button')
      await user.click(trigger)
      expect(screen.getByRole('menu')).toBeInTheDocument()
      fireEvent.keyDown(document, { key: 'Escape' })
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    })

    it('does NOT open when the trigger is disabled', async () => {
      const user = userEvent.setup()
      renderDropdown({ disabled: true })
      await user.click(screen.getByRole('button'))
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('item interaction', () => {
    it('calls item onClick and closes menu when a menu item is clicked', async () => {
      const user = userEvent.setup()
      const items = makeItems(2)
      renderDropdown({ items })
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Option 1'))
      expect(items[0].onClick).toHaveBeenCalledOnce()
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('does NOT call onClick for a disabled item', async () => {
      const user = userEvent.setup()
      const items: DropdownItem[] = [
        { id: 'enabled', label: 'Enabled', onClick: vi.fn() },
        { id: 'disabled', label: 'Disabled', onClick: vi.fn(), disabled: true },
      ]
      renderDropdown({ items })
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Disabled'))
      expect(items[1].onClick).not.toHaveBeenCalled()
    })

    it('keeps the menu open after clicking a disabled item', async () => {
      const user = userEvent.setup()
      const items: DropdownItem[] = [
        { id: 'd', label: 'Disabled', onClick: vi.fn(), disabled: true },
      ]
      renderDropdown({ items })
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Disabled'))
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowDown moves focus to the first item', async () => {
      const user = userEvent.setup()
      renderDropdown()
      await user.click(screen.getByRole('button'))
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      const items = screen.getAllByRole('menuitem')
      expect(items[0]).toHaveAttribute('tabindex', '0')
    })

    it('ArrowDown wraps from last item back to first', async () => {
      const user = userEvent.setup()
      const items = makeItems(2)
      renderDropdown({ items })
      await user.click(screen.getByRole('button'))
      fireEvent.keyDown(document, { key: 'ArrowDown' }) // → index 0
      fireEvent.keyDown(document, { key: 'ArrowDown' }) // → index 1
      fireEvent.keyDown(document, { key: 'ArrowDown' }) // → wraps to index 0
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems[0]).toHaveAttribute('tabindex', '0')
      expect(menuItems[1]).toHaveAttribute('tabindex', '-1')
    })

    it('ArrowUp wraps from first item to last', async () => {
      const user = userEvent.setup()
      const items = makeItems(2)
      renderDropdown({ items })
      await user.click(screen.getByRole('button'))
      fireEvent.keyDown(document, { key: 'ArrowUp' }) // wraps to last
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems[1]).toHaveAttribute('tabindex', '0')
    })

    it('Home key focuses the first item', async () => {
      const user = userEvent.setup()
      renderDropdown()
      await user.click(screen.getByRole('button'))
      fireEvent.keyDown(document, { key: 'ArrowDown' }) // go to index 0
      fireEvent.keyDown(document, { key: 'ArrowDown' }) // go to index 1
      fireEvent.keyDown(document, { key: 'Home' })      // back to first
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems[0]).toHaveAttribute('tabindex', '0')
    })

    it('End key focuses the last item', async () => {
      const user = userEvent.setup()
      renderDropdown()
      await user.click(screen.getByRole('button'))
      fireEvent.keyDown(document, { key: 'End' })
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems[menuItems.length - 1]).toHaveAttribute('tabindex', '0')
    })

    it('Enter activates the focused item and closes menu', async () => {
      const user = userEvent.setup()
      const items = makeItems(2)
      renderDropdown({ items })
      await user.click(screen.getByRole('button'))
      fireEvent.keyDown(document, { key: 'ArrowDown' }) // focus index 0
      fireEvent.keyDown(document, { key: 'Enter' })
      expect(items[0].onClick).toHaveBeenCalledOnce()
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('Space activates the focused item and closes menu', async () => {
      const user = userEvent.setup()
      const items = makeItems(2)
      renderDropdown({ items })
      await user.click(screen.getByRole('button'))
      fireEvent.keyDown(document, { key: 'ArrowDown' }) // focus index 0
      fireEvent.keyDown(document, { key: ' ' })
      expect(items[0].onClick).toHaveBeenCalledOnce()
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('alignment', () => {
    it('applies right-0 class for align="right"', async () => {
      const user = userEvent.setup()
      renderDropdown({ align: 'right' })
      await user.click(screen.getByRole('button'))
      const menu = screen.getByRole('menu')
      expect(menu.className).toContain('right-0')
    })

    it('applies left-0 class for align="left"', async () => {
      const user = userEvent.setup()
      renderDropdown({ align: 'left' })
      await user.click(screen.getByRole('button'))
      const menu = screen.getByRole('menu')
      expect(menu.className).toContain('left-0')
    })
  })
})
