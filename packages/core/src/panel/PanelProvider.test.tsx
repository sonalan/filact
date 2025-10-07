import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PanelProvider, usePanel, useResource, useResources, useCurrentUser } from './PanelProvider'
import { createPanel } from './builder'
import { createResource } from '../resources/builder'
import { createRestDataProvider } from '../providers/rest'
import type { PanelConfig } from './types'

describe('PanelProvider', () => {
  it('should render children', () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .build()

    render(
      <PanelProvider config={panel}>
        <div>Test Content</div>
      </PanelProvider>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should provide panel context', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .build()

    function TestComponent() {
      const { config } = usePanel()
      return <div>{config.name}</div>
    }

    render(
      <PanelProvider config={panel}>
        <TestComponent />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    })
  })

  it('should throw error if usePanel used outside provider', () => {
    function TestComponent() {
      usePanel()
      return null
    }

    // Suppress console.error for this test
    const originalError = console.error
    console.error = vi.fn()

    expect(() => render(<TestComponent />)).toThrow('usePanel must be used within a PanelProvider')

    console.error = originalError
  })

  it('should provide registered resources', async () => {
    const provider = createRestDataProvider({ baseUrl: 'http://api.example.com' })

    const userResource = createResource(
      { name: 'User', endpoint: '/users', primaryKey: 'id' },
      provider
    ).build()

    const postResource = createResource(
      { name: 'Post', endpoint: '/posts', primaryKey: 'id' },
      provider
    ).build()

    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .resource(userResource)
      .resource(postResource)
      .build()

    function TestComponent() {
      const resources = useResources()
      return <div>Resources: {resources.length}</div>
    }

    render(
      <PanelProvider config={panel}>
        <TestComponent />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Resources: 2')).toBeInTheDocument()
    })
  })

  it('should get resource by name', async () => {
    const provider = createRestDataProvider({ baseUrl: 'http://api.example.com' })

    const userResource = createResource(
      { name: 'User', endpoint: '/users', primaryKey: 'id' },
      provider
    ).build()

    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .resource(userResource)
      .build()

    function TestComponent() {
      const resource = useResource('User')
      return <div>{resource?.model.name || 'Not found'}</div>
    }

    render(
      <PanelProvider config={panel}>
        <TestComponent />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument()
    })
  })

  it('should return undefined for non-existent resource', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .build()

    function TestComponent() {
      const resource = useResource('NonExistent')
      return <div>{resource ? 'Found' : 'Not found'}</div>
    }

    render(
      <PanelProvider config={panel}>
        <TestComponent />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument()
    })
  })

  it('should handle authentication check', async () => {
    const checkAuth = vi.fn().mockResolvedValue(true)
    const getUser = vi.fn().mockResolvedValue({ id: 1, name: 'John Doe' })

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .auth({ checkAuth, getUser })
      .build()

    function TestComponent() {
      const { user, isAuthenticated } = useCurrentUser()
      return (
        <div>
          {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          {user && `: ${user.name}`}
        </div>
      )
    }

    render(
      <PanelProvider config={panel}>
        <TestComponent />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
      expect(getUser).toHaveBeenCalled()
      expect(screen.getByText('Authenticated: John Doe')).toBeInTheDocument()
    })
  })

  it('should handle auth check failure', async () => {
    const checkAuth = vi.fn().mockRejectedValue(new Error('Auth failed'))

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .auth({ checkAuth })
      .build()

    function TestComponent() {
      const { isAuthenticated } = useCurrentUser()
      return <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
    }

    render(
      <PanelProvider config={panel}>
        <TestComponent />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    })
  })

  it('should default to authenticated if no auth config', async () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .build()

    function TestComponent() {
      const { isAuthenticated } = useCurrentUser()
      return <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
    }

    render(
      <PanelProvider config={panel}>
        <TestComponent />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Authenticated')).toBeInTheDocument()
    })
  })

  it('should show loading during auth check', () => {
    const checkAuth = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
    )

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .auth({ checkAuth })
      .build()

    render(
      <PanelProvider config={panel}>
        <div>Content</div>
      </PanelProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle logout', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .auth({ logout })
      .build()

    function TestComponent() {
      const { logout: handleLogout } = usePanel()
      return <button onClick={handleLogout}>Logout</button>
    }

    render(
      <PanelProvider config={panel}>
        <TestComponent />
      </PanelProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    const button = screen.getByText('Logout')
    button.click()

    await waitFor(() => {
      expect(logout).toHaveBeenCalled()
    })
  })
})
