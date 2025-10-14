# Installation

This guide covers different ways to install and set up Filact in your project.

## Package Manager Installation

### Using pnpm (Recommended)

```bash
pnpm add @filact/core @filact/ui
```

### Using npm

```bash
npm install @filact/core @filact/ui
```

### Using yarn

```bash
yarn add @filact/core @filact/ui
```

## Required Peer Dependencies

Filact requires the following peer dependencies:

```bash
pnpm add react react-dom @tanstack/react-query @tanstack/react-table react-hook-form @hookform/resolvers zod
```

## Optional Dependencies

Depending on the features you use, you may need:

```bash
# For virtual scrolling
pnpm add @tanstack/react-virtual

# For drag-and-drop functionality
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# For rich text editing
pnpm add @tiptap/react @tiptap/starter-kit

# For charts
pnpm add recharts
```

## Tailwind CSS Setup

Filact uses Tailwind CSS for styling. If you don't have Tailwind CSS set up:

### 1. Install Tailwind CSS

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind

Update your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@filact/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### 3. Add Tailwind Directives

Add to your CSS file (e.g., `src/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

## CLI Installation

Install the Filact CLI globally for code generation:

```bash
pnpm add -g @filact/cli
```

Or use it with npx:

```bash
npx @filact/cli generate:resource Product
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

## Verification

Verify your installation by creating a simple test component:

```tsx
import { Panel } from '@filact/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Panel id="admin" name="Admin Panel" resources={[]} />
    </QueryClientProvider>
  )
}
```

If this renders without errors, you're all set!

## Troubleshooting

### Module not found errors

Make sure all peer dependencies are installed:

```bash
pnpm add react react-dom @tanstack/react-query @tanstack/react-table react-hook-form @hookform/resolvers zod
```

### Type errors with shadcn/ui components

If you see type errors related to UI components, ensure you have the latest version of `@filact/ui`:

```bash
pnpm update @filact/ui
```

### Styling not working

1. Verify Tailwind CSS is configured correctly
2. Check that the Filact content path is in `tailwind.config.js`
3. Ensure CSS variables are defined in your CSS file

## Next Steps

- [Getting Started Guide](/guide/getting-started)
- [Quick Start Tutorial](/guide/quick-start)
- [Resources](/guide/resources)
