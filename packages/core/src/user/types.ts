/**
 * User Menu & Profile Types
 * Types for user menu and profile functionality
 */

import type { ReactNode } from 'react'

/**
 * User information
 */
export interface User {
  /** User ID */
  id: string | number

  /** User name */
  name: string

  /** User email */
  email?: string

  /** Avatar URL */
  avatar?: string

  /** User roles */
  roles?: string[]

  /** Additional user data */
  [key: string]: any
}

/**
 * User menu item
 */
export interface UserMenuItem {
  /** Unique identifier */
  id: string

  /** Menu item label */
  label: string

  /** Icon to display */
  icon?: ReactNode

  /** URL to navigate to */
  url?: string

  /** Custom action to execute */
  onSelect?: () => void | Promise<void>

  /** Whether this is a separator */
  separator?: boolean

  /** Custom styling */
  className?: string

  /** Whether item is disabled */
  disabled?: boolean

  /** Badge or count to display */
  badge?: string | number

  /** Badge color */
  badgeColor?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

/**
 * User menu configuration
 */
export interface UserMenuConfig {
  /** Show user avatar */
  showAvatar?: boolean

  /** Show user name */
  showName?: boolean

  /** Show user email */
  showEmail?: boolean

  /** Avatar size */
  avatarSize?: 'sm' | 'md' | 'lg'

  /** Custom menu items (top section) */
  topItems?: UserMenuItem[]

  /** Custom menu items (bottom section) */
  bottomItems?: UserMenuItem[]

  /** Show theme switcher */
  showThemeSwitcher?: boolean

  /** Show logout action */
  showLogout?: boolean

  /** Logout label */
  logoutLabel?: string

  /** Theme switcher label */
  themeSwitcherLabel?: string

  /** Position of the dropdown */
  position?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

  /** Custom logout handler */
  onLogout?: () => void | Promise<void>
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Theme preference */
  theme?: 'light' | 'dark' | 'system'

  /** Language preference */
  language?: string

  /** Sidebar collapsed state */
  sidebarCollapsed?: boolean

  /** Table density preference */
  tableDensity?: 'compact' | 'comfortable'

  /** Custom preferences */
  [key: string]: any
}

/**
 * Theme
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * User context value
 */
export interface UserContextValue {
  /** Current user */
  user: User | null

  /** User preferences */
  preferences: UserPreferences

  /** Update user */
  setUser: (user: User | null) => void

  /** Update preferences */
  updatePreferences: (preferences: Partial<UserPreferences>) => void

  /** Logout */
  logout: () => void | Promise<void>

  /** Whether user is authenticated */
  isAuthenticated: boolean

  /** Current theme */
  theme: Theme

  /** Set theme */
  setTheme: (theme: Theme) => void
}
