import { describe, it, expect } from 'vitest'
import type {
  BaseModel,
  ModelDefinition,
  NavigationConfig,
  ResourcePolicies,
  ResourceLifecycleHooks,
  InferModel,
} from './resource'

describe('Resource Types', () => {
  describe('BaseModel', () => {
    it('should accept string id', () => {
      const model: BaseModel = {
        id: 'abc123',
        name: 'Test',
      }
      expect(model.id).toBe('abc123')
    })

    it('should accept number id', () => {
      const model: BaseModel = {
        id: 123,
        name: 'Test',
      }
      expect(model.id).toBe(123)
    })

    it('should accept additional properties', () => {
      const model: BaseModel = {
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        age: 30,
      }
      expect(model.name).toBe('Test')
      expect(model.email).toBe('test@example.com')
    })
  })

  describe('ModelDefinition', () => {
    it('should accept valid model definition', () => {
      interface User extends BaseModel {
        name: string
        email: string
      }

      const definition: ModelDefinition<User> = {
        name: 'User',
        pluralName: 'Users',
        endpoint: '/api/users',
        primaryKey: 'id',
        displayField: 'name',
      }

      expect(definition.name).toBe('User')
      expect(definition.endpoint).toBe('/api/users')
    })

    it('should accept minimal model definition', () => {
      const definition: ModelDefinition = {
        name: 'Post',
        endpoint: '/api/posts',
      }

      expect(definition.name).toBe('Post')
    })

    it('should accept timestamps configuration', () => {
      interface Post extends BaseModel {
        title: string
        createdAt: Date
        updatedAt: Date
      }

      const definition: ModelDefinition<Post> = {
        name: 'Post',
        endpoint: '/api/posts',
        timestamps: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt',
        },
      }

      expect(definition.timestamps?.createdAt).toBe('createdAt')
    })
  })

  describe('NavigationConfig', () => {
    it('should accept complete navigation config', () => {
      const nav: NavigationConfig = {
        label: 'Users',
        icon: 'UserIcon',
        group: 'Administration',
        sort: 1,
        visible: true,
        badge: 5,
      }

      expect(nav.label).toBe('Users')
      expect(nav.group).toBe('Administration')
    })

    it('should accept minimal navigation config', () => {
      const nav: NavigationConfig = {
        label: 'Posts',
      }

      expect(nav.label).toBe('Posts')
    })
  })

  describe('ResourcePolicies', () => {
    it('should accept synchronous policies', () => {
      interface User extends BaseModel {
        role: string
      }

      const policies: ResourcePolicies<User> = {
        viewAny: () => true,
        view: (record) => record.role === 'admin',
        create: () => false,
        update: (record) => record.id !== 1,
        delete: () => true,
      }

      expect(policies.viewAny?.()).toBe(true)
      expect(policies.create?.()).toBe(false)
    })

    it('should accept async policies', () => {
      const policies: ResourcePolicies = {
        viewAny: async () => true,
        create: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return false
        },
      }

      expect(policies.viewAny).toBeDefined()
    })
  })

  describe('ResourceLifecycleHooks', () => {
    it('should accept lifecycle hooks', () => {
      interface User extends BaseModel {
        name: string
        email: string
      }

      const hooks: ResourceLifecycleHooks<User> = {
        beforeCreate: (data) => {
          return { ...data, createdAt: new Date() }
        },
        afterCreate: (record) => {
          console.log('Created:', record.id)
        },
        beforeUpdate: (record, data) => {
          return { ...data, updatedAt: new Date() }
        },
        afterUpdate: (record) => {
          console.log('Updated:', record.id)
        },
        beforeDelete: (record) => {
          return record.id !== 1
        },
        afterDelete: (id) => {
          console.log('Deleted:', id)
        },
      }

      expect(hooks.beforeCreate).toBeDefined()
      expect(hooks.afterUpdate).toBeDefined()
    })

    it('should accept async lifecycle hooks', () => {
      const hooks: ResourceLifecycleHooks = {
        beforeCreate: async (data) => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return data
        },
        afterFetch: async (records) => {
          return records.filter((r) => r.id !== 0)
        },
      }

      expect(hooks.beforeCreate).toBeDefined()
    })
  })

  describe('InferModel', () => {
    it('should infer model type from definition', () => {
      interface User extends BaseModel {
        name: string
        email: string
      }

      const definition: ModelDefinition<User> = {
        name: 'User',
        endpoint: '/api/users',
      }

      type InferredUser = InferModel<typeof definition>

      const user: InferredUser = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
      }

      expect(user.name).toBe('John')
    })
  })
})
