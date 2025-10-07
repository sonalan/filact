import { describe, it, expect } from 'vitest'
import { createPanel, PanelBuilder, definePanel } from './builder'
import { createResource } from '../resources/builder'
import { createRestDataProvider } from '../providers/rest'
import type { PanelConfig, ThemeConfig, AuthConfig } from './types'

describe('PanelBuilder', () => {
  it('should create a panel builder with id and name', () => {
    const builder = createPanel('admin', 'Admin Panel')
    expect(builder).toBeInstanceOf(PanelBuilder)
  })

  it('should set panel path', () => {
    const panel = createPanel('admin', 'Admin Panel')
      .path('/admin')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .build()

    expect(panel.path).toBe('/admin')
  })

  it('should configure data provider', () => {
    const provider = createRestDataProvider({ baseUrl: 'http://api.example.com' })
    const panel = createPanel('admin', 'Admin Panel')
      .provider(provider)
      .build()

    expect(panel.dataProvider).toBe(provider)
  })

  it('should throw error if no data provider', () => {
    const builder = createPanel('admin', 'Admin Panel')

    expect(() => builder.build()).toThrow('Panel requires a data provider')
  })

  it('should register a single resource', () => {
    const userResource = createResource({
      model: { name: 'User', endpoint: '/users', primaryKey: 'id' },
    }).build()

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .resource(userResource)
      .build()

    expect(panel.resources).toHaveLength(1)
    expect(panel.resources?.[0]).toBe(userResource)
  })

  it('should register multiple resources', () => {
    const userResource = createResource({
      model: { name: 'User', endpoint: '/users', primaryKey: 'id' },
    }).build()

    const postResource = createResource({
      model: { name: 'Post', endpoint: '/posts', primaryKey: 'id' },
    }).build()

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .resources([userResource, postResource])
      .build()

    expect(panel.resources).toHaveLength(2)
  })

  it('should register custom pages', () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .page({
        name: 'dashboard',
        path: '/dashboard',
        component: () => null,
        title: 'Dashboard',
      })
      .build()

    expect(panel.pages).toHaveLength(1)
    expect(panel.pages?.[0].name).toBe('dashboard')
  })

  it('should configure theme', () => {
    const theme: ThemeConfig = {
      colors: {
        primary: '#3b82f6',
      },
      radius: 'md',
      defaultMode: 'light',
    }

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .theme(theme)
      .build()

    expect(panel.theme).toEqual(theme)
  })

  it('should configure authentication', () => {
    const auth: AuthConfig = {
      loginPath: '/login',
      checkAuth: async () => true,
    }

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .auth(auth)
      .build()

    expect(panel.auth).toEqual(auth)
  })

  it('should add middleware', () => {
    const middleware1 = async () => {}
    const middleware2 = async () => {}

    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .middleware(middleware1)
      .middleware(middleware2)
      .build()

    expect(panel.middleware).toHaveLength(2)
  })

  it('should configure layout', () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .layout({
        sidebarPosition: 'left',
        sidebarCollapsed: false,
      })
      .build()

    expect(panel.layout?.sidebarPosition).toBe('left')
    expect(panel.layout?.sidebarCollapsed).toBe(false)
  })

  it('should configure navigation', () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .navigation({
        showIcons: true,
        showLabels: true,
      })
      .build()

    expect(panel.navigation?.showIcons).toBe(true)
    expect(panel.navigation?.showLabels).toBe(true)
  })

  it('should configure branding', () => {
    const panel = createPanel('admin', 'Admin Panel')
      .provider(createRestDataProvider({ baseUrl: 'http://api.example.com' }))
      .branding({
        name: 'My App',
        tagline: 'Powerful admin panel',
      })
      .build()

    expect(panel.branding?.name).toBe('My App')
    expect(panel.branding?.tagline).toBe('Powerful admin panel')
  })

  it('should allow method chaining', () => {
    const provider = createRestDataProvider({ baseUrl: 'http://api.example.com' })
    const userResource = createResource({
      model: { name: 'User', endpoint: '/users', primaryKey: 'id' },
    }).build()

    const panel = createPanel('admin', 'Admin Panel')
      .path('/admin')
      .provider(provider)
      .resource(userResource)
      .theme({ defaultMode: 'dark' })
      .layout({ sidebarCollapsed: true })
      .build()

    expect(panel.id).toBe('admin')
    expect(panel.name).toBe('Admin Panel')
    expect(panel.path).toBe('/admin')
    expect(panel.dataProvider).toBe(provider)
    expect(panel.resources).toHaveLength(1)
    expect(panel.theme?.defaultMode).toBe('dark')
    expect(panel.layout?.sidebarCollapsed).toBe(true)
  })

  it('should create panel using definePanel', () => {
    const panel = definePanel({
      id: 'admin',
      name: 'Admin Panel',
      dataProvider: createRestDataProvider({ baseUrl: 'http://api.example.com' }),
      theme: { defaultMode: 'light' },
    })

    expect(panel.id).toBe('admin')
    expect(panel.name).toBe('Admin Panel')
  })
})
