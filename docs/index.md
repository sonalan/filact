---
layout: home

hero:
  name: Filact
  text: React Admin Panel Library
  tagline: Build beautiful admin interfaces with minimal code, inspired by FilamentPHP
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/sonalan/filact

features:
  - icon: ⚡
    title: Lightning Fast Development
    details: Build complete CRUD interfaces in under 30 minutes with our declarative API and CLI tools.

  - icon: 🎨
    title: Beautiful by Default
    details: Built on shadcn/ui for modern, accessible components that work out of the box.

  - icon: 🔒
    title: Type-Safe
    details: Full TypeScript support with excellent IntelliSense and compile-time safety.

  - icon: 🧩
    title: Composable
    details: Modular architecture with reusable components that you can mix and match.

  - icon: 📊
    title: Powerful Tables
    details: Advanced data tables with sorting, filtering, pagination, virtual scrolling, and more.

  - icon: 📝
    title: Smart Forms
    details: Rich form builder with 20+ field types, validation, wizards, and conditional logic.

  - icon: 🎯
    title: Action System
    details: Flexible actions with modals, confirmations, and contextual behavior.

  - icon: 📈
    title: Dashboard Widgets
    details: Pre-built widgets for stats, charts, and custom data visualizations.

  - icon: 🌐
    title: Flexible Data Layer
    details: Works with REST, GraphQL, or any custom backend with built-in TanStack Query integration.
---

## Quick Example

```typescript
import { defineResource, TextInput, Select, BadgeColumn } from '@filact/core'

export const userResource = defineResource({
  name: 'User',
  endpoint: '/api/users',

  schema: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'user']),
    status: z.enum(['active', 'inactive']),
  }),

  form: {
    fields: [
      TextInput.make('name').required(),
      TextInput.make('email').email().required(),
      Select.make('role').options([
        { value: 'admin', label: 'Administrator' },
        { value: 'user', label: 'User' },
      ]),
      Select.make('status').options([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]),
    ],
  },

  columns: [
    TextColumn.make('name').searchable().sortable(),
    TextColumn.make('email').searchable(),
    BadgeColumn.make('role'),
    BadgeColumn.make('status'),
  ],
})
```

That's it! You now have a complete CRUD interface with:
- List page with searchable, sortable table
- Create form with validation
- Edit form pre-populated with data
- Delete confirmation
- Responsive mobile layout

## Installation

```bash
npm install @filact/core @filact/ui
# or
pnpm add @filact/core @filact/ui
# or
yarn add @filact/core @filact/ui
```

## Why Filact?

**Inspired by FilamentPHP**, Filact brings the same developer experience to React. If you've used FilamentPHP and loved it, you'll feel right at home.

**Built on Modern Tools**: Leverages the best of the React ecosystem - shadcn/ui, TanStack Query, React Hook Form, Zod, and Tailwind CSS.

**Production Ready**: 750+ tests, TypeScript throughout, WCAG 2.1 AA compliant, and optimized for performance.

## Community

- [GitHub Discussions](https://github.com/sonalan/filact/discussions)
- [Report Issues](https://github.com/sonalan/filact/issues)
- [Contribute](https://github.com/sonalan/filact/blob/main/CONTRIBUTING.md)

## License

MIT License - see [LICENSE](https://github.com/sonalan/filact/blob/main/LICENSE) for details.
