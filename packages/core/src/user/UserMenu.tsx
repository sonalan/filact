/**
 * UserMenu Component
 * Dropdown menu for user account actions
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAvatar } from './UserAvatar'
import type { User, UserMenuConfig, UserMenuItem, Theme } from './types'

/**
 * UserMenu props
 */
export interface UserMenuProps extends UserMenuConfig {
  /** Current user */
  user: User

  /** Current theme */
  theme?: Theme

  /** Set theme callback */
  onThemeChange?: (theme: Theme) => void

  /** Custom class name */
  className?: string
}

/**
 * UserMenu Component
 */
export function UserMenu({
  user,
  theme = 'light',
  onThemeChange,
  showAvatar = true,
  showName = true,
  showEmail = true,
  avatarSize = 'md',
  topItems = [],
  bottomItems = [],
  showThemeSwitcher = true,
  showLogout = true,
  logoutLabel = 'Logout',
  themeSwitcherLabel = 'Theme',
  position = 'bottom-end',
  onLogout,
  className = '',
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  // Handle menu item selection
  const handleItemSelect = async (item: UserMenuItem) => {
    if (item.disabled) return

    setIsOpen(false)

    if (item.onSelect) {
      await item.onSelect()
    } else if (item.url) {
      navigate(item.url)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    setIsOpen(false)
    if (onLogout) {
      await onLogout()
    }
  }

  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
  }

  // Get position classes
  const positionClasses = {
    'bottom-start': 'top-full left-0 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
    'top-start': 'bottom-full left-0 mb-2',
    'top-end': 'bottom-full right-0 mb-2',
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 hover:bg-gray-100 transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {showAvatar && <UserAvatar user={user} size={avatarSize} />}

        {(showName || showEmail) && (
          <div className="text-left hidden sm:block">
            {showName && <div className="text-sm font-medium text-gray-900">{user.name}</div>}
            {showEmail && user.email && (
              <div className="text-xs text-gray-500">{user.email}</div>
            )}
          </div>
        )}

        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className={`absolute ${positionClasses[position]} z-20 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1`}
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <UserAvatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                  {user.email && (
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Menu Items */}
            {topItems.length > 0 && (
              <div className="py-1">
                {topItems.map((item) => (
                  <MenuItem key={item.id} item={item} onSelect={handleItemSelect} />
                ))}
              </div>
            )}

            {/* Theme Switcher */}
            {showThemeSwitcher && (
              <div className="py-1 border-t border-gray-200">
                <div className="px-4 py-2 text-xs font-medium text-gray-500">
                  {themeSwitcherLabel}
                </div>
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-2">
                    {(['light', 'dark', 'system'] as Theme[]).map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => handleThemeChange(themeOption)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          theme === themeOption
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Menu Items */}
            {bottomItems.length > 0 && (
              <div className="py-1 border-t border-gray-200">
                {bottomItems.map((item) => (
                  <MenuItem key={item.id} item={item} onSelect={handleItemSelect} />
                ))}
              </div>
            )}

            {/* Logout */}
            {showLogout && (
              <div className="py-1 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  {logoutLabel}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * MenuItem Component
 */
function MenuItem({
  item,
  onSelect,
}: {
  item: UserMenuItem
  onSelect: (item: UserMenuItem) => void
}) {
  if (item.separator) {
    return <div className="border-t border-gray-200 my-1" />
  }

  const badgeColors = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
  }

  return (
    <button
      onClick={() => onSelect(item)}
      disabled={item.disabled}
      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
        item.disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100'
      } ${item.className || ''}`}
    >
      <span className="flex items-center">
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.label}
      </span>

      {item.badge !== undefined && (
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            badgeColors[item.badgeColor || 'default']
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  )
}
