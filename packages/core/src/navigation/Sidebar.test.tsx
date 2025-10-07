import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'
import { PanelProvider } from '../panel/PanelProvider'
import { createPanel } from '../panel/builder'
import { createResource } from '../resources/builder'
import { createRestDataProvider } from '../providers/rest'
import type { NavigationItem } from '../panel/types'

describe('Sidebar', () => {
  const provider = createRestDataProvider({ baseUrl: 'http://api.example.com' })

  it('should render sidebar', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .branding({ name: 'My App' })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('My App')).toBeInTheDocument()
    })
  })

  it('should render custom navigation items', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .navigation({
        customItems: [
          { name: 'dashboard', label: 'Dashboard', path: '/dashboard' },
          { name: 'settings', label: 'Settings', path: '/settings' },
        ],
      })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  it('should render resources as navigation items', async () => {
    const userResource = createResource(
      { name: 'User', endpoint: '/users', primaryKey: 'id', label: 'Users' },
      provider
    ).build()

    const postResource = createResource(
      { name: 'Post', endpoint: '/posts', primaryKey: 'id', label: 'Posts' },
      provider
    ).build()

    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .resource(userResource)
      .resource(postResource)
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Posts')).toBeInTheDocument()
    })
  })

  it('should highlight active path', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .navigation({
        customItems: [
          { name: 'dashboard', label: 'Dashboard', path: '/dashboard' },
          { name: 'users', label: 'Users', path: '/users' },
        ],
      })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar activePath="/dashboard" />
      </PanelProvider>
    )

    await waitFor(() => {
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('bg-blue-50')
      expect(dashboardLink).toHaveAttribute('aria-current', 'page')
    })
  })

  it('should toggle collapse when button clicked', async () => {
    const user = userEvent.setup()
    const onCollapse = vi.fn()

    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .branding({ name: 'My App' })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar onCollapse={onCollapse} />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('My App')).toBeInTheDocument()
    })

    const collapseButton = screen.getByLabelText('Collapse sidebar')
    await user.click(collapseButton)

    expect(onCollapse).toHaveBeenCalledWith(true)
  })

  it('should render collapsed sidebar', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .branding({ name: 'My App' })
      .navigation({
        customItems: [{ name: 'dashboard', label: 'Dashboard', path: '/dashboard' }],
      })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar collapsed={true} />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('My App')).not.toBeInTheDocument()
    })
  })

  it('should render navigation with badges', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .navigation({
        customItems: [
          {
            name: 'notifications',
            label: 'Notifications',
            path: '/notifications',
            badge: '5',
            badgeColor: 'primary',
          },
        ],
      })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('should render nested navigation items', async () => {
    const user = userEvent.setup()

    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .navigation({
        customItems: [
          {
            name: 'users',
            label: 'Users',
            path: '',
            children: [
              { name: 'all-users', label: 'All Users', path: '/users/all' },
              { name: 'roles', label: 'Roles', path: '/users/roles' },
            ],
          },
        ],
      })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    // Initially nested items should not be visible
    expect(screen.queryByText('All Users')).not.toBeInTheDocument()

    // Click to expand
    const usersLink = screen.getByText('Users')
    await user.click(usersLink)

    await waitFor(() => {
      expect(screen.getByText('All Users')).toBeInTheDocument()
      expect(screen.getByText('Roles')).toBeInTheDocument()
    })
  })

  it('should render footer if configured', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .branding({
        name: 'My App',
        footer: '© 2025 My Company',
      })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('© 2025 My Company')).toBeInTheDocument()
    })
  })

  it('should not render footer when collapsed', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .branding({
        name: 'My App',
        footer: '© 2025 My Company',
      })
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar collapsed={true} />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('© 2025 My Company')).not.toBeInTheDocument()
    })
  })

  it('should group resources by group', async () => {
    const userResource = createResource(
      {
        name: 'User',
        endpoint: '/users',
        primaryKey: 'id',
        label: 'Users',
      },
      provider
    )
      .navigation({ group: 'Content' })
      .build()

    const settingResource = createResource(
      {
        name: 'Setting',
        endpoint: '/settings',
        primaryKey: 'id',
        label: 'Settings',
      },
      provider
    )
      .navigation({ group: 'System' })
      .build()

    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .resource(userResource)
      .resource(settingResource)
      .build()

    render(
      <PanelProvider config={panel}>
        <Sidebar />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })
})
