import { describe, it, expect, vi } from 'vitest'
import { ResourceBuilder, createResource } from './builder'
import { RestDataProvider } from '../providers/rest'
import type { ModelDefinition } from '../types/resource'
import type { FormSchema } from '../types/form'
import type { TableSchema } from '../types/table'

interface User {
  id: number
  name: string
  email: string
  role: string
  active: boolean
}

describe('ResourceBuilder', () => {
  const mockProvider = new RestDataProvider({ baseURL: 'http://api.test' })

  const userModel: ModelDefinition<User> = {
    name: 'User',
    pluralName: 'Users',
    endpoint: '/users',
    primaryKey: 'id',
    displayField: 'name',
  }

  it('should create a resource builder instance', () => {
    const builder = new ResourceBuilder(userModel, mockProvider)
    expect(builder).toBeInstanceOf(ResourceBuilder)
  })

  it('should create builder with factory function', () => {
    const builder = createResource(userModel, mockProvider)
    expect(builder).toBeInstanceOf(ResourceBuilder)
  })

  it('should build resource with model and provider', () => {
    const builder = createResource(userModel, mockProvider)
    const resource = builder.build()

    expect(resource.model).toEqual(userModel)
    expect(resource.provider).toBe(mockProvider)
  })

  it('should set form schema', () => {
    const formSchema: FormSchema<User> = {
      fields: [
        { type: 'text', name: 'name', label: 'Name' },
        { type: 'email', name: 'email', label: 'Email' },
      ],
    }

    const builder = createResource(userModel, mockProvider)
    const resource = builder.form(formSchema).build()

    expect(resource.form).toEqual(formSchema)
  })

  it('should set table schema', () => {
    const tableSchema: TableSchema<User> = {
      columns: [
        { type: 'text', accessor: 'name', label: 'Name' },
        { type: 'text', accessor: 'email', label: 'Email' },
      ],
    }

    const builder = createResource(userModel, mockProvider)
    const resource = builder.table(tableSchema).build()

    expect(resource.table).toEqual(tableSchema)
  })

  it('should set page-level actions', () => {
    const actions = [
      {
        type: 'button' as const,
        id: 'create',
        label: 'Create New',
        onClick: vi.fn(),
      },
    ]

    const builder = createResource(userModel, mockProvider)
    const resource = builder.actions(actions).build()

    expect(resource.actions).toEqual(actions)
  })

  it('should set row-level actions', () => {
    const rowActions = [
      {
        type: 'button' as const,
        id: 'edit',
        label: 'Edit',
        onClick: vi.fn(),
      },
      {
        type: 'button' as const,
        id: 'delete',
        label: 'Delete',
        onClick: vi.fn(),
      },
    ]

    const builder = createResource(userModel, mockProvider)
    const resource = builder.rowActions(rowActions).build()

    expect(resource.rowActions).toEqual(rowActions)
  })

  it('should set bulk actions', () => {
    const bulkActions = [
      {
        id: 'delete',
        label: 'Delete Selected',
        action: vi.fn(),
      },
      {
        id: 'export',
        label: 'Export Selected',
        action: vi.fn(),
      },
    ]

    const builder = createResource(userModel, mockProvider)
    const resource = builder.bulkActions(bulkActions).build()

    expect(resource.bulkActions).toEqual(bulkActions)
  })

  it('should set navigation config', () => {
    const navigation = {
      label: 'Users',
      icon: '<UsersIcon />',
      group: 'Management',
      sort: 1,
      visible: true,
    }

    const builder = createResource(userModel, mockProvider)
    const resource = builder.navigation(navigation).build()

    expect(resource.navigation).toEqual(navigation)
  })

  it('should set policies', () => {
    const policies = {
      viewAny: vi.fn(() => true),
      view: vi.fn(() => true),
      create: vi.fn(() => true),
      update: vi.fn(() => true),
      delete: vi.fn(() => false),
    }

    const builder = createResource(userModel, mockProvider)
    const resource = builder.policies(policies).build()

    expect(resource.policies).toEqual(policies)
  })

  it('should set lifecycle hooks', () => {
    const hooks = {
      beforeCreate: vi.fn(),
      afterCreate: vi.fn(),
      beforeUpdate: vi.fn(),
      afterUpdate: vi.fn(),
      beforeDelete: vi.fn(),
      afterDelete: vi.fn(),
    }

    const builder = createResource(userModel, mockProvider)
    const resource = builder.hooks(hooks).build()

    expect(resource.hooks).toEqual(hooks)
  })

  it('should enable soft deletes', () => {
    const builder = createResource(userModel, mockProvider)
    const resource = builder.softDeletes().build()

    expect(resource.softDeletes).toBe(true)
  })

  it('should disable soft deletes', () => {
    const builder = createResource(userModel, mockProvider)
    const resource = builder.softDeletes(false).build()

    expect(resource.softDeletes).toBe(false)
  })

  it('should enable timestamps', () => {
    const builder = createResource(userModel, mockProvider)
    const resource = builder.timestamps().build()

    expect(resource.timestamps).toBe(true)
  })

  it('should disable timestamps', () => {
    const builder = createResource(userModel, mockProvider)
    const resource = builder.timestamps(false).build()

    expect(resource.timestamps).toBe(false)
  })

  it('should chain multiple methods', () => {
    const formSchema: FormSchema<User> = {
      fields: [{ type: 'text', name: 'name', label: 'Name' }],
    }

    const tableSchema: TableSchema<User> = {
      columns: [{ type: 'text', accessor: 'name', label: 'Name' }],
    }

    const actions = [
      { type: 'button' as const, id: 'create', label: 'Create', onClick: vi.fn() },
    ]

    const rowActions = [
      { type: 'button' as const, id: 'edit', label: 'Edit', onClick: vi.fn() },
    ]

    const bulkActions = [{ id: 'delete', label: 'Delete', action: vi.fn() }]

    const navigation = { label: 'Users', icon: '<Icon />' }

    const policies = { viewAny: vi.fn(() => true) }

    const hooks = { beforeCreate: vi.fn() }

    const builder = createResource(userModel, mockProvider)
    const resource = builder
      .form(formSchema)
      .table(tableSchema)
      .actions(actions)
      .rowActions(rowActions)
      .bulkActions(bulkActions)
      .navigation(navigation)
      .policies(policies)
      .hooks(hooks)
      .softDeletes(true)
      .timestamps(true)
      .build()

    expect(resource.model).toEqual(userModel)
    expect(resource.provider).toBe(mockProvider)
    expect(resource.form).toEqual(formSchema)
    expect(resource.table).toEqual(tableSchema)
    expect(resource.actions).toEqual(actions)
    expect(resource.rowActions).toEqual(rowActions)
    expect(resource.bulkActions).toEqual(bulkActions)
    expect(resource.navigation).toEqual(navigation)
    expect(resource.policies).toEqual(policies)
    expect(resource.hooks).toEqual(hooks)
    expect(resource.softDeletes).toBe(true)
    expect(resource.timestamps).toBe(true)
  })

  it('should build minimal resource with only model and provider', () => {
    const builder = createResource(userModel, mockProvider)
    const resource = builder.build()

    expect(resource.model).toEqual(userModel)
    expect(resource.provider).toBe(mockProvider)
    expect(resource.form).toBeUndefined()
    expect(resource.table).toBeUndefined()
    expect(resource.actions).toBeUndefined()
    expect(resource.rowActions).toBeUndefined()
    expect(resource.bulkActions).toBeUndefined()
    expect(resource.navigation).toBeUndefined()
    expect(resource.policies).toBeUndefined()
    expect(resource.hooks).toBeUndefined()
    expect(resource.softDeletes).toBe(false)
    expect(resource.timestamps).toBe(false)
  })
})
