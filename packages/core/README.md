# @filact/core

> A powerful React admin panel library inspired by FilamentPHP, built with TypeScript and modern React patterns.

[![npm version](https://img.shields.io/npm/v/@filact/core.svg)](https://www.npmjs.com/package/@filact/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Quick Setup** - Get started in minutes with minimal configuration
- 📊 **Complete CRUD** - Built-in create, read, update, delete operations
- 🎨 **Type-Safe** - Full TypeScript support with excellent IntelliSense
- 🔄 **Data Provider Pattern** - Flexible REST and GraphQL adapters
- 📝 **Form Builder** - Declarative form schemas with validation
- 📋 **Table Builder** - Sortable, filterable, paginated tables
- 🎯 **Actions System** - Page-level and row-level actions
- 🔐 **Authorization** - Built-in policy-based permissions
- 🪝 **Lifecycle Hooks** - beforeCreate, afterUpdate, etc.
- ⚡ **React Query** - Optimistic updates and caching
- 🧩 **React Hook Form** - Performant form state management
- ✅ **Zod Validation** - Runtime type checking and validation
- ♿ **Accessible** - WCAG 2.1 Level AA compliant
- 🧪 **Well Tested** - 123+ tests (unit, integration, E2E, a11y)

## Installation

```bash
# npm
npm install @filact/core react react-dom

# yarn
yarn add @filact/core react react-dom

# pnpm
pnpm add @filact/core react react-dom
```

## Quick Start

### 1. Define Your Model

```typescript
import { z } from 'zod'

// Define your data model
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  createdAt: string
}

// Create a Zod schema for validation
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user']),
  status: z.enum(['active', 'inactive']),
})
```

### 2. Create a Data Provider

```typescript
import { createRestDataProvider } from '@filact/core'

const dataProvider = createRestDataProvider({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
```

### 3. Build Your Resource

```typescript
import { createResource } from '@filact/core'

const userResource = createResource<User>(
  {
    name: 'User',
    pluralName: 'Users',
    endpoint: 'users',
    primaryKey: 'id',
    displayField: 'name',
  },
  dataProvider
)
  .form({
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
      },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
    ],
    validation: userSchema,
  })
  .table({
    columns: [
      {
        key: 'id',
        label: 'ID',
        sortable: true,
      },
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
        searchable: true,
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => (
          <span className={value === 'active' ? 'text-green-600' : 'text-gray-400'}>
            {value}
          </span>
        ),
      },
    ],
    filters: [
      {
        field: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
      {
        field: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ],
      },
    ],
    pagination: {
      pageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
    },
  })
  .build()
```

### 4. Use Resource Hooks in Your Components

```typescript
import { useResourceList, useResourceCreate } from '@filact/core'

function UserListPage() {
  const { data, isLoading } = useResourceList(userResource, {
    pagination: { page: 1, perPage: 10 },
    sort: { field: 'name', order: 'asc' },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CreateUserForm() {
  const { mutate, isPending, isSuccess } = useResourceCreate(userResource)

  const handleSubmit = (data: Partial<User>) => {
    mutate(data)
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as 'admin' | 'user',
        status: 'active',
      })
    }}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <select name="role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
      {isSuccess && <p>User created successfully!</p>}
    </form>
  )
}
```

## Core Concepts

### Data Providers

Data providers abstract your backend API, supporting REST and GraphQL out of the box.

#### REST Provider

```typescript
import { createRestDataProvider } from '@filact/core'

const restProvider = createRestDataProvider({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  // Customize pagination parameters
  pagination: {
    pageParam: 'page',
    perPageParam: 'limit',
  },
  // Customize sort parameters
  sort: {
    fieldParam: 'sortBy',
    orderParam: 'order',
  },
})
```

#### GraphQL Provider

```typescript
import { createGraphQLDataProvider } from '@filact/core'

const graphqlProvider = createGraphQLDataProvider({
  endpoint: 'https://api.example.com/graphql',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  // Define custom queries
  queries: {
    getList: (resource, params) => ({
      query: `
        query GetUsers($page: Int, $limit: Int) {
          users(page: $page, limit: $limit) {
            data { id name email }
            total
          }
        }
      `,
      variables: {
        page: params.pagination?.page,
        limit: params.pagination?.perPage,
      },
    }),
  },
})
```

### Resource Hooks

Filact provides React hooks powered by TanStack Query for data management:

#### useResourceList

```typescript
const { data, isLoading, error, refetch } = useResourceList(userResource, {
  pagination: { page: 1, perPage: 10 },
  sort: { field: 'createdAt', order: 'desc' },
  filter: { field: 'status', operator: 'eq', value: 'active' },
  search: 'john',
})

// data.data: Array of records
// data.total: Total count
// data.page: Current page
// data.perPage: Items per page
// data.pageCount: Total pages
```

#### useResourceOne

```typescript
const { data: user, isLoading } = useResourceOne(userResource, userId)
```

#### useResourceCreate

```typescript
const { mutate, isPending, isSuccess, isError, error } = useResourceCreate(userResource)

mutate({ name: 'John', email: 'john@example.com' })
```

#### useResourceUpdate

```typescript
const { mutate } = useResourceUpdate(userResource)

mutate({ id: 1, data: { name: 'Jane' } })
```

#### useResourceDelete

```typescript
const { mutate } = useResourceDelete(userResource)

mutate(userId)
```

### Form Builder

Build forms with declarative schemas and automatic validation:

```typescript
const formSchema = {
  fields: [
    {
      name: 'title',
      label: 'Post Title',
      type: 'text',
      required: true,
      placeholder: 'Enter post title...',
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      rows: 10,
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'tech', label: 'Technology' },
        { value: 'business', label: 'Business' },
      ],
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'multi-select',
      options: [
        { value: 'react', label: 'React' },
        { value: 'typescript', label: 'TypeScript' },
      ],
    },
    {
      name: 'published',
      label: 'Publish immediately',
      type: 'checkbox',
    },
    {
      name: 'publishDate',
      label: 'Publish Date',
      type: 'date',
      visible: (values) => !values.published,
    },
  ],
  validation: z.object({
    title: z.string().min(3).max(100),
    content: z.string().min(10),
    category: z.string(),
    tags: z.array(z.string()),
  }),
}
```

### Table Builder

Create powerful data tables with sorting, filtering, and pagination:

```typescript
const tableSchema = {
  columns: [
    {
      key: 'id',
      label: 'ID',
      width: 80,
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
      render: (value, record) => (
        <a href={`/users/${record.id}`}>{value}</a>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      searchable: true,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ],
  filters: [
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ],
  pagination: {
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  searchable: true,
  selectable: true,
}
```

### Actions

Add custom actions at page and row levels:

```typescript
const userResource = createResource(userModel, dataProvider)
  .actions([
    {
      name: 'export',
      label: 'Export Users',
      icon: 'download',
      action: async () => {
        const csv = await exportUsersToCSV()
        downloadFile(csv, 'users.csv')
      },
    },
  ])
  .rowActions([
    {
      name: 'edit',
      label: 'Edit',
      icon: 'edit',
      action: (record) => {
        router.push(`/users/${record.id}/edit`)
      },
    },
    {
      name: 'delete',
      label: 'Delete',
      icon: 'trash',
      color: 'danger',
      confirm: 'Are you sure you want to delete this user?',
      action: async (record) => {
        await deleteUser(record.id)
      },
    },
  ])
  .bulkActions([
    {
      name: 'delete',
      label: 'Delete Selected',
      icon: 'trash',
      color: 'danger',
      confirm: (records) =>
        `Are you sure you want to delete ${records.length} users?`,
      action: async (records) => {
        await bulkDeleteUsers(records.map(r => r.id))
      },
    },
  ])
  .build()
```

### Lifecycle Hooks

React to data operations with lifecycle hooks:

```typescript
const userResource = createResource(userModel, dataProvider)
  .hooks({
    beforeCreate: async (data) => {
      // Hash password before creating
      return {
        ...data,
        password: await hashPassword(data.password),
      }
    },
    afterCreate: async (user) => {
      // Send welcome email
      await sendWelcomeEmail(user.email)
    },
    beforeUpdate: async (id, data) => {
      // Log update attempt
      console.log(`Updating user ${id}`, data)
      return data
    },
    afterUpdate: async (user) => {
      // Invalidate cache
      cache.invalidate(`user:${user.id}`)
    },
    beforeDelete: async (id) => {
      // Check if user can be deleted
      const hasOrders = await checkUserOrders(id)
      if (hasOrders) {
        throw new Error('Cannot delete user with existing orders')
      }
      return true
    },
    afterDelete: async (id) => {
      // Clean up related data
      await deleteUserUploads(id)
    },
  })
  .build()
```

### Authorization Policies

Define who can perform which operations:

```typescript
const userResource = createResource(userModel, dataProvider)
  .policies({
    viewAny: (user) => user.role === 'admin',
    view: (user, record) => user.role === 'admin' || user.id === record.id,
    create: (user) => user.role === 'admin',
    update: (user, record) => user.role === 'admin' || user.id === record.id,
    delete: (user, record) => user.role === 'admin',
  })
  .build()
```

## Advanced Features

### Custom Data Provider

Create a custom data provider for any backend:

```typescript
import { DataProvider } from '@filact/core'

class CustomDataProvider implements DataProvider {
  async getList(resource, params) {
    // Your custom implementation
    const response = await fetch(`/api/${resource}`, {
      method: 'GET',
      // ... handle params
    })
    return response.json()
  }

  async getOne(resource, id) {
    const response = await fetch(`/api/${resource}/${id}`)
    return response.json()
  }

  async create(resource, params) {
    const response = await fetch(`/api/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    })
    return response.json()
  }

  async update(resource, params) {
    const response = await fetch(`/api/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    })
    return response.json()
  }

  async delete(resource, params) {
    await fetch(`/api/${resource}/${params.id}`, {
      method: 'DELETE',
    })
  }

  async deleteMany(resource, params) {
    await fetch(`/api/${resource}/batch`, {
      method: 'DELETE',
      body: JSON.stringify({ ids: params.ids }),
    })
  }

  async updateMany(resource, params) {
    const response = await fetch(`/api/${resource}/batch`, {
      method: 'PUT',
      body: JSON.stringify({ ids: params.ids, data: params.data }),
    })
    return response.json()
  }
}

const customProvider = new CustomDataProvider()
```

### Soft Deletes

Enable soft deletes for resources:

```typescript
const userResource = createResource(userModel, dataProvider)
  .softDeletes(true)
  .build()

// Now delete operations will set deletedAt instead of removing records
```

### Timestamps

Automatically manage createdAt and updatedAt:

```typescript
const userResource = createResource(userModel, dataProvider)
  .timestamps(true)
  .build()
```

## API Reference

### Types

```typescript
// Model Definition
interface ModelDefinition<TModel> {
  name: string
  pluralName: string
  endpoint: string
  primaryKey: keyof TModel
  displayField?: keyof TModel
  schema?: ZodSchema
}

// Form Field
interface FormField<TModel> {
  name: keyof TModel
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'datetime'
  required?: boolean
  placeholder?: string
  helperText?: string
  options?: Array<{ value: any; label: string }>
  visible?: (values: Partial<TModel>) => boolean
  disabled?: boolean
  rows?: number
  min?: number
  max?: number
}

// Table Column
interface TableColumn<TModel> {
  key: keyof TModel
  label: string
  sortable?: boolean
  searchable?: boolean
  width?: number | string
  render?: (value: any, record: TModel) => React.ReactNode
}

// Action
interface Action<TModel> {
  name: string
  label: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  confirm?: string | ((record: TModel) => string)
  action: (record: TModel) => void | Promise<void>
  visible?: (record: TModel) => boolean
}
```

## Testing

Filact includes comprehensive test utilities:

```typescript
import { createTestDataProvider, createTestQueryClient } from '@filact/core/test-utils'

// Mock data provider for tests
const mockProvider = createTestDataProvider()

// Test query client
const queryClient = createTestQueryClient()

// Your tests
test('should fetch users', async () => {
  const { result } = renderHook(
    () => useResourceList(userResource),
    { wrapper: createWrapper(queryClient) }
  )

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data?.data).toHaveLength(3)
})
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Filact](https://github.com/sonalan/filact)

## Support

- 📖 [Documentation](https://filact.dev)
- 💬 [Discord Community](https://discord.gg/filact)
- 🐛 [Issue Tracker](https://github.com/sonalan/filact/issues)
- 📧 [Email Support](mailto:support@filact.dev)
