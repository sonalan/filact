# Filact

> A powerful React admin panel framework inspired by FilamentPHP - Build beautiful admin interfaces with minimal code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://reactjs.org/)

Filact is a modern, type-safe React framework for building admin panels and back-office applications. Inspired by Laravel's FilamentPHP, it provides a declarative API to create complete CRUD interfaces with minimal boilerplate.

## ✨ Features

- 🚀 **Rapid Development** - Build complete admin panels in minutes, not days
- 📊 **Complete CRUD** - Full create, read, update, delete operations out of the box
- 🎨 **Type-Safe** - Built with TypeScript for excellent IntelliSense and type safety
- 🔄 **Flexible Data Layer** - REST and GraphQL providers with custom adapter support
- 📝 **Declarative Forms** - Build complex forms with simple schema definitions
- 📋 **Powerful Tables** - Sortable, filterable, paginated tables with search
- 🎯 **Actions System** - Page, row, and bulk actions with confirmation dialogs
- 🔐 **Authorization** - Built-in policy-based permission system
- 🪝 **Lifecycle Hooks** - React to data operations (beforeCreate, afterUpdate, etc.)
- ⚡ **Optimized Performance** - TanStack Query for caching and optimistic updates
- 🧩 **React Hook Form** - Performant form state management
- ✅ **Validation** - Zod integration for runtime type checking
- ♿ **Accessible** - WCAG 2.1 Level AA compliant components
- 🎨 **Beautiful UI** - Modern interface with shadcn/ui components
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🧪 **Well Tested** - 123+ tests covering unit, integration, E2E, and accessibility

## 📦 Packages

Filact is a monorepo containing multiple packages:

- **[@filact/core](./packages/core)** - Core library with data management, forms, tables, and hooks
- **@filact/ui** - UI components built with shadcn/ui (coming soon)
- **@filact/cli** - CLI tools for scaffolding (coming soon)

## 🚀 Quick Start

### Installation

```bash
npm install @filact/core react react-dom
# or
pnpm add @filact/core react react-dom
```

### Basic Example

```typescript
import { createResource, createRestDataProvider, useResourceList } from '@filact/core'
import { z } from 'zod'

// 1. Define your model
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

// 2. Create data provider
const dataProvider = createRestDataProvider({
  baseURL: 'https://api.example.com',
})

// 3. Build resource
const userResource = createResource<User>(
  {
    name: 'User',
    pluralName: 'Users',
    endpoint: 'users',
    primaryKey: 'id',
  },
  dataProvider
)
  .form({
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'role', label: 'Role', type: 'select', options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ]},
    ],
    validation: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(['admin', 'user']),
    }),
  })
  .table({
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true, searchable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
    ],
  })
  .build()

// 4. Use in components
function UsersList() {
  const { data, isLoading } = useResourceList(userResource, {
    pagination: { page: 1, perPage: 10 },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <table>
      <thead>
        <tr>
          {userResource.table?.columns.map(col => (
            <th key={String(col.key)}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.data.map(user => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## 📚 Documentation

- **[Getting Started Guide](./packages/core/README.md#quick-start)** - Learn the basics
- **[Core Package Docs](./packages/core/README.md)** - Complete API reference
- **[Examples](./examples)** - Sample applications (coming soon)

## 🏗️ Architecture

Filact follows a layered architecture:

```
┌─────────────────────────────────────┐
│         Your Application            │
│    (React Components, Pages)        │
└─────────────────────────────────────┘
               ▼
┌─────────────────────────────────────┐
│         Filact Resources            │
│  (Forms, Tables, Actions, Hooks)    │
└─────────────────────────────────────┘
               ▼
┌─────────────────────────────────────┐
│       Data Provider Layer           │
│    (REST, GraphQL, Custom)          │
└─────────────────────────────────────┘
               ▼
┌─────────────────────────────────────┐
│          Your Backend API           │
│   (REST API, GraphQL, etc.)         │
└─────────────────────────────────────┘
```

### Key Concepts

1. **Resources** - Central configuration for CRUD operations on a model
2. **Data Providers** - Abstract backend communication (REST, GraphQL, custom)
3. **Forms** - Declarative form schemas with validation
4. **Tables** - Sortable, filterable, paginated data tables
5. **Actions** - Reusable operations at page, row, or bulk level
6. **Hooks** - React hooks for data fetching and mutations
7. **Policies** - Authorization rules for resources

## 🎯 Use Cases

Filact is perfect for:

- 📊 **Admin Panels** - Manage application data
- 🏢 **Back-office Applications** - Internal business tools
- 📈 **Dashboards** - Data visualization and analytics
- 🛠️ **CMS Systems** - Content management interfaces
- 🔧 **API Clients** - Visual interfaces for APIs

## 🛠️ Development

This is a pnpm monorepo using Turborepo.

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run linter
pnpm lint

# Type check
pnpm typecheck
```

### Package Development

```bash
# Work on core package
cd packages/core

# Watch mode for development
pnpm dev

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

## 🧪 Testing

Filact has comprehensive test coverage:

- **Unit Tests** - Component and hook testing with Vitest
- **Integration Tests** - Full data flow testing with MSW
- **E2E Tests** - Complete user journeys with Playwright
- **Accessibility Tests** - WCAG compliance with axe-core

Total: **123+ tests** ensuring reliability and quality.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code of Conduct
- Development process
- How to submit pull requests
- Coding standards

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a list of changes.

## 🗺️ Roadmap

### Current Status (v0.1.0)

- ✅ Core data management system
- ✅ REST and GraphQL data providers
- ✅ Resource builder with fluent API
- ✅ Form builder with validation
- ✅ Table builder with sorting/filtering
- ✅ Actions system (page, row, bulk)
- ✅ React hooks for CRUD operations
- ✅ Lifecycle hooks
- ✅ Authorization policies
- ✅ Comprehensive test suite

### Coming Soon (v0.2.0)

- 🔜 UI component library (@filact/ui)
- 🔜 CLI tools for scaffolding
- 🔜 Documentation website
- 🔜 Example applications
- 🔜 Advanced features:
  - Real-time updates
  - File uploads
  - Export/Import
  - Internationalization (i18n)
  - Multi-tenancy
  - Charts and widgets

## 📄 License

MIT © [Filact](https://github.com/sonalan/filact)

See [LICENSE](./LICENSE) for details.

## 💬 Community & Support

- 📖 [Documentation](https://filact.dev) (coming soon)
- 💬 [Discord Community](https://discord.gg/filact) (coming soon)
- 🐛 [Issue Tracker](https://github.com/sonalan/filact/issues)
- 📧 [Email Support](mailto:support@filact.dev)

## 🙏 Acknowledgments

Filact is inspired by:

- [FilamentPHP](https://filamentphp.com/) - The Laravel admin panel that inspired this project
- [React Admin](https://marmelab.com/react-admin/) - Pioneer in React admin frameworks
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible component system

Built with amazing open source libraries:

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TanStack Query](https://tanstack.com/query) - Data fetching and caching
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Zod](https://zod.dev/) - Schema validation
- [Vitest](https://vitest.dev/) - Unit testing
- [Playwright](https://playwright.dev/) - E2E testing

## ⭐ Star History

If you find Filact useful, please consider giving it a star! ⭐

---

**Made with ❤️ by the Filact team**
