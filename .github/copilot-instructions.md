# Filact - AI Coding Instructions

## Project Overview
Filact is a React admin panel library inspired by FilamentPHP, providing declarative builder patterns for CRUD interfaces. Built with TypeScript, shadcn/ui, and modern React patterns.

### Architecture: Turborepo Monorepo
- **`packages/core`**: Main library with builders and components (`@filact/core`)
- **`packages/ui`**: shadcn/ui based components (`@filact/ui`) 
- **`packages/cli`**: Code generation CLI (`@filact/cli`)
- **Path aliases**: Use `@filact/core`, `@filact/ui`, `@filact/cli` imports

## Core Patterns

### Builder Pattern Architecture
All main features use fluent builder APIs that end with `.build()`:

```typescript
// Form Builder
const formSchema = FormBuilder.make()
  .schema([
    TextInput.make('name').label('Name').required().build(),
    Select.make('role').options([{value: 'admin', label: 'Admin'}]).build()
  ])
  .grid(2)
  .submit('Save User')
  .build()

// Action Builder  
const editAction = ButtonAction.make('edit', 'Edit', onClick)
  .icon('<EditIcon />')
  .variant('default')
  .tooltip('Edit record')
  .build()
```

**Key principle**: Builders are immutable - each method returns a new instance.

### Module Organization
- Each module exports from `index.ts` with grouped functionality
- Use barrel exports pattern: `export * from './submodule'`
- Tests co-located with source files using `.test.ts/.test.tsx` suffix

### Field System Architecture
Fields have consistent builder pattern with shared methods:
```typescript
// Base field capabilities available on all field types
.label('Display Name')
.required(true)
.visible(true | (record) => boolean)
.disabled(false | (record) => boolean)
.placeholder('Enter value...')
.helperText('Additional info')
.build()
```

**Dynamic values**: Many properties accept functions for runtime evaluation based on record data.

## Development Workflows

### Package Management & Scripts
- **Package manager**: pnpm with workspaces
- **Build system**: Turbo + Vite for fast development
- **Key commands**:
  - `pnpm dev` - Start all packages in watch mode
  - `pnpm build` - Build all packages for production
  - `pnpm test` - Run all tests
  - `pnpm test:watch` - Tests in watch mode with Vitest

### Testing Conventions
- **Framework**: Vitest + React Testing Library
- **Setup**: Global setup in `vitest.setup.ts` with jsdom and jest-dom matchers
- **Patterns**: 
  - Test builders and their fluent APIs
  - Use `vi.fn()` for mocks (Vitest's mock function)
  - Test both static and dynamic property functions
  - Coverage thresholds: 85% lines/functions, 80% branches

### Build Configuration
- **Library bundling**: Vite with dual ESM/CJS output
- **Types**: Generated with `vite-plugin-dts` 
- **Externals**: React, React-DOM, and major dependencies marked as external
- **Sourcemaps**: Always enabled for debugging

## File Conventions

### TypeScript Patterns
- Strict mode enabled with noUnusedLocals/Parameters
- Interface-first approach for public APIs
- Export interfaces and types from dedicated `types/` modules
- Use function overloads for builder method variants

### Component Patterns
When creating React components:
- Use React 18+ patterns (no legacy features)
- Prefer `React.ComponentType` for component props
- Use Radix UI primitives through shadcn/ui
- Apply Tailwind classes via `clsx` and `tailwind-merge`

### Import Conventions
```typescript
// External libraries first
import { useState } from 'react'
import { z } from 'zod'

// Internal monorepo packages
import { Button } from '@filact/ui'

// Relative imports last
import { FieldBuilder } from './builder'
import type { FormSchema } from '../types'
```

## Technology Integration

### State Management Stack
- **Server state**: TanStack Query for data fetching/caching
- **Forms**: React Hook Form + Zod validation
- **UI state**: Zustand for notifications, modals, theme
- **Routing**: React Router DOM v7

### UI Component Stack
- **Design system**: shadcn/ui built on Radix UI + Tailwind
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with `tailwind-merge` for conditional classes
- **Animations**: `tailwindcss-animate` plugin

## Code Generation Patterns

When creating new builders or fields:

1. **Start with TypeScript interface** defining the final built object
2. **Create builder class** with fluent methods that return `this`
3. **Add `.build()` method** that returns frozen/immutable result
4. **Export factory function** like `TextInput.make()` for ergonomics
5. **Write comprehensive tests** covering all builder methods and edge cases

### Field Builder Template
```typescript
interface MyFieldConfig extends BaseFieldConfig {
  customProp?: string
}

class MyFieldBuilder extends BaseFieldBuilder<MyFieldConfig> {
  customProp(value: string): this {
    return this.clone({ customProp: value })
  }
}

export const MyField = {
  make: (name: string) => new MyFieldBuilder({ name, type: 'myfield' })
}
```

## Branch & Feature Context
- **Current branch**: `feature/undo-redo` - implementing undo/redo functionality
- **Focus areas**: Form state management, action history, UI feedback for undoable operations

When working on undo/redo features, consider:
- Integration with form builders and field state
- Action history patterns for table operations
- Notification system for undo feedback
- Zustand store for undo/redo state management