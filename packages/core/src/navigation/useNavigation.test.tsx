import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import { useNavigation, isPathActive, findNavigationItem, getNavigationParents } from './useNavigation'
import { PanelProvider } from '../panel/PanelProvider'
import { createPanel } from '../panel/builder'
import { createRestDataProvider } from '../providers/rest'
import type { NavigationItem } from '../panel/types'

describe('useNavigation', () => {
  const panel = createPanel('admin', 'Admin Panel')
    .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
    .build()

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PanelProvider config={panel}>{children}</PanelProvider>
  )

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper })

    expect(result.current.activePath).toBe('')
    expect(result.current.isCollapsed).toBe(false)
    expect(result.current.isMobileMenuOpen).toBe(false)
  })

  it('should initialize with custom path', () => {
    const { result } = renderHook(() => useNavigation('/dashboard'), { wrapper })

    expect(result.current.activePath).toBe('/dashboard')
  })

  it('should update active path', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper })

    act(() => {
      result.current.setActivePath('/users')
    })

    expect(result.current.activePath).toBe('/users')
  })

  it('should toggle collapsed state', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper })

    expect(result.current.isCollapsed).toBe(false)

    act(() => {
      result.current.toggleCollapsed()
    })

    expect(result.current.isCollapsed).toBe(true)

    act(() => {
      result.current.toggleCollapsed()
    })

    expect(result.current.isCollapsed).toBe(false)
  })

  it('should set collapsed state', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper })

    act(() => {
      result.current.setCollapsed(true)
    })

    expect(result.current.isCollapsed).toBe(true)
  })

  it('should toggle mobile menu', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper })

    expect(result.current.isMobileMenuOpen).toBe(false)

    act(() => {
      result.current.toggleMobileMenu()
    })

    expect(result.current.isMobileMenuOpen).toBe(true)

    act(() => {
      result.current.toggleMobileMenu()
    })

    expect(result.current.isMobileMenuOpen).toBe(false)
  })

  it('should close mobile menu', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper })

    act(() => {
      result.current.toggleMobileMenu()
    })

    expect(result.current.isMobileMenuOpen).toBe(true)

    act(() => {
      result.current.closeMobileMenu()
    })

    expect(result.current.isMobileMenuOpen).toBe(false)
  })
})

describe('isPathActive', () => {
  it('should return true for exact match', () => {
    expect(isPathActive('/users', '/users')).toBe(true)
  })

  it('should return true for nested routes', () => {
    expect(isPathActive('/users/123', '/users')).toBe(true)
    expect(isPathActive('/users/123/edit', '/users')).toBe(true)
  })

  it('should return false for different paths', () => {
    expect(isPathActive('/posts', '/users')).toBe(false)
  })

  it('should return false for empty item path', () => {
    expect(isPathActive('/users', '')).toBe(false)
  })

  it('should not match partial segments', () => {
    expect(isPathActive('/user-settings', '/users')).toBe(false)
  })
})

describe('findNavigationItem', () => {
  const items: NavigationItem[] = [
    {
      name: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      name: 'users',
      label: 'Users',
      path: '/users',
      children: [
        {
          name: 'all-users',
          label: 'All Users',
          path: '/users/all',
        },
        {
          name: 'roles',
          label: 'Roles',
          path: '/users/roles',
        },
      ],
    },
  ]

  it('should find top-level item', () => {
    const item = findNavigationItem(items, '/dashboard')
    expect(item).toBeDefined()
    expect(item?.name).toBe('dashboard')
  })

  it('should find nested item', () => {
    const item = findNavigationItem(items, '/users/all')
    expect(item).toBeDefined()
    expect(item?.name).toBe('all-users')
  })

  it('should return undefined for non-existent path', () => {
    const item = findNavigationItem(items, '/not-found')
    expect(item).toBeUndefined()
  })
})

describe('getNavigationParents', () => {
  const items: NavigationItem[] = [
    {
      name: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      name: 'users',
      label: 'Users',
      path: '/users',
      children: [
        {
          name: 'all-users',
          label: 'All Users',
          path: '/users/all',
        },
        {
          name: 'settings',
          label: 'Settings',
          path: '/users/settings',
          children: [
            {
              name: 'profile',
              label: 'Profile',
              path: '/users/settings/profile',
            },
          ],
        },
      ],
    },
  ]

  it('should return empty array for top-level item', () => {
    const parents = getNavigationParents(items, '/dashboard')
    expect(parents).toEqual([])
  })

  it('should return single parent for first-level nested item', () => {
    const parents = getNavigationParents(items, '/users/all')
    expect(parents).toHaveLength(1)
    expect(parents[0].name).toBe('users')
  })

  it('should return all parents for deeply nested item', () => {
    const parents = getNavigationParents(items, '/users/settings/profile')
    expect(parents).toHaveLength(2)
    expect(parents[0].name).toBe('users')
    expect(parents[1].name).toBe('settings')
  })

  it('should return empty array for non-existent path', () => {
    const parents = getNavigationParents(items, '/not-found')
    expect(parents).toEqual([])
  })
})
