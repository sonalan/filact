# API Reference

Complete API reference for Filact packages.

## Packages

Filact is composed of two main packages:

### @filact/core

The core library containing all functionality for building admin panels:

- **Resources** - Define CRUD resources
- **Forms** - Form builder and field components
- **Tables** - Table builder and column components
- **Actions** - Action system for buttons and modals
- **Widgets** - Dashboard widgets and stats
- **Panels** - Panel configuration and layout
- **Navigation** - Sidebar and navigation components
- **Notifications** - Toast notification system
- **Providers** - Data provider abstraction

### @filact/ui

UI component library based on shadcn/ui:

- Pre-styled components
- Tailwind CSS integration
- Dark mode support
- Accessible by default

### @filact/cli

Command-line tools for code generation:

- Resource generator
- Component generator
- Utility functions

## Core Concepts

### Resources

Resources are the foundation of Filact. They define your data model, forms, and tables:

```typescript
import { defineResource } from '@filact/core'

const userResource = defineResource({
  name: 'User',
  endpoint: '/api/users',
  schema: z.object({ /* ... */ }),
  form: { /* ... */ },
  columns: [ /* ... */ ],
})
```

[Learn more about Resources →](/api/resources)

### Forms

Build forms declaratively with the form builder:

```typescript
form: {
  fields: [
    TextInput.make('name').required(),
    TextInput.make('email').email(),
    Select.make('role').options([...]),
  ],
}
```

[Learn more about Forms →](/api/forms)

### Tables

Define table columns with built-in sorting, filtering, and searching:

```typescript
columns: [
  TextColumn.make('name').searchable().sortable(),
  BadgeColumn.make('status'),
  DateColumn.make('createdAt').format('MMM DD, YYYY'),
]
```

[Learn more about Tables →](/api/tables)

### Actions

Create interactive buttons and modals:

```typescript
actions: [
  Action.make('approve')
    .label('Approve')
    .icon(<CheckIcon />)
    .requiresConfirmation()
    .onClick(async (record) => {
      await approveUser(record.id)
    }),
]
```

[Learn more about Actions →](/api/actions)

## Type Safety

Filact is fully typed with TypeScript. All APIs provide excellent IntelliSense:

```typescript
// Type inference from schema
const userResource = defineResource({
  schema: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
  // Fields are type-checked against schema
  form: {
    fields: [
      TextInput.make('name'), // ✓ Valid
      TextInput.make('age'),  // ✗ Type error: 'age' doesn't exist
    ],
  },
})
```

## Builder Pattern

Most APIs use a fluent builder pattern:

```typescript
TextInput.make('email')
  .label('Email Address')
  .email()
  .required()
  .placeholder('user@example.com')
  .helperText('We will never share your email')
  .disabled((record) => record.isVerified)
```

Builders support:
- Method chaining
- Type-safe configuration
- Conditional logic
- Custom transformations

## Data Providers

Connect to any backend with data providers:

```typescript
import { RestDataProvider } from '@filact/core'

const dataProvider = RestDataProvider({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

Built-in providers:
- REST API
- GraphQL
- Mock/JSON Server

[Learn more about Data Providers →](/guide/data-providers)

## Hooks

Filact exposes React hooks for advanced use cases:

```typescript
import {
  useResource,
  useResourceData,
  useResourceMutation,
  useNotification,
} from '@filact/core'

function CustomComponent() {
  const { data, isLoading } = useResourceData('User')
  const { mutate } = useResourceMutation('User', 'create')
  const { notify } = useNotification()

  // Custom logic
}
```

## Components

All components are exported and can be used standalone:

```typescript
import {
  FormBuilder,
  TableBuilder,
  StatsWidget,
  ChartWidget,
  Breadcrumb,
  Sidebar,
} from '@filact/core'

// Use components directly
<FormBuilder resource={userResource} onSubmit={handleSubmit} />
```

## Utilities

Helper functions for common tasks:

```typescript
import {
  formatDate,
  formatNumber,
  formatCurrency,
  truncate,
  pluralize,
} from '@filact/core/utils'

formatDate(new Date(), 'MMM DD, YYYY')  // Jan 01, 2025
formatNumber(1234.56, { decimals: 2 })  // 1,234.56
formatCurrency(99.99, 'USD')            // $99.99
```

## Browser Support

Filact supports all modern browsers:

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## TypeScript Version

Filact requires TypeScript 5.0 or higher for optimal type inference.

## React Version

Filact is compatible with React 18+.

## Next Steps

Explore specific API references:

- [Resources API](/api/resources)
- [Forms API](/api/forms)
- [Tables API](/api/tables)
- [Actions API](/api/actions)
- [Widgets API](/api/widgets)
