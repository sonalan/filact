# Getting Started

Welcome to Filact! This guide will help you get up and running with Filact in minutes.

## What is Filact?

Filact is a React library for building admin panels and management interfaces. It provides a declarative, type-safe API for creating CRUD interfaces with minimal boilerplate.

Inspired by FilamentPHP, Filact brings the same developer experience to the React ecosystem.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or higher
- npm, pnpm, or yarn
- Basic knowledge of React and TypeScript

## Installation

Install Filact packages using your preferred package manager:

::: code-group

```bash [pnpm]
pnpm add @filact/core @filact/ui
```

```bash [npm]
npm install @filact/core @filact/ui
```

```bash [yarn]
yarn add @filact/core @filact/ui
```

:::

## Peer Dependencies

Filact requires the following peer dependencies:

```bash
pnpm add react react-dom @tanstack/react-query @tanstack/react-table react-hook-form zod
```

Most of these are likely already in your project. If you're starting fresh, all will be installed.

## Setting Up Your First Panel

### 1. Wrap Your App with Providers

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Panel } from '@filact/core'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Panel
        id="admin"
        name="Admin Panel"
        resources={[]}
      />
    </QueryClientProvider>
  )
}
```

### 2. Create Your First Resource

Create a new file for your resource:

```typescript
// src/resources/user.ts
import { defineResource, TextInput, TextColumn, z } from '@filact/core'

export const userResource = defineResource({
  name: 'User',
  endpoint: '/api/users',

  schema: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    createdAt: z.string(),
  }),

  form: {
    fields: [
      TextInput.make('name')
        .label('Full Name')
        .required()
        .placeholder('Enter full name'),

      TextInput.make('email')
        .label('Email Address')
        .email()
        .required()
        .placeholder('user@example.com'),
    ],
  },

  columns: [
    TextColumn.make('name')
      .label('Name')
      .searchable()
      .sortable(),

    TextColumn.make('email')
      .label('Email')
      .searchable(),

    DateColumn.make('createdAt')
      .label('Created')
      .sortable(),
  ],
})
```

### 3. Register Your Resource

```tsx
import { Panel } from '@filact/core'
import { userResource } from './resources/user'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Panel
        id="admin"
        name="Admin Panel"
        resources={[userResource]}
      />
    </QueryClientProvider>
  )
}
```

That's it! You now have a fully functional CRUD interface for users with:

- ✅ List page with search and sorting
- ✅ Create form with validation
- ✅ Edit form
- ✅ Delete functionality
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

## Next Steps

Now that you have Filact installed and your first resource created, explore these guides:

- [Quick Start Tutorial](/guide/quick-start) - Build a complete admin panel
- [Resources](/guide/resources) - Learn about resource configuration
- [Form Fields](/guide/form-fields) - Explore all available field types
- [Table Columns](/guide/table-columns) - Customize your data tables
- [Actions](/guide/actions) - Add custom actions and buttons

## Using the CLI

Filact includes a CLI tool to generate resources and components:

```bash
# Install CLI globally
pnpm add -g @filact/cli

# Generate a new resource
filact generate:resource Product

# Generate a component
filact generate:component CustomWidget
```

See the [CLI Guide](/guide/cli) for more details.

## Need Help?

- Check out the [Examples](/examples/basic-crud)
- Read the [API Reference](/api/overview)
- Ask questions in [GitHub Discussions](https://github.com/sonalan/filact/discussions)
- Report bugs in [GitHub Issues](https://github.com/sonalan/filact/issues)
