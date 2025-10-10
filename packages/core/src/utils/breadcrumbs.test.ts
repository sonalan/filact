import { describe, it, expect } from 'vitest'
import {
  generateResourceBreadcrumbs,
  createResourceBreadcrumbs,
  type BreadcrumbItem,
} from './breadcrumbs'
import type { ModelDefinition } from '../types/resource'

interface TestUser {
  id: number
  name: string
  email: string
}

const testModel: ModelDefinition<TestUser> = {
  name: 'User',
  pluralName: 'Users',
  endpoint: '/api/users',
  displayField: 'name',
}

describe('generateResourceBreadcrumbs - list page', () => {
  it('should generate breadcrumbs for list page', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'list')

    expect(breadcrumbs).toHaveLength(2)
    expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' })
    expect(breadcrumbs[1]).toEqual({ label: 'Users', current: true })
  })

  it('should work without home breadcrumb', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'list', {
      config: { home: undefined },
    })

    expect(breadcrumbs).toHaveLength(1)
    expect(breadcrumbs[0]).toEqual({ label: 'Users', current: true })
  })

  it('should include custom breadcrumbs', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'list', {
      customBreadcrumbs: [{ label: 'Admin', href: '/admin' }],
    })

    expect(breadcrumbs).toHaveLength(3)
    expect(breadcrumbs[1]).toEqual({ label: 'Admin', href: '/admin' })
    expect(breadcrumbs[2]).toEqual({ label: 'Users', current: true })
  })
})

describe('generateResourceBreadcrumbs - create page', () => {
  it('should generate breadcrumbs for create page', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'create')

    expect(breadcrumbs).toHaveLength(3)
    expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' })
    expect(breadcrumbs[1]).toEqual({ label: 'Users', href: '/users' })
    expect(breadcrumbs[2]).toEqual({ label: 'Create', current: true })
  })

  it('should link to list page', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'create')

    expect(breadcrumbs[1].href).toBe('/users')
  })
})

describe('generateResourceBreadcrumbs - view page', () => {
  it('should generate breadcrumbs for view page with id', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'view', {
      id: 123,
    })

    expect(breadcrumbs).toHaveLength(3)
    expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' })
    expect(breadcrumbs[1]).toEqual({ label: 'Users', href: '/users' })
    expect(breadcrumbs[2]).toEqual({ label: '#123', current: true })
  })

  it('should use displayField from record', () => {
    const record: TestUser = { id: 123, name: 'John Doe', email: 'john@example.com' }
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'view', {
      id: 123,
      record,
    })

    expect(breadcrumbs[2]).toEqual({ label: 'John Doe', current: true })
  })

  it('should fall back to id when displayField missing', () => {
    const record: TestUser = { id: 123, name: '', email: 'john@example.com' }
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'view', {
      id: 123,
      record,
    })

    expect(breadcrumbs[2].label).toBe('#123')
  })

  it('should work without record', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'view', {
      id: 456,
    })

    expect(breadcrumbs[2].label).toBe('#456')
  })
})

describe('generateResourceBreadcrumbs - edit page', () => {
  it('should generate breadcrumbs for edit page', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'edit', {
      id: 123,
    })

    expect(breadcrumbs).toHaveLength(4)
    expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' })
    expect(breadcrumbs[1]).toEqual({ label: 'Users', href: '/users' })
    expect(breadcrumbs[2]).toEqual({ label: '#123', href: '/users/123' })
    expect(breadcrumbs[3]).toEqual({ label: 'Edit', current: true })
  })

  it('should use displayField from record', () => {
    const record: TestUser = { id: 123, name: 'John Doe', email: 'john@example.com' }
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'edit', {
      id: 123,
      record,
    })

    expect(breadcrumbs[2]).toEqual({ label: 'John Doe', href: '/users/123' })
    expect(breadcrumbs[3]).toEqual({ label: 'Edit', current: true })
  })

  it('should link view breadcrumb to view page', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'edit', {
      id: 456,
    })

    expect(breadcrumbs[2].href).toBe('/users/456')
  })
})

describe('Breadcrumb truncation', () => {
  it('should not truncate when under maxItems', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'edit', {
      id: 123,
      config: { maxItems: 10 },
    })

    expect(breadcrumbs).toHaveLength(4)
    expect(breadcrumbs.some((b) => b.label === '...')).toBe(false)
  })

  it('should truncate when over maxItems', () => {
    const customBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Admin', href: '/admin' },
      { label: 'Organization', href: '/org' },
      { label: 'Department', href: '/dept' },
    ]

    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'edit', {
      id: 123,
      customBreadcrumbs,
      config: { maxItems: 4 },
    })

    expect(breadcrumbs).toHaveLength(4)
    expect(breadcrumbs[0].label).toBe('Home')
    expect(breadcrumbs[1].label).toBe('...')
    expect(breadcrumbs[breadcrumbs.length - 1].current).toBe(true)
  })

  it('should keep first and last items when truncating', () => {
    const customBreadcrumbs: BreadcrumbItem[] = Array.from({ length: 10 }, (_, i) => ({
      label: `Level ${i}`,
      href: `/level${i}`,
    }))

    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'list', {
      customBreadcrumbs,
      config: { maxItems: 4 },
    })

    expect(breadcrumbs[0].label).toBe('Home')
    expect(breadcrumbs[1].label).toBe('...')
    expect(breadcrumbs[breadcrumbs.length - 1].label).toBe('Users')
  })
})

describe('Custom breadcrumb config', () => {
  it('should use custom home breadcrumb', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'list', {
      config: {
        home: { label: 'Dashboard', href: '/dashboard' },
      },
    })

    expect(breadcrumbs[0]).toEqual({ label: 'Dashboard', href: '/dashboard' })
  })

  it('should handle missing home breadcrumb', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'create', {
      config: { home: undefined },
    })

    expect(breadcrumbs[0].label).not.toBe('Home')
    expect(breadcrumbs[0].label).toBe('Users')
  })
})

describe('ResourceBreadcrumbs helper', () => {
  it('should generate list breadcrumbs', () => {
    const helper = createResourceBreadcrumbs(testModel)
    const breadcrumbs = helper.list()

    expect(breadcrumbs[breadcrumbs.length - 1]).toEqual({
      label: 'Users',
      current: true,
    })
  })

  it('should generate create breadcrumbs', () => {
    const helper = createResourceBreadcrumbs(testModel)
    const breadcrumbs = helper.create()

    expect(breadcrumbs[breadcrumbs.length - 1]).toEqual({
      label: 'Create',
      current: true,
    })
  })

  it('should generate view breadcrumbs', () => {
    const helper = createResourceBreadcrumbs(testModel)
    const breadcrumbs = helper.view(123)

    expect(breadcrumbs[breadcrumbs.length - 1]).toEqual({
      label: '#123',
      current: true,
    })
  })

  it('should generate edit breadcrumbs', () => {
    const helper = createResourceBreadcrumbs(testModel)
    const breadcrumbs = helper.edit(123)

    expect(breadcrumbs[breadcrumbs.length - 1]).toEqual({
      label: 'Edit',
      current: true,
    })
  })

  it('should pass custom breadcrumbs to all methods', () => {
    const helper = createResourceBreadcrumbs(testModel, {
      maxItems: 10, // Set high enough to prevent truncation
    })
    const custom: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin' }]

    const listBc = helper.list(custom)
    const createBc = helper.create(custom)
    const viewBc = helper.view(123, undefined, custom)
    const editBc = helper.edit(123, undefined, custom)

    expect(listBc[1]).toEqual({ label: 'Admin', href: '/admin' })
    expect(createBc[1]).toEqual({ label: 'Admin', href: '/admin' })
    expect(viewBc[1]).toEqual({ label: 'Admin', href: '/admin' })
    expect(editBc[1]).toEqual({ label: 'Admin', href: '/admin' })
  })

  it('should use config from constructor', () => {
    const helper = createResourceBreadcrumbs(testModel, {
      home: { label: 'Dashboard', href: '/dash' },
    })
    const breadcrumbs = helper.list()

    expect(breadcrumbs[0]).toEqual({ label: 'Dashboard', href: '/dash' })
  })
})

describe('Model without displayField', () => {
  it('should use id when no displayField defined', () => {
    const model: ModelDefinition<TestUser> = {
      name: 'User',
      pluralName: 'Users',
      endpoint: '/api/users',
    }

    const record: TestUser = { id: 123, name: 'John', email: 'john@example.com' }
    const breadcrumbs = generateResourceBreadcrumbs(model, 'view', {
      id: 123,
      record,
    })

    expect(breadcrumbs[breadcrumbs.length - 1].label).toBe('#123')
  })
})

describe('String IDs', () => {
  it('should handle string IDs', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'view', {
      id: 'abc-123',
    })

    expect(breadcrumbs[breadcrumbs.length - 1].label).toBe('#abc-123')
  })

  it('should build paths with string IDs', () => {
    const breadcrumbs = generateResourceBreadcrumbs(testModel, 'edit', {
      id: 'uuid-123',
    })

    expect(breadcrumbs[2].href).toBe('/users/uuid-123')
  })
})
