import { describe, it, expect } from 'vitest'
import {
  generateResourceRoutes,
  buildRoutePath,
  parseRouteParams,
  createResourceRoutes,
  DEFAULT_ROUTING,
} from './routing'
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
}

describe('generateResourceRoutes', () => {
  it('should generate default routes from model', () => {
    const routes = generateResourceRoutes(testModel)

    expect(routes.basePath).toBe('/users')
    expect(routes.listPath).toBe('/users')
    expect(routes.createPath).toBe('/users/create')
    expect(routes.editPath).toBe('/users/:id/edit')
    expect(routes.viewPath).toBe('/users/:id')
  })

  it('should use custom basePath', () => {
    const routes = generateResourceRoutes(testModel, {
      basePath: '/admin/users',
    })

    expect(routes.basePath).toBe('/admin/users')
    expect(routes.listPath).toBe('/admin/users')
    expect(routes.createPath).toBe('/admin/users/create')
  })

  it('should use custom route paths', () => {
    const routes = generateResourceRoutes(testModel, {
      basePath: '/users',
      createPath: '/new',
      editPath: '/:id/update',
    })

    expect(routes.createPath).toBe('/users/new')
    expect(routes.editPath).toBe('/users/:id/update')
  })

  it('should respect autoGenerate: false', () => {
    const routes = generateResourceRoutes(testModel, {
      autoGenerate: false,
      basePath: '/custom',
      listPath: '/all',
      createPath: '/add',
    })

    expect(routes.basePath).toBe('/custom')
    expect(routes.listPath).toBe('/all')
    expect(routes.createPath).toBe('/add')
  })

  it('should use custom paramName', () => {
    const routes = generateResourceRoutes(testModel, {
      paramName: 'userId',
    })

    expect(routes.editPath).toBe('/users/:userId/edit')
    expect(routes.viewPath).toBe('/users/:userId')
  })

  it('should generate basePath from model name when pluralName missing', () => {
    const model: ModelDefinition<TestUser> = {
      name: 'User',
      endpoint: '/api/users',
    }

    const routes = generateResourceRoutes(model)

    expect(routes.basePath).toBe('/users')
  })

  it('should handle lowercase model names', () => {
    const model: ModelDefinition<TestUser> = {
      name: 'user',
      pluralName: 'Users',
      endpoint: '/api/users',
    }

    const routes = generateResourceRoutes(model)

    expect(routes.basePath).toBe('/users')
  })
})

describe('buildRoutePath', () => {
  it('should replace single parameter', () => {
    const path = buildRoutePath('/users/:id', { id: 123 })

    expect(path).toBe('/users/123')
  })

  it('should replace multiple parameters', () => {
    const path = buildRoutePath('/organizations/:orgId/users/:userId', {
      orgId: 'abc',
      userId: 456,
    })

    expect(path).toBe('/organizations/abc/users/456')
  })

  it('should handle string and number parameters', () => {
    const path1 = buildRoutePath('/users/:id', { id: 'abc-123' })
    const path2 = buildRoutePath('/users/:id', { id: 999 })

    expect(path1).toBe('/users/abc-123')
    expect(path2).toBe('/users/999')
  })

  it('should leave unreplaced parameters as-is', () => {
    const path = buildRoutePath('/users/:id/posts/:postId', { id: 123 })

    expect(path).toBe('/users/123/posts/:postId')
  })
})

describe('parseRouteParams', () => {
  it('should parse single parameter', () => {
    const params = parseRouteParams('/users/:id', '/users/123')

    expect(params).toEqual({ id: '123' })
  })

  it('should parse multiple parameters', () => {
    const params = parseRouteParams(
      '/organizations/:orgId/users/:userId',
      '/organizations/abc/users/456'
    )

    expect(params).toEqual({ orgId: 'abc', userId: '456' })
  })

  it('should return null for non-matching paths', () => {
    const params = parseRouteParams('/users/:id', '/posts/123')

    expect(params).toBeNull()
  })

  it('should handle paths with trailing content', () => {
    const params = parseRouteParams('/users/:id/edit', '/users/123/edit')

    expect(params).toEqual({ id: '123' })
  })

  it('should return null for partial matches', () => {
    const params = parseRouteParams('/users/:id/edit', '/users/123')

    expect(params).toBeNull()
  })

  it('should handle complex parameter values', () => {
    const params = parseRouteParams('/users/:id', '/users/abc-123-def')

    expect(params).toEqual({ id: 'abc-123-def' })
  })
})

describe('ResourceRoutes', () => {
  it('should generate list route', () => {
    const routes = createResourceRoutes(testModel)

    expect(routes.list()).toBe('/users')
  })

  it('should generate create route', () => {
    const routes = createResourceRoutes(testModel)

    expect(routes.create()).toBe('/users/create')
  })

  it('should generate edit route with id', () => {
    const routes = createResourceRoutes(testModel)

    expect(routes.edit(123)).toBe('/users/123/edit')
    expect(routes.edit('abc')).toBe('/users/abc/edit')
  })

  it('should generate view route with id', () => {
    const routes = createResourceRoutes(testModel)

    expect(routes.view(123)).toBe('/users/123')
    expect(routes.view('abc')).toBe('/users/abc')
  })

  it('should return all route templates', () => {
    const routes = createResourceRoutes(testModel)
    const templates = routes.templates()

    expect(templates.basePath).toBe('/users')
    expect(templates.listPath).toBe('/users')
    expect(templates.createPath).toBe('/users/create')
    expect(templates.editPath).toBe('/users/:id/edit')
    expect(templates.viewPath).toBe('/users/:id')
  })

  it('should work with custom configuration', () => {
    const routes = createResourceRoutes(testModel, {
      basePath: '/admin/users',
      paramName: 'userId',
    })

    expect(routes.list()).toBe('/admin/users')
    expect(routes.create()).toBe('/admin/users/create')
    expect(routes.edit(123)).toBe('/admin/users/123/edit')
    expect(routes.view(123)).toBe('/admin/users/123')
  })
})

describe('DEFAULT_ROUTING', () => {
  it('should have expected default values', () => {
    expect(DEFAULT_ROUTING.basePath).toBe('')
    expect(DEFAULT_ROUTING.listPath).toBe('')
    expect(DEFAULT_ROUTING.createPath).toBe('/create')
    expect(DEFAULT_ROUTING.editPath).toBe('/:id/edit')
    expect(DEFAULT_ROUTING.viewPath).toBe('/:id')
    expect(DEFAULT_ROUTING.autoGenerate).toBe(true)
    expect(DEFAULT_ROUTING.paramName).toBe('id')
  })
})
