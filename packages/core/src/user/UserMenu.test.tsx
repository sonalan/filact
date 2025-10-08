/**
 * UserMenu Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { UserMenu } from './UserMenu'
import type { User } from './types'

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('UserMenu', () => {
  it('should render user menu trigger', () => {
    render(<UserMenu user={user} />, { wrapper })

    expect(screen.getByLabelText('User menu')).toBeInTheDocument()
  })

  it('should display user name', () => {
    render(<UserMenu user={user} />, { wrapper })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should display user email', () => {
    render(<UserMenu user={user} />, { wrapper })

    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should hide user name when showName is false', async () => {
    const userObj = userEvent.setup()
    render(<UserMenu user={user} showName={false} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    // User name should still appear in the dropdown header, just not in the trigger
    // Check that the trigger doesn't show the name prominently
    const allNameElements = screen.getAllByText('John Doe')
    // Should only appear in the dropdown header (1 time) not in trigger
    expect(allNameElements).toHaveLength(1)
  })

  it('should hide user avatar when showAvatar is false', () => {
    const { container } = render(<UserMenu user={user} showAvatar={false} />, { wrapper })

    const avatar = container.querySelector('.rounded-full')
    expect(avatar).not.toBeInTheDocument()
  })

  it('should open dropdown menu when clicked', async () => {
    const userObj = userEvent.setup()
    render(<UserMenu user={user} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    // Check for logout button to confirm menu is open
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should close dropdown when backdrop is clicked', async () => {
    const userObj = userEvent.setup()
    const { container } = render(<UserMenu user={user} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    const backdrop = container.querySelector('.fixed.inset-0')
    expect(backdrop).toBeInTheDocument()

    if (backdrop) {
      await userObj.click(backdrop)
    }

    // Menu should be closed, logout button should not be visible
    const logoutButtons = screen.queryAllByText('Logout')
    expect(logoutButtons).toHaveLength(0)
  })

  it('should call onLogout when logout is clicked', async () => {
    const onLogout = vi.fn()
    const userObj = userEvent.setup()
    render(<UserMenu user={user} onLogout={onLogout} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    const logoutButton = screen.getByText('Logout')
    await userObj.click(logoutButton)

    expect(onLogout).toHaveBeenCalled()
  })

  it('should show theme switcher when showThemeSwitcher is true', async () => {
    const userObj = userEvent.setup()
    render(<UserMenu user={user} showThemeSwitcher={true} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('should call onThemeChange when theme is changed', async () => {
    const onThemeChange = vi.fn()
    const userObj = userEvent.setup()
    render(<UserMenu user={user} theme="light" onThemeChange={onThemeChange} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    const darkButton = screen.getByText('Dark')
    await userObj.click(darkButton)

    expect(onThemeChange).toHaveBeenCalledWith('dark')
  })

  it('should highlight current theme', async () => {
    const userObj = userEvent.setup()
    render(<UserMenu user={user} theme="dark" />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    const darkButton = screen.getByText('Dark')
    expect(darkButton).toHaveClass('bg-blue-600')
  })

  it('should render custom top menu items', async () => {
    const userObj = userEvent.setup()
    const topItems = [
      { id: 'profile', label: 'Profile', url: '/profile' },
      { id: 'settings', label: 'Settings', url: '/settings' },
    ]

    render(<UserMenu user={user} topItems={topItems} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should render custom bottom menu items', async () => {
    const userObj = userEvent.setup()
    const bottomItems = [
      { id: 'help', label: 'Help', url: '/help' },
      { id: 'feedback', label: 'Feedback', url: '/feedback' },
    ]

    render(<UserMenu user={user} bottomItems={bottomItems} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    expect(screen.getByText('Help')).toBeInTheDocument()
    expect(screen.getByText('Feedback')).toBeInTheDocument()
  })

  it('should call item onSelect when custom menu item is clicked', async () => {
    const onSelect = vi.fn()
    const userObj = userEvent.setup()
    const topItems = [{ id: 'custom', label: 'Custom Item', onSelect }]

    render(<UserMenu user={user} topItems={topItems} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    const customItem = screen.getByText('Custom Item')
    await userObj.click(customItem)

    expect(onSelect).toHaveBeenCalled()
  })

  it('should display badge on menu item', async () => {
    const userObj = userEvent.setup()
    const topItems = [{ id: 'notifications', label: 'Notifications', badge: 5 }]

    render(<UserMenu user={user} topItems={topItems} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should disable menu item when disabled is true', async () => {
    const userObj = userEvent.setup()
    const onSelect = vi.fn()
    const topItems = [{ id: 'disabled', label: 'Disabled Item', disabled: true, onSelect }]

    render(<UserMenu user={user} topItems={topItems} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    const disabledItem = screen.getByText('Disabled Item').closest('button')
    expect(disabledItem).toBeDisabled()

    if (disabledItem) {
      await userObj.click(disabledItem)
    }
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should hide logout when showLogout is false', async () => {
    const userObj = userEvent.setup()
    render(<UserMenu user={user} showLogout={false} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })

  it('should use custom logout label', async () => {
    const userObj = userEvent.setup()
    render(<UserMenu user={user} logoutLabel="Sign Out" />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('should render menu item icon', async () => {
    const userObj = userEvent.setup()
    const topItems = [{ id: 'profile', label: 'Profile', icon: <span>👤</span> }]

    render(<UserMenu user={user} topItems={topItems} />, { wrapper })

    const trigger = screen.getByLabelText('User menu')
    await userObj.click(trigger)

    expect(screen.getByText('👤')).toBeInTheDocument()
  })
})
