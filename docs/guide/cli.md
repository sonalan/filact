# CLI Tools

Filact includes a powerful CLI to help you generate resources, components, and boilerplate code quickly.

## Installation

Install the CLI globally:

```bash
pnpm add -g @filact/cli
```

Or use it directly with npx:

```bash
npx @filact/cli generate:resource Product
```

## Commands

### Generate Resource

Generate a complete CRUD resource with forms and tables:

```bash
filact generate:resource <name> [options]
```

**Aliases:** `g:resource`, `gr`

**Options:**
- `-f, --fields <fields>` - Comma-separated field definitions (e.g., "name:string,email:email,age:number")
- `--no-list` - Skip list page generation
- `--no-create` - Skip create page generation
- `--no-edit` - Skip edit page generation
- `--no-show` - Skip show page generation

**Example:**

```bash
filact generate:resource Product -f "name:string,price:number,description:text,inStock:boolean"
```

This generates:

1. **Resource file** (`src/resources/product.ts`):
   ```typescript
   import { defineResource, z } from '@filact/core'

   export const productResource = defineResource({
     name: 'Product',
     endpoint: '/api/products',

     schema: z.object({
       id: z.number(),
       name: z.string(),
       price: z.number(),
       description: z.string(),
       inStock: z.boolean(),
     }),

     form: {
       fields: [
         TextInput.make('name').required(),
         NumberInput.make('price').required(),
         TextArea.make('description'),
         Switch.make('inStock'),
       ],
     },

     columns: [
       TextColumn.make('name').searchable().sortable(),
       NumberColumn.make('price').sortable(),
       TextColumn.make('description'),
       BooleanColumn.make('inStock'),
     ],
   })
   ```

2. **List page** (`src/pages/products/list.tsx`)
3. **Create page** (`src/pages/products/create.tsx`)
4. **Edit page** (`src/pages/products/edit.tsx`)
5. **Show page** (`src/pages/products/show.tsx`)

### Generate Component

Generate custom components with optional tests and stories:

```bash
filact generate:component <name> [options]
```

**Aliases:** `g:component`, `gc`

**Options:**
- `--with-test` - Generate test file
- `--with-stories` - Generate Storybook stories
- `--type <type>` - Component type: `functional` (default) or `class`

**Example:**

```bash
filact generate:component CustomWidget --with-test --with-stories
```

This generates:

1. **Component file** (`src/components/CustomWidget.tsx`):
   ```typescript
   export interface CustomWidgetProps {
     // Props here
   }

   export function CustomWidget({}: CustomWidgetProps) {
     return (
       <div className="custom-widget">
         {/* Component content */}
       </div>
     )
   }
   ```

2. **Test file** (`src/components/CustomWidget.test.tsx`):
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { render, screen } from '@testing-library/react'
   import { CustomWidget } from './CustomWidget'

   describe('CustomWidget', () => {
     it('should render', () => {
       render(<CustomWidget />)
       // Add assertions
     })
   })
   ```

3. **Stories file** (`src/components/CustomWidget.stories.tsx`):
   ```typescript
   import type { Meta, StoryObj } from '@storybook/react'
   import { CustomWidget } from './CustomWidget'

   const meta: Meta<typeof CustomWidget> = {
     title: 'Components/CustomWidget',
     component: CustomWidget,
   }

   export default meta
   type Story = StoryObj<typeof CustomWidget>

   export const Default: Story = {
     args: {},
   }
   ```

## Field Type Mapping

When using the `--fields` option, the CLI supports these field types:

| CLI Type | Generated Field | Example |
|----------|----------------|---------|
| `string` | TextInput | `name:string` |
| `text` | TextArea | `description:text` |
| `number` | NumberInput | `age:number` |
| `email` | TextInput with email validation | `email:email` |
| `password` | TextInput with password type | `password:password` |
| `boolean` | Switch | `isActive:boolean` |
| `date` | DatePicker | `birthDate:date` |
| `datetime` | DateTimePicker | `createdAt:datetime` |
| `select` | Select | `status:select` |
| `file` | FileUpload | `avatar:file` |
| `image` | ImageUpload | `photo:image` |

## Interactive Mode

Run commands without arguments to enter interactive mode:

```bash
filact generate:resource
```

The CLI will prompt you for:
- Resource name
- Field definitions
- Which pages to generate
- Additional options

## Utility Functions

The CLI includes utility functions that you can use in your generated code:

### Case Conversion

```typescript
import { pascalCase, camelCase, kebabCase } from '@filact/cli/utils'

pascalCase('user-profile') // UserProfile
camelCase('user-profile')  // userProfile
kebabCase('UserProfile')   // user-profile
```

### Pluralization

```typescript
import { pluralize, singularize } from '@filact/cli/utils'

pluralize('user')      // users
pluralize('category')  // categories
singularize('users')   // user
```

## Configuration

Create a `filact.config.ts` file in your project root to customize CLI behavior:

```typescript
export default {
  paths: {
    resources: 'src/resources',
    pages: 'src/pages',
    components: 'src/components',
  },

  typescript: true,

  templates: {
    resource: './templates/resource.ts.hbs',
  },
}
```

## Custom Templates

You can override the default templates by creating your own:

1. Create a `templates` directory in your project
2. Add your custom templates (using Handlebars syntax)
3. Reference them in `filact.config.ts`

Example custom resource template:

```handlebars
// templates/resource.ts.hbs
import { defineResource } from '@filact/core'

export const {{camelCase name}}Resource = defineResource({
  name: '{{name}}',
  endpoint: '/api/{{pluralize (kebabCase name)}}',

  // Custom configuration here
})
```

## Tips

### Generate Multiple Resources

Use a shell script to generate multiple resources at once:

```bash
#!/bin/bash

resources=("User" "Product" "Order" "Category")

for resource in "${resources[@]}"; do
  filact generate:resource "$resource"
done
```

### Git Integration

The CLI automatically creates files but doesn't commit them. Review generated code before committing:

```bash
filact generate:resource Product
git diff
git add .
git commit -m "Add Product resource"
```

### Customize After Generation

Generated code is meant to be customized. Feel free to modify:
- Field configurations
- Validation rules
- Column definitions
- Page layouts

## Troubleshooting

### Command not found

Make sure the CLI is installed globally:

```bash
pnpm add -g @filact/cli
```

Or use npx:

```bash
npx @filact/cli --version
```

### Permission errors

On Unix systems, you may need to use sudo:

```bash
sudo pnpm add -g @filact/cli
```

Or use a version manager like [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues.

## Next Steps

- [Resources Guide](/guide/resources) - Learn about resource configuration
- [Forms Guide](/guide/forms) - Customize generated forms
- [Tables Guide](/guide/tables) - Customize generated tables
- [Examples](/examples/basic-crud) - See the CLI in action
