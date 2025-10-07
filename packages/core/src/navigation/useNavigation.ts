/**
 * Navigation Hook
 * Custom hook for managing navigation state
 */

import { useState, useCallback, useMemo } from 'react'
import { usePanel } from '../panel/PanelProvider'
import type { NavigationItem } from '../panel/types'

/**
 * Navigation state and utilities
 */
export interface NavigationState {
  /** Current active path */
  activePath: string

  /** Set active path */
  setActivePath: (path: string) => void

  /** Sidebar collapsed state */
  isCollapsed: boolean

  /** Toggle sidebar collapsed */
  toggleCollapsed: () => void

  /** Set collapsed state */
  setCollapsed: (collapsed: boolean) => void

  /** Mobile menu open state */
  isMobileMenuOpen: boolean

  /** Toggle mobile menu */
  toggleMobileMenu: () => void

  /** Close mobile menu */
  closeMobileMenu: () => void

  /** Navigation items */
  items: NavigationItem[]
}

/**
 * Hook to manage navigation state
 */
export function useNavigation(initialPath = ''): NavigationState {
  const { config } = usePanel()
  const [activePath, setActivePath] = useState(initialPath)
  const [isCollapsed, setCollapsed] = useState(
    config.layout?.sidebarCollapsed ?? false
  )
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Build navigation items
  const items = useMemo(() => {
    return config.navigation?.customItems || []
  }, [config.navigation])

  return {
    activePath,
    setActivePath,
    isCollapsed,
    toggleCollapsed,
    setCollapsed,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    items,
  }
}

/**
 * Check if a path is active
 */
export function isPathActive(currentPath: string, itemPath: string): boolean {
  if (!itemPath) return false
  if (currentPath === itemPath) return true

  // Check if current path starts with item path (for nested routes)
  return currentPath.startsWith(itemPath + '/')
}

/**
 * Get navigation item by path
 */
export function findNavigationItem(
  items: NavigationItem[],
  path: string
): NavigationItem | undefined {
  for (const item of items) {
    if (item.path === path) {
      return item
    }

    if (item.children) {
      const found = findNavigationItem(item.children, path)
      if (found) return found
    }
  }

  return undefined
}

/**
 * Get all parent navigation items for a path
 */
export function getNavigationParents(
  items: NavigationItem[],
  path: string,
  parents: NavigationItem[] = []
): NavigationItem[] {
  for (const item of items) {
    if (item.path === path) {
      return parents
    }

    if (item.children) {
      const found = getNavigationParents(item.children, path, [...parents, item])
      // Check if we actually found something (the path exists in children)
      const childHasPath = findNavigationItem(item.children, path)
      if (childHasPath) {
        return found
      }
    }
  }

  return []
}
