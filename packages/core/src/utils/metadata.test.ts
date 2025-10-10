import { describe, it, expect } from 'vitest'
import {
  getListPageMetadata,
  getCreatePageMetadata,
  getEditPageMetadata,
  getViewPageMetadata,
  createResourceMetadata,
} from './metadata'
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

describe('getListPageMetadata', () => {
  it('should generate default list page metadata', () => {
    const metadata = getListPageMetadata(testModel)

    expect(metadata.title).toBe('Users')
    expect(metadata.description).toBe('Browse and manage Users')
  })

  it('should use custom metadata', () => {
    const metadata = getListPageMetadata(testModel, {
      title: 'All Users',
      description: 'View all registered users',
    })

    expect(metadata.title).toBe('All Users')
    expect(metadata.description).toBe('View all registered users')
  })

  it('should replace template variables', () => {
    const metadata = getListPageMetadata(testModel, {
      title: 'Manage {pluralName}',
      description: 'List of all {pluralName} in the system',
    })

    expect(metadata.title).toBe('Manage Users')
    expect(metadata.description).toBe('List of all Users in the system')
  })

  it('should handle missing pluralName', () => {
    const model: ModelDefinition<TestUser> = {
      name: 'User',
      endpoint: '/api/users',
    }

    const metadata = getListPageMetadata(model)

    expect(metadata.title).toBe('Users')
  })
})

describe('getCreatePageMetadata', () => {
  it('should generate default create page metadata', () => {
    const metadata = getCreatePageMetadata(testModel)

    expect(metadata.title).toBe('Create User')
    expect(metadata.description).toBe('Create a new User')
  })

  it('should use custom metadata', () => {
    const metadata = getCreatePageMetadata(testModel, {
      title: 'Add New User',
      description: 'Register a new user account',
    })

    expect(metadata.title).toBe('Add New User')
    expect(metadata.description).toBe('Register a new user account')
  })

  it('should replace template variables', () => {
    const metadata = getCreatePageMetadata(testModel, {
      title: 'New {name}',
      description: 'Add a new {name} to the system',
    })

    expect(metadata.title).toBe('New User')
    expect(metadata.description).toBe('Add a new User to the system')
  })
})

describe('getEditPageMetadata', () => {
  it('should generate default edit page metadata', () => {
    const metadata = getEditPageMetadata(testModel, 123)

    expect(metadata.title).toBe('Edit User')
    expect(metadata.description).toBe('Edit User details')
  })

  it('should use custom metadata', () => {
    const metadata = getEditPageMetadata(testModel, 123, undefined, {
      title: 'Update User',
      description: 'Modify user information',
    })

    expect(metadata.title).toBe('Update User')
    expect(metadata.description).toBe('Modify user information')
  })

  it('should replace template variables including id', () => {
    const metadata = getEditPageMetadata(testModel, 123, undefined, {
      title: 'Edit {name} #{id}',
      description: 'Update {name} with ID {id}',
    })

    expect(metadata.title).toBe('Edit User #123')
    expect(metadata.description).toBe('Update User with ID 123')
  })

  it('should accept record parameter', () => {
    const record: TestUser = { id: 123, name: 'John Doe', email: 'john@example.com' }
    const metadata = getEditPageMetadata(testModel, 123, record)

    expect(metadata.title).toBe('Edit User')
  })
})

describe('getViewPageMetadata', () => {
  it('should generate default view page metadata', () => {
    const metadata = getViewPageMetadata(testModel, 123)

    expect(metadata.title).toBe('View User')
    expect(metadata.description).toBe('View User details')
  })

  it('should use custom metadata', () => {
    const metadata = getViewPageMetadata(testModel, 123, undefined, {
      title: 'User Details',
      description: 'View user profile',
    })

    expect(metadata.title).toBe('User Details')
    expect(metadata.description).toBe('View user profile')
  })

  it('should replace template variables', () => {
    const metadata = getViewPageMetadata(testModel, 456, undefined, {
      title: '{name} #{id}',
      description: 'Details for {name} {id}',
    })

    expect(metadata.title).toBe('User #456')
    expect(metadata.description).toBe('Details for User 456')
  })
})

describe('ResourceMetadataHelper', () => {
  it('should generate list metadata', () => {
    const helper = createResourceMetadata(testModel)
    const metadata = helper.list()

    expect(metadata.title).toBe('Users')
    expect(metadata.description).toBe('Browse and manage Users')
  })

  it('should generate create metadata', () => {
    const helper = createResourceMetadata(testModel)
    const metadata = helper.create()

    expect(metadata.title).toBe('Create User')
  })

  it('should generate edit metadata', () => {
    const helper = createResourceMetadata(testModel)
    const metadata = helper.edit(123)

    expect(metadata.title).toBe('Edit User')
  })

  it('should generate view metadata', () => {
    const helper = createResourceMetadata(testModel)
    const metadata = helper.view(123)

    expect(metadata.title).toBe('View User')
  })

  it('should use custom metadata for all pages', () => {
    const helper = createResourceMetadata(testModel, {
      list: { title: 'All Users' },
      create: { title: 'Add User' },
      edit: { title: 'Update User' },
      view: { title: 'User Profile' },
    })

    expect(helper.list().title).toBe('All Users')
    expect(helper.create().title).toBe('Add User')
    expect(helper.edit(123).title).toBe('Update User')
    expect(helper.view(123).title).toBe('User Profile')
  })

  it('should pass record to edit metadata', () => {
    const helper = createResourceMetadata(testModel)
    const record: TestUser = { id: 123, name: 'John', email: 'john@example.com' }
    const metadata = helper.edit(123, record)

    expect(metadata.title).toBe('Edit User')
  })

  it('should pass record to view metadata', () => {
    const helper = createResourceMetadata(testModel)
    const record: TestUser = { id: 123, name: 'John', email: 'john@example.com' }
    const metadata = helper.view(123, record)

    expect(metadata.title).toBe('View User')
  })
})

describe('OpenGraph metadata', () => {
  it('should process og metadata templates', () => {
    const metadata = getListPageMetadata(testModel, {
      title: '{pluralName}',
      og: {
        title: '{pluralName} - Admin',
        description: 'Manage {pluralName}',
      },
    })

    expect(metadata.og?.title).toBe('Users - Admin')
    expect(metadata.og?.description).toBe('Manage Users')
  })

  it('should preserve og metadata without templates', () => {
    const metadata = getListPageMetadata(testModel, {
      og: {
        title: 'Users',
        image: 'https://example.com/image.png',
        type: 'website',
      },
    })

    expect(metadata.og?.title).toBe('Users')
    expect(metadata.og?.image).toBe('https://example.com/image.png')
    expect(metadata.og?.type).toBe('website')
  })
})

describe('Custom meta tags', () => {
  it('should preserve custom meta tags', () => {
    const metadata = getListPageMetadata(testModel, {
      meta: {
        keywords: 'users, admin, management',
        author: 'Filact',
      },
    })

    expect(metadata.meta).toEqual({
      keywords: 'users, admin, management',
      author: 'Filact',
    })
  })
})
